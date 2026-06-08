import { createServiceClient } from '@/lib/supabase/service'
import { ok, unauthorized, notFound, internalError } from '@/lib/api'
import { cookies } from 'next/headers'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const clientId = cookieStore.get('portal_client_id')?.value
  if (!clientId) return unauthorized('No portal session')

  const service = createServiceClient()

  // Verify the file belongs to one of this client's projects
  const { data: file } = await service
    .from('files')
    .select('id, filename, storage_path, projects!inner(client_id)')
    .eq('id', id)
    .eq('projects.client_id', clientId)
    .is('deleted_at', null)
    .single()

  if (!file) return notFound('File not found or access denied')

  const { data: signed, error } = await service.storage
    .from('portalkit_bucket')
    .createSignedUrl(file.storage_path, 3600, {
      download: file.filename,
    })

  if (error || !signed?.signedUrl) return internalError('Could not generate download link')

  return ok({ url: signed.signedUrl, filename: file.filename })
}

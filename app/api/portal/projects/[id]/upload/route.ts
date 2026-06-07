import { createServiceClient } from '@/lib/supabase/service'
import { ok, unauthorized, notFound, badRequest, internalError } from '@/lib/api'
import { cookies } from 'next/headers'
import { MAX_FILE_SIZE } from '@/lib/validations'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const clientId = cookieStore.get('portal_client_id')?.value
  if (!clientId) return unauthorized()

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return badRequest('Invalid JSON') }

  const filename = typeof body.filename === 'string' ? body.filename.trim() : ''
  const fileSize = typeof body.file_size === 'number' ? body.file_size : 0
  const mimeType = typeof body.mime_type === 'string' ? body.mime_type : 'application/octet-stream'

  if (!filename) return badRequest('filename required')
  if (fileSize > MAX_FILE_SIZE) return badRequest('File size exceeds the 50MB limit')

  const service = createServiceClient()

  // Verify this project belongs to the portal client
  const { data: project } = await service
    .from('projects')
    .select('id, freelancer_id')
    .eq('id', id)
    .eq('client_id', clientId)
    .is('deleted_at', null)
    .single()

  if (!project) return notFound('Project not found')

  const ext = filename.split('.').pop() ?? 'bin'
  const storagePath = `files/${project.freelancer_id}/${id}/${Date.now()}-client.${ext}`

  const { data: signedUrl, error } = await service.storage
    .from('portalkit_bucket')
    .createSignedUploadUrl(storagePath)

  if (error) return internalError(error.message)

  return ok({
    signed_url: signedUrl.signedUrl,
    token: signedUrl.token,
    storage_path: storagePath,
    freelancer_id: project.freelancer_id,
  })
}

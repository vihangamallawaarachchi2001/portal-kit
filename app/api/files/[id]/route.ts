import { createClient } from '@/lib/supabase/server'
import { ok, noContent, unauthorized, notFound, internalError } from '@/lib/api'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const { data: file } = await supabase
    .from('files')
    .select('id')
    .eq('id', id)
    .eq('freelancer_id', user.id)
    .is('deleted_at', null)
    .single()

  if (!file) return notFound('File not found')

  const { error } = await supabase
    .from('files')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('freelancer_id', user.id)

  if (error) return internalError(error.message)
  return noContent()
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const { data: file, error } = await supabase
    .from('files')
    .select('*')
    .eq('id', id)
    .eq('freelancer_id', user.id)
    .is('deleted_at', null)
    .single()

  if (error || !file) return notFound('File not found')

  // Generate signed download URL (1 hour)
  const { data: signed } = await supabase.storage
    .from('portalkit_bucket')
    .createSignedUrl(file.storage_path, 3600)

  return ok({ ...file, download_url: signed?.signedUrl ?? null })
}

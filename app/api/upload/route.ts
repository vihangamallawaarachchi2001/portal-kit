import { createClient } from '@/lib/supabase/server'
import { ok, unauthorized, badRequest, forbidden, internalError, fromZodError } from '@/lib/api'
import { requestUploadSchema, MAX_FILE_SIZE } from '@/lib/validations'
import { ZodError } from 'zod'

// Storage limits per plan
const STORAGE_LIMITS: Record<string, number> = {
  free: 3,           // max 3 files total (count limit)
  pro: 5 * 1024 * 1024 * 1024,      // 5GB
  business: 20 * 1024 * 1024 * 1024, // 20GB
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  let body: unknown
  try { body = await req.json() } catch { return badRequest('Invalid JSON') }

  let input
  try { input = requestUploadSchema.parse(body) } catch (e) { return fromZodError(e as ZodError) }

  if (input.file_size > MAX_FILE_SIZE) {
    return badRequest(`File size exceeds the 50MB limit.`)
  }

  // Verify project belongs to this freelancer
  const { data: project } = await supabase
    .from('projects')
    .select('id, client_id')
    .eq('id', input.project_id)
    .eq('freelancer_id', user.id)
    .is('deleted_at', null)
    .single()

  if (!project) return forbidden('Project not found or access denied')

  // Enforce free tier file count
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (profile?.plan === 'free') {
    const { count } = await supabase
      .from('files')
      .select('id', { count: 'exact', head: true })
      .eq('freelancer_id', user.id)
      .is('deleted_at', null)

    if ((count ?? 0) >= STORAGE_LIMITS.free) {
      return forbidden('Free tier allows 3 file uploads. Upgrade to Pro for unlimited storage.')
    }
  }

  // Generate signed upload URL (5 minute expiry)
  const ext = input.filename.split('.').pop() ?? 'bin'
  const version = input.version ?? 1
  const storagePath = `files/${user.id}/${input.project_id}/${Date.now()}-v${version}.${ext}`

  const { data: signedUrl, error } = await supabase.storage
    .from('portalkit_bucket')
    .createSignedUploadUrl(storagePath)

  if (error) return internalError(error.message)

  return ok({ signed_url: signedUrl.signedUrl, token: signedUrl.token, storage_path: storagePath })
}

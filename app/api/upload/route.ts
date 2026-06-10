import { createClient } from '@/lib/supabase/server'
import { ok, unauthorized, badRequest, paymentRequired, forbidden, internalError, fromZodError } from '@/lib/api'
import { requestUploadSchema, MAX_FILE_SIZE } from '@/lib/validations'
import { ZodError } from 'zod'

const FREE_FILES_PER_PORTAL = 10
const FREE_STORAGE_BYTES    = 500 * 1024 * 1024 // 500 MB

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  let body: unknown
  try { body = await req.json() } catch { return badRequest('Invalid JSON') }

  let input
  try { input = requestUploadSchema.parse(body) } catch (e) { return fromZodError(e as ZodError) }

  if (input.file_size > MAX_FILE_SIZE) {
    return badRequest(`File size exceeds the 50 MB limit.`)
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

  // ── Free plan enforcement ──────────────────────────────────────────────────

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (profile?.plan === 'free') {
    // 1. Enforce 10 files per portal (count non-deleted files across all projects in this client portal)
    const { data: portalProjects } = await supabase
      .from('projects')
      .select('id')
      .eq('client_id', project.client_id)
      .eq('freelancer_id', user.id)
      .is('deleted_at', null)

    const projectIds = portalProjects?.map(p => p.id) ?? []

    if (projectIds.length > 0) {
      const { count: portalFileCount } = await supabase
        .from('files')
        .select('id', { count: 'exact', head: true })
        .in('project_id', projectIds)
        .eq('freelancer_id', user.id)
        .is('deleted_at', null)

      if ((portalFileCount ?? 0) >= FREE_FILES_PER_PORTAL) {
        return paymentRequired(
          `Free plan allows ${FREE_FILES_PER_PORTAL} files per portal. Upgrade to Pro for unlimited uploads.`,
          { code: 'file_limit', limit: FREE_FILES_PER_PORTAL, current: portalFileCount },
        )
      }
    }

    // 2. Enforce 500 MB total storage across all portals
    const { data: allFiles } = await supabase
      .from('files')
      .select('file_size')
      .eq('freelancer_id', user.id)
      .is('deleted_at', null)

    const usedBytes = allFiles?.reduce((s, f) => s + (f.file_size ?? 0), 0) ?? 0

    if (usedBytes + input.file_size > FREE_STORAGE_BYTES) {
      return paymentRequired(
        `This upload would exceed the 500 MB storage limit on the Free plan.`,
        { code: 'storage_limit', limitMb: 500, usedMb: Math.round(usedBytes / (1024 * 1024)) },
      )
    }
  }

  // Generate signed upload URL (5-minute expiry)
  const ext         = input.filename.split('.').pop() ?? 'bin'
  const version     = input.version ?? 1
  const storagePath = `files/${user.id}/${input.project_id}/${Date.now()}-v${version}.${ext}`

  const { data: signedUrl, error } = await supabase.storage
    .from('portalkit_bucket')
    .createSignedUploadUrl(storagePath)

  if (error) return internalError(error.message)

  return ok({ signed_url: signedUrl.signedUrl, token: signedUrl.token, storage_path: storagePath })
}

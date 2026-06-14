import { createClient } from '@/lib/supabase/server'
import { ok, noContent, unauthorized, notFound, forbidden, internalError } from '@/lib/api'
import { getWorkspaceContext, allowedClientIds, canAccessSub } from '@/lib/workspace'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const ctx = await getWorkspaceContext(user.id, user.email ?? '')
  const { ownerId } = ctx

  // Fetch the file record — always scope to the workspace owner
  const { data: file, error } = await supabase
    .from('files')
    .select('*')
    .eq('id', id)
    .eq('freelancer_id', ownerId)
    .is('deleted_at', null)
    .single()

  if (error || !file) return notFound('File not found')

  // ── Sub-feature access check ──────────────────────────────────────────────
  // Owners and unrestricted members skip the grant checks (canAccessSub returns
  // true for them), so we only do real work for restricted members.

  if (file.project_id) {
    // File belongs to a project — resolve client_id from the project row
    const { data: project } = await supabase
      .from('projects')
      .select('client_id')
      .eq('id', file.project_id)
      .eq('freelancer_id', ownerId)
      .single()

    if (!project) return notFound('File not found')

    const clientId: string = project.client_id

    // Membership-level client filter
    const allowed = allowedClientIds(ctx)
    if (allowed !== null && !allowed.includes(clientId)) return forbidden()

    // Sub-feature grant check (project-level, falling back to client-level)
    if (!canAccessSub(ctx, 'canViewFiles', clientId, file.project_id)) return forbidden()
  } else if (file.client_id) {
    // File is attached directly to a client (no project)
    const clientId: string = file.client_id

    const allowed = allowedClientIds(ctx)
    if (allowed !== null && !allowed.includes(clientId)) return forbidden()

    if (!canAccessSub(ctx, 'canViewFiles', clientId)) return forbidden()
  }
  // If the file has neither project_id nor client_id it is a workspace-level
  // file — only the owner or an unrestricted member may access it.
  else if (!ctx.isOwner && ctx.accessMode === 'restricted') {
    return forbidden()
  }

  // Generate signed download URL (1 hour)
  const { data: signed } = await supabase.storage
    .from('portalkit_bucket')
    .createSignedUrl(file.storage_path, 3600)

  return ok({ ...file, download_url: signed?.signedUrl ?? null })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const { ownerId } = await getWorkspaceContext(user.id, user.email ?? '')

  // DELETE is owner-only: freelancer_id must match the workspace owner
  const { data: file } = await supabase
    .from('files')
    .select('id')
    .eq('id', id)
    .eq('freelancer_id', ownerId)
    .is('deleted_at', null)
    .single()

  if (!file) return notFound('File not found')

  const { error } = await supabase
    .from('files')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('freelancer_id', ownerId)

  if (error) return internalError(error.message)
  return noContent()
}

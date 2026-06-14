import { createClient } from '@/lib/supabase/server'
import { ok, noContent, unauthorized, notFound, badRequest, internalError } from '@/lib/api'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  let body: unknown
  try { body = await req.json() } catch { return badRequest('Invalid JSON') }
  const { permissions } = body as { permissions?: Record<string, boolean> }
  if (!permissions || typeof permissions !== 'object') return badRequest('permissions required')

  const { data: invite } = await supabase
    .from('team_invites')
    .select('id')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (!invite) return notFound('Invite not found')

  const { data, error } = await supabase
    .from('team_invites')
    .update({ permissions })
    .eq('id', id)
    .select('id, email, role, status, invited_at, accepted_at, permissions')
    .single()

  if (error) return internalError(error.message)
  return ok(data)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const { data: invite } = await supabase
    .from('team_invites')
    .select('id')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (!invite) return notFound('Invite not found')

  const { error } = await supabase
    .from('team_invites')
    .delete()
    .eq('id', id)

  if (error) return internalError(error.message)
  return noContent()
}

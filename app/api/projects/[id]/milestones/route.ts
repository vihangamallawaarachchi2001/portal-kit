import { createClient } from '@/lib/supabase/server'
import { ok, badRequest, unauthorized, notFound, internalError } from '@/lib/api'
import { getWorkspaceContext, allowedClientIds, canAccessSub } from '@/lib/workspace'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()
  const ctx = await getWorkspaceContext(user.id, user.email ?? '')
  const { ownerId } = ctx

  // Verify project belongs to freelancer
  const { data: project } = await supabase
    .from('projects')
    .select('id, freelancer_id, client_id')
    .eq('id', id)
    .eq('freelancer_id', ownerId)
    .is('deleted_at', null)
    .single()
  if (!project) return notFound('Project not found')

  const clientIds = allowedClientIds(ctx)
  if (clientIds !== null && project.client_id && !clientIds.includes(project.client_id)) return notFound()
  if (!canAccessSub(ctx, 'canViewMilestones', project.client_id, id)) return unauthorized()

  const { data, error } = await supabase
    .from('milestones')
    .select('*')
    .eq('project_id', id)
    .order('due_date', { ascending: true })

  if (error) return internalError(error.message)
  return ok({ data })
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()
  const ctx = await getWorkspaceContext(user.id, user.email ?? '')
  const { ownerId } = ctx

  // Verify project belongs to freelancer
  const { data: project } = await supabase
    .from('projects')
    .select('id, freelancer_id, client_id')
    .eq('id', id)
    .eq('freelancer_id', ownerId)
    .is('deleted_at', null)
    .single()
  if (!project) return notFound('Project not found')

  const clientIds = allowedClientIds(ctx)
  if (clientIds !== null && project.client_id && !clientIds.includes(project.client_id)) return notFound()
  if (!canAccessSub(ctx, 'canViewMilestones', project.client_id, id)) return unauthorized()

  let body: unknown
  try { body = await req.json() } catch { return badRequest('Invalid JSON') }

  const { title, due_date, description } = body as { title?: string; due_date?: string; description?: string }
  if (!title || !due_date) return badRequest('Missing title or due_date')

  const { data, error } = await supabase
    .from('milestones')
    .insert([{ project_id: id, freelancer_id: ownerId, title, description: description ?? null, due_date }])
    .select()
    .single()

  if (error) return internalError(error.message)
  return ok(data)
}

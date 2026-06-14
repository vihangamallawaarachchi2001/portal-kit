import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { ok, unauthorized, notFound, badRequest, internalError } from '@/lib/api'

interface GrantInput {
  clientId: string
  projectId: string | null
  canViewFiles: boolean
  canViewInvoices: boolean
  canViewMessages: boolean
  canViewMilestones: boolean
}

// GET /api/settings/team/[id]/grants — list grants for a member invite
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  // Verify caller owns this invite
  const { data: invite } = await supabase
    .from('team_invites')
    .select('id')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()
  if (!invite) return notFound('Invite not found')

  const service = createServiceClient()
  const { data: grants, error } = await service
    .from('team_data_grants')
    .select('id, client_id, project_id, can_view_files, can_view_invoices, can_view_messages, can_view_milestones')
    .eq('invite_id', id)
    .order('client_id')

  if (error) return internalError(error.message)
  return ok(grants ?? [])
}

// PUT /api/settings/team/[id]/grants — replace all grants for a member
// Body: { grants: GrantInput[] }
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  // Verify caller owns this invite
  const { data: invite } = await supabase
    .from('team_invites')
    .select('id')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()
  if (!invite) return notFound('Invite not found')

  let body: unknown
  try { body = await req.json() } catch { return badRequest('Invalid JSON') }
  const { grants } = body as { grants?: GrantInput[] }
  if (!Array.isArray(grants)) return badRequest('grants must be an array')

  const service = createServiceClient()

  // Delete all existing grants for this invite, then insert new ones
  await service.from('team_data_grants').delete().eq('invite_id', id)

  if (grants.length > 0) {
    const rows = grants.map(g => ({
      invite_id: id,
      client_id: g.clientId,
      project_id: g.projectId ?? null,
      can_view_files: g.canViewFiles,
      can_view_invoices: g.canViewInvoices,
      can_view_messages: g.canViewMessages,
      can_view_milestones: g.canViewMilestones,
    }))

    const { error } = await service.from('team_data_grants').insert(rows)
    if (error) return internalError(error.message)
  }

  return ok({ saved: true, count: grants.length })
}

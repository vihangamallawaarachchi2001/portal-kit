import { createServiceClient } from '@/lib/supabase/service'
import { ok, badRequest, notFound } from '@/lib/api'

export async function POST(req: Request) {
  const { token } = await req.json().catch(() => ({}))
  if (!token) return badRequest('Token required')

  const service = createServiceClient()

  const { data: invite } = await service
    .from('team_invites')
    .select('id, status, owner_id, email')
    .eq('token', token)
    .single()

  if (!invite) return notFound('Invalid or expired invitation')
  if (invite.status === 'accepted') return ok({ already_accepted: true })

  const { error } = await service
    .from('team_invites')
    .update({ status: 'accepted', accepted_at: new Date().toISOString() })
    .eq('id', invite.id)

  if (error) return badRequest('Failed to accept invitation')

  return ok({ accepted: true, owner_id: invite.owner_id })
}

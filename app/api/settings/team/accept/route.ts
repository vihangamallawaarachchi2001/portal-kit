import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import { ok, badRequest, notFound } from '@/lib/api'

export async function POST(req: Request) {
  const { token } = await req.json().catch(() => ({}))
  if (!token) return badRequest('Token required')

  const service = createServiceClient()

  const { data: invite } = await service
    .from('team_invites')
    .select('id, status, owner_id, email, accepted_user_id')
    .eq('token', token)
    .single()

  if (!invite) return notFound('Invalid or expired invitation')
  if (invite.status === 'accepted') return ok({ already_accepted: true, invite_id: invite.id })

  const { error } = await service
    .from('team_invites')
    .update({ status: 'accepted', accepted_at: new Date().toISOString() })
    .eq('id', invite.id)

  if (error) return badRequest('Failed to accept invitation')

  // If the invitee is already signed in, link immediately
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user && user.email?.toLowerCase() === invite.email.toLowerCase()) {
    await service
      .from('team_invites')
      .update({ accepted_user_id: user.id })
      .eq('id', invite.id)
  }

  return ok({ accepted: true, invite_id: invite.id, owner_id: invite.owner_id })
}

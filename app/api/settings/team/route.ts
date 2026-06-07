import { createClient } from '@/lib/supabase/server'
import { ok, created, unauthorized, badRequest, paymentRequired, conflict, internalError } from '@/lib/api'
import { sendTeamInviteEmail } from '@/lib/email'
import { z } from 'zod'

const TEAM_LIMIT = 5

const inviteSchema = z.object({
  email: z.string().email(),
  role:  z.enum(['admin', 'member']).default('member'),
})

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const { data, error } = await supabase
    .from('team_invites')
    .select('*')
    .eq('owner_id', user.id)
    .order('invited_at', { ascending: false })

  if (error) return internalError(error.message)
  return ok(data ?? [])
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  // Business plan only
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, full_name, business_name')
    .eq('id', user.id)
    .single()

  if (profile?.plan !== 'business') {
    return paymentRequired(
      'Team members are available on the Business plan.',
      { code: 'team_gating' },
    )
  }

  // Enforce seat limit
  const { count } = await supabase
    .from('team_invites')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', user.id)

  if ((count ?? 0) >= TEAM_LIMIT) {
    return paymentRequired(
      `Business plan allows ${TEAM_LIMIT} team members.`,
      { code: 'team_limit', limit: TEAM_LIMIT, current: count ?? 0 },
    )
  }

  let body: unknown
  try { body = await req.json() } catch { return badRequest('Invalid JSON') }

  const parsed = inviteSchema.safeParse(body)
  if (!parsed.success) return badRequest('Invalid input', parsed.error.flatten().fieldErrors)
  const { email, role } = parsed.data

  // Prevent duplicate invites
  const { count: existing } = await supabase
    .from('team_invites')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', user.id)
    .eq('email', email)

  if ((existing ?? 0) > 0) return conflict('This email has already been invited.')

  const { data: invite, error } = await supabase
    .from('team_invites')
    .insert({ owner_id: user.id, email, role })
    .select()
    .single()

  if (error) return internalError(error.message)

  const appUrl      = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const ownerName   = profile?.full_name ?? 'Your team'
  const bizName     = profile?.business_name || profile?.full_name || 'PortalKit workspace'
  const acceptUrl   = `${appUrl}/team-invite/accept?token=${invite.token}`

  sendTeamInviteEmail({ to: email, ownerName, businessName: bizName, role, acceptUrl }).catch((err) => console.error('[email] team-invite send failed', err))

  return created(invite)
}

import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { ok, unauthorized, badRequest } from '@/lib/api'
import { getAvailableWorkspaces } from '@/lib/workspace'

// GET — list workspaces available to the current user
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const cookieStore = await cookies()
  const currentWorkspaceId = cookieStore.get('pk-workspace')?.value ?? 'own'

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, business_name, avatar_url')
    .eq('id', user.id)
    .single()

  const teamWorkspaces = await getAvailableWorkspaces(user.id, user.email ?? '')

  const workspaces = [
    {
      inviteId: 'own',
      ownerId: user.id,
      name: profile?.business_name || profile?.full_name || 'My Workspace',
      avatarUrl: profile?.avatar_url ?? null,
      isPersonal: true,
    },
    ...teamWorkspaces.map(w => ({ ...w, isPersonal: false })),
  ]

  return ok({ workspaces, currentWorkspaceId })
}

// POST { inviteId: 'own' | uuid } — switch active workspace (sets cookie)
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  let body: unknown
  try { body = await req.json() } catch { return badRequest('Invalid JSON') }
  const { inviteId } = body as { inviteId?: string }
  if (!inviteId) return badRequest('inviteId required')

  if (inviteId !== 'own') {
    // Verify the invite belongs to this user
    const service = createServiceClient()
    const { data: invite } = await service
      .from('team_invites')
      .select('id, accepted_user_id')
      .eq('id', inviteId)
      .eq('status', 'accepted')
      .maybeSingle()

    if (!invite) return unauthorized('Not a member of this workspace')

    // Allow if accepted_user_id matches OR if not yet linked (first switch)
    if (invite.accepted_user_id && invite.accepted_user_id !== user.id) {
      return unauthorized('Not a member of this workspace')
    }
  }

  const cookieStore = await cookies()
  cookieStore.set('pk-workspace', inviteId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })

  return ok({ switched: true, inviteId })
}

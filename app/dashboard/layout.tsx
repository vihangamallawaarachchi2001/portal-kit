import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { Profile } from '@/types/database'
import { getWorkspaceContext, getAvailableWorkspaces, WorkspaceSummary } from '@/lib/workspace'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  const { ownerId, isOwner, permissions } = await getWorkspaceContext(user.id, user.email ?? '')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_completed) redirect('/onboarding')

  // For team members, also fetch the owner's profile for plan gating + workspace name
  let ownerProfile: { full_name: string | null; business_name: string | null; plan: string; avatar_url?: string | null } | null = null
  if (!isOwner) {
    const service = createServiceClient()
    const { data } = await service
      .from('profiles')
      .select('full_name, business_name, plan, avatar_url')
      .eq('id', ownerId)
      .single()
    ownerProfile = data as typeof ownerProfile
  }

  // Workspace switcher data
  const cookieStore = await cookies()
  const currentWorkspaceId = cookieStore.get('pk-workspace')?.value ?? 'own'
  const teamWorkspaces = await getAvailableWorkspaces(user.id, user.email ?? '')

  const availableWorkspaces: (WorkspaceSummary & { isPersonal: boolean })[] = [
    {
      inviteId: 'own',
      ownerId: user.id,
      name: profile?.business_name || profile?.full_name || 'My Workspace',
      avatarUrl: profile?.avatar_url ?? null,
      isPersonal: true,
    },
    ...teamWorkspaces.map(w => ({ ...w, isPersonal: false })),
  ]

  // Counts scoped to the active workspace owner
  const { count: clientCount } = await supabase
    .from('clients')
    .select('id', { count: 'exact', head: true })
    .eq('freelancer_id', ownerId)
    .eq('status', 'active')
    .is('deleted_at', null)

  const { count: unreadCount } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('sender_type', 'client')
    .is('read_at', null)
    .in(
      'project_id',
      (
        await supabase
          .from('projects')
          .select('id')
          .eq('freelancer_id', ownerId)
          .is('deleted_at', null)
      ).data?.map(p => p.id) ?? []
    )

  const op = ownerProfile as { full_name: string | null; business_name: string | null; plan: string } | null
  const workspaceName = op?.business_name || op?.full_name || null
  const effectivePlan = op?.plan ?? profile?.plan ?? 'free'

  return (
    <DashboardShell
      profile={profile as Profile}
      unreadCount={unreadCount ?? 0}
      clientCount={clientCount ?? 0}
      isOwner={isOwner}
      permissions={permissions}
      workspaceName={workspaceName}
      effectivePlan={effectivePlan}
      currentWorkspaceId={currentWorkspaceId}
      availableWorkspaces={availableWorkspaces}
    >
      {children}
    </DashboardShell>
  )
}

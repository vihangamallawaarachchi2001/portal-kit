import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TeamSettings } from '@/components/dashboard/team-settings'
import { getWorkspaceContext } from '@/lib/workspace'
import { Lock } from 'lucide-react'

export const revalidate = 0

export default async function TeamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { isOwner } = await getWorkspaceContext(user.id, user.email ?? '')
  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-8 py-24 text-center">
        <div className="size-12 rounded-xl bg-surface-container flex items-center justify-center">
          <Lock className="size-5 text-on-surface-variant" />
        </div>
        <div>
          <p className="text-sm font-bold text-on-surface">Owner only</p>
          <p className="text-xs text-on-surface-variant mt-1 max-w-xs">
            Team management is handled by the workspace owner.
          </p>
        </div>
      </div>
    )
  }

  const [{ data: profile }, { data: members }] = await Promise.all([
    supabase.from('profiles').select('plan').eq('id', user.id).single(),
    supabase.from('team_invites').select('*').eq('owner_id', user.id).order('invited_at', { ascending: false }),
  ])

  return (
    <TeamSettings
      plan={profile?.plan ?? 'free'}
      initialMembers={members ?? []}
    />
  )
}

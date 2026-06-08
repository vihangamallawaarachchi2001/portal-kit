import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TeamSettings } from '@/components/dashboard/team-settings'

export const revalidate = 0

export default async function TeamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

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

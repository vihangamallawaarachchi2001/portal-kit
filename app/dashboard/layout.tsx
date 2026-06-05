import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { UpgradeNudge } from '@/components/dashboard/upgrade-nudge'
import { Profile } from '@/types/database'
import { Toaster } from '@/components/ui/sonner'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_completed) redirect('/onboarding')

  const { count: clientCount } = await supabase
    .from('clients')
    .select('id', { count: 'exact', head: true })
    .eq('freelancer_id', user.id)
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
          .eq('freelancer_id', user.id)
          .is('deleted_at', null)
      ).data?.map(p => p.id) ?? []
    )

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar profile={profile as Profile} unreadCount={unreadCount ?? 0} clientCount={clientCount ?? 0} />
      <div className="flex-1 min-w-0 flex flex-col" style={{ marginLeft: '240px' }}>
        <DashboardHeader profile={profile as Profile} unreadCount={unreadCount ?? 0} />
        <main className="flex-1 pt-14 min-h-screen">{children}</main>
      </div>
      {profile?.plan === 'free' && <UpgradeNudge />}
      <Toaster position="bottom-right" richColors />
    </div>
  )
}

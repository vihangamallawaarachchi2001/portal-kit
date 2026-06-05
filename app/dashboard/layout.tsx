import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
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
    <div className="min-h-screen bg-surface flex">
      <Sidebar profile={profile as Profile} unreadCount={unreadCount ?? 0} />
      <div className="flex-1 min-w-0 flex flex-col" style={{ marginLeft: '240px' }}>
        <DashboardHeader profile={profile as Profile} unreadCount={unreadCount ?? 0} />
        <main className="flex-1 pt-14 min-h-screen">{children}</main>
      </div>
      <Toaster position="bottom-right" richColors />
    </div>
  )
}

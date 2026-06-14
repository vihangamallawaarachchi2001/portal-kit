import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AnalyticsDashboard } from '@/components/dashboard/analytics-dashboard'
import { getWorkspaceContext } from '@/lib/workspace'

export const revalidate = 0

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const ctx = await getWorkspaceContext(user.id, user.email ?? '')
  const { ownerId } = ctx

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', ownerId)
    .single()

  return <AnalyticsDashboard plan={profile?.plan ?? 'free'} />
}

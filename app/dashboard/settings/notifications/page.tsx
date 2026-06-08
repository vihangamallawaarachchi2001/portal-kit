import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import { DEFAULT_NOTIFICATION_PREFERENCES } from '@/types/database'
import NotificationsSettings from '@/components/dashboard/notifications-settings'

export const revalidate = 0

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const service = createServiceClient()
  const { data: profile } = await service
    .from('profiles')
    .select('plan, notification_preferences')
    .eq('id', user.id)
    .single()

  const initialPrefs = {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...(profile?.notification_preferences ?? {}),
  }

  return (
    <NotificationsSettings
      plan={profile?.plan ?? 'free'}
      initialPrefs={initialPrefs}
    />
  )
}

import { createServiceClient } from '@/lib/supabase/service'
import { DEFAULT_NOTIFICATION_PREFERENCES, NotificationPreferences } from '@/types/database'

/**
 * Returns the freelancer's notification preference for a given key.
 * Falls back to the default if the column is missing or the key is not set.
 */
export async function getNotificationPref(
  freelancerId: string,
  key: keyof NotificationPreferences,
): Promise<boolean> {
  const service = createServiceClient()
  const { data } = await service
    .from('profiles')
    .select('notification_preferences')
    .eq('id', freelancerId)
    .single()

  const prefs = data?.notification_preferences as NotificationPreferences | null
  if (prefs && key in prefs) return Boolean(prefs[key])
  return DEFAULT_NOTIFICATION_PREFERENCES[key] ?? true
}

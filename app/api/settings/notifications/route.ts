import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { ok, unauthorized, badRequest, internalError } from '@/lib/api'
import { DEFAULT_NOTIFICATION_PREFERENCES, NotificationPreferences } from '@/types/database'

const ALLOWED_KEYS: Array<keyof NotificationPreferences> = [
  'messages', 'file_review', 'invoice_paid', 'status_change', 'weekly_digest',
]

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const service = createServiceClient()
  const { data: profile, error } = await service
    .from('profiles')
    .select('notification_preferences')
    .eq('id', user.id)
    .single()

  if (error) return internalError(error.message)

  const preferences: NotificationPreferences = {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...(profile?.notification_preferences ?? {}),
  }

  return ok({ preferences })
}

export async function PATCH(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  let body: unknown
  try { body = await req.json() } catch { return badRequest('Invalid JSON') }

  if (typeof body !== 'object' || body === null) return badRequest('Invalid body')

  const incoming = body as Record<string, unknown>
  const sanitized: Partial<NotificationPreferences> = {}
  for (const key of ALLOWED_KEYS) {
    if (key in incoming && typeof incoming[key] === 'boolean') {
      sanitized[key] = incoming[key] as boolean
    }
  }

  if (Object.keys(sanitized).length === 0) return badRequest('No valid preference keys')

  const service = createServiceClient()

  // Merge with existing preferences (don't overwrite keys not in this request)
  const { data: existing } = await service
    .from('profiles')
    .select('notification_preferences')
    .eq('id', user.id)
    .single()

  const merged: NotificationPreferences = {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...(existing?.notification_preferences ?? {}),
    ...sanitized,
  }

  const { error } = await service
    .from('profiles')
    .update({ notification_preferences: merged, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return internalError(error.message)
  return ok({ preferences: merged })
}

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { ok, unauthorized, badRequest, internalError } from '@/lib/api'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  let body: unknown
  try { body = await req.json() } catch { return badRequest('Invalid JSON') }

  const { endpoint, keys } = body as { endpoint?: string; keys?: unknown }
  if (!endpoint || !keys) return badRequest('endpoint and keys required')

  // Determine caller — freelancer session or portal client cookie
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const cookieStore = await cookies()
  const portalClientId = cookieStore.get('portal_client_id')?.value

  if (!user && !portalClientId) return unauthorized()

  const subscriberType = user ? 'freelancer' : 'client'
  const subscriberId   = user ? user.id : portalClientId!

  const service = createServiceClient()
  const { error } = await service
    .from('push_subscriptions')
    .upsert(
      { subscriber_type: subscriberType, subscriber_id: subscriberId, endpoint, keys },
      { onConflict: 'subscriber_id,endpoint' }
    )

  if (error) return internalError(error.message)
  return ok({ subscribed: true })
}

export async function DELETE(req: Request) {
  let body: unknown
  try { body = await req.json() } catch { return badRequest('Invalid JSON') }
  const { endpoint } = body as { endpoint?: string }
  if (!endpoint) return badRequest('endpoint required')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const cookieStore = await cookies()
  const portalClientId = cookieStore.get('portal_client_id')?.value

  if (!user && !portalClientId) return unauthorized()

  const subscriberId = user ? user.id : portalClientId!

  const service = createServiceClient()
  await service
    .from('push_subscriptions')
    .delete()
    .eq('subscriber_id', subscriberId)
    .eq('endpoint', endpoint)

  return ok({ unsubscribed: true })
}

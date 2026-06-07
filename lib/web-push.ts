import webpush from 'web-push'
import { createServiceClient } from '@/lib/supabase/service'

// VAPID keys must be set in environment. Generate once with:
//   npx web-push generate-vapid-keys
// Then add to .env.local:
//   NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
//   VAPID_PRIVATE_KEY=...
//   VAPID_SUBJECT=mailto:your@email.com

function getVapid() {
  const publicKey  = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject    = process.env.VAPID_SUBJECT ?? 'mailto:noreply@portalkit.app'
  if (!publicKey || !privateKey) return null
  return { publicKey, privateKey, subject }
}

export interface PushPayload {
  title: string
  body: string
  tag?: string
  data?: { url?: string }
}

// Send a push notification to all subscriptions for a given subscriber
export async function sendPushToSubscriber(
  subscriberType: 'freelancer' | 'client',
  subscriberId: string,
  payload: PushPayload
) {
  const vapid = getVapid()
  if (!vapid) {
    console.warn('[push] VAPID keys not configured — skipping push notification')
    return
  }

  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey)

  const service = createServiceClient()
  const { data: subs } = await service
    .from('push_subscriptions')
    .select('id, endpoint, keys')
    .eq('subscriber_type', subscriberType)
    .eq('subscriber_id', subscriberId)

  if (!subs?.length) return

  const pushStr = JSON.stringify(payload)

  await Promise.allSettled(
    subs.map(async sub => {
      const subscription = {
        endpoint: sub.endpoint,
        keys: sub.keys as { p256dh: string; auth: string },
      }
      try {
        await webpush.sendNotification(subscription, pushStr)
      } catch (err: unknown) {
        // 410 Gone or 404 = subscription expired; remove it
        const status = (err as { statusCode?: number }).statusCode
        if (status === 410 || status === 404) {
          await service.from('push_subscriptions').delete().eq('id', sub.id)
        } else {
          console.error('[push] send error', err)
        }
      }
    })
  )
}

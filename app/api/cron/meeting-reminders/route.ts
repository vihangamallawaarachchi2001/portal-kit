import { createServiceClient } from '@/lib/supabase/service'
import { NextResponse } from 'next/server'
import { sendMeetingReminderEmail } from '@/lib/email'
import { sendPushToSubscriber } from '@/lib/web-push'

function isAuthorized(req: Request): boolean {
  const auth = req.headers.get('authorization')
  if (auth === `Bearer ${process.env.CRON_SECRET}`) return true
  const xSecret = req.headers.get('x-cron-secret')
  if (xSecret === process.env.CRON_SECRET) return true
  return false
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createServiceClient()
  const now = new Date()

  // 24h reminders
  const from24 = new Date(now.getTime() + 23 * 60 * 60 * 1000).toISOString()
  const to24   = new Date(now.getTime() + 25 * 60 * 60 * 1000).toISOString()

  const { data: meetings24 } = await service
    .from('meetings')
    .select('*')
    .eq('status', 'scheduled')
    .gte('scheduled_at', from24)
    .lte('scheduled_at', to24)
    .is('reminder_24h_at', null)

  if (meetings24?.length) {
    for (const m of meetings24 as any[]) {
      try {
        const [{ data: client }, { data: profile }] = await Promise.all([
          service.from('clients').select('id, name, email, portal_slug').eq('id', m.client_id).single(),
          service.from('profiles').select('id, full_name, notification_preferences').eq('id', m.freelancer_id).single(),
        ])

        // send to freelancer
        if (profile) {
          const to = profile?.email ?? profile?.id ?? ''
          sendMeetingReminderEmail({ to, recipientName: profile?.full_name ?? 'Freelancer', title: m.title, timeframe: '24 hours', meetLink: m.meet_link }).catch(err => console.error('[cron/meetings] reminder 24h freelancer', err))
          if (profile.id) sendPushToSubscriber('freelancer', profile.id, { title: `Meeting in 24 hours: ${m.title}`, body: `${m.title} scheduled`, data: { url: '/dashboard/projects' } }).catch(() => {})
        }

        // send to client
        if (client?.email) {
          sendMeetingReminderEmail({ to: client.email, recipientName: client.name, title: m.title, timeframe: '24 hours', meetLink: m.meet_link }).catch(err => console.error('[cron/meetings] reminder 24h client', err))
          if (client.id) sendPushToSubscriber('client', client.id, { title: `Meeting in 24 hours: ${m.title}`, body: `${m.title} scheduled`, data: { url: `/p/${client.portal_slug}` } }).catch(() => {})
        }

        await service.from('meetings').update({ reminder_24h_at: new Date().toISOString() }).eq('id', m.id)
      } catch (err) {
        console.error('[cron/meetings] 24h loop error', err)
      }
    }
  }

  // 1h reminders
  const from1 = new Date(now.getTime() + 45 * 60 * 1000).toISOString()
  const to1   = new Date(now.getTime() + 75 * 60 * 1000).toISOString()

  const { data: meetings1 } = await service
    .from('meetings')
    .select('*')
    .eq('status', 'scheduled')
    .gte('scheduled_at', from1)
    .lte('scheduled_at', to1)
    .is('reminder_1h_at', null)

  if (meetings1?.length) {
    for (const m of meetings1 as any[]) {
      try {
        const [{ data: client }, { data: profile }] = await Promise.all([
          service.from('clients').select('id, name, email, portal_slug').eq('id', m.client_id).single(),
          service.from('profiles').select('id, full_name').eq('id', m.freelancer_id).single(),
        ])

        if (profile) {
          const to = profile?.email ?? profile?.id ?? ''
          sendMeetingReminderEmail({ to, recipientName: profile?.full_name ?? 'Freelancer', title: m.title, timeframe: '1 hour', meetLink: m.meet_link }).catch(err => console.error('[cron/meetings] reminder 1h freelancer', err))
          if (profile.id) sendPushToSubscriber('freelancer', profile.id, { title: `Meeting in 1 hour: ${m.title}`, body: `${m.title} starting soon`, data: { url: '/dashboard/projects' } }).catch(() => {})
        }

        if (client?.email) {
          sendMeetingReminderEmail({ to: client.email, recipientName: client.name, title: m.title, timeframe: '1 hour', meetLink: m.meet_link }).catch(err => console.error('[cron/meetings] reminder 1h client', err))
          if (client.id) sendPushToSubscriber('client', client.id, { title: `Meeting in 1 hour: ${m.title}`, body: `${m.title} starting soon`, data: { url: `/p/${client.portal_slug}` } }).catch(() => {})
        }

        await service.from('meetings').update({ reminder_1h_at: new Date().toISOString() }).eq('id', m.id)
      } catch (err) {
        console.error('[cron/meetings] 1h loop error', err)
      }
    }
  }

  // Mark past meetings completed
  try {
    await service.from('meetings').update({ status: 'completed' }).lt('scheduled_at', new Date().toISOString()).eq('status', 'scheduled')
  } catch (err) {
    console.error('[cron/meetings] mark completed failed', err)
  }

  return NextResponse.json({ ok: true })
}

export async function POST(req: Request) { return GET(req) }

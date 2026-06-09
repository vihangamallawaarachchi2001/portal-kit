import { createServiceClient } from '@/lib/supabase/service'
import { NextResponse } from 'next/server'
import { sendMilestoneReminderEmail, sendMilestoneClientUpcomingEmail } from '@/lib/email'
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

  const daysToNotify = [7, 3, 1]

  for (const days of daysToNotify) {
    const target = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    target.setUTCDate(target.getUTCDate() + days)
    const dateStr = target.toISOString().slice(0, 10) // YYYY-MM-DD

    const { data: milestones } = await service
      .from('milestones')
      .select('id, title, due_date, project_id, freelancer_id')
      .eq('due_date', dateStr)
      .is('completed_at', null)

    if (!milestones || milestones.length === 0) continue

    for (const m of milestones as any[]) {
      try {
        // load freelancer prefs and project/client
        const [{ data: profile }, { data: project }] = await Promise.all([
          service.from('profiles').select('id, full_name, notification_preferences').eq('id', m.freelancer_id).single(),
          service.from('projects').select('id, title, client_id').eq('id', m.project_id).single(),
        ])

        if (!project) continue

        const { data: client } = await service.from('clients').select('id, name, email, portal_slug').eq('id', project.client_id).single()

        const daysAway = days
        const dueDate = m.due_date

        // Fetch freelancer email from auth.users
        const { data: { user: freelancerUser } } = await service.auth.admin.getUserById(m.freelancer_id)
        const freelancerEmail = freelancerUser?.email ?? ''

        // Send reminder to freelancer if they have milestone_reminders enabled
        const prefs = profile?.notification_preferences ?? {}
        if (prefs.milestone_reminders ?? true) {
          sendMilestoneReminderEmail({
            to: freelancerEmail,
            freelancerName: profile?.full_name ?? 'Freelancer',
            clientName: client?.name ?? '',
            milestoneTitle: m.title,
            projectTitle: project.title,
            dueDate,
            daysAway,
            dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/projects`,
          }).catch(err => console.error('[cron/milestones] send reminder email failed', err))

          // Push to freelancer
          if (profile?.id) {
            sendPushToSubscriber('freelancer', profile.id, {
              title: `Milestone due in ${daysAway} days`,
              body: `${m.title} — due ${dueDate}`,
              data: { url: `/dashboard/projects` },
            }).catch(err => console.error('[cron/milestones] push failed', err))
          }
        }

        // If freelancer preference allows, notify client
        if (prefs.milestone_client_notify ?? true) {
          if (client?.email) {
            sendMilestoneClientUpcomingEmail({
              to: client.email,
              clientName: client.name,
              milestoneTitle: m.title,
              projectTitle: project.title,
              dueDate,
              daysAway,
              portalUrl: `${process.env.NEXT_PUBLIC_APP_URL}/p/${client.portal_slug}`,
            }).catch(err => console.error('[cron/milestones] send client upcoming email failed', err))

            sendPushToSubscriber('client', client.id, {
              title: `Upcoming milestone: ${m.title}`,
              body: `${m.title} — ${daysAway} days away`,
              data: { url: `/p/${client.portal_slug}` },
            }).catch(err => console.error('[cron/milestones] push to client failed', err))
          }
        }
      } catch (err) {
        console.error('[cron/milestones] processing milestone failed', err)
      }
    }
  }

  return NextResponse.json({ ok: true })
}

export async function POST(req: Request) {
  return GET(req)
}

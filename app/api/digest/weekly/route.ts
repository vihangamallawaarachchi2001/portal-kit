import { createServiceClient } from '@/lib/supabase/service'
import { NextResponse } from 'next/server'
import { sendWeeklyDigest } from '@/lib/email'

function isAuthorized(req: Request): boolean {
  const authHeader = req.headers.get('authorization')
  if (authHeader === `Bearer ${process.env.CRON_SECRET}`) return true
  const xSecret = req.headers.get('x-cron-secret')
  if (xSecret === process.env.CRON_SECRET) return true
  return false
}

async function runDigest() {
  const service = createServiceClient()
  const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? ''

  // Bring overdue invoices up to date before computing digest stats
  const { error: overdueErr } = await service.rpc('mark_overdue_invoices')
  if (overdueErr) console.error('[digest] mark_overdue_invoices failed', overdueErr)

  // Find all Pro/Business users with weekly_digest preference enabled
  const { data: profiles } = await service
    .from('profiles')
    .select('id, full_name, base_currency, notification_preferences, plan')
    .in('plan', ['pro', 'business'])

  const eligible = (profiles ?? []).filter(p => {
    const prefs = p.notification_preferences as Record<string, boolean> | null
    return prefs?.weekly_digest === true
  })

  if (eligible.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, eligible: 0 })
  }

  const userIds  = eligible.map(p => p.id)
  const weekAgo  = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // Batch all queries in parallel — limits prevent OOM on large datasets;
  // single listUsers call replaces the prior N×getUserById loop
  const [
    { data: pendingFiles },
    { data: outstandingInvoices },
    { data: recentMessages },
    authUsersResult,
  ] = await Promise.all([
    // Pending files per freelancer
    service
      .from('files')
      .select('freelancer_id')
      .in('freelancer_id', userIds)
      .eq('status', 'pending')
      .is('deleted_at', null)
      .limit(5000),

    // Outstanding invoices per freelancer
    service
      .from('invoices')
      .select('freelancer_id, total, currency')
      .in('freelancer_id', userIds)
      .in('status', ['sent', 'overdue'])
      .is('deleted_at', null)
      .limit(5000),

    // Unread client messages in the last 7 days, via project join
    service
      .from('messages')
      .select('project_id, projects!inner(freelancer_id)')
      .in('projects.freelancer_id', userIds)
      .eq('sender_type', 'client')
      .is('read_at', null)
      .gte('created_at', weekAgo)
      .limit(50000),

    // Single bulk fetch instead of N×getUserById
    service.auth.admin.listUsers({ perPage: 1000 }),
  ])

  // Build lookup maps
  const pendingMap  = new Map<string, number>()
  for (const f of pendingFiles ?? []) pendingMap.set(f.freelancer_id, (pendingMap.get(f.freelancer_id) ?? 0) + 1)

  const outstandingMap = new Map<string, number>()
  for (const inv of outstandingInvoices ?? []) outstandingMap.set(inv.freelancer_id, (outstandingMap.get(inv.freelancer_id) ?? 0) + Number(inv.total))

  const unreadMap = new Map<string, number>()
  for (const msg of recentMessages ?? []) {
    const project = Array.isArray(msg.projects) ? (msg.projects[0] ?? null) : msg.projects
    const fid = (project as { freelancer_id: string } | null)?.freelancer_id
    if (fid) unreadMap.set(fid, (unreadMap.get(fid) ?? 0) + 1)
  }

  const emailMap = new Map<string, string>()
  const eligibleSet = new Set(userIds)
  for (const u of (authUsersResult.data?.users ?? []) as { id: string; email?: string }[]) {
    if (u.id && u.email && eligibleSet.has(u.id)) emailMap.set(u.id, u.email)
  }

  let sent = 0
  await Promise.all(
    eligible.map(async profile => {
      const email = emailMap.get(profile.id)
      if (!email) return

      await sendWeeklyDigest({
        to:               email,
        freelancerName:   profile.full_name ?? 'there',
        pendingApprovals: pendingMap.get(profile.id) ?? 0,
        outstandingAmount:outstandingMap.get(profile.id) ?? 0,
        currency:         profile.base_currency ?? 'USD',
        unreadMessages:   unreadMap.get(profile.id) ?? 0,
        dashboardUrl:     `${appUrl}/dashboard`,
      }).catch((err) => console.error('[email] weekly-digest send failed', err))

      sent++
    })
  )

  return NextResponse.json({ ok: true, sent, eligible: eligible.length })
}

// GET: Vercel Cron calls this every Monday at 08:00 UTC
export async function GET(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return runDigest()
}

// POST: manual trigger
export async function POST(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return runDigest()
}

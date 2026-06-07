import { createServiceClient } from '@/lib/supabase/service'
import { NextResponse } from 'next/server'
import { sendWeeklyDigest } from '@/lib/email'

function isAuthorized(req: Request): boolean {
  const authHeader = req.headers.get('authorization')
  if (authHeader === `Bearer ${process.env.CRON_SECRET}`) return true
  const xSecret = req.headers.get('x-cron-secret')
  if (xSecret === process.env.CRON_SECRET) return true
  const urlSecret = new URL(req.url).searchParams.get('secret')
  if (urlSecret === process.env.CRON_SECRET) return true
  return false
}

async function runDigest() {
  const service = createServiceClient()
  const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? ''

  // Find all Pro/Business users with weekly_digest preference enabled
  const { data: profiles } = await service
    .from('profiles')
    .select('id, full_name, base_currency, notification_preferences, plan')
    .in('plan', ['pro', 'business'])

  const eligible = (profiles ?? []).filter(p => {
    const prefs = p.notification_preferences as Record<string, boolean> | null
    return prefs?.weekly_digest === true
  })

  let sent = 0

  for (const profile of eligible) {
    const userId = profile.id

    // Get auth user email
    const { data: authUser } = await service.auth.admin.getUserById(userId)
    const email = authUser?.user?.email
    if (!email) continue

    // Compute weekly stats
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const [
      { count: pendingApprovals },
      { data: outstandingInvoices },
      { count: unreadMessages },
    ] = await Promise.all([
      service
        .from('files')
        .select('id', { count: 'exact', head: true })
        .eq('freelancer_id', userId)
        .eq('status', 'pending')
        .is('deleted_at', null),

      service
        .from('invoices')
        .select('total, currency')
        .eq('freelancer_id', userId)
        .in('status', ['sent', 'overdue'])
        .is('deleted_at', null),

      service
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('sender_type', 'client')
        .is('read_at', null)
        .gte('created_at', weekAgo)
        // messages belong to projects → filter by freelancer via join would require RPC;
        // for simplicity we join via projects
        .in(
          'project_id',
          (await service
            .from('projects')
            .select('id')
            .eq('freelancer_id', userId)
            .is('deleted_at', null)
          ).data?.map(p => p.id) ?? [],
        ),
    ])

    const outstandingAmount = (outstandingInvoices ?? []).reduce(
      (sum, inv) => sum + Number(inv.total), 0,
    )

    await sendWeeklyDigest({
      to: email,
      freelancerName:    profile.full_name ?? 'there',
      pendingApprovals:  pendingApprovals ?? 0,
      outstandingAmount,
      currency:          profile.base_currency ?? 'USD',
      unreadMessages:    unreadMessages ?? 0,
      dashboardUrl:      `${appUrl}/dashboard`,
    }).catch(() => {})

    sent++
  }

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

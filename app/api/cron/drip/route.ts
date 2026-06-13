import { createServiceClient } from '@/lib/supabase/service'
import { NextResponse } from 'next/server'
import {
  sendDripDay1Email,
  sendDripDay3Email,
  sendDripDay5Email,
  sendDripDay7Email,
} from '@/lib/email'

function isAuthorized(req: Request): boolean {
  const auth = req.headers.get('authorization')
  if (auth === `Bearer ${process.env.CRON_SECRET}`) return true
  const xSecret = req.headers.get('x-cron-secret')
  if (xSecret === process.env.CRON_SECRET) return true
  return false
}

// Drip schedule (drip_step = emails sent so far):
//   step 0 → Day 1 email   (send when created_at ≥ 1 day ago, drip_last_sent_at IS NULL)
//   step 1 → Day 3 email   (send 2 days after Day 1)
//   step 2 → Day 5 email   (send 2 days after Day 3)
//   step 3 → Day 7 email   (send 2 days after Day 5)
//   step 4+ → sequence complete

async function runDrip() {
  const service = createServiceClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const foundingMemberUrl = `${appUrl}/founding-member`

  const now = new Date()
  const oneDayAgo  = new Date(now.getTime() - 1  * 24 * 60 * 60 * 1000).toISOString()
  const twoDaysAgo = new Date(now.getTime() - 2  * 24 * 60 * 60 * 1000).toISOString()

  // Fetch all users due across all 4 steps in parallel
  const [step0Result, step1Result, step2Result, step3Result] = await Promise.all([
    // Step 0: onboarded ≥1 day ago, sequence not yet started
    service
      .from('profiles')
      .select('id, full_name')
      .eq('onboarding_completed', true)
      .eq('drip_step', 0)
      .is('drip_last_sent_at', null)
      .lte('created_at', oneDayAgo),

    // Steps 1-3: last drip email sent ≥2 days ago
    service
      .from('profiles')
      .select('id, full_name')
      .eq('drip_step', 1)
      .lte('drip_last_sent_at', twoDaysAgo),

    service
      .from('profiles')
      .select('id, full_name')
      .eq('drip_step', 2)
      .lte('drip_last_sent_at', twoDaysAgo),

    service
      .from('profiles')
      .select('id, full_name')
      .eq('drip_step', 3)
      .lte('drip_last_sent_at', twoDaysAgo),
  ])

  type ProfileRow = { id: string; full_name: string | null }

  const step0 = (step0Result.data ?? []) as ProfileRow[]
  const step1 = (step1Result.data ?? []) as ProfileRow[]
  const step2 = (step2Result.data ?? []) as ProfileRow[]
  const step3 = (step3Result.data ?? []) as ProfileRow[]

  const allDue = [...step0, ...step1, ...step2, ...step3]
  if (allDue.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 })
  }

  // Resolve emails for all due users in one batch of parallel getUserById calls
  const allIds = allDue.map(p => p.id)
  const emailResults = await Promise.all(
    allIds.map(id => service.auth.admin.getUserById(id))
  )
  const emailMap = new Map(
    emailResults.map((r, i) => [allIds[i], r.data.user?.email ?? ''])
  )

  let sent = 0
  const sentAt = now.toISOString()

  // Helper: send email, log errors, return whether it succeeded
  async function trySend(id: string, fn: () => Promise<void>): Promise<boolean> {
    try {
      await fn()
      return true
    } catch (err) {
      console.error(`[cron/drip] send failed for ${id}`, err)
      return false
    }
  }

  // Helper: batch-update drip_step for users whose emails sent successfully
  async function bumpStep(ids: string[], nextStep: number) {
    if (ids.length === 0) return
    const { error } = await service
      .from('profiles')
      .update({ drip_step: nextStep, drip_last_sent_at: sentAt })
      .in('id', ids)
    if (error) console.error(`[cron/drip] update to step ${nextStep} failed`, error)
  }

  // Process each step concurrently within the step, then update in batch
  const [step0Sent, step1Sent, step2Sent, step3Sent] = await Promise.all([
    Promise.all(step0.map(async p => {
      const to = emailMap.get(p.id) ?? ''
      if (!to) return false
      const ok = await trySend(p.id, () => sendDripDay1Email({ to, name: p.full_name ?? '' }))
      if (ok) sent++
      return ok ? p.id : null
    })),
    Promise.all(step1.map(async p => {
      const to = emailMap.get(p.id) ?? ''
      if (!to) return false
      const ok = await trySend(p.id, () => sendDripDay3Email({ to, name: p.full_name ?? '' }))
      if (ok) sent++
      return ok ? p.id : null
    })),
    Promise.all(step2.map(async p => {
      const to = emailMap.get(p.id) ?? ''
      if (!to) return false
      const ok = await trySend(p.id, () => sendDripDay5Email({ to, name: p.full_name ?? '' }))
      if (ok) sent++
      return ok ? p.id : null
    })),
    Promise.all(step3.map(async p => {
      const to = emailMap.get(p.id) ?? ''
      if (!to) return false
      const ok = await trySend(p.id, () =>
        sendDripDay7Email({ to, name: p.full_name ?? '', foundingMemberUrl })
      )
      if (ok) sent++
      return ok ? p.id : null
    })),
  ])

  // Batch-update drip_step for all successful sends
  await Promise.all([
    bumpStep(step0Sent.filter((id): id is string => typeof id === 'string'), 1),
    bumpStep(step1Sent.filter((id): id is string => typeof id === 'string'), 2),
    bumpStep(step2Sent.filter((id): id is string => typeof id === 'string'), 3),
    bumpStep(step3Sent.filter((id): id is string => typeof id === 'string'), 4),
  ])

  return NextResponse.json({
    ok: true,
    sent,
    breakdown: {
      day1: step0Sent.filter(Boolean).length,
      day3: step1Sent.filter(Boolean).length,
      day5: step2Sent.filter(Boolean).length,
      day7: step3Sent.filter(Boolean).length,
    },
  })
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return runDrip()
}

export async function POST(req: Request) {
  return GET(req)
}

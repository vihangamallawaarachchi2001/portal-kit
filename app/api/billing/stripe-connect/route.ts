import { createClient } from '@/lib/supabase/server'
import { ok, unauthorized, internalError } from '@/lib/api'
import Stripe from 'stripe'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' })
}

// POST — create Express account (or reuse existing) and return onboarding URL
// Body: { from?: 'onboarding' | 'settings' } — controls where the return URL redirects
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const body = await req.json().catch(() => ({})) as { from?: string }
  const from = body?.from === 'onboarding' ? 'onboarding' : 'settings'

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_connect_account_id, stripe_connect_onboarded')
    .eq('id', user.id)
    .single()

  const stripe = getStripe()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://portalkit.app'

  try {
    let accountId = profile?.stripe_connect_account_id

    // Create a new Express account if they don't have one
    if (!accountId) {
      const account = await stripe.accounts.create({ type: 'express' })
      accountId = account.id

      const { error } = await supabase
        .from('profiles')
        .update({ stripe_connect_account_id: accountId, stripe_connect_onboarded: false })
        .eq('id', user.id)

      if (error) return internalError(error.message)
    }

    // Create an account link for onboarding / re-onboarding
    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${appUrl}/api/billing/stripe-connect`,
      return_url:  `${appUrl}/api/billing/stripe-connect/return?uid=${user.id}&from=${from}`,
      type: 'account_onboarding',
    })

    return ok({ url: link.url })
  } catch (err) {
    console.error('[stripe-connect] POST error:', err)
    return internalError('Failed to start Stripe Connect. Please verify STRIPE_SECRET_KEY is configured.')
  }
}

// DELETE — disconnect Stripe Connect account
export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const { error } = await supabase
    .from('profiles')
    .update({ stripe_connect_account_id: null, stripe_connect_onboarded: false })
    .eq('id', user.id)

  if (error) return internalError(error.message)
  return ok({ disconnected: true })
}

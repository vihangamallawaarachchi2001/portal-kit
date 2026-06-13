import { createServiceClient } from '@/lib/supabase/service'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' })
}

// GET — called by Stripe after onboarding completes; verifies account and updates DB
export async function GET(req: Request) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://portalkit.app'
  const { searchParams } = new URL(req.url)
  const uid = searchParams.get('uid')

  const from = searchParams.get('from') ?? 'settings'

  if (!uid) {
    const dest = from === 'onboarding' ? `/onboarding?step=2` : `/dashboard/settings/billing?stripe_connect=error`
    return NextResponse.redirect(`${appUrl}${dest}`)
  }

  const service = createServiceClient()

  const { data: profile } = await service
    .from('profiles')
    .select('stripe_connect_account_id')
    .eq('id', uid)
    .single()

  if (!profile?.stripe_connect_account_id) {
    return NextResponse.redirect(`${appUrl}/dashboard/settings/billing?stripe_connect=error`)
  }

  try {
    const stripe = getStripe()
    const account = await stripe.accounts.retrieve(profile.stripe_connect_account_id)
    const onboarded = account.charges_enabled && account.details_submitted

    await service
      .from('profiles')
      .update({ stripe_connect_onboarded: onboarded })
      .eq('id', uid)

    if (from === 'onboarding') {
      return NextResponse.redirect(`${appUrl}/onboarding?step=2`)
    }

    const status = onboarded ? 'success' : 'pending'
    return NextResponse.redirect(`${appUrl}/dashboard/settings/billing?stripe_connect=${status}`)
  } catch {
    const dest = from === 'onboarding' ? `/onboarding?step=2` : `/dashboard/settings/billing?stripe_connect=error`
    return NextResponse.redirect(`${appUrl}${dest}`)
  }
}

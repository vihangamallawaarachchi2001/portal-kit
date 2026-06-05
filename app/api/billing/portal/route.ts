import { createClient } from '@/lib/supabase/server'
import { ok, unauthorized, badRequest, internalError } from '@/lib/api'
import Stripe from 'stripe'

function getStripe() { return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' }) }

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_customer_id) return badRequest('No billing account found')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  const session = await getStripe().billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${appUrl}/dashboard/settings/billing`,
  })

  return ok({ url: session.url })
}

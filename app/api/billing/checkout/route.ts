import { createClient } from '@/lib/supabase/server'
import { ok, unauthorized, badRequest, internalError } from '@/lib/api'
import Stripe from 'stripe'

function getStripe() { return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' }) }

const PRICE_IDS: Record<string, Record<string, string | undefined>> = {
  pro: {
    monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    annual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
  },
  business: {
    monthly: process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID,
    annual: process.env.STRIPE_BUSINESS_ANNUAL_PRICE_ID,
  },
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  let body: unknown
  try { body = await req.json() } catch { return badRequest('Invalid JSON') }

  const { plan, billing } = body as { plan?: string; billing?: string }
  if (!plan || !billing) return badRequest('plan and billing are required')

  const priceId = PRICE_IDS[plan]?.[billing]
  if (!priceId) return badRequest('Invalid plan or billing period')

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, full_name')
    .eq('id', user.id)
    .single()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  // Create or retrieve Stripe customer
  let customerId = profile?.stripe_customer_id
  if (!customerId) {
    const customer = await getStripe().customers.create({
      email: user.email,
      name: profile?.full_name ?? undefined,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id
    await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
  }

  const session = await getStripe().checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/settings/billing?upgraded=true`,
    cancel_url: `${appUrl}/dashboard/settings/billing`,
    subscription_data: { metadata: { supabase_user_id: user.id } },
    allow_promotion_codes: true,
  })

  if (!session.url) return internalError('Failed to create Stripe session')
  return ok({ url: session.url })
}

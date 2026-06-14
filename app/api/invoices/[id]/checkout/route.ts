import { createServiceClient } from '@/lib/supabase/service'
import { ok, badRequest, unauthorized, notFound, internalError, paymentRequired } from '@/lib/api'
import { isStripeSupportedServer } from '@/lib/currencies-server'
import Stripe from 'stripe'
import { cookies } from 'next/headers'

function getStripe() { return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' }) }

// Platform fee: 2% when payment routes through PortalKit Connect
const PLATFORM_FEE_RATE = 0.02

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const clientId = cookieStore.get('portal_client_id')?.value

  if (!clientId) return unauthorized('No portal session')

  const service = createServiceClient()

  const { data: invoice } = await service
    .from('invoices')
    .select(`
      *,
      clients ( id, name, email, portal_slug ),
      profiles:freelancer_id (
        full_name, business_name, plan,
        stripe_connect_account_id, stripe_connect_onboarded
      )
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!invoice) return notFound('Invoice not found')
  if (invoice.client_id !== clientId) return unauthorized('Access denied')
  if (invoice.status === 'paid') return badRequest('Invoice already paid')
  if (invoice.status === 'draft') return badRequest('Invoice has not been sent yet')

  const client  = Array.isArray(invoice.clients)  ? (invoice.clients[0] ?? null)  : invoice.clients
  const profile = Array.isArray(invoice.profiles) ? (invoice.profiles[0] ?? null) : invoice.profiles

  // Stripe payment collection is a Pro+ feature
  if (profile?.plan === 'free') {
    return paymentRequired(
      'Online invoice payments are available on Pro and above.',
      { code: 'invoice_stripe' },
    )
  }

  // Currency must be on Stripe's supported list
  if (!await isStripeSupportedServer(invoice.currency)) {
    return badRequest(
      `${invoice.currency} is not supported for online payment via Stripe.`,
      { code: 'currency_not_supported' },
    )
  }

  const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? ''
  // Route success through our confirmation endpoint so we can verify + mark paid server-side
  // before the client lands on the portal. Stripe substitutes {CHECKOUT_SESSION_ID} automatically.
  const successUrl = `${appUrl}/api/portal/invoices/payment-confirm?session_id={CHECKOUT_SESSION_ID}&slug=${client?.portal_slug}`
  const cancelUrl  = `${appUrl}/p/${client?.portal_slug}/invoices`

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = (invoice.line_items ?? []).map(
    (item: { description: string; quantity: number; unit_price: number }) => ({
      price_data: {
        currency: invoice.currency.toLowerCase(),
        product_data: { name: item.description },
        unit_amount: Math.round(item.unit_price * 100),
      },
      quantity: item.quantity,
    })
  )

  // Determine routing: if freelancer has a fully-onboarded Connect account, money goes
  // directly to them (PortalKit takes a 2% platform fee). Otherwise money stays in
  // PortalKit's account and is transferred manually.
  const connectAccountId  = profile?.stripe_connect_account_id
  const connectOnboarded  = profile?.stripe_connect_onboarded
  const useConnect        = !!(connectAccountId && connectOnboarded)

  const totalCents = Math.round(Number(invoice.total) * 100)

  let paymentIntentData: Stripe.Checkout.SessionCreateParams['payment_intent_data']

  if (useConnect) {
    paymentIntentData = {
      application_fee_amount: Math.round(totalCents * PLATFORM_FEE_RATE),
      transfer_data: { destination: connectAccountId! },
      metadata: { invoice_id: id, routed_via: 'connect' },
    }
  } else {
    paymentIntentData = {
      metadata: { invoice_id: id, routed_via: 'platform' },
    }
  }

  let session: Stripe.Checkout.Session
  try {
    session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      customer_email: client?.email,
      metadata: { invoice_id: id, client_id: clientId },
      success_url: successUrl,
      cancel_url: cancelUrl,
      payment_intent_data: paymentIntentData,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Stripe error'
    return internalError(msg)
  }

  await service
    .from('invoices')
    .update({ stripe_payment_intent_id: session.payment_intent as string })
    .eq('id', id)

  return ok({ url: session.url })
}

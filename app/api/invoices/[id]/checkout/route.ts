import { createServiceClient } from '@/lib/supabase/service'
import { ok, badRequest, unauthorized, notFound, internalError } from '@/lib/api'
import Stripe from 'stripe'
import { cookies } from 'next/headers'

function getStripe() { return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' }) }

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const clientId = cookieStore.get('portal_client_id')?.value

  if (!clientId) return unauthorized('No portal session')

  const service = createServiceClient()

  const { data: invoice } = await service
    .from('invoices')
    .select('*, clients(id, name, email, portal_slug), profiles:freelancer_id(stripe_customer_id, full_name, business_name)')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!invoice) return notFound('Invoice not found')
  if (invoice.client_id !== clientId) return unauthorized('Access denied')
  if (invoice.status === 'paid') return badRequest('Invoice already paid')
  if (invoice.status === 'draft') return badRequest('Invoice has not been sent yet')

  const client = Array.isArray(invoice.clients) ? invoice.clients[0] : invoice.clients
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const successUrl = `${appUrl}/p/${client?.portal_slug}/invoices?paid=true`
  const cancelUrl = `${appUrl}/p/${client?.portal_slug}/invoices`

  // Build line items for Stripe
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

  // Add tax if applicable
  const session = await getStripe().checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    customer_email: client?.email,
    metadata: { invoice_id: id, client_id: clientId },
    success_url: successUrl,
    cancel_url: cancelUrl,
    payment_intent_data: {
      metadata: { invoice_id: id },
    },
  })

  // Store payment intent ID
  await service
    .from('invoices')
    .update({ stripe_payment_intent_id: session.payment_intent as string })
    .eq('id', id)

  return ok({ url: session.url })
}

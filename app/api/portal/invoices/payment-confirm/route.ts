import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import Stripe from 'stripe'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' })
}

// GET — Stripe redirects here after successful checkout.
// We verify the session server-side, mark the invoice as paid, then redirect to the portal.
// This is more reliable than the webhook alone since the redirect happens immediately.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id')
  const slug = searchParams.get('slug')

  const fallback = slug ? `/p/${slug}/invoices?paid=true` : '/p/access'

  if (!sessionId || !slug) {
    return NextResponse.redirect(new URL(fallback, request.url))
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId)

    if (session.payment_status === 'paid') {
      const invoiceId = session.metadata?.invoice_id

      if (invoiceId) {
        const service = createServiceClient()
        await service
          .from('invoices')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
            stripe_payment_intent_id: typeof session.payment_intent === 'string'
              ? session.payment_intent
              : (session.payment_intent as Stripe.PaymentIntent | null)?.id ?? null,
          })
          .eq('id', invoiceId)
          .not('status', 'eq', 'paid')
      }
    }
  } catch (err) {
    console.error('[payment-confirm] error:', err)
  }

  return NextResponse.redirect(new URL(fallback, request.url))
}

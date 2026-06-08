import { createServiceClient } from '@/lib/supabase/service'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { sendInvoicePaidEmail, sendPaymentReceiptEmail } from '@/lib/email'
import { sendPushToSubscriber } from '@/lib/web-push'

function getStripe() { return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' }) }

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[stripe webhook] signature verification failed', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const service = createServiceClient()

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent
      const invoiceId = pi.metadata?.invoice_id
      if (!invoiceId) break

      const { data: invoice } = await service
        .from('invoices')
        .select('*, clients(name, email, portal_slug), profiles:freelancer_id(full_name, notification_preferences)')
        .eq('id', invoiceId)
        .single()

      if (!invoice) break

      const paidAt = new Date().toISOString()

      // Update invoice and fetch auth user in parallel
      const [, { data: authUser }] = await Promise.all([
        service
          .from('invoices')
          .update({ status: 'paid', paid_at: paidAt, stripe_payment_intent_id: pi.id })
          .eq('id', invoiceId),
        service.auth.admin.getUserById(invoice.freelancer_id),
      ])

      const profile = Array.isArray(invoice.profiles) ? (invoice.profiles[0] ?? null) : invoice.profiles
      const client  = Array.isArray(invoice.clients)  ? (invoice.clients[0] ?? null)  : invoice.clients
      const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? ''

      // Notification preference embedded in initial fetch — no extra round-trip
      const prefs   = (profile as { notification_preferences?: Record<string, boolean> } | null)?.notification_preferences
      const allowed = prefs?.invoice_paid !== false // default: allowed unless explicitly disabled

      if (authUser?.user?.email && allowed) {
        await sendInvoicePaidEmail({
          to: authUser.user.email,
          freelancerName: profile?.full_name ?? '',
          clientName: client?.name ?? '',
          invoiceNumber: invoice.invoice_number,
          total: invoice.total,
          currency: invoice.currency,
          dashboardUrl: `${appUrl}/dashboard`,
        }).catch((err) => console.error('[email] invoice-paid notification failed', err))
      }

      // Push notification to freelancer
      if (allowed) {
        sendPushToSubscriber('freelancer', invoice.freelancer_id, {
          title: 'Invoice paid',
          body: `${client?.name ?? 'A client'} paid invoice ${invoice.invoice_number}`,
          tag: `invoice-paid-${invoiceId}`,
          data: { url: '/dashboard/invoices' },
        }).catch((err) => console.error("[push]", err))
      }

      // Send receipt to client
      if (client?.email) {
        await sendPaymentReceiptEmail({
          to: client.email,
          clientName: client.name ?? '',
          businessName: profile?.full_name ?? 'Your freelancer',
          invoiceNumber: invoice.invoice_number,
          total: invoice.total,
          currency: invoice.currency,
          paidAt,
          lineItems: invoice.line_items ?? [],
          portalUrl: `${appUrl}/p/${client.portal_slug}`,
        }).catch((err) => console.error('[email] payment-receipt failed', err))
      }
      break
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = sub.customer as string

      const newPlan = event.type === 'customer.subscription.deleted'
        ? 'free'
        : getPlanFromPriceId(sub.items.data[0]?.price?.id ?? '')

      const newStatus = event.type === 'customer.subscription.deleted' ? 'canceled' : sub.status

      await service
        .from('profiles')
        .update({
          plan: newPlan,
          subscription_status: newStatus,
          stripe_subscription_id: event.type === 'customer.subscription.deleted' ? null : sub.id,
        })
        .eq('stripe_customer_id', customerId)
      break
    }

    case 'account.updated': {
      // Keep stripe_connect_onboarded in sync when Stripe finishes KYC
      const account = event.data.object as Stripe.Account
      if (account.charges_enabled && account.details_submitted) {
        await service
          .from('profiles')
          .update({ stripe_connect_onboarded: true })
          .eq('stripe_connect_account_id', account.id)
      }
      break
    }

    case 'invoice.payment_failed': {
      // Stripe subscription invoice failed — mark subscription as past_due
      const inv = event.data.object as Stripe.Invoice
      const customerId = (typeof inv.customer === 'string' ? inv.customer : inv.customer?.id) ?? null
      if (!customerId) break

      await service
        .from('profiles')
        .update({ subscription_status: 'past_due' })
        .eq('stripe_customer_id', customerId)
      break
    }

    case 'checkout.session.completed': {
      const session = event.data.object as unknown as { mode: string; subscription: string | null; customer: string }
      if (session.mode === 'subscription' && session.subscription) {
        const sub = await getStripe().subscriptions.retrieve(session.subscription as string)
        const customerId = session.customer as string
        const plan = getPlanFromPriceId(sub.items.data[0]?.price?.id ?? '')

        await service
          .from('profiles')
          .update({
            plan,
            subscription_status: sub.status,
            stripe_customer_id: customerId,
            stripe_subscription_id: sub.id,
          })
          .eq('stripe_customer_id', customerId)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}

function getPlanFromPriceId(priceId: string): 'free' | 'pro' | 'business' {
  if (
    priceId === process.env.STRIPE_PRO_MONTHLY_PRICE_ID ||
    priceId === process.env.STRIPE_PRO_ANNUAL_PRICE_ID
  ) return 'pro'

  if (
    priceId === process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID ||
    priceId === process.env.STRIPE_BUSINESS_ANNUAL_PRICE_ID
  ) return 'business'

  return 'free'
}

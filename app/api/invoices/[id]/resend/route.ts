import { createClient } from '@/lib/supabase/server'
import { ok, unauthorized, notFound, badRequest, internalError, tooManyRequests } from '@/lib/api'
import { sendInvoiceSentEmail } from '@/lib/email'
import { getWorkspaceContext, canAccessSub } from '@/lib/workspace'

// Resend an invoice email — unlike /send, this allows sent and overdue statuses
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()
  const ctx = await getWorkspaceContext(user.id, user.email ?? '')
  const { ownerId } = ctx

  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, clients(id, name, email, portal_slug)')
    .eq('id', id)
    .eq('freelancer_id', ownerId)
    .is('deleted_at', null)
    .single()

  if (!invoice) return notFound('Invoice not found')

  const client = Array.isArray(invoice.clients) ? (invoice.clients[0] ?? null) : invoice.clients
  if (!canAccessSub(ctx, 'canViewInvoices', client.id)) return unauthorized()

  if (invoice.status === 'paid') return badRequest('Cannot resend a paid invoice')
  if (invoice.status === 'draft') return badRequest('Send the invoice first before resending')

  // Rate limit: 15-minute cooldown between resends to prevent inbox flooding
  if (invoice.last_resent_at) {
    const cooldownMs = 15 * 60 * 1000
    const elapsed = Date.now() - new Date(invoice.last_resent_at).getTime()
    if (elapsed < cooldownMs) {
      const waitMin = Math.ceil((cooldownMs - elapsed) / 60000)
      return tooManyRequests(`Please wait ${waitMin} more minute${waitMin === 1 ? '' : 's'} before resending.`)
    }
  }

  // Send email notification
  if (client?.email) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, business_name, plan, hide_branding')
      .eq('id', user.id)
      .single()

    const hideBranding = profile?.plan !== 'free' && (profile?.hide_branding ?? false)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
    const sent = await sendInvoiceSentEmail({
      to: client.email,
      clientName: client.name,
      freelancerName: profile?.full_name ?? '',
      businessName: profile?.business_name || profile?.full_name || '',
      invoiceNumber: invoice.invoice_number,
      total: invoice.total,
      currency: invoice.currency,
      dueDate: invoice.due_date,
      portalUrl: `${appUrl}/p/${client.portal_slug}`,
      hideBranding,
    }).catch(() => null)

    if (sent === null) return internalError('Failed to send email')
  }

  // Record resend timestamp for cooldown enforcement
  await supabase
    .from('invoices')
    .update({ last_resent_at: new Date().toISOString() })
    .eq('id', id)
    .eq('freelancer_id', ownerId)

  return ok({ resent: true })
}

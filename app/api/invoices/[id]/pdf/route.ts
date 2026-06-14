import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { unauthorized, notFound, paymentRequired } from '@/lib/api'
import { renderToBuffer } from '@react-pdf/renderer'
import { InvoicePDF } from '@/lib/invoice-pdf'
import { cookies } from 'next/headers'
import React from 'react'

// Accessible by both the authenticated freelancer (dashboard) and
// the portal client (cookie-auth). Returns the PDF as a binary stream.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const service = createServiceClient()

  // ── Auth: check freelancer session first, then portal cookie ──────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const cookieStore = await cookies()
  const portalClientId = cookieStore.get('portal_client_id')?.value

  if (!user && !portalClientId) return unauthorized()

  // ── Fetch invoice + freelancer plan ───────────────────────────────────────
  const { data: invoice } = await service
    .from('invoices')
    .select(`
      *,
      clients ( id, name, email ),
      profiles:freelancer_id ( full_name, business_name, tagline, plan, hide_branding )
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!invoice) return notFound('Invoice not found')

  // Ensure the caller is authorised to access this invoice
  if (user && invoice.freelancer_id !== user.id) return unauthorized()
  if (!user && portalClientId && invoice.client_id !== portalClientId) return unauthorized()

  // PDF export is a Pro+ feature — block if freelancer is on Free plan
  const profile = Array.isArray(invoice.profiles) ? (invoice.profiles[0] ?? null) : invoice.profiles
  const hideBranding = profile?.plan !== 'free' && (profile?.hide_branding ?? false)
  if (profile?.plan === 'free') {
    return paymentRequired('PDF invoice export is available on Pro and above.', { code: 'invoice_pdf' })
  }

  const client = Array.isArray(invoice.clients) ? (invoice.clients[0] ?? null) : invoice.clients

  // ── Render PDF ────────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(InvoicePDF, {
    invoiceNumber:  invoice.invoice_number,
    status:         invoice.status,
    currency:       invoice.currency,
    subtotal:       Number(invoice.subtotal),
    taxRate:        Number(invoice.tax_rate),
    taxAmount:      Number(invoice.tax_amount),
    total:          Number(invoice.total),
    dueDate:        invoice.due_date,
    paidAt:         invoice.paid_at,
    createdAt:      invoice.created_at,
    notes:          invoice.notes,
    lineItems:      invoice.line_items ?? [],
    businessName:   profile?.business_name || profile?.full_name || 'PortalKit',
    tagline:        profile?.tagline,
    freelancerName: profile?.full_name ?? '',
    clientName:     client?.name ?? '',
    clientEmail:    client?.email ?? '',
    hideBranding,
  }) as Parameters<typeof renderToBuffer>[0]

  const pdfBuffer = await renderToBuffer(element)
  const bytes     = new Uint8Array(pdfBuffer)

  const filename = `invoice-${invoice.invoice_number}.pdf`

  return new Response(bytes, {
    headers: {
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length':      String(bytes.length),
      // Cache for 24h — PDFs are immutable once generated; paid invoices never change.
      // private: scoped to the individual user, not shared caches.
      'Cache-Control':       'private, max-age=86400, immutable',
    },
  })
}

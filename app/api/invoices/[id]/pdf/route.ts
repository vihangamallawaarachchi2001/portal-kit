import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { unauthorized, notFound } from '@/lib/api'
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

  // ── Fetch invoice ─────────────────────────────────────────────────────────
  const { data: invoice } = await service
    .from('invoices')
    .select(`
      *,
      clients ( id, name, email ),
      profiles:freelancer_id ( full_name, business_name, tagline )
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!invoice) return notFound('Invoice not found')

  // Ensure the caller is authorised to access this invoice
  if (user && invoice.freelancer_id !== user.id) return unauthorized()
  if (!user && portalClientId && invoice.client_id !== portalClientId) return unauthorized()

  const client  = Array.isArray(invoice.clients)  ? invoice.clients[0]  : invoice.clients
  const profile = Array.isArray(invoice.profiles) ? invoice.profiles[0] : invoice.profiles

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
  }) as Parameters<typeof renderToBuffer>[0]

  const pdfBuffer = await renderToBuffer(element)
  const bytes     = new Uint8Array(pdfBuffer)

  const filename = `invoice-${invoice.invoice_number}.pdf`

  return new Response(bytes, {
    headers: {
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length':      String(bytes.length),
    },
  })
}

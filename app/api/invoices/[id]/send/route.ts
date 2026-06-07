import { createClient } from '@/lib/supabase/server'
import { ok, unauthorized, notFound, badRequest, internalError } from '@/lib/api'
import { sendInvoiceSentEmail } from '@/lib/email'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, clients(id, name, email, portal_slug)')
    .eq('id', id)
    .eq('freelancer_id', user.id)
    .is('deleted_at', null)
    .single()

  if (!invoice) return notFound('Invoice not found')
  if (invoice.status === 'paid') return badRequest('Invoice is already paid')
  if (invoice.status === 'sent') return badRequest('Invoice is already sent')

  const { data, error } = await supabase
    .from('invoices')
    .update({ status: 'sent', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return internalError(error.message)

  // Notify client
  const client = Array.isArray(invoice.clients) ? (invoice.clients[0] ?? null) : invoice.clients
  if (client?.email) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, business_name')
      .eq('id', user.id)
      .single()

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
    await sendInvoiceSentEmail({
      to: client.email,
      clientName: client.name,
      freelancerName: profile?.full_name ?? '',
      businessName: profile?.business_name || profile?.full_name || '',
      invoiceNumber: invoice.invoice_number,
      total: invoice.total,
      currency: invoice.currency,
      dueDate: invoice.due_date,
      portalUrl: `${appUrl}/p/${client.portal_slug}`,
    }).catch((err) => console.error('[email] invoice-sent notification failed', err))
  }

  return ok(data)
}

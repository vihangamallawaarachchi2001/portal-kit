import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { InvoiceManager } from '@/components/dashboard/invoice-manager'
import { createServiceClient } from '@/lib/supabase/service'
import { getWorkspaceContext } from '@/lib/workspace'

export const revalidate = 0

export default async function ClientInvoicesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const ctx = await getWorkspaceContext(user.id, user.email ?? '')
  const { ownerId } = ctx

  const [{ data: client }, { data: invoices }, { data: projects }, { data: profile }] = await Promise.all([
    supabase.from('clients').select('id, name, email').eq('id', id).eq('freelancer_id', ownerId).is('deleted_at', null).single(),
    supabase.from('invoices').select('id, invoice_number, status, subtotal, tax_rate, tax_amount, total, currency, due_date, paid_at, line_items, notes, project_id, client_id, freelancer_id, stripe_payment_intent_id, deleted_at, created_at, updated_at').eq('client_id', id).eq('freelancer_id', ownerId).is('deleted_at', null).order('created_at', { ascending: false }),
    supabase.from('projects').select('id, title').eq('client_id', id).eq('freelancer_id', ownerId).is('deleted_at', null),
    supabase.from('profiles').select('full_name, business_name, plan, stripe_connect_onboarded, bank_details').eq('id', ownerId).single(),
  ])

  if (!client) notFound()

  // Fetch receipts for all invoices and generate signed download URLs
  const service = createServiceClient()
  const invoiceIds = (invoices ?? []).map(i => i.id)
  const { data: rawReceipts } = invoiceIds.length > 0
    ? await service
        .from('invoice_receipts')
        .select('id, invoice_id, filename, file_size, storage_path, uploaded_at')
        .in('invoice_id', invoiceIds)
        .order('uploaded_at', { ascending: false })
    : { data: [] }

  // Generate signed download URLs
  const receiptsWithUrls = await Promise.all(
    (rawReceipts ?? []).map(async r => {
      const rec = r as { id: string; invoice_id: string; filename: string; file_size: number; storage_path: string; uploaded_at: string }
      const { data } = await service.storage.from('portalkit_bucket').createSignedUrl(rec.storage_path, 3600)
      return { id: rec.id, invoice_id: rec.invoice_id, filename: rec.filename, file_size: rec.file_size, uploaded_at: rec.uploaded_at, download_url: data?.signedUrl ?? null }
    })
  )

  const receiptsByInvoice: Record<string, typeof receiptsWithUrls[0][]> = {}
  for (const r of receiptsWithUrls) {
    if (!receiptsByInvoice[r.invoice_id]) receiptsByInvoice[r.invoice_id] = []
    receiptsByInvoice[r.invoice_id].push(r)
  }

  return (
    <InvoiceManager
      clientId={id}
      clientName={client.name}
      clientEmail={client.email}
      invoices={invoices ?? []}
      projects={projects ?? []}
      freelancerName={profile?.full_name ?? ''}
      businessName={profile?.business_name || profile?.full_name || ''}
      plan={profile?.plan ?? 'free'}
      stripeConnected={profile?.stripe_connect_onboarded ?? false}
      hasBankDetails={!!profile?.bank_details}
      receiptsByInvoice={receiptsByInvoice}
    />
  )
}

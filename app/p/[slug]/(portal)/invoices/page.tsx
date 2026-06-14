import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import { PortalInvoices } from '@/components/portal/portal-invoices'
import { Invoice, BankDetails } from '@/types/database'
import { getStripeSupportedCurrencies } from '@/lib/currencies-server'

export default async function PortalInvoicesPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ paid?: string }>
}) {
  const { slug } = await params
  const { paid } = await searchParams
  const cookieStore = await cookies()
  const clientId = cookieStore.get('portal_client_id')?.value
  if (!clientId) redirect(`/p/${slug}/access`)

  const service = createServiceClient()
  const { data: client } = await service
    .from('clients')
    .select('id, freelancer_id, portal_features, invoices(*)')
    .eq('portal_slug', slug)
    .eq('id', clientId)
    .is('deleted_at', null)
    .single()

  if (!client) redirect(`/p/${slug}/access`)
  const features = client.portal_features as Record<string, boolean> | null
  if (features && features.invoices === false) redirect(`/p/${slug}`)

  const invoices = ((client.invoices ?? []) as Invoice[])
    .filter(i => !i.deleted_at && i.status !== 'draft')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const { data: freelancerProfile } = await service
    .from('profiles')
    .select('bank_details, stripe_connect_onboarded')
    .eq('id', (client as { freelancer_id: string }).freelancer_id)
    .single()

  const bankDetails = (freelancerProfile?.bank_details as BankDetails | null) ?? null
  const stripeConnected = freelancerProfile?.stripe_connect_onboarded ?? false
  const supportedCurrencies = await getStripeSupportedCurrencies().catch(() => null)

  // Fetch receipts for all unpaid invoices
  const invoiceIds = invoices.map(i => i.id)
  const { data: allReceipts } = invoiceIds.length > 0
    ? await service
        .from('invoice_receipts')
        .select('id, invoice_id, filename, file_size, uploaded_at')
        .in('invoice_id', invoiceIds)
        .order('uploaded_at', { ascending: false })
    : { data: [] }

  const receiptsByInvoice: Record<string, { id: string; filename: string; file_size: number; uploaded_at: string }[]> = {}
  for (const r of allReceipts ?? []) {
    const inv = r as { id: string; invoice_id: string; filename: string; file_size: number; uploaded_at: string }
    if (!receiptsByInvoice[inv.invoice_id]) receiptsByInvoice[inv.invoice_id] = []
    receiptsByInvoice[inv.invoice_id].push({ id: inv.id, filename: inv.filename, file_size: inv.file_size, uploaded_at: inv.uploaded_at })
  }

  return (
    <PortalInvoices
      invoices={invoices}
      slug={slug}
      justPaid={paid === 'true'}
      bankDetails={bankDetails}
      supportedCurrencies={supportedCurrencies ?? undefined}
      stripeConnected={stripeConnected}
      receiptsByInvoice={receiptsByInvoice}
    />
  )
}

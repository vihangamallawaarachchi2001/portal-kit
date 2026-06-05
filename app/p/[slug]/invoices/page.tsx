import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import { PortalInvoices } from '@/components/portal/portal-invoices'
import { Invoice } from '@/types/database'

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
    .select('id, invoices(*)')
    .eq('portal_slug', slug)
    .eq('id', clientId)
    .is('deleted_at', null)
    .single()

  if (!client) redirect(`/p/${slug}/access`)

  const invoices = ((client.invoices ?? []) as Invoice[])
    .filter(i => !i.deleted_at && i.status !== 'draft')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return <PortalInvoices invoices={invoices} slug={slug} justPaid={paid === 'true'} />
}

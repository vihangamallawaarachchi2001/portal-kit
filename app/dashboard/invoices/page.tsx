import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { InvoicesView } from '@/components/dashboard/invoices-view'
import { getWorkspaceContext, allowedClientIds } from '@/lib/workspace'

export const revalidate = 0

export default async function InvoicesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const ctx = await getWorkspaceContext(user.id, user.email ?? '')
  const { ownerId } = ctx

  const clientIds = allowedClientIds(ctx)

  let invoicesQuery = supabase
    .from('invoices')
    .select('id, invoice_number, total, currency, status, due_date, created_at, clients ( id, name )')
    .eq('freelancer_id', ownerId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (clientIds !== null) {
    invoicesQuery = invoicesQuery.in('client_id', clientIds)
  }

  let clientsQuery = supabase
    .from('clients')
    .select('id, name')
    .eq('freelancer_id', ownerId)
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('name', { ascending: true })

  if (clientIds !== null) {
    clientsQuery = clientsQuery.in('id', clientIds)
  }

  const [{ data: invoices }, { data: clients }, { data: profile }] = await Promise.all([
    invoicesQuery,
    clientsQuery,
    supabase
      .from('profiles')
      .select('plan')
      .eq('id', ownerId)
      .single(),
  ])

  return (
    <InvoicesView
      invoices={(invoices ?? []) as never}
      clients={(clients ?? []) as { id: string; name: string }[]}
      plan={profile?.plan ?? 'free'}
    />
  )
}

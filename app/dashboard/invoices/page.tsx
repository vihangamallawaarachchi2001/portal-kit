import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { InvoicesView } from '@/components/dashboard/invoices-view'

export const revalidate = 0

export default async function InvoicesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const [{ data: invoices }, { data: clients }, { data: profile }] = await Promise.all([
    supabase
      .from('invoices')
      .select('id, invoice_number, total, currency, status, due_date, created_at, clients ( id, name )')
      .eq('freelancer_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false }),
    supabase
      .from('clients')
      .select('id, name')
      .eq('freelancer_id', user.id)
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('name', { ascending: true }),
    supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
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

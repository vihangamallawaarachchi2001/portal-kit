import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { InvoiceManager } from '@/components/dashboard/invoice-manager'

export const revalidate = 0

export default async function ClientInvoicesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const [{ data: client }, { data: invoices }, { data: projects }, { data: profile }] = await Promise.all([
    supabase.from('clients').select('id, name, email').eq('id', id).eq('freelancer_id', user.id).is('deleted_at', null).single(),
    supabase.from('invoices').select('*').eq('client_id', id).eq('freelancer_id', user.id).is('deleted_at', null).order('created_at', { ascending: false }),
    supabase.from('projects').select('id, title').eq('client_id', id).eq('freelancer_id', user.id).is('deleted_at', null),
    supabase.from('profiles').select('full_name, business_name').eq('id', user.id).single(),
  ])

  if (!client) notFound()

  return (
    <InvoiceManager
      clientId={id}
      clientName={client.name}
      clientEmail={client.email}
      invoices={invoices ?? []}
      projects={projects ?? []}
      freelancerName={profile?.full_name ?? ''}
      businessName={profile?.business_name || profile?.full_name || ''}
    />
  )
}

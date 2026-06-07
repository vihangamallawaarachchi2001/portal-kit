import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClientsView, type EnrichedClient } from '@/components/dashboard/clients-view'

export const revalidate = 0

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const [{ data: clients }, { data: profile }] = await Promise.all([
    supabase
      .from('clients')
      .select(`
        *,
        projects (
          id, title, status, due_date, updated_at,
          files ( id, status ),
          messages ( id, sender_type, read_at )
        ),
        invoices ( id, total, status, currency )
      `)
      .eq('freelancer_id', user.id)
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('updated_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single(),
  ])

  const enrichedClients: EnrichedClient[] = (clients ?? []).map(c => {
    const projects = (c.projects ?? []).filter((p: { deleted_at: string | null }) => !p.deleted_at)
    const outstanding = (c.invoices ?? [])
      .filter((i: { status: string }) => i.status === 'sent' || i.status === 'overdue')
      .reduce((sum: number, i: { total: number }) => sum + Number(i.total), 0)
    const pending_files_total = projects.reduce((sum: number, p: { files: { status: string }[] }) =>
      sum + (p.files ?? []).filter((f: { status: string }) => f.status === 'pending').length, 0)
    const unread_messages_total = projects.reduce((sum: number, p: { messages: { sender_type: string; read_at: string | null }[] }) =>
      sum + (p.messages ?? []).filter((m: { sender_type: string; read_at: string | null }) => m.sender_type === 'client' && !m.read_at).length, 0)
    return {
      ...c,
      projects: projects.map((p: {
        id: string; title: string; status: string; due_date: string | null; updated_at: string;
        files: { status: string }[]; messages: { sender_type: string; read_at: string | null }[]
      }) => ({
        ...p,
        pending_files: (p.files ?? []).filter((f: { status: string }) => f.status === 'pending').length,
        unread_messages: (p.messages ?? []).filter((m: { sender_type: string; read_at: string | null }) => m.sender_type === 'client' && !m.read_at).length,
      })),
      outstanding, pending_files_total, unread_messages_total,
    }
  }) as EnrichedClient[]

  return <ClientsView clients={enrichedClients} plan={profile?.plan ?? 'free'} />
}

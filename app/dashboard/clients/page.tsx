import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClientsView, type EnrichedClient } from '@/components/dashboard/clients-view'
import { effectiveInvoiceStatus } from '@/lib/format'
import { getWorkspaceContext, allowedClientIds } from '@/lib/workspace'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const ctx = await getWorkspaceContext(user.id, user.email ?? '')
  const { ownerId } = ctx

  let clientsQuery = supabase
    .from('clients')
    .select(`
      *,
      projects (
        id, title, status, due_date, updated_at,
        files ( id, status, uploaded_by_client, parent_file_id ),
        messages ( id, sender_type, read_at )
      ),
      invoices ( id, total, status, currency, due_date )
    `)
    .eq('freelancer_id', ownerId)
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })

  const allowedIds = allowedClientIds(ctx)
  if (allowedIds !== null) {
    clientsQuery = clientsQuery.in('id', allowedIds)
  }

  const [{ data: clients }, { data: profile }] = await Promise.all([
    clientsQuery,
    supabase
      .from('profiles')
      .select('plan')
      .eq('id', ownerId)
      .single(),
  ])

  const enrichedClients: EnrichedClient[] = (clients ?? []).map(c => {
    const projects = (c.projects ?? []).filter((p: { deleted_at: string | null }) => !p.deleted_at)
    const outstanding = (c.invoices ?? [])
      .filter((i: { status: string; due_date?: string | null }) => {
        const eff = effectiveInvoiceStatus(i.status, i.due_date)
        return eff === 'sent' || eff === 'overdue'
      })
      .reduce((sum: number, i: { total: number }) => sum + Number(i.total), 0)
    const pending_files_total = projects.reduce((sum: number, p: { files: { status: string; uploaded_by_client?: boolean; parent_file_id?: string | null }[] }) =>
      sum + (p.files ?? []).filter((f: { status: string; uploaded_by_client?: boolean; parent_file_id?: string | null }) =>
        f.status === 'pending' && !f.uploaded_by_client && !f.parent_file_id).length, 0)
    const unread_messages_total = projects.reduce((sum: number, p: { messages: { sender_type: string; read_at: string | null }[] }) =>
      sum + (p.messages ?? []).filter((m: { sender_type: string; read_at: string | null }) => m.sender_type === 'client' && !m.read_at).length, 0)
    return {
      ...c,
      projects: projects.map((p: {
        id: string; title: string; status: string; due_date: string | null; updated_at: string;
        files: { status: string; uploaded_by_client?: boolean; parent_file_id?: string | null }[]
        messages: { sender_type: string; read_at: string | null }[]
      }) => ({
        ...p,
        pending_files: (p.files ?? []).filter((f: { status: string; uploaded_by_client?: boolean; parent_file_id?: string | null }) =>
          f.status === 'pending' && !f.uploaded_by_client && !f.parent_file_id).length,
        unread_messages: (p.messages ?? []).filter((m: { sender_type: string; read_at: string | null }) => m.sender_type === 'client' && !m.read_at).length,
      })),
      outstanding, pending_files_total, unread_messages_total,
    }
  }) as EnrichedClient[]

  return <ClientsView clients={enrichedClients} plan={profile?.plan ?? 'free'} />
}

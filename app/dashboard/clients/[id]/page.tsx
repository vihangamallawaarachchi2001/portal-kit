import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ClientOverviewView } from '@/components/dashboard/client-overview-view'
import { effectiveInvoiceStatus } from '@/lib/format'
import { getWorkspaceContext } from '@/lib/workspace'

export default async function ClientOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const ctx = await getWorkspaceContext(user.id, user.email ?? ''); const { ownerId } = ctx;

  const { data: client } = await supabase
    .from('clients')
    .select(`
      *,
      projects (
        id, title, status, description, due_date, updated_at,
        files ( id, status, uploaded_by_client, parent_file_id ),
        messages ( id, sender_type, read_at )
      ),
      invoices ( id, invoice_number, total, currency, status, due_date, created_at )
    `)
    .eq('id', id)
    .eq('freelancer_id', ownerId)
    .is('deleted_at', null)
    .single()

  if (!client) notFound()

  type RawProject = {
    id: string; title: string; status: string; description: string | null
    due_date: string | null; updated_at: string; deleted_at?: string | null
    files?: { id: string; status: string; uploaded_by_client?: boolean; parent_file_id?: string | null }[]
    messages?: { id: string; sender_type: string; read_at: string | null }[]
  }

  type RawInvoice = {
    id: string; invoice_number: string; total: number
    currency: string; status: string; due_date: string | null
    created_at: string; deleted_at?: string | null
  }

  const rawProjects = ((client.projects ?? []) as RawProject[])
    .filter(p => !p.deleted_at)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

  const projects = rawProjects.map(p => ({
    id: p.id,
    title: p.title,
    status: p.status,
    description: p.description,
    due_date: p.due_date,
    updated_at: p.updated_at,
    pendingFiles: (p.files ?? []).filter(f => f.status === 'pending' && !f.uploaded_by_client && !f.parent_file_id).length,
    unreadMsgs: (p.messages ?? []).filter(m => m.sender_type === 'client' && !m.read_at).length,
  }))

  const invoices = ((client.invoices ?? []) as RawInvoice[])
    .filter(i => !i.deleted_at)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map(i => ({
      id: i.id,
      invoice_number: i.invoice_number,
      total: Number(i.total),
      currency: i.currency,
      status: i.status,
      due_date: i.due_date,
    }))

  const outstandingTotal = ((client.invoices ?? []) as RawInvoice[])
    .filter(i => {
      const eff = effectiveInvoiceStatus(i.status, i.due_date)
      return eff === 'sent' || eff === 'overdue'
    })
    .reduce((s, i) => s + Number(i.total), 0)

  const totalPendingFiles = rawProjects.reduce(
    (s, p) => s + (p.files ?? []).filter(f => f.status === 'pending' && !f.uploaded_by_client && !f.parent_file_id).length, 0)

  const totalUnread = rawProjects.reduce(
    (s, p) => s + (p.messages ?? []).filter(m => m.sender_type === 'client' && !m.read_at).length, 0)

  return (
    <ClientOverviewView
      clientId={id}
      projects={projects}
      invoices={invoices}
      totalPendingFiles={totalPendingFiles}
      totalUnread={totalUnread}
      outstandingTotal={outstandingTotal}
    />
  )
}

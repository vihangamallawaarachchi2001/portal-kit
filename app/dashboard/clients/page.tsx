import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardClientList } from '@/components/dashboard/dashboard-client-list'
import { Plus } from 'lucide-react'
import { Client, Project } from '@/types/database'

export const revalidate = 0

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: clients } = await supabase
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
    .order('updated_at', { ascending: false })

  const enrichedClients = (clients ?? []).map(c => {
    const projects = (c.projects ?? []).filter((p: { deleted_at: string | null }) => !p.deleted_at)
    const outstanding = (c.invoices ?? [])
      .filter((i: { status: string }) => i.status === 'sent' || i.status === 'overdue')
      .reduce((s: number, i: { total: number }) => s + Number(i.total), 0)
    const pending_files_total = projects.reduce((s: number, p: { files: { status: string }[] }) =>
      s + (p.files ?? []).filter((f: { status: string }) => f.status === 'pending').length, 0)
    const unread_messages_total = projects.reduce((s: number, p: { messages: { sender_type: string; read_at: string | null }[] }) =>
      s + (p.messages ?? []).filter((m: { sender_type: string; read_at: string | null }) => m.sender_type === 'client' && !m.read_at).length, 0)

    return {
      ...c,
      projects: projects.map((p: Project & { files: { status: string }[]; messages: { sender_type: string; read_at: string | null }[] }) => ({
        ...p,
        pending_files: (p.files ?? []).filter((f: { status: string }) => f.status === 'pending').length,
        unread_messages: (p.messages ?? []).filter((m: { sender_type: string; read_at: string | null }) => m.sender_type === 'client' && !m.read_at).length,
      })),
      outstanding,
      pending_files_total,
      unread_messages_total,
    }
  })

  return (
    <div className="p-8 flex flex-col gap-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-on-surface">Clients</h1>
        <span className="text-sm text-on-surface-variant">{enrichedClients.length} active portal{enrichedClients.length !== 1 ? 's' : ''}</span>
      </div>
      <DashboardClientList clients={enrichedClients as Parameters<typeof DashboardClientList>[0]['clients']} />
    </div>
  )
}

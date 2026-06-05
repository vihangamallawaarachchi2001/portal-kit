import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardClientList } from '@/components/dashboard/dashboard-client-list'
import { Users } from 'lucide-react'

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
  })

  return (
    <div className="w-full">
      {/* Page hero */}
      <div className="px-8 pt-8 pb-6 border-b border-outline-variant/50 bg-white">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-1">Clients</p>
            <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">Client Portals</h1>
            <p className="text-sm text-on-surface-variant mt-1">Manage all your active client workspaces.</p>
          </div>
          {enrichedClients.length > 0 && (
            <div className="flex items-center gap-2 shrink-0 bg-surface-container rounded-xl px-4 py-2.5">
              <Users className="size-4 text-on-surface-variant" />
              <span className="text-sm font-semibold text-on-surface">{enrichedClients.length}</span>
              <span className="text-sm text-on-surface-variant">active portal{enrichedClients.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-8">
        <DashboardClientList clients={enrichedClients as Parameters<typeof DashboardClientList>[0]['clients']} />
      </div>
    </div>
  )
}

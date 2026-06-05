import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { KpiCards } from '@/components/dashboard/kpi-cards'
import { DashboardClientList } from '@/components/dashboard/dashboard-client-list'
import { DashboardStats } from '@/types/database'
import { Plus } from 'lucide-react'

export const revalidate = 0

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  // Fetch clients with their active projects
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

  // Compute per-client stats
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
      outstanding,
      pending_files_total,
      unread_messages_total,
    }
  })

  // Dashboard KPI stats
  const allInvoices = enrichedClients.flatMap(c => c.invoices ?? [])
  const allProjects = enrichedClients.flatMap(c => c.projects)

  const stats: DashboardStats = {
    total_outstanding: allInvoices
      .filter((i: { status: string }) => i.status === 'sent')
      .reduce((s: number, i: { total: number }) => s + Number(i.total), 0),
    total_overdue: allInvoices
      .filter((i: { status: string }) => i.status === 'overdue')
      .reduce((s: number, i: { total: number }) => s + Number(i.total), 0),
    pending_approvals: enrichedClients.reduce((s, c) => s + c.pending_files_total, 0),
    unread_messages: enrichedClients.reduce((s, c) => s + c.unread_messages_total, 0),
    active_clients: enrichedClients.length,
    active_projects: allProjects.filter((p: { status: string }) => p.status === 'in_progress' || p.status === 'review').length,
  }

  const profile = (await supabase.from('profiles').select('full_name, plan').eq('id', user.id).single()).data

  return (
    <div className="p-8 flex flex-col gap-8 max-w-7xl">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">
            {profile?.full_name ? `Welcome back, ${profile.full_name.split(' ')[0]}` : 'Dashboard'}
          </h1>
          <p className="text-sm text-on-surface-variant mt-0.5">Here's what's happening across your client portals.</p>
        </div>
        <DashboardAddClientButton plan={profile?.plan ?? 'free'} clientCount={enrichedClients.length} />
      </div>

      {/* KPIs */}
      <KpiCards stats={stats} />

      {/* Client list */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-on-surface">Active Clients</h2>
          <span className="text-sm text-on-surface-variant">{enrichedClients.length} portal{enrichedClients.length !== 1 ? 's' : ''}</span>
        </div>
        <DashboardClientList clients={enrichedClients as Parameters<typeof DashboardClientList>[0]['clients']} />
      </div>
    </div>
  )
}

function DashboardAddClientButton({ plan, clientCount }: { plan: string; clientCount: number }) {
  const atLimit = plan === 'free' && clientCount >= 1
  return (
    <div className="flex items-center gap-3">
      {atLimit && (
        <p className="text-xs text-on-surface-variant hidden md:block">
          <a href="/dashboard/settings/billing" className="text-ds-secondary font-semibold hover:underline">Upgrade to Pro</a> for unlimited clients
        </p>
      )}
      <a
        href={atLimit ? '/dashboard/settings/billing' : '#add-client'}
        id={atLimit ? undefined : 'open-add-client'}
        data-action="add-client"
        className="flex items-center gap-2 h-9 px-4 rounded-lg bg-ds-secondary text-white text-sm font-semibold hover:bg-ds-secondary-container transition-colors shadow-sm"
      >
        <Plus className="size-4" />
        {atLimit ? 'Upgrade' : 'Add Client'}
      </a>
    </div>
  )
}

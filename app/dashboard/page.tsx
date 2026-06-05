import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { KpiCards } from '@/components/dashboard/kpi-cards'
import { DashboardClientList } from '@/components/dashboard/dashboard-client-list'
import { DashboardStats } from '@/types/database'

export const revalidate = 0

export default async function DashboardPage() {
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

  const allInvoices = enrichedClients.flatMap(c => c.invoices ?? [])
  const allProjects = enrichedClients.flatMap(c => c.projects)

  const stats: DashboardStats = {
    total_outstanding: allInvoices.filter((i: { status: string }) => i.status === 'sent').reduce((s: number, i: { total: number }) => s + Number(i.total), 0),
    total_overdue: allInvoices.filter((i: { status: string }) => i.status === 'overdue').reduce((s: number, i: { total: number }) => s + Number(i.total), 0),
    pending_approvals: enrichedClients.reduce((s, c) => s + c.pending_files_total, 0),
    unread_messages: enrichedClients.reduce((s, c) => s + c.unread_messages_total, 0),
    active_clients: enrichedClients.length,
    active_projects: allProjects.filter((p: { status: string }) => p.status === 'in_progress' || p.status === 'review').length,
  }

  const profile = (await supabase.from('profiles').select('full_name, plan').eq('id', user.id).single()).data
  const firstName = profile?.full_name?.split(' ')[0] ?? null

  return (
    <div className="w-full">
      {/* ── Page hero ─────────────────────────────────── */}
      <div className="px-8 pt-8 pb-6 border-b border-outline-variant/50 bg-white">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-1">Overview</p>
            <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">
              {firstName ? `Welcome back, ${firstName}` : 'Dashboard'}
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">
              Here&apos;s what&apos;s happening across your client portals.
            </p>
          </div>
          {enrichedClients.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex flex-col items-end">
                <span className="text-2xl font-extrabold text-on-surface">{enrichedClients.length}</span>
                <span className="text-xs text-on-surface-variant">active portal{enrichedClients.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Content ────────────────────────────────────── */}
      <div className="p-8 flex flex-col gap-8">
        <KpiCards stats={stats} />

        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-on-surface">Active Clients</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {enrichedClients.length > 0 ? `${enrichedClients.length} portal${enrichedClients.length !== 1 ? 's' : ''} running` : 'No active portals yet'}
              </p>
            </div>
          </div>
          <DashboardClientList
            clients={enrichedClients as Parameters<typeof DashboardClientList>[0]['clients']}
          />
        </div>
      </div>
    </div>
  )
}

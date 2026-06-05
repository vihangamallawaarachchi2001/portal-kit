import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardClientList } from '@/components/dashboard/dashboard-client-list'

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

  const totalOutstanding = enrichedClients.reduce((s, c) => s + (c.outstanding ?? 0), 0)
  const totalPending     = enrichedClients.reduce((s, c) => s + (c.pending_files_total ?? 0), 0)
  const totalUnread      = enrichedClients.reduce((s, c) => s + (c.unread_messages_total ?? 0), 0)

  return (
    <div className="w-full min-h-screen">
      {/* ── Page header ─────────────────────────────── */}
      <div className="px-8 pt-8 pb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-on-surface tracking-tight">Clients</h1>
            <p className="text-sm text-on-surface-variant mt-0.5">
              {enrichedClients.length > 0
                ? `${enrichedClients.length} active portal${enrichedClients.length !== 1 ? 's' : ''}`
                : 'Add clients to create their portals'}
            </p>

            {/* Quick stat chips — only when data exists */}
            {enrichedClients.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {totalOutstanding > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-ds-secondary/10 text-ds-secondary">
                    <span className="size-1.5 rounded-full bg-ds-secondary" />
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalOutstanding)} outstanding
                  </span>
                )}
                {totalPending > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                    <span className="size-1.5 rounded-full bg-amber-500" />
                    {totalPending} file{totalPending !== 1 ? 's' : ''} awaiting review
                  </span>
                )}
                {totalUnread > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                    <span className="size-1.5 rounded-full bg-blue-500" />
                    {totalUnread} unread message{totalUnread !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-8 pb-12">
        <DashboardClientList clients={enrichedClients as Parameters<typeof DashboardClientList>[0]['clients']} />
      </div>
    </div>
  )
}

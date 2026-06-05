import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { KpiCards } from '@/components/dashboard/kpi-cards'
import { DashboardClientList } from '@/components/dashboard/dashboard-client-list'
import { DashboardHeroActions } from '@/components/dashboard/dashboard-hero-actions'
import { OnboardingChecklist } from '@/components/dashboard/onboarding-checklist'
import { DashboardStats } from '@/types/database'
import Link from 'next/link'
import { ArrowRight, BookOpen, MessageCircle } from 'lucide-react'

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
        unread_messages: (p.messages ?? []).filter((m: { sender_type: string; read_at: string | null }) =>
          m.sender_type === 'client' && !m.read_at).length,
      })),
      outstanding, pending_files_total, unread_messages_total,
    }
  })

  const allInvoices = enrichedClients.flatMap(c => c.invoices ?? [])
  const allProjects = enrichedClients.flatMap(c => c.projects)

  const stats: DashboardStats = {
    total_outstanding: allInvoices.filter((i: { status: string }) => i.status === 'sent').reduce((s: number, i: { total: number }) => s + Number(i.total), 0),
    total_overdue:     allInvoices.filter((i: { status: string }) => i.status === 'overdue').reduce((s: number, i: { total: number }) => s + Number(i.total), 0),
    pending_approvals: enrichedClients.reduce((s, c) => s + c.pending_files_total, 0),
    unread_messages:   enrichedClients.reduce((s, c) => s + c.unread_messages_total, 0),
    active_clients:    enrichedClients.length,
    active_projects:   allProjects.filter((p: { status: string }) => p.status === 'in_progress' || p.status === 'review').length,
  }

  const profileRow = (await supabase.from('profiles').select('full_name, business_name, avatar_url, plan').eq('id', user.id).single()).data
  const firstName   = profileRow?.full_name?.split(' ')[0] ?? null

  // Derive setup completion for the Getting Started widget
  const hasProfile  = !!(profileRow?.full_name && profileRow.full_name.trim())
  const hasClient   = enrichedClients.length > 0
  const hasProject  = allProjects.length > 0
  const hasFile     = enrichedClients.some(c => (c.projects as { files?: unknown[] }[]).some(p => (p.files ?? []).length > 0))
  const hasSentInvoice = allInvoices.some((i: { status: string }) => i.status !== 'draft')

  const completedSteps = [hasProfile, hasClient, hasProject, hasFile, hasSentInvoice]
  const completedCount = completedSteps.filter(Boolean).length
  const showOnboarding = completedCount < completedSteps.length

  return (
    <div className="w-full min-h-screen bg-white">
      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="px-6 pt-6 pb-0 sm:px-8 sm:pt-8">
        <div className="relative overflow-hidden rounded-md bg-white shadow-sm">
          {/* Brand gradient wash — subtle, not gaudy */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(135deg, rgba(0,81,213,0.055) 0%, rgba(0,81,213,0.015) 45%, transparent 100%)' }}
          />
          {/* Decorative circle — right side */}
          <div
            className="absolute -right-16 -top-16 size-64 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(0,81,213,0.06) 0%, transparent 70%)' }}
          />

          <div className="relative px-6 py-7 sm:px-8 sm:py-8 flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Left: greeting */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-ds-secondary uppercase tracking-widest mb-2">
                PortalKit workspace
              </p>
              <h1 className="text-[1.75rem] sm:text-3xl font-extrabold text-on-surface tracking-tight leading-tight">
                {firstName ? `Welcome back, ${firstName}` : 'Your dashboard'}
              </h1>
              <p className="text-sm text-on-surface-variant mt-2 leading-relaxed max-w-lg">
                {enrichedClients.length > 0
                  ? `You have ${enrichedClients.length} active client portal${enrichedClients.length !== 1 ? 's' : ''}${stats.total_outstanding > 0 ? ` and outstanding revenue to collect.` : '.'}`
                  : 'Add your first client to start delivering work professionally.'}
              </p>

              {/* Progress pill — only when setup incomplete */}
              {showOnboarding && (
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex-1 max-w-48 h-1.5 rounded-full bg-outline-variant/40 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-ds-secondary transition-all"
                      style={{ width: `${(completedCount / completedSteps.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-on-surface-variant shrink-0">
                    {completedCount}/{completedSteps.length} setup complete
                  </span>
                </div>
              )}
            </div>

            {/* Right: CTAs — client component owns modal state */}
            <DashboardHeroActions />
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────── */}
      <div className="px-6 py-6 sm:px-8 sm:py-8 flex flex-col gap-8">
        {/* KPI row */}
        <KpiCards stats={stats} />

        {/* Getting Started — side-by-side layout */}
        {showOnboarding && (
          <section className="flex flex-col gap-4 max-w-7xl">
            <div className="flex items-baseline justify-between">
              <h2 className="text-base font-bold text-on-surface">Getting Started</h2>
              <span className="text-sm text-on-surface-variant">
                {completedSteps.filter(Boolean).length}/{completedSteps.length} complete
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-3 items-start">
              {/* Checklist — left */}
              <OnboardingChecklist completed={completedSteps} />

              {/* Action cards — right */}
              <div className="flex flex-col gap-3 max-w-xl">
                <a
                  href="https://docs.portalkit.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white rounded-md shadow-sm hover:shadow-md transition-shadow p-4 flex items-start gap-3"
                >
                  <div className="size-9 rounded-md bg-ds-secondary/10 flex items-center justify-center shrink-0">
                    <BookOpen className="size-4 text-ds-secondary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-on-surface">Read the Guide</p>
                    <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                      Step-by-step setup for PortalKit.
                    </p>
                    <span className="flex items-center gap-1 mt-1.5 text-xs font-semibold text-ds-secondary group-hover:gap-1.5 transition-all">
                      View guide <ArrowRight className="size-3" />
                    </span>
                  </div>
                </a>
                <a
                  href="mailto:support@portalkit.io"
                  className="group bg-white rounded-md shadow-sm hover:shadow-md transition-shadow p-4 flex items-start gap-3"
                >
                  <div className="size-9 rounded-md bg-surface-container flex items-center justify-center shrink-0">
                    <MessageCircle className="size-4 text-on-surface-variant" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-on-surface">Need help?</p>
                    <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                      We typically respond within a few hours.
                    </p>
                    <span className="flex items-center gap-1 mt-1.5 text-xs font-semibold text-ds-secondary group-hover:gap-1.5 transition-all">
                      Contact support <ArrowRight className="size-3" />
                    </span>
                  </div>
                </a>
              </div>
            </div>
          </section>
        )}

        {/* Client section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-base font-bold text-on-surface">
              {enrichedClients.length > 0 ? 'Active Portals' : 'Client Portals'}
            </h2>
            {enrichedClients.length > 0 && (
              <span className="text-sm text-on-surface-variant">
                {enrichedClients.length} active
              </span>
            )}
          </div>
          <DashboardClientList
            clients={enrichedClients as Parameters<typeof DashboardClientList>[0]['clients']}
          />
        </section>
      </div>
    </div>
  )
}



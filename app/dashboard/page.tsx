import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { KpiCards } from '@/components/dashboard/kpi-cards'
import { DashboardClientList } from '@/components/dashboard/dashboard-client-list'
import { DashboardStats } from '@/types/database'
import Link from 'next/link'
import { Plus, ArrowRight } from 'lucide-react'

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
  const hasFile     = allInvoices.length > 0 // approximate: if invoices exist, files were likely shared
  const hasSentInvoice = allInvoices.some((i: { status: string }) => i.status !== 'draft')

  const completedSteps = [hasProfile, hasClient, hasProject, hasFile, hasSentInvoice]
  const completedCount = completedSteps.filter(Boolean).length
  const showOnboarding = completedCount < completedSteps.length

  return (
    <div className="w-full min-h-screen bg-surface">
      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="px-6 pt-6 pb-0 sm:px-8 sm:pt-8">
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm">
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
              <p className="text-xs font-semibold text-ds-secondary uppercase tracking-[0.1em] mb-2">
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

            {/* Right: CTAs */}
            <div className="flex flex-row sm:flex-col gap-2.5 shrink-0">
              <DashboardHeroCTA />
              <Link
                href="https://docs.portalkit.io"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl text-sm font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                View Guide <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────── */}
      <div className="px-6 py-6 sm:px-8 sm:py-8 flex flex-col gap-8">
        {/* KPI row */}
        <KpiCards stats={stats} />

        {/* Getting Started — shown when setup incomplete */}
        {showOnboarding && (
          <OnboardingWidget
            completed={completedSteps}
            hasClient={hasClient}
          />
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

// Thin client component just for the hero CTA (needs no router)
function DashboardHeroCTA() {
  return (
    <Link
      href="#"
      id="open-add-client"
      data-action="add-client"
      className="flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl bg-ds-secondary text-white text-sm font-semibold hover:bg-ds-secondary-container transition-colors shadow-sm shadow-ds-secondary/25"
    >
      <Plus className="size-3.5" strokeWidth={2.5} />
      New Client
    </Link>
  )
}

const ONBOARDING_STEPS = [
  {
    label: 'Complete your profile',
    description: 'Add your name, business name and a photo.',
    href: '/dashboard/settings',
  },
  {
    label: 'Add your first client',
    description: 'Create a portal link you can share with a client.',
    href: null,
  },
  {
    label: 'Create a project',
    description: 'Organise your work into trackable projects.',
    href: '/dashboard/clients',
  },
  {
    label: 'Share a file for review',
    description: 'Upload a deliverable and collect client sign-off.',
    href: '/dashboard/clients',
  },
  {
    label: 'Send your first invoice',
    description: 'Issue an invoice with online payment via Stripe.',
    href: '/dashboard/invoices',
  },
]

function OnboardingWidget({ completed, hasClient }: { completed: boolean[]; hasClient: boolean }) {
  const total     = ONBOARDING_STEPS.length
  const doneCount = completed.filter(Boolean).length
  const pct       = Math.round((doneCount / total) * 100)

  return (
    <section>
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-base font-bold text-on-surface">Getting Started</h2>
        <span className="text-sm text-on-surface-variant">{doneCount}/{total} complete</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Progress bar at top */}
        <div className="h-1 w-full bg-outline-variant/20">
          <div
            className="h-full bg-ds-secondary transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="divide-y divide-outline-variant/30">
          {ONBOARDING_STEPS.map((step, i) => {
            const done = completed[i]
            return (
              <div
                key={i}
                className={`flex items-center gap-4 px-5 py-4 group ${done ? 'opacity-50' : 'hover:bg-surface-container/40 transition-colors'}`}
              >
                {/* Step indicator */}
                <div className={`size-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold transition-all ${
                  done
                    ? 'bg-ds-secondary text-white'
                    : 'bg-surface-container text-on-surface-variant'
                }`}>
                  {done ? (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold leading-tight ${done ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
                    {step.label}
                  </p>
                  {!done && (
                    <p className="text-xs text-on-surface-variant mt-0.5">{step.description}</p>
                  )}
                </div>

                {/* CTA arrow — only on incomplete steps */}
                {!done && (
                  step.href ? (
                    <Link
                      href={step.href}
                      className="shrink-0 flex items-center gap-1 text-xs font-semibold text-ds-secondary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                    >
                      Start <ArrowRight className="size-3" />
                    </Link>
                  ) : (
                    <span className="shrink-0 text-xs font-semibold text-ds-secondary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Use the <strong>+ New Client</strong> button above
                    </span>
                  )
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

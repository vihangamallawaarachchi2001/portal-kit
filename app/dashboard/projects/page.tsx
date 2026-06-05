import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  FolderOpen, Clock, ArrowRight, Layers, Users,
  Zap, CheckCircle2, AlertTriangle,
} from 'lucide-react'
import Link from 'next/link'
import { NewProjectButton } from '@/components/dashboard/new-project-button'

export const revalidate = 0

const STATUS_CFG = {
  briefing:    { label: 'Briefing',    dot: 'bg-slate-400',  badge: 'bg-slate-100 text-slate-600',   accent: '#94a3b8', iconBg: 'bg-slate-100',  iconColor: 'text-slate-500'  },
  in_progress: { label: 'In Progress', dot: 'bg-blue-500',   badge: 'bg-blue-50 text-blue-700',      accent: '#3b82f6', iconBg: 'bg-blue-50',    iconColor: 'text-blue-500'   },
  review:      { label: 'In Review',   dot: 'bg-amber-500',  badge: 'bg-amber-50 text-amber-700',    accent: '#f59e0b', iconBg: 'bg-amber-50',   iconColor: 'text-amber-500'  },
  done:        { label: 'Done',        dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700', accent: '#10b981', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
}

type ProjectRow = {
  id: string
  title: string
  status: string
  due_date: string | null
  description: string | null
  clients: { id: string; name: string } | null
}

function daysUntil(dateStr: string): string {
  const d = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000)
  if (d <= 0)  return ''
  if (d === 1) return 'Tomorrow'
  if (d < 7)   return `${d}d left`
  if (d < 31)  return `${Math.floor(d / 7)}w left`
  return `${Math.floor(d / 30)}mo left`
}

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const [{ data: projects }, { data: clientList }] = await Promise.all([
    supabase
      .from('projects')
      .select('id, title, status, due_date, description, clients ( id, name )')
      .eq('freelancer_id', user.id)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false }),
    supabase
      .from('clients')
      .select('id, name')
      .eq('freelancer_id', user.id)
      .eq('status', 'active')
      .is('deleted_at', null),
  ])

  const all     = (projects ?? []) as unknown as ProjectRow[]
  const active  = all.filter(p => p.status !== 'done')
  const done    = all.filter(p => p.status === 'done')
  const overdue = all.filter(p => p.due_date && new Date(p.due_date) < new Date() && p.status !== 'done')

  return (
    <div className="w-full min-h-screen" style={{ background: '#f4f5f8' }}>

      {/* ── Page header ─────────────────────────────── */}
      <div className="bg-white border-b border-outline-variant/30 px-8 pt-7 pb-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h1 className="text-[22px] font-bold text-on-surface tracking-tight">Projects</h1>
            <p className="text-sm text-on-surface-variant mt-0.5">
              {all.length > 0
                ? `${all.length} total · ${active.length} active · ${done.length} completed`
                : 'All your work in one place'}
            </p>
          </div>
          <div className="shrink-0 mt-0.5">
            <NewProjectButton clients={clientList ?? []} />
          </div>
        </div>

        {/* Stats pills */}
        {all.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <StatPill icon={Layers} label="Total" value={all.length} bg="bg-surface-container" fg="text-on-surface-variant" />
            <StatPill icon={Zap} label="Active" value={active.length} bg="bg-blue-50" fg="text-blue-600" />
            {overdue.length > 0 && (
              <StatPill icon={AlertTriangle} label="Overdue" value={overdue.length} bg="bg-red-50" fg="text-red-600" />
            )}
            <StatPill icon={CheckCircle2} label="Done" value={done.length} bg="bg-emerald-50" fg="text-emerald-600" />
          </div>
        )}
      </div>

      {/* ── Content ─────────────────────────────────── */}
      <div className="px-8 py-8 pb-14">
        {all.length === 0 ? (
          <EmptyProjects clients={clientList ?? []} />
        ) : (
          <div className="flex flex-col gap-10">
            {active.length > 0 && <ProjectGroup label="Active" projects={active} />}
            {done.length > 0  && <ProjectGroup label="Completed" projects={done} faded />}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Stat pill ──────────────────────────────────────────── */
function StatPill({
  icon: Icon, label, value, bg, fg,
}: { icon: React.ElementType; label: string; value: number; bg: string; fg: string }) {
  return (
    <div className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm', bg)}>
      <Icon className={cn('size-3.5 shrink-0', fg)} />
      <span className={cn('font-bold', fg)}>{value}</span>
      <span className="text-on-surface-variant/60 text-[12px]">{label}</span>
    </div>
  )
}

/* ── Project group ──────────────────────────────────────── */
function ProjectGroup({
  label, projects, faded,
}: { label: string; projects: ProjectRow[]; faded?: boolean }) {
  return (
    <section>
      {/* Group header */}
      <div className="flex items-center gap-3 mb-5">
        <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest whitespace-nowrap">{label}</span>
        <span className="text-[11px] font-semibold text-on-surface-variant/50 bg-white border border-outline-variant/30 px-2 py-0.5 rounded-full">
          {projects.length}
        </span>
        <div className="flex-1 h-px bg-outline-variant/30" />
      </div>

      <div className={cn('grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4', faded && 'opacity-55')}>
        {projects.map(p => <ProjectCard key={p.id} project={p} />)}
      </div>
    </section>
  )
}

/* ── Project card ───────────────────────────────────────── */
function ProjectCard({ project: p }: { project: ProjectRow }) {
  const cfg      = STATUS_CFG[p.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.briefing
  const isOverdue = p.due_date && new Date(p.due_date) < new Date() && p.status !== 'done'
  const countdown = p.due_date && !isOverdue ? daysUntil(p.due_date) : ''
  const destHref  = p.clients ? `/dashboard/clients/${p.clients.id}` : '#'

  return (
    <Link
      href={destHref}
      className="group flex flex-col bg-white rounded-xl border border-black/[0.06] shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
    >
      {/* Accent strip */}
      <div className="h-1 w-full shrink-0" style={{ background: cfg.accent }} />

      <div className="flex flex-col gap-3.5 p-5 flex-1">
        {/* Top row: icon + status badge + arrow */}
        <div className="flex items-center gap-3">
          <div className={cn('size-9 rounded-lg flex items-center justify-center shrink-0', cfg.iconBg)}>
            <FolderOpen className={cn('size-[18px]', cfg.iconColor)} strokeWidth={1.75} />
          </div>
          <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full', cfg.badge)}>
            <span className={cn('size-1.5 rounded-full shrink-0', cfg.dot)} />
            {cfg.label}
          </span>
          <ArrowRight className="ml-auto size-4 text-on-surface-variant/20 opacity-0 group-hover:opacity-100 group-hover:text-ds-secondary group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>

        {/* Title + client */}
        <div>
          <h3 className="font-bold text-[15px] text-on-surface leading-snug group-hover:text-ds-secondary transition-colors">
            {p.title}
          </h3>
          {p.clients && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="size-4 rounded-full bg-ds-secondary/10 flex items-center justify-center shrink-0">
                <Users className="size-2.5 text-ds-secondary" />
              </div>
              <span className="text-xs font-medium text-on-surface-variant">{p.clients.name}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {p.description && (
          <p className="text-xs text-on-surface-variant/75 leading-relaxed line-clamp-2">
            {p.description}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className={cn(
        'px-5 py-3 flex items-center gap-2 border-t',
        isOverdue
          ? 'bg-red-50 border-red-100'
          : 'bg-surface-container/20 border-outline-variant/15',
      )}>
        <Clock className={cn('size-3 shrink-0', isOverdue ? 'text-red-500' : 'text-on-surface-variant/40')} />
        <span className={cn('text-[11px] font-medium', isOverdue ? 'text-red-600 font-semibold' : 'text-on-surface-variant')}>
          {p.due_date
            ? isOverdue
              ? `Overdue — ${formatDate(p.due_date)}`
              : `Due ${formatDate(p.due_date)}`
            : 'No due date set'}
        </span>
        {countdown && (
          <span className="ml-auto text-[10px] font-semibold text-on-surface-variant/40 whitespace-nowrap">{countdown}</span>
        )}
      </div>
    </Link>
  )
}

/* ── Empty state ────────────────────────────────────────── */
function EmptyProjects({ clients }: { clients: { id: string; name: string }[] }) {
  const hasClients = clients.length > 0
  return (
    <div className="flex flex-col items-center justify-center min-h-[58vh] text-center px-6">
      <div className="relative mb-8">
        <div className="size-28 rounded-3xl bg-ds-secondary/8 flex items-center justify-center">
          <div className="size-18 rounded-2xl bg-ds-secondary/12 flex items-center justify-center">
            <FolderOpen className="size-10 text-ds-secondary/70" strokeWidth={1.5} />
          </div>
        </div>
        <div className="absolute -top-1.5 -right-1.5 size-6 rounded-full bg-ds-secondary/20 flex items-center justify-center">
          <Layers className="size-3 text-ds-secondary" />
        </div>
        <div className="absolute -bottom-1 -left-3 size-4 rounded-full bg-amber-200" />
        <div className="absolute top-3 -left-4 size-2.5 rounded-full bg-ds-secondary/25" />
      </div>
      <h2 className="text-2xl font-bold text-on-surface tracking-tight max-w-xs">No projects yet</h2>
      <p className="text-base text-on-surface-variant mt-3 max-w-sm leading-relaxed">
        {hasClients
          ? 'You have clients ready — create your first project to start organising work.'
          : 'Projects live inside client portals. Add a client first, then create projects.'}
      </p>
      <div className="flex items-center gap-3 mt-8">
        {hasClients ? (
          <NewProjectButton clients={clients} label="Create First Project" />
        ) : (
          <Link
            href="/dashboard/clients"
            className="inline-flex items-center justify-center h-10 px-6 rounded-md bg-ds-secondary text-white text-sm font-semibold hover:bg-ds-secondary-container transition-colors shadow-sm shadow-ds-secondary/20"
          >
            Add a Client
          </Link>
        )}
        <a
          href="https://docs.portalkit.io"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center h-10 px-6 rounded-md border border-outline-variant text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors"
        >
          View Guide
        </a>
      </div>
      <p className="mt-10 text-xs text-on-surface-variant/60 max-w-xs">
        Tip: Each client gets their own portal with unlimited projects on the Pro plan.
      </p>
    </div>
  )
}

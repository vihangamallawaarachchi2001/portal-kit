'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { formatDate, getInitials } from '@/lib/format'
import {
  FolderOpen, Clock, ArrowRight, Layers, Users,
  CheckCircle2, AlertTriangle, Eye,
  Search, LayoutGrid, List, Zap, SlidersHorizontal, Check,
} from 'lucide-react'
import Link from 'next/link'
import { NewProjectButton } from './new-project-button'

/* ── Types + constants ──────────────────────────────────── */
export type ProjectRow = {
  id: string
  title: string
  status: string
  due_date: string | null
  description: string | null
  clients: { id: string; name: string } | null
}

const STATUS_CFG = {
  briefing:    { label: 'Briefing',    dot: 'bg-slate-400',   badge: 'bg-slate-100 text-slate-600',    accent: '#94a3b8', iconBg: 'bg-slate-100',  iconColor: 'text-slate-500'  },
  in_progress: { label: 'In Progress', dot: 'bg-blue-500',    badge: 'bg-blue-50 text-blue-700',       accent: '#3b82f6', iconBg: 'bg-blue-50',    iconColor: 'text-blue-500'   },
  review:      { label: 'In Review',   dot: 'bg-amber-500',   badge: 'bg-amber-50 text-amber-700',     accent: '#f59e0b', iconBg: 'bg-amber-50',   iconColor: 'text-amber-500'  },
  done:        { label: 'Done',        dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700', accent: '#10b981', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
}

const CLIENT_ACCENTS = ['#0051d5','#7c3aed','#059669','#d97706','#dc2626','#0891b2','#9333ea','#16a34a']
function clientAccent(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0
  return CLIENT_ACCENTS[Math.abs(h) % CLIENT_ACCENTS.length]
}

function daysUntil(dateStr: string): string {
  const d = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000)
  if (d <= 0) return ''
  if (d === 1) return 'Tomorrow'
  if (d < 7)  return `${d}d left`
  if (d < 31) return `${Math.floor(d / 7)}w left`
  return `${Math.floor(d / 30)}mo left`
}

/* ── Root component ─────────────────────────────────────── */
interface ProjectsViewProps {
  projects: ProjectRow[]
  clients: { id: string; name: string }[]
}

export function ProjectsView({ projects, clients }: ProjectsViewProps) {
  const [view, setView]             = useState<'table' | 'cards'>('table')
  const [search, setSearch]         = useState('')
  const [statusFilter, setStatus]   = useState('all')

  const active   = projects.filter(p => p.status !== 'done')
  const done     = projects.filter(p => p.status === 'done')
  const inReview = projects.filter(p => p.status === 'review')
  const overdue  = projects.filter(p =>
    p.due_date && new Date(p.due_date) < new Date() && p.status !== 'done',
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return projects.filter(p => {
      const matchSearch = !q
        || p.title.toLowerCase().includes(q)
        || (p.clients?.name ?? '').toLowerCase().includes(q)
        || (p.description ?? '').toLowerCase().includes(q)
      const matchStatus = statusFilter === 'all' || p.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [projects, search, statusFilter])

  const isFiltering = search !== '' || statusFilter !== 'all'

  return (
    <div className="w-full min-h-screen bg-white">

      {/* ══ HERO SECTION ════════════════════════════════ */}
      <div className="border-b border-outline-variant/20">

        {/* Title + CTA */}
        <div className="px-4 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-5 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[22px] font-bold text-on-surface tracking-tight">Projects</h1>
          </div>
          <NewProjectButton clients={clients} />
        </div>

        {/* KPI cards */}
        {projects.length > 0 && (
          <div className="px-4 sm:px-8 pb-5 sm:pb-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KpiCard value={projects.length} label="Total"      icon={Layers}       color="text-slate-400"   accent="#94a3b8" />
            <KpiCard value={active.length}   label="Active"     icon={Zap}          color="text-blue-500"    accent="#3b82f6"
              badge={overdue.length > 0 ? `${overdue.length} overdue` : undefined} badgeCls="bg-red-50 text-red-600" />
            <KpiCard value={inReview.length} label="In Review"  icon={Eye}          color="text-amber-500"   accent="#f59e0b" />
            <KpiCard value={done.length}     label="Completed"  icon={CheckCircle2} color="text-emerald-500" accent="#10b981" />
          </div>
        )}
      </div>

      {/* ══ CONTROLS BAR ════════════════════════════════ */}
      {projects.length > 0 && (
        <div className="sticky top-14 z-20 bg-white/95 backdrop-blur-sm border-b border-outline-variant/15 px-4 sm:px-8 py-2.5 flex items-center gap-2">

          {/* Search — full width */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-on-surface-variant/40 pointer-events-none" />
            <input
              type="text"
              placeholder="Search projects…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-8 w-full pl-9 pr-3 rounded-md border border-outline-variant/60 text-sm bg-white focus:border-ds-secondary focus:ring-2 focus:ring-ds-secondary/20 focus:outline-none transition-all placeholder:text-on-surface-variant/40"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 rounded-full bg-on-surface-variant/20 hover:bg-on-surface-variant/35 flex items-center justify-center transition-colors"
                aria-label="Clear search"
              >
                <span className="text-[9px] font-bold text-on-surface-variant leading-none">✕</span>
              </button>
            )}
          </div>

          {/* Filter icon button */}
          <FilterButton statusFilter={statusFilter} onStatusChange={setStatus} />

          {/* Results feedback — hidden on mobile to save space */}
          {isFiltering && (
            <span className="hidden sm:inline text-[12px] text-on-surface-variant/60">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
          )}
          {isFiltering && (
            <button
              onClick={() => { setSearch(''); setStatus('all') }}
              className="text-[12px] font-medium text-ds-secondary hover:underline whitespace-nowrap"
            >
              Clear
            </button>
          )}

          {/* View toggle */}
          <div className="flex items-center gap-0.5 bg-surface-container/60 p-0.5 rounded-md border border-outline-variant/25 shrink-0">
            {([['table', List, 'Table view'], ['cards', LayoutGrid, 'Card view']] as const).map(([v, Icon, title]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                title={title}
                className={cn(
                  'h-6 w-7 flex items-center justify-center rounded transition-all',
                  view === v
                    ? 'bg-white shadow-sm text-on-surface'
                    : 'text-on-surface-variant/45 hover:text-on-surface',
                )}
              >
                <Icon className="size-3.5" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ══ CONTENT ═════════════════════════════════════ */}
      <div className="px-4 sm:px-8 py-5 sm:py-7 pb-16">
        {projects.length === 0 ? (
          <EmptyProjects clients={clients} />
        ) : filtered.length === 0 ? (
          <NoResults onClear={() => { setSearch(''); setStatus('all') }} />
        ) : view === 'table' ? (
          <TableView projects={filtered} />
        ) : (
          <CardView projects={filtered} clients={clients} />
        )}
      </div>
    </div>
  )
}

/* ══ KPI CARD ════════════════════════════════════════════ */
function KpiCard({
  value, label, icon: Icon, color, accent, badge, badgeCls,
}: {
  value: number; label: string; icon: React.ElementType
  color: string; accent: string
  badge?: string; badgeCls?: string
}) {
  return (
    <div className="relative flex items-start justify-between px-5 py-4 rounded-lg border border-outline-variant/20 bg-white shadow-sm overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-0.75" style={{ background: accent }} />
      <div className="flex flex-col">
        <span className="text-[28px] font-extrabold text-on-surface tracking-tight leading-none">{value}</span>
        <span className="text-[12px] font-medium text-on-surface-variant mt-2">{label}</span>
        {badge && (
          <span className={cn('inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-1.5 w-fit', badgeCls)}>
            {badge}
          </span>
        )}
      </div>
      <Icon className={cn('size-4.5 mt-0.5 shrink-0 opacity-40', color)} />
    </div>
  )
}

/* ══ FILTER BUTTON ═══════════════════════════════════════ */
function FilterButton({ statusFilter, onStatusChange }: {
  statusFilter: string
  onStatusChange: (s: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isFiltered = statusFilter !== 'all'

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const OPTIONS = [
    { value: 'all',         label: 'All statuses', dot: null       },
    { value: 'briefing',    label: 'Briefing',      dot: '#94a3b8' },
    { value: 'in_progress', label: 'In Progress',   dot: '#3b82f6' },
    { value: 'review',      label: 'In Review',     dot: '#f59e0b' },
    { value: 'done',        label: 'Done',          dot: '#10b981' },
  ]

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen(p => !p)}
        aria-label="Filter by status"
        className={cn(
          'h-8 px-2.5 rounded-md border transition-all flex items-center gap-1.5',
          isFiltered || open
            ? 'border-ds-secondary bg-ds-secondary/8 text-ds-secondary'
            : 'border-outline-variant/60 bg-white text-on-surface-variant hover:border-outline-variant hover:text-on-surface',
        )}
      >
        <SlidersHorizontal className="size-3.5" />
        {isFiltered && <span className="size-1.5 rounded-full bg-ds-secondary" />}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-outline-variant/20 shadow-xl z-50 overflow-hidden">
          <div className="px-4 pt-3.5 pb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Filter by status
            </p>
          </div>
          <div className="p-2 pt-0">
            {OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => { onStatusChange(opt.value); setOpen(false) }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-colors',
                  statusFilter === opt.value
                    ? 'bg-ds-secondary text-white font-semibold'
                    : 'text-on-surface hover:bg-surface-container/60',
                )}
              >
                {opt.dot
                  ? <span className="size-2 rounded-full shrink-0" style={{ background: opt.dot }} />
                  : <span className="size-2 rounded-full shrink-0 bg-outline-variant/30" />
                }
                <span className="flex-1">{opt.label}</span>
                {statusFilter === opt.value && <Check className="size-3.5 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ══ TABLE VIEW ══════════════════════════════════════════ */
function TableView({ projects }: { projects: ProjectRow[] }) {
  const active = projects.filter(p => p.status !== 'done')
  const done   = projects.filter(p => p.status === 'done')
  return (
    <div className="flex flex-col gap-8">
      {active.length > 0 && <TableSection rows={active} />}
      {done.length > 0   && <TableSection rows={done} faded />}
    </div>
  )
}

const COL = 'grid-cols-[minmax(0,1fr)_160px_144px_120px_88px]'

function TableSection({ rows, faded }: {
  rows: ProjectRow[]; faded?: boolean
}) {
  return (
    <section className={cn(faded && 'opacity-60')}>
      {/* Horizontal scroll on mobile */}
      <div className="overflow-x-auto">
      {/* Table card */}
      <div className="min-w-150 rounded-xl border border-outline-variant/30 overflow-hidden bg-white shadow-sm">
        {/* Header row */}
        <div className={cn('grid gap-0 px-5 py-2.5 bg-surface-container/50 border-b border-outline-variant/20', COL)}>
          {['Project', 'Client', 'Status', 'Due Date', ''].map((h, i) => (
            <p key={i} className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              {h}
            </p>
          ))}
        </div>

        {/* Data rows */}
        <div className="divide-y divide-outline-variant/10">
          {rows.map(p => <TableRow key={p.id} project={p} />)}
        </div>
      </div>
      </div>
    </section>
  )
}

function TableRow({ project: p }: { project: ProjectRow }) {
  const cfg      = STATUS_CFG[p.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.briefing
  const isOverdue = p.due_date && new Date(p.due_date) < new Date() && p.status !== 'done'
  const accent   = p.clients ? clientAccent(p.clients.name) : '#94a3b8'
  const href     = p.clients ? `/dashboard/clients/${p.clients.id}` : '#'

  return (
    <div className={cn(
      'relative grid gap-0 items-center pl-5 pr-4 py-3.5 group transition-colors',
      COL,
      isOverdue ? 'bg-red-50/30 hover:bg-red-50/60' : 'hover:bg-surface-container/20',
    )}>
      {/* Left status accent strip */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: cfg.accent }} />

      {/* Project col */}
      <div className="flex items-center gap-3 min-w-0 pr-4">
        <div className={cn('size-8 rounded-lg flex items-center justify-center shrink-0', cfg.iconBg)}>
          <FolderOpen className={cn('size-4', cfg.iconColor)} strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-on-surface truncate group-hover:text-ds-secondary transition-colors">
            {p.title}
          </p>
          {p.description && (
            <p className="text-[11px] text-on-surface-variant/50 truncate mt-0.5">{p.description}</p>
          )}
        </div>
      </div>

      {/* Client col */}
      <div className="flex items-center gap-2 min-w-0 pr-4">
        {p.clients ? (
          <>
            <div
              className="size-6 rounded-md flex items-center justify-center text-white text-[9px] font-bold shrink-0"
              style={{ background: accent }}
            >
              {getInitials(p.clients.name)}
            </div>
            <span className="text-[13px] text-on-surface truncate">{p.clients.name}</span>
          </>
        ) : (
          <span className="text-[13px] text-on-surface-variant/35">—</span>
        )}
      </div>

      {/* Status col */}
      <div className="pr-4">
        <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full', cfg.badge)}>
          <span className={cn('size-1.5 rounded-full shrink-0', cfg.dot)} />
          {cfg.label}
        </span>
      </div>

      {/* Due date col */}
      <div className="pr-4">
        {p.due_date ? (
          <div>
            <p className={cn('text-[12px] font-medium', isOverdue ? 'text-red-600 font-semibold' : 'text-on-surface-variant')}>
              {formatDate(p.due_date)}
            </p>
            {isOverdue && (
              <div className="flex items-center gap-1 mt-0.5">
                <AlertTriangle className="size-2.5 text-red-500" />
                <span className="text-[10px] font-semibold text-red-500">Overdue</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-[12px] text-on-surface-variant/35">—</p>
        )}
      </div>

      {/* Actions col */}
      <div className="flex items-center justify-end">
        <Link
          href={href}
          className="h-7 px-2.5 text-[12px] font-semibold text-ds-secondary bg-ds-secondary/8 hover:bg-ds-secondary/15 rounded-md flex items-center gap-1 transition-colors opacity-0 group-hover:opacity-100 whitespace-nowrap"
        >
          Open <ArrowRight className="size-3" />
        </Link>
      </div>
    </div>
  )
}

/* ══ CARD VIEW ═══════════════════════════════════════════ */
function CardView({ projects, clients }: { projects: ProjectRow[]; clients: { id: string; name: string }[] }) {
  const active = projects.filter(p => p.status !== 'done')
  const done   = projects.filter(p => p.status === 'done')
  return (
    <div className="flex flex-col gap-10">
      {active.length > 0 && <CardGroup label="Active"    count={active.length} projects={active} />}
      {done.length > 0   && <CardGroup label="Completed" count={done.length}   projects={done} faded />}
    </div>
  )
}

function CardGroup({ label, count, projects, faded }: {
  label: string; count: number; projects: ProjectRow[]; faded?: boolean
}) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-5">
        <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest whitespace-nowrap">{label}</span>
        <span className="text-[11px] font-semibold text-on-surface-variant/50 bg-surface-container border border-outline-variant/30 px-2 py-0.5 rounded-full">{count}</span>
        <div className="flex-1 h-px bg-outline-variant/25" />
      </div>
      <div className={cn('grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4', faded && 'opacity-55')}>
        {projects.map(p => <ProjectCard key={p.id} project={p} />)}
      </div>
    </section>
  )
}

function ProjectCard({ project: p }: { project: ProjectRow }) {
  const cfg      = STATUS_CFG[p.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.briefing
  const isOverdue = p.due_date && new Date(p.due_date) < new Date() && p.status !== 'done'
  const countdown = p.due_date && !isOverdue ? daysUntil(p.due_date) : ''
  const href     = p.clients ? `/dashboard/clients/${p.clients.id}` : '#'

  return (
    <Link
      href={href}
      className="group flex flex-col bg-white rounded-xl border border-outline-variant/30 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
    >
      <div className="h-1 w-full shrink-0" style={{ background: cfg.accent }} />
      <div className="flex flex-col gap-3.5 p-5 flex-1">
        <div className="flex items-center gap-3">
          <div className={cn('size-9 rounded-lg flex items-center justify-center shrink-0', cfg.iconBg)}>
            <FolderOpen className={cn('size-4.5', cfg.iconColor)} strokeWidth={1.75} />
          </div>
          <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full', cfg.badge)}>
            <span className={cn('size-1.5 rounded-full shrink-0', cfg.dot)} />
            {cfg.label}
          </span>
          <ArrowRight className="ml-auto size-4 text-on-surface-variant/20 opacity-0 group-hover:opacity-100 group-hover:text-ds-secondary transition-all shrink-0" />
        </div>
        <div>
          <h3 className="font-bold text-[15px] text-on-surface leading-snug group-hover:text-ds-secondary transition-colors">{p.title}</h3>
          {p.clients && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="size-4 rounded-full bg-ds-secondary/10 flex items-center justify-center shrink-0">
                <Users className="size-2.5 text-ds-secondary" />
              </div>
              <span className="text-xs font-medium text-on-surface-variant">{p.clients.name}</span>
            </div>
          )}
        </div>
        {p.description && (
          <p className="text-xs text-on-surface-variant/75 leading-relaxed line-clamp-2">{p.description}</p>
        )}
      </div>
      <div className={cn(
        'px-5 py-3 flex items-center gap-2 border-t',
        isOverdue ? 'bg-red-50 border-red-100' : 'bg-surface-container/20 border-outline-variant/15',
      )}>
        <Clock className={cn('size-3 shrink-0', isOverdue ? 'text-red-500' : 'text-on-surface-variant/40')} />
        <span className={cn('text-[11px] font-medium', isOverdue ? 'text-red-600 font-semibold' : 'text-on-surface-variant')}>
          {p.due_date
            ? isOverdue ? `Overdue — ${formatDate(p.due_date)}` : `Due ${formatDate(p.due_date)}`
            : 'No due date set'}
        </span>
        {countdown && (
          <span className="ml-auto text-[10px] font-semibold text-on-surface-variant/40 whitespace-nowrap">{countdown}</span>
        )}
      </div>
    </Link>
  )
}

/* ══ UTILITY STATES ══════════════════════════════════════ */
function NoResults({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="size-14 rounded-xl bg-surface-container flex items-center justify-center mb-4">
        <Search className="size-6 text-on-surface-variant/40" />
      </div>
      <p className="text-base font-semibold text-on-surface">No matching projects</p>
      <p className="text-sm text-on-surface-variant mt-1">Try adjusting your search or filters.</p>
      <button
        onClick={onClear}
        className="mt-4 h-8 px-4 rounded-md border border-outline-variant text-sm font-medium text-on-surface hover:bg-surface-container transition-colors"
      >
        Clear filters
      </button>
    </div>
  )
}

function EmptyProjects({ clients }: { clients: { id: string; name: string }[] }) {
  const hasClients = clients.length > 0
  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] text-center px-6">
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
    </div>
  )
}

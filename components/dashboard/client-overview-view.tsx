'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { formatDate, formatCurrency, formatRelativeTime } from '@/lib/format'
import {
  FolderOpen, Clock, DollarSign, Zap, Paperclip, MessageSquare,
  Plus, ArrowRight, Search, Check, SlidersHorizontal, TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import { AddProjectButton } from './add-project-button'
import { ProjectStatusSelector } from './project-status-selector'

/* ── Types ───────────────────────────────────────────── */
export type OverviewProject = {
  id: string; title: string; status: string; due_date: string | null
  description: string | null; updated_at: string
  pendingFiles: number; unreadMsgs: number
}

export type OverviewInvoice = {
  id: string; invoice_number: string; total: number
  currency: string; status: string; due_date: string | null
}

interface Props {
  clientId: string
  projects: OverviewProject[]
  invoices: OverviewInvoice[]
  totalPendingFiles: number
  totalUnread: number
  outstandingTotal: number
}

/* ── Status configs ──────────────────────────────────── */
const PROJECT_STATUS: Record<string, { label: string; dot: string; badge: string; border: string; iconBg: string; iconColor: string }> = {
  briefing:    { label: 'Briefing',    dot: 'bg-slate-400',   badge: 'bg-slate-100 text-slate-600',      border: '#94a3b8', iconBg: 'bg-slate-100',  iconColor: 'text-slate-500'    },
  in_progress: { label: 'In Progress', dot: 'bg-blue-500',    badge: 'bg-blue-50 text-blue-700',         border: '#3b82f6', iconBg: 'bg-blue-50',    iconColor: 'text-blue-600'     },
  review:      { label: 'In Review',   dot: 'bg-amber-500',   badge: 'bg-amber-50 text-amber-700',       border: '#f59e0b', iconBg: 'bg-amber-50',   iconColor: 'text-amber-600'    },
  done:        { label: 'Done',        dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700',   border: '#10b981', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600'  },
}

const INVOICE_STATUS: Record<string, { label: string; cls: string; dot: string }> = {
  draft:   { label: 'Draft',   cls: 'bg-slate-100 text-slate-600',             dot: 'bg-slate-400'   },
  sent:    { label: 'Sent',    cls: 'bg-blue-50 text-blue-700',                dot: 'bg-blue-500'    },
  paid:    { label: 'Paid',    cls: 'bg-emerald-50 text-emerald-700',          dot: 'bg-emerald-500' },
  overdue: { label: 'Overdue', cls: 'bg-red-50 text-red-700',                  dot: 'bg-red-500'     },
}

const PROJ_COL = 'grid-cols-[minmax(0,1fr)_130px_120px_70px_70px_80px]'

/* ── Main component ──────────────────────────────────── */
export function ClientOverviewView({
  clientId, projects, invoices,
  totalPendingFiles, totalUnread, outstandingTotal,
}: Props) {
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return projects.filter(p => {
      const matchSearch = !q || p.title.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q)
      const matchStatus = statusFilter === 'all' || p.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [projects, search, statusFilter])

  const isFiltering = search !== '' || statusFilter !== 'all'

  /* KPI values */
  const activeCount = projects.filter(p => p.status !== 'done').length

  return (
    <div className="flex flex-col gap-6">

      {/* ── KPI Cards ───────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard icon={FolderOpen} label="Total Projects"  value={String(projects.length)}
          accent="#0051d5" iconColor="text-ds-secondary" />
        <KpiCard icon={Zap}        label="Active"          value={String(activeCount)}
          accent={activeCount > 0 ? '#f59e0b' : '#94a3b8'}
          iconColor={activeCount > 0 ? 'text-amber-500' : 'text-slate-400'} />
        <KpiCard icon={DollarSign} label="Outstanding"     value={outstandingTotal > 0 ? formatCurrency(outstandingTotal) : '—'}
          accent={outstandingTotal > 0 ? '#3b82f6' : '#94a3b8'}
          iconColor={outstandingTotal > 0 ? 'text-blue-500' : 'text-slate-400'}
          compact={outstandingTotal > 0} />
        <KpiCard icon={Clock}      label="Pending Files"   value={String(totalPendingFiles)}
          accent={totalPendingFiles > 0 ? '#f59e0b' : '#94a3b8'}
          iconColor={totalPendingFiles > 0 ? 'text-amber-500' : 'text-slate-400'} />
      </div>

      {/* ── Alert chips ─────────────────────────────── */}
      {(totalPendingFiles > 0 || totalUnread > 0) && (
        <div className="flex flex-wrap gap-2">
          {totalPendingFiles > 0 && (
            <Link href={`/dashboard/clients/${clientId}/files`}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/60 transition-colors">
              <Paperclip className="size-3.5 shrink-0" />
              {totalPendingFiles} file{totalPendingFiles !== 1 ? 's' : ''} awaiting review
              <ArrowRight className="size-3 shrink-0" />
            </Link>
          )}
          {totalUnread > 0 && (
            <Link href={`/dashboard/chats?client=${clientId}`}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full bg-ds-secondary/8 text-ds-secondary hover:bg-ds-secondary/15 border border-ds-secondary/20 transition-colors">
              <MessageSquare className="size-3.5 shrink-0" />
              {totalUnread} unread message{totalUnread !== 1 ? 's' : ''}
              <ArrowRight className="size-3 shrink-0" />
            </Link>
          )}
        </div>
      )}

      {/* ── Projects section ────────────────────────── */}
      <div className="flex flex-col gap-3">
        {/* Section header: search + filter + add */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-on-surface-variant/40 pointer-events-none" />
            <input
              type="text"
              placeholder="Search projects…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-8 w-full pl-9 pr-3 rounded-lg border border-outline-variant/60 text-sm bg-white focus:border-ds-secondary focus:ring-2 focus:ring-ds-secondary/20 focus:outline-none transition-all placeholder:text-on-surface-variant/40"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 rounded-full bg-on-surface-variant/20 hover:bg-on-surface-variant/35 flex items-center justify-center transition-colors">
                <span className="text-[9px] font-bold text-on-surface-variant leading-none">✕</span>
              </button>
            )}
          </div>
          <ProjectFilterButton statusFilter={statusFilter} onStatusChange={setStatusFilter} />
          {isFiltering && (
            <button onClick={() => { setSearch(''); setStatusFilter('all') }}
              className="text-[12px] font-medium text-ds-secondary hover:underline whitespace-nowrap">
              Clear
            </button>
          )}
          <AddProjectButton clientId={clientId} />
        </div>

        {/* Projects table */}
        {projects.length === 0 ? (
          <EmptyProjects clientId={clientId} />
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-outline-variant/20 shadow-sm p-8 flex flex-col items-center gap-2 text-center">
            <p className="text-sm font-semibold text-on-surface">No projects match your filter</p>
            <button onClick={() => { setSearch(''); setStatusFilter('all') }}
              className="text-xs font-semibold text-ds-secondary hover:underline">Clear filters</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-150 rounded-xl border border-outline-variant/20 overflow-hidden bg-white shadow-sm">
              {/* Header */}
              <div className={cn('grid px-4 py-2.5 bg-surface-container/50 border-b border-outline-variant/15', PROJ_COL)}>
                {['Project', 'Status', 'Due Date', 'Files', 'Msgs', ''].map((h, i) => (
                  <p key={i} className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{h}</p>
                ))}
              </div>
              {/* Rows */}
              <div className="divide-y divide-outline-variant/10">
                {filtered.map(p => {
                  const cfg = PROJECT_STATUS[p.status] ?? PROJECT_STATUS.briefing
                  const isOverdue = p.due_date && new Date(p.due_date) < new Date() && p.status !== 'done'
                  return (
                    <div key={p.id} className={cn(
                      'relative grid items-center pl-4 pr-3 py-3 group transition-colors',
                      PROJ_COL,
                      isOverdue ? 'bg-red-50/30 hover:bg-red-50/60' : 'hover:bg-surface-container/20',
                    )}>
                      <div className="absolute left-0 top-0 bottom-0 w-0.75" style={{ background: cfg.border }} />
                      {/* Project */}
                      <div className="flex items-center gap-2.5 min-w-0 pr-3">
                        <div className={cn('size-8 rounded-lg flex items-center justify-center shrink-0', cfg.iconBg)}>
                          <FolderOpen className={cn('size-3.5', cfg.iconColor)} strokeWidth={1.75} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-on-surface truncate group-hover:text-ds-secondary transition-colors">{p.title}</p>
                          {p.description && <p className="text-[11px] text-on-surface-variant/50 truncate">{p.description}</p>}
                        </div>
                      </div>
                      {/* Status */}
                      <div className="pr-3">
                        <ProjectStatusSelector projectId={p.id} currentStatus={p.status as never} />
                      </div>
                      {/* Due date */}
                      <div className="pr-3">
                        {p.due_date ? (
                          <p className={cn('text-[12px] font-medium', isOverdue ? 'text-red-600 font-semibold' : 'text-on-surface-variant')}>
                            {formatDate(p.due_date)}
                          </p>
                        ) : <p className="text-[12px] text-on-surface-variant/35">—</p>}
                      </div>
                      {/* Files */}
                      <div>
                        {p.pendingFiles > 0
                          ? <Link href={`/dashboard/clients/${clientId}/files`}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:underline">
                              <Paperclip className="size-3" />{p.pendingFiles}
                            </Link>
                          : <span className="text-[12px] text-on-surface-variant/30">—</span>}
                      </div>
                      {/* Messages */}
                      <div>
                        {p.unreadMsgs > 0
                          ? <Link href={`/dashboard/chats?client=${clientId}`}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-ds-secondary hover:underline">
                              <MessageSquare className="size-3" />{p.unreadMsgs}
                            </Link>
                          : <span className="text-[12px] text-on-surface-variant/30">—</span>}
                      </div>
                      {/* Time */}
                      <div className="flex items-center justify-end">
                        <span className="text-[11px] text-on-surface-variant/40 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {formatRelativeTime(p.updated_at)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Recent Invoices section ──────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-bold text-on-surface uppercase tracking-widest">Recent Invoices</h2>
          <Link href={`/dashboard/clients/${clientId}/invoices`}
            className="text-xs font-semibold text-ds-secondary hover:underline flex items-center gap-1">
            View all <ArrowRight className="size-3" />
          </Link>
        </div>

        {invoices.length === 0 ? (
          <div className="bg-white rounded-xl border border-outline-variant/20 shadow-sm p-7 flex flex-col items-center text-center gap-3">
            <div className="size-11 rounded-xl bg-surface-container/80 flex items-center justify-center">
              <TrendingUp className="size-5 text-on-surface-variant/40" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-semibold text-on-surface">No invoices yet</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Create invoices to track and collect payments.</p>
            </div>
            <Link href={`/dashboard/clients/${clientId}/invoices`}
              className="inline-flex items-center gap-1 h-8 px-3 rounded-lg bg-ds-secondary text-white text-xs font-semibold hover:bg-ds-secondary-container transition-colors">
              <Plus className="size-3.5" /> Create invoice
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-96 rounded-xl border border-outline-variant/20 overflow-hidden bg-white shadow-sm">
              {/* Header */}
              <div className="grid grid-cols-[minmax(0,1fr)_110px_120px_120px] px-4 py-2.5 bg-surface-container/50 border-b border-outline-variant/15">
                {['Invoice', 'Status', 'Amount', 'Due Date'].map((h, i) => (
                  <p key={i} className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{h}</p>
                ))}
              </div>
              {/* Rows */}
              <div className="divide-y divide-outline-variant/10">
                {invoices.map(inv => {
                  const cfg       = INVOICE_STATUS[inv.status] ?? INVOICE_STATUS.draft
                  const isOverdue = inv.status === 'overdue'
                  const isPaid    = inv.status === 'paid'
                  return (
                    <div key={inv.id} className={cn(
                      'relative grid grid-cols-[minmax(0,1fr)_110px_120px_120px] items-center px-4 py-3 transition-colors',
                      isOverdue ? 'bg-red-50/40 hover:bg-red-50/70' : 'hover:bg-surface-container/25',
                    )}>
                      <div className={cn(
                        'absolute left-0 top-0 bottom-0 w-0.75',
                        isOverdue ? 'bg-red-500' : isPaid ? 'bg-emerald-500' : 'bg-transparent',
                      )} />
                      <p className="text-sm font-bold text-on-surface pl-1">{inv.invoice_number}</p>
                      <span className={cn('w-fit inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full', cfg.cls)}>
                        <span className={cn('size-1 rounded-full shrink-0', cfg.dot)} />
                        {cfg.label}
                      </span>
                      <span className={cn('text-sm font-bold tabular-nums', isPaid ? 'text-emerald-600' : isOverdue ? 'text-red-600' : 'text-on-surface')}>
                        {formatCurrency(inv.total, inv.currency)}
                      </span>
                      <p className={cn('text-[12px]', isOverdue ? 'text-red-500 font-medium' : 'text-on-surface-variant')}>
                        {inv.due_date ? formatDate(inv.due_date) : '—'}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Quick-access CTAs ────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link href={`/dashboard/clients/${clientId}/files`}
          className="group flex items-center gap-3.5 p-4 bg-white rounded-xl border border-outline-variant/20 shadow-sm hover:shadow-md hover:border-amber-200/70 transition-all">
          <div className={cn(
            'size-10 rounded-xl flex items-center justify-center shrink-0 transition-colors',
            totalPendingFiles > 0 ? 'bg-amber-100' : 'bg-amber-50 group-hover:bg-amber-100',
          )}>
            <Paperclip className="size-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-on-surface">Files</p>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {totalPendingFiles > 0 ? `${totalPendingFiles} awaiting review` : 'Share deliverables for review'}
            </p>
          </div>
          {totalPendingFiles > 0
            ? <span className="text-[10px] font-bold bg-amber-100 text-amber-700 rounded-full px-1.5 py-0.5 shrink-0">{totalPendingFiles}</span>
            : <ArrowRight className="size-4 text-on-surface-variant/25 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all shrink-0" />}
        </Link>

        <Link href={`/dashboard/chats?client=${clientId}`}
          className="group flex items-center gap-3.5 p-4 bg-white rounded-xl border border-outline-variant/20 shadow-sm hover:shadow-md hover:border-ds-secondary/25 transition-all">
          <div className={cn(
            'size-10 rounded-xl flex items-center justify-center shrink-0 transition-colors',
            totalUnread > 0 ? 'bg-ds-secondary/15' : 'bg-ds-secondary/8 group-hover:bg-ds-secondary/15',
          )}>
            <MessageSquare className="size-5 text-ds-secondary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-on-surface">Messages</p>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {totalUnread > 0 ? `${totalUnread} unread message${totalUnread > 1 ? 's' : ''}` : 'Chat with your client'}
            </p>
          </div>
          {totalUnread > 0
            ? <span className="text-[10px] font-bold bg-ds-secondary text-white rounded-full px-1.5 py-0.5 shrink-0">{totalUnread}</span>
            : <ArrowRight className="size-4 text-on-surface-variant/25 group-hover:text-ds-secondary group-hover:translate-x-0.5 transition-all shrink-0" />}
        </Link>
      </div>
    </div>
  )
}

/* ── KPI Card ─────────────────────────────────────────── */
function KpiCard({ icon: Icon, label, value, accent, iconColor, compact }: {
  icon: React.ElementType; label: string; value: string
  accent: string; iconColor: string; compact?: boolean
}) {
  return (
    <div className="relative flex items-start justify-between px-4 py-4 rounded-lg border border-outline-variant/20 bg-white shadow-sm overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-0.75" style={{ background: accent }} />
      <div className="flex flex-col min-w-0">
        <span className={cn(
          'font-extrabold text-on-surface tracking-tight leading-none',
          compact ? 'text-[17px] sm:text-[20px]' : 'text-[26px] sm:text-[28px]',
        )}>
          {value}
        </span>
        <span className="text-[11px] font-medium text-on-surface-variant mt-2 leading-snug">{label}</span>
      </div>
      <Icon className={cn('size-4.5 mt-0.5 shrink-0 opacity-40', iconColor)} />
    </div>
  )
}

/* ── Project filter button ───────────────────────────── */
function ProjectFilterButton({ statusFilter, onStatusChange }: {
  statusFilter: string; onStatusChange: (s: string) => void
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
          'h-8 px-2.5 rounded-lg border transition-all flex items-center gap-1.5',
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
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Filter by status</p>
          </div>
          <div className="p-2 pt-0">
            {OPTIONS.map(opt => (
              <button key={opt.value}
                onClick={() => { onStatusChange(opt.value); setOpen(false) }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-colors',
                  statusFilter === opt.value ? 'bg-ds-secondary text-white font-semibold' : 'text-on-surface hover:bg-surface-container/60',
                )}>
                {opt.dot
                  ? <span className="size-2 rounded-full shrink-0" style={{ background: opt.dot }} />
                  : <span className="size-2 rounded-full shrink-0 bg-outline-variant/30" />}
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

/* ── Empty projects state ────────────────────────────── */
function EmptyProjects({ clientId }: { clientId: string }) {
  return (
    <div className="bg-white rounded-xl border border-outline-variant/20 shadow-sm p-10 flex flex-col items-center text-center gap-4">
      <div className="size-14 rounded-xl bg-ds-secondary/8 flex items-center justify-center">
        <FolderOpen className="size-7 text-ds-secondary/50" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-sm font-bold text-on-surface">No projects yet</p>
        <p className="text-xs text-on-surface-variant mt-1 max-w-xs leading-relaxed">
          Add a project to start tracking work, sharing files, and communicating with this client.
        </p>
      </div>
      <AddProjectButton clientId={clientId} />
    </div>
  )
}

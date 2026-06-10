'use client'

import { useState, useMemo, useTransition, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { formatCurrency, formatRelativeTime, getInitials } from '@/lib/format'
import {
  Users, DollarSign, Clock, MessageSquare,
  Search, LayoutGrid, List, ArrowRight,
  Copy, Send, Archive, MoreHorizontal, FolderOpen, Plus, Sparkles,
  SlidersHorizontal, Check,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { ClientCard, clientAccent } from './client-card'
import { AddClientModal } from './add-client-modal'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Client, Project } from '@/types/database'

/* ── Types ──────────────────────────────────────────────── */
export type EnrichedClient = Client & {
  projects: (Project & { pending_files: number; unread_messages: number })[]
  outstanding: number
  pending_files_total: number
  unread_messages_total: number
}

const STATUS_CFG: Record<string, { label: string; dot: string; badge: string }> = {
  briefing:    { label: 'Briefing',    dot: 'bg-slate-400',   badge: 'bg-slate-100 text-slate-600'   },
  in_progress: { label: 'In Progress', dot: 'bg-blue-500',    badge: 'bg-blue-50 text-blue-700'      },
  review:      { label: 'In Review',   dot: 'bg-amber-500',   badge: 'bg-amber-50 text-amber-700'    },
  done:        { label: 'Done',        dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700' },
}

const COL = 'grid-cols-[minmax(0,1fr)_minmax(0,180px)_112px_130px_96px]'

/* ── Root component ─────────────────────────────────────── */
interface ClientsViewProps {
  clients: EnrichedClient[]
  plan?: string
}

export function ClientsView({ clients, plan = 'free' }: ClientsViewProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [view, setView]     = useState<'table' | 'cards'>('table')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [addOpen, setAddOpen] = useState(false)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  const totalOutstanding    = clients.reduce((s, c) => s + c.outstanding, 0)
  const totalPending        = clients.reduce((s, c) => s + c.pending_files_total, 0)
  const totalUnread         = clients.reduce((s, c) => s + c.unread_messages_total, 0)
  const outstandingCount    = clients.filter(c => c.outstanding > 0).length

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return clients.filter(c => {
      const matchSearch = !q
        || c.name.toLowerCase().includes(q)
        || (c.email ?? '').toLowerCase().includes(q)
      const matchFilter =
        filter === 'outstanding'  ? c.outstanding > 0 :
        filter === 'unread'       ? c.unread_messages_total > 0 :
        filter === 'no-projects'  ? c.projects.filter(p => p.status !== 'done').length === 0 :
        true
      return matchSearch && matchFilter
    })
  }, [clients, search, filter])

  function handleSendMagicLink(clientId: string) {
    startTransition(async () => {
      const res = await fetch(`/api/clients/${clientId}/magic-link`, { method: 'POST' })
      if (res.ok) toast.success('Magic link sent')
      else        toast.error('Failed to send magic link')
    })
  }

  function handleArchive(clientId: string) {
    startTransition(async () => {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' }),
      })
      if (res.ok) { toast.success('Client archived'); router.refresh() }
      else          toast.error('Failed to archive client')
    })
  }

  const isFiltering = search !== '' || filter !== 'all'

  return (
    <div className="w-full min-h-screen bg-white">

      {/* ══ HERO SECTION ════════════════════════════════ */}
      <div className="border-b border-outline-variant/20">

        {/* Title + CTA */}
        <div className="px-4 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-5 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[22px] font-bold text-on-surface tracking-tight">Clients</h1>
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 h-9 px-4 rounded-md bg-ds-secondary text-white text-sm font-semibold hover:bg-ds-secondary-container transition-colors shadow-sm shadow-ds-secondary/20 shrink-0 mt-0.5"
          >
            <Plus className="size-3.5" strokeWidth={2.5} />
            Add Client
          </button>
        </div>

        {/* KPI cards */}
        {clients.length > 0 && (
          <div className="px-4 sm:px-8 pb-5 sm:pb-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KpiCard value={clients.length}               label="Total Clients"    icon={Users}         color="text-slate-400"   accent="#94a3b8" />
            <KpiCard value={formatCurrency(totalOutstanding)} label="Outstanding"  icon={DollarSign}    color="text-blue-500"    accent="#3b82f6"
              badge={outstandingCount > 0 ? `${outstandingCount} client${outstandingCount !== 1 ? 's' : ''}` : undefined}
              badgeCls="bg-blue-50 text-ds-secondary" />
            <KpiCard value={totalPending}                 label="Pending Files"    icon={Clock}         color="text-amber-500"   accent="#f59e0b" />
            <KpiCard value={totalUnread}                  label="Unread Messages"  icon={MessageSquare} color="text-violet-500"  accent="#8b5cf6" />
          </div>
        )}
      </div>

      {/* ══ CONTROLS BAR ════════════════════════════════ */}
      {clients.length > 0 && (
        <div className="sticky top-14 z-20 bg-white/95 backdrop-blur-sm border-b border-outline-variant/15 px-4 sm:px-8 py-2.5 flex items-center gap-2">

          {/* Search — full width */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-on-surface-variant/40 pointer-events-none" />
            <input
              type="text"
              placeholder="Search clients…"
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
          <ClientFilterButton filter={filter} onFilterChange={setFilter} />

          {isFiltering && (
            <span className="hidden sm:inline text-[12px] text-on-surface-variant/60">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
          )}
          {isFiltering && (
            <button
              onClick={() => { setSearch(''); setFilter('all') }}
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
        {clients.length === 0 ? (
          <EmptyClients onAdd={() => setAddOpen(true)} />
        ) : filtered.length === 0 ? (
          <NoResults onClear={() => { setSearch(''); setFilter('all') }} />
        ) : view === 'table' ? (
          <ClientTable
            clients={filtered}
            appUrl={appUrl}
            onSendMagicLink={handleSendMagicLink}
            onArchive={handleArchive}
          />
        ) : (
          <ClientCardGrid
            clients={filtered}
            onAdd={() => setAddOpen(true)}
            onSendMagicLink={handleSendMagicLink}
            onArchive={handleArchive}
          />
        )}
      </div>

      <AddClientModal open={addOpen} onOpenChange={setAddOpen} plan={plan} clientCount={clients.length} />
    </div>
  )
}

/* ══ KPI CARD ════════════════════════════════════════════ */
function KpiCard({
  value, label, icon: Icon, color, accent, badge, badgeCls,
}: {
  value: string | number; label: string; icon: React.ElementType
  color: string; accent: string
  badge?: string; badgeCls?: string
}) {
  const isString = typeof value === 'string'
  return (
    <div className="relative flex items-start justify-between px-5 py-4 rounded-lg border border-outline-variant/20 bg-white shadow-sm overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-0.75" style={{ background: accent }} />
      <div className="flex flex-col">
        <span className={cn(
          'font-extrabold text-on-surface tracking-tight leading-none',
          isString ? 'text-[20px]' : 'text-[28px]',
        )}>
          {value}
        </span>
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
function ClientFilterButton({ filter, onFilterChange }: {
  filter: string
  onFilterChange: (s: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isFiltered = filter !== 'all'

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const OPTIONS = [
    { value: 'all',          label: 'All clients',          icon: Users         },
    { value: 'outstanding',  label: 'Outstanding balance',  icon: DollarSign    },
    { value: 'unread',       label: 'Unread messages',      icon: MessageSquare },
    { value: 'no-projects',  label: 'No active projects',   icon: FolderOpen    },
  ]

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen(p => !p)}
        aria-label="Filter clients"
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
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-outline-variant/20 shadow-xl z-50 overflow-hidden">
          <div className="px-4 pt-3.5 pb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Filter clients
            </p>
          </div>
          <div className="p-2 pt-0">
            {OPTIONS.map(opt => {
              const Icon = opt.icon
              return (
                <button
                  key={opt.value}
                  onClick={() => { onFilterChange(opt.value); setOpen(false) }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-colors',
                    filter === opt.value
                      ? 'bg-ds-secondary text-white font-semibold'
                      : 'text-on-surface hover:bg-surface-container/60',
                  )}
                >
                  <Icon className={cn('size-3.5 shrink-0', filter === opt.value ? 'text-white' : 'text-on-surface-variant/50')} />
                  <span className="flex-1">{opt.label}</span>
                  {filter === opt.value && <Check className="size-3.5 shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/* ══ TABLE VIEW ══════════════════════════════════════════ */
function ClientTable({
  clients, appUrl, onSendMagicLink, onArchive,
}: {
  clients: EnrichedClient[]
  appUrl: string
  onSendMagicLink: (id: string) => void
  onArchive: (id: string) => void
}) {
  return (
    <div className="overflow-x-auto">
    <div className="min-w-150 rounded-xl border border-outline-variant/30 overflow-hidden bg-white shadow-sm">
      {/* Header row */}
      <div className={cn('grid gap-0 px-5 py-2.5 bg-surface-container/50 border-b border-outline-variant/20', COL)}>
        {['Client', 'Active Project', 'Outstanding', 'Activity', ''].map((h, i) => (
          <p key={i} className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
            {h}
          </p>
        ))}
      </div>

      {/* Data rows */}
      <div className="divide-y divide-outline-variant/10">
        {clients.map(c => (
          <ClientTableRow
            key={c.id}
            client={c}
            appUrl={appUrl}
            onSendMagicLink={onSendMagicLink}
            onArchive={onArchive}
          />
        ))}
      </div>
    </div>
    </div>
  )
}

function ClientTableRow({
  client: c, appUrl, onSendMagicLink, onArchive,
}: {
  client: EnrichedClient
  appUrl: string
  onSendMagicLink: (id: string) => void
  onArchive: (id: string) => void
}) {
  const router       = useRouter()
  const accent       = clientAccent(c.name)
  const portalUrl    = `${appUrl}/p/${c.portal_slug}`
  const latestActive = c.projects.find(p => p.status !== 'done') ?? c.projects[0]
  const statusCfg    = latestActive ? STATUS_CFG[latestActive.status] : null
  const hasOutstanding = c.outstanding > 0
  const hasUnread    = c.unread_messages_total > 0
  const hasPending   = c.pending_files_total > 0

  function copyLink() {
    navigator.clipboard.writeText(portalUrl)
    toast.success('Portal link copied')
  }

  return (
    <div
      className={cn(
        'relative grid gap-0 items-center pl-5 pr-4 py-3.5 group transition-colors hover:bg-surface-container/20 cursor-pointer',
        COL,
      )}
      onClick={() => router.push(`/dashboard/clients/${c.id}`)}
    >
      {/* Left accent strip */}
      <div className="absolute left-0 top-0 bottom-0 w-0.75" style={{ background: accent }} />

      {/* Client col */}
      <div className="flex items-center gap-3 min-w-0 pr-4">
        <div
          className="size-9 rounded-xl flex items-center justify-center text-white text-[11px] font-bold shrink-0 select-none"
          style={{ background: accent }}
        >
          {getInitials(c.name)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-on-surface truncate group-hover:text-ds-secondary transition-colors">
            {c.name}
          </p>
          <p className="text-[11px] text-on-surface-variant/50 truncate mt-0.5">{c.email}</p>
        </div>
      </div>

      {/* Active project col */}
      <div className="min-w-0 pr-4">
        {statusCfg && latestActive ? (
          <>
            <span className={cn('inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full', statusCfg.badge)}>
              <span className={cn('size-1.5 rounded-full shrink-0', statusCfg.dot)} />
              {statusCfg.label}
            </span>
            <p className="text-[12px] font-medium text-on-surface truncate mt-1">{latestActive.title}</p>
          </>
        ) : (
          <div className="flex items-center gap-1.5">
            <FolderOpen className="size-3 text-on-surface-variant/30" />
            <span className="text-[12px] text-on-surface-variant/40">No active projects</span>
          </div>
        )}
      </div>

      {/* Outstanding col */}
      <div className="pr-4">
        {hasOutstanding ? (
          <p className="text-[13px] font-bold text-ds-secondary tabular-nums">
            {formatCurrency(c.outstanding)}
          </p>
        ) : (
          <p className="text-[13px] text-on-surface-variant/35">—</p>
        )}
      </div>

      {/* Activity col */}
      <div className="flex flex-col gap-1 pr-4">
        {hasPending ? (
          <div className="flex items-center gap-1">
            <Clock className="size-3 text-amber-500 shrink-0" />
            <span className="text-[11px] font-semibold text-amber-600">
              {c.pending_files_total} file{c.pending_files_total !== 1 ? 's' : ''} pending
            </span>
          </div>
        ) : null}
        {hasUnread ? (
          <div className="flex items-center gap-1">
            <MessageSquare className="size-3 text-violet-500 shrink-0" />
            <span className="text-[11px] font-semibold text-violet-600">
              {c.unread_messages_total} unread
            </span>
          </div>
        ) : null}
        {!hasPending && !hasUnread && (
          <span className="text-[12px] text-on-surface-variant/35">—</span>
        )}
      </div>

      {/* Actions col */}
      <div
        className="flex items-center justify-end gap-1"
        onClick={e => e.stopPropagation()}
      >
        <Link
          href={`/dashboard/clients/${c.id}`}
          className="hidden md:flex h-7 px-2.5 text-[12px] font-semibold text-ds-secondary bg-ds-secondary/8 hover:bg-ds-secondary/15 rounded-md items-center gap-1 transition-colors md:opacity-0 md:group-hover:opacity-100 whitespace-nowrap"
        >
          Open <ArrowRight className="size-3" />
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 md:opacity-0 md:group-hover:opacity-100 transition-opacity text-on-surface-variant/50 hover:text-on-surface hover:bg-surface-container"
            >
              <MoreHorizontal className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={copyLink}>
              <Copy className="size-3.5 mr-2" />Copy portal link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSendMagicLink(c.id)}>
              <Send className="size-3.5 mr-2" />Send magic link
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onArchive(c.id)}
              className="text-on-surface-variant"
            >
              <Archive className="size-3.5 mr-2" />Archive client
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

/* ══ CARD VIEW ═══════════════════════════════════════════ */
function ClientCardGrid({
  clients, onAdd, onSendMagicLink, onArchive,
}: {
  clients: EnrichedClient[]
  onAdd: () => void
  onSendMagicLink: (id: string) => void
  onArchive: (id: string) => void
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {clients.map(c => (
        <ClientCard
          key={c.id}
          client={c}
          onSendMagicLink={onSendMagicLink}
          onArchive={onArchive}
        />
      ))}
      <button
        onClick={onAdd}
        className="min-h-55 rounded-xl border-2 border-dashed border-outline-variant/50 hover:border-ds-secondary/50 hover:bg-white transition-all flex flex-col items-center justify-center gap-3 text-on-surface-variant hover:text-ds-secondary group"
      >
        <div className="size-10 rounded-xl bg-surface-container group-hover:bg-ds-secondary/10 flex items-center justify-center transition-colors shadow-sm">
          <Plus className="size-5" />
        </div>
        <div className="text-center">
          <p className="text-[13px] font-semibold">Add client</p>
          <p className="text-[11px] text-on-surface-variant/50 mt-0.5">Create a new portal</p>
        </div>
      </button>
    </div>
  )
}

/* ══ UTILITY STATES ══════════════════════════════════════ */
function NoResults({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="size-14 rounded-xl bg-surface-container flex items-center justify-center mb-4">
        <Search className="size-6 text-on-surface-variant/40" />
      </div>
      <p className="text-base font-semibold text-on-surface">No matching clients</p>
      <p className="text-sm text-on-surface-variant mt-1">Try adjusting your search or filter.</p>
      <button
        onClick={onClear}
        className="mt-4 h-8 px-4 rounded-md border border-outline-variant text-sm font-medium text-on-surface hover:bg-surface-container transition-colors"
      >
        Clear filters
      </button>
    </div>
  )
}

function EmptyClients({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] text-center px-6">
      <div className="relative mb-8">
        <div className="size-28 rounded-3xl bg-ds-secondary/8 flex items-center justify-center">
          <div className="size-18 rounded-2xl bg-ds-secondary/12 flex items-center justify-center">
            <Sparkles className="size-10 text-ds-secondary/70" strokeWidth={1.5} />
          </div>
        </div>
        <div className="absolute -top-1.5 -right-1.5 size-6 rounded-full bg-ds-secondary/20 flex items-center justify-center">
          <Users className="size-3 text-ds-secondary" />
        </div>
        <div className="absolute -bottom-1 -left-3 size-4 rounded-full bg-amber-200" />
        <div className="absolute top-3 -left-4 size-2.5 rounded-full bg-ds-secondary/25" />
      </div>
      <h2 className="text-2xl font-bold text-on-surface tracking-tight max-w-sm">
        Your workspace is ready
      </h2>
      <p className="text-base text-on-surface-variant mt-3 max-w-sm leading-relaxed">
        Add your first client to create a branded portal they can access with a magic link — no account required on their end.
      </p>
      <div className="flex items-center gap-3 mt-8">
        <button
          onClick={onAdd}
          className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-md bg-ds-secondary text-white text-sm font-semibold hover:bg-ds-secondary-container transition-colors shadow-sm shadow-ds-secondary/20"
        >
          <Plus className="size-4" strokeWidth={2.5} />
          Add your first client
        </button>
        <a
          href="https://docs.portalkit.io"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center h-10 px-6 rounded-md border border-outline-variant text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors"
        >
          Learn More
        </a>
      </div>
    </div>
  )
}

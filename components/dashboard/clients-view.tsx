'use client'

import { useState, useMemo, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { formatCurrency, formatRelativeTime, getInitials } from '@/lib/format'
import {
  Users, DollarSign, Clock, MessageSquare,
  Search, LayoutGrid, List, ArrowRight,
  Copy, Send, Archive, MoreHorizontal, FolderOpen, Plus, Sparkles,
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
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
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
}

export function ClientsView({ clients }: ClientsViewProps) {
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
        <div className="px-8 pt-8 pb-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-bold text-on-surface tracking-tight">Clients</h1>
            <p className="text-sm text-on-surface-variant mt-0.5">
              {clients.length > 0
                ? `${clients.length} active portal${clients.length !== 1 ? 's' : ''}`
                : 'Add clients to create their portals'}
            </p>
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
          <div className="px-8 pb-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KpiCard value={clients.length} label="Total Clients" icon={Users}
              bg="bg-slate-50" border="border-slate-200/70" color="text-slate-600" />
            <KpiCard value={formatCurrency(totalOutstanding)} label="Outstanding" icon={DollarSign}
              bg="bg-blue-50/60" border="border-blue-200/60" color="text-ds-secondary"
              badge={outstandingCount > 0 ? `${outstandingCount} client${outstandingCount !== 1 ? 's' : ''}` : undefined}
              badgeCls="bg-blue-100 text-ds-secondary" />
            <KpiCard value={totalPending} label="Pending Files" icon={Clock}
              bg="bg-amber-50" border="border-amber-200/70" color="text-amber-600" />
            <KpiCard value={totalUnread} label="Unread Messages" icon={MessageSquare}
              bg="bg-violet-50" border="border-violet-200/60" color="text-violet-600" />
          </div>
        )}
      </div>

      {/* ══ CONTROLS BAR ════════════════════════════════ */}
      {clients.length > 0 && (
        <div className="sticky top-14 z-20 bg-white/95 backdrop-blur-sm border-b border-outline-variant/15 px-8 py-2.5 flex items-center gap-3">

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-on-surface-variant/40 pointer-events-none" />
            <input
              type="text"
              placeholder="Search clients…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-8 w-52 pl-9 pr-3 rounded-md border border-outline-variant/60 text-sm bg-surface-container/20 hover:bg-white focus:bg-white focus:border-ds-secondary focus:ring-2 focus:ring-ds-secondary/20 focus:outline-none transition-all placeholder:text-on-surface-variant/40"
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

          {/* Filter */}
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="h-8 w-44 text-sm">
              <SelectValue placeholder="All clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All clients</SelectItem>
              <SelectItem value="outstanding">Outstanding balance</SelectItem>
              <SelectItem value="unread">Unread messages</SelectItem>
              <SelectItem value="no-projects">No active projects</SelectItem>
            </SelectContent>
          </Select>

          {isFiltering && (
            <span className="text-[12px] text-on-surface-variant/60">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
          )}
          {isFiltering && (
            <button
              onClick={() => { setSearch(''); setFilter('all') }}
              className="text-[12px] font-medium text-ds-secondary hover:underline"
            >
              Clear
            </button>
          )}

          {/* View toggle */}
          <div className="ml-auto flex items-center gap-0.5 bg-surface-container/60 p-0.5 rounded-md border border-outline-variant/25">
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
      <div className="px-8 py-7 pb-16">
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

      <AddClientModal open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}

/* ══ KPI CARD ════════════════════════════════════════════ */
function KpiCard({
  value, label, icon: Icon, bg, border, color, badge, badgeCls,
}: {
  value: string | number; label: string; icon: React.ElementType
  bg: string; border: string; color: string
  badge?: string; badgeCls?: string
}) {
  const isString = typeof value === 'string'
  return (
    <div className={cn('flex items-start justify-between px-4 py-4 rounded-xl border', bg, border)}>
      <div className="flex flex-col">
        <span className={cn(
          'font-extrabold text-on-surface tracking-tight leading-none',
          isString ? 'text-[20px]' : 'text-[30px]',
        )}>
          {value}
        </span>
        <span className={cn('text-[12px] font-semibold mt-2', color)}>{label}</span>
        {badge && (
          <span className={cn('inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-1.5 w-fit', badgeCls)}>
            {badge}
          </span>
        )}
      </div>
      <Icon className={cn('size-5 mt-0.5 shrink-0 opacity-30', color)} />
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
    <div className="rounded-xl border border-outline-variant/30 overflow-hidden bg-white shadow-sm">
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
      <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: accent }} />

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
          className="h-7 px-2.5 text-[12px] font-semibold text-ds-secondary bg-ds-secondary/8 hover:bg-ds-secondary/15 rounded-md flex items-center gap-1 transition-colors opacity-0 group-hover:opacity-100 whitespace-nowrap"
        >
          Open <ArrowRight className="size-3" />
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 opacity-0 group-hover:opacity-100 transition-opacity text-on-surface-variant/50 hover:text-on-surface hover:bg-surface-container"
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

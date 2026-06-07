'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDate, getInitials } from '@/lib/format'
import {
  TrendingUp, AlertTriangle, CheckCircle2, FileText,
  Search, Check, SlidersHorizontal, Banknote,
  ArrowUpRight, ArrowRight, User, Plus, ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

/* ── Types ───────────────────────────────────────── */
export type InvoiceRow = {
  id: string
  invoice_number: string
  total: number
  currency: string
  status: string
  due_date: string | null
  created_at: string
  clients: { id: string; name: string } | null
}

interface Props {
  invoices: InvoiceRow[]
  clients: { id: string; name: string }[]
  baseCurrency?: string
}

/* ── Config ──────────────────────────────────────── */
const STATUS_CFG: Record<string, { label: string; pill: string; dot: string; accent: string }> = {
  draft:   { label: 'Draft',   pill: 'bg-slate-100 text-slate-600',    dot: 'bg-slate-400',   accent: '#94a3b8' },
  sent:    { label: 'Sent',    pill: 'bg-blue-50 text-blue-700',       dot: 'bg-blue-500',    accent: '#3b82f6' },
  paid:    { label: 'Paid',    pill: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500', accent: '#10b981' },
  overdue: { label: 'Overdue', pill: 'bg-red-50 text-red-700',         dot: 'bg-red-500',     accent: '#ef4444' },
}

const ACCENTS = ['#0051d5','#7c3aed','#059669','#d97706','#dc2626','#0891b2','#9333ea','#16a34a']
function clientAccent(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0
  return ACCENTS[Math.abs(h) % ACCENTS.length]
}

const INV_COL = 'grid-cols-[minmax(0,1fr)_130px_120px_110px_100px_96px]'

/* ── Main component ──────────────────────────────── */
export function InvoicesView({ invoices, clients, baseCurrency = 'USD' }: Props) {
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [clientFilter, setClientFilter] = useState('all')
  const [pickerOpen, setPickerOpen]     = useState(false)

  /* Derived stats — sums are in base currency only to avoid mixing currencies */
  const baseInvoices     = invoices.filter(i => i.currency === baseCurrency)
  const totalOutstanding = baseInvoices.filter(i => i.status === 'sent').reduce((s, i) => s + Number(i.total), 0)
  const totalOverdue     = baseInvoices.filter(i => i.status === 'overdue').reduce((s, i) => s + Number(i.total), 0)
  const totalPaid        = baseInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.total), 0)
  const draftCount       = invoices.filter(i => i.status === 'draft').length
  const overdueCount     = invoices.filter(i => i.status === 'overdue').length
  const sentCount        = invoices.filter(i => i.status === 'sent').length
  const paidCount        = invoices.filter(i => i.status === 'paid').length

  /* Unique clients for filter (from invoices data) */
  const invoiceClients = useMemo(() => {
    const map = new Map<string, string>()
    for (const inv of invoices) {
      if (inv.clients) map.set(inv.clients.id, inv.clients.name)
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [invoices])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return invoices.filter(inv => {
      const matchSearch = !q
        || inv.invoice_number.toLowerCase().includes(q)
        || (inv.clients?.name ?? '').toLowerCase().includes(q)
      const matchStatus = statusFilter === 'all' || inv.status === statusFilter
      const matchClient = clientFilter === 'all' || inv.clients?.id === clientFilter
      return matchSearch && matchStatus && matchClient
    })
  }, [invoices, search, statusFilter, clientFilter])

  const isFiltering = search !== '' || statusFilter !== 'all' || clientFilter !== 'all'

  if (invoices.length === 0) return <EmptyInvoices clients={clients} />

  return (
    <div className="w-full min-h-screen" style={{ background: '#f4f6fa' }}>

      {/* ── Page header ─────────────────────────────── */}
      <div className="bg-white border-b border-outline-variant/30 px-4 sm:px-8 pt-7 pb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-on-surface tracking-tight">Invoices</h1>
        </div>
        <ClientPickerButton
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          clients={clients}
        />
      </div>

      <div className="px-4 sm:px-8 py-6 flex flex-col gap-6">

        {/* ── KPI cards ───────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            icon={TrendingUp} label="Outstanding" amount={formatCurrency(totalOutstanding, baseCurrency)}
            count={`${sentCount} invoice${sentCount !== 1 ? 's' : ''} sent`}
            iconBg="bg-ds-secondary/10" iconColor="text-ds-secondary"
            pulse={totalOutstanding > 0} pulseColor="bg-ds-secondary"
          />
          <MetricCard
            icon={AlertTriangle} label="Overdue" amount={formatCurrency(totalOverdue, baseCurrency)}
            count={`${overdueCount} past due date`}
            iconBg="bg-red-50" iconColor="text-red-600"
            pulse={totalOverdue > 0} pulseColor="bg-red-500" urgent={totalOverdue > 0}
          />
          <MetricCard
            icon={CheckCircle2} label="Collected" amount={formatCurrency(totalPaid, baseCurrency)}
            count={`${paidCount} invoice${paidCount !== 1 ? 's' : ''} paid`}
            iconBg="bg-emerald-50" iconColor="text-emerald-600"
          />
          <MetricCard
            icon={FileText} label="Drafts" amount={String(draftCount)}
            count={`${draftCount} draft${draftCount !== 1 ? 's' : ''}`}
            iconBg="bg-slate-100" iconColor="text-slate-500" plain
          />
        </div>

        {/* ── Search + filter bar ──────────────────────── */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-on-surface-variant/40 pointer-events-none" />
            <input
              type="text"
              placeholder="Search invoices or clients…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-9 w-full pl-9 pr-3 rounded-lg border border-outline-variant/60 text-sm bg-white focus:border-ds-secondary focus:ring-2 focus:ring-ds-secondary/20 focus:outline-none transition-all placeholder:text-on-surface-variant/40"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 rounded-full bg-on-surface-variant/20 hover:bg-on-surface-variant/35 flex items-center justify-center transition-colors">
                <span className="text-[9px] font-bold text-on-surface-variant leading-none">✕</span>
              </button>
            )}
          </div>
          <InvoiceFilterButton
            statusFilter={statusFilter} onStatusChange={setStatusFilter}
            clientFilter={clientFilter} onClientChange={setClientFilter}
            clients={invoiceClients}
          />
          {isFiltering && (
            <button onClick={() => { setSearch(''); setStatusFilter('all'); setClientFilter('all') }}
              className="text-[12px] font-medium text-ds-secondary hover:underline whitespace-nowrap">
              Clear
            </button>
          )}
        </div>

        {/* ── Table ────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-outline-variant/20 shadow-sm p-10 flex flex-col items-center text-center gap-2">
            <p className="text-sm font-semibold text-on-surface">No invoices match your filters</p>
            <button onClick={() => { setSearch(''); setStatusFilter('all'); setClientFilter('all') }}
              className="text-xs font-semibold text-ds-secondary hover:underline">Clear filters</button>
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="min-w-175 rounded-xl border border-outline-variant/20 overflow-hidden bg-white shadow-sm">
              {/* Header */}
              <div className={cn('grid px-5 py-2.5 bg-surface-container/50 border-b border-outline-variant/15', INV_COL)}>
                {['Invoice', 'Client', 'Status', 'Amount', 'Due Date', ''].map((h, i) => (
                  <p key={i} className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{h}</p>
                ))}
              </div>

              {/* Rows */}
              <div className="divide-y divide-outline-variant/10">
                {filtered.map(inv => {
                  const cfg       = STATUS_CFG[inv.status] ?? STATUS_CFG.draft
                  const client    = inv.clients
                  const accent    = client ? clientAccent(client.name) : '#94a3b8'
                  const isOverdue = inv.status === 'overdue'
                  const isPaid    = inv.status === 'paid'
                  const href      = client ? `/dashboard/clients/${client.id}/invoices` : '#'

                  return (
                    <div key={inv.id} className={cn(
                      'relative grid items-center px-5 py-3.5 group transition-colors',
                      INV_COL,
                      isOverdue ? 'bg-red-50/30 hover:bg-red-50/60' : 'hover:bg-surface-container/15',
                    )}>
                      <div className="absolute left-0 top-0 bottom-0 w-0.75" style={{ background: cfg.accent }} />

                      {/* Invoice # */}
                      <div className="min-w-0 pr-3">
                        <p className="text-sm font-bold text-on-surface truncate">{inv.invoice_number}</p>
                        <p className="text-[10px] text-on-surface-variant/40 mt-0.5">{formatDate(inv.created_at)}</p>
                      </div>

                      {/* Client */}
                      <div className="min-w-0 pr-3">
                        {client ? (
                          <Link href={`/dashboard/clients/${client.id}`}
                            className="flex items-center gap-2 hover:text-ds-secondary transition-colors">
                            <div
                              className="size-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                              style={{ background: accent }}
                            >
                              {getInitials(client.name)}
                            </div>
                            <span className="text-xs font-medium text-on-surface truncate">{client.name}</span>
                          </Link>
                        ) : (
                          <span className="text-xs text-on-surface-variant/40">—</span>
                        )}
                      </div>

                      {/* Status */}
                      <span className={cn('w-fit inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full', cfg.pill)}>
                        <span className={cn('size-1 rounded-full shrink-0', cfg.dot)} />
                        {cfg.label}
                      </span>

                      {/* Amount */}
                      <span className={cn(
                        'text-sm font-bold tabular-nums',
                        isPaid ? 'text-emerald-600' : isOverdue ? 'text-red-700' : 'text-on-surface',
                      )}>
                        {formatCurrency(Number(inv.total), inv.currency)}
                      </span>

                      {/* Due date */}
                      <p className={cn('text-[12px]', isOverdue ? 'text-red-500 font-medium' : 'text-on-surface-variant')}>
                        {inv.due_date ? formatDate(inv.due_date) : '—'}
                      </p>

                      {/* View link */}
                      <div className="flex items-center justify-end">
                        <Link href={href}
                          className="h-7 px-2.5 rounded-lg text-xs font-medium text-ds-secondary opacity-0 group-hover:opacity-100 transition-opacity hover:bg-ds-secondary/8 flex items-center gap-1">
                          View <ArrowRight className="size-3" />
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Create Invoice — client picker button ───────── */
function ClientPickerButton({
  open, onOpenChange, clients,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  clients: { id: string; name: string }[]
}) {
  const ref    = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [search, setSearch] = useState('')

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOpenChange(false)
        setSearch('')
      }
    }
    if (open) document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open, onOpenChange])

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  function pick(clientId: string) {
    onOpenChange(false)
    setSearch('')
    router.push(`/dashboard/clients/${clientId}/invoices`)
  }

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => onOpenChange(!open)}
        className={cn(
          'flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-semibold transition-colors',
          open
            ? 'bg-ds-secondary/10 text-ds-secondary'
            : 'bg-ds-secondary text-white hover:bg-ds-secondary-container shadow-sm',
        )}
      >
        <Plus className="size-4" />
        New Invoice
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl border border-outline-variant/20 shadow-xl z-50 overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">
              Select a client
            </p>
            <p className="text-[11px] text-on-surface-variant/55 mt-0.5">You'll create the invoice on their page</p>
          </div>

          {clients.length > 5 && (
            <div className="px-3 pb-2">
              <input
                type="text"
                placeholder="Search clients…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-8 px-3 rounded-lg border border-outline-variant/50 text-sm focus:outline-none focus:border-ds-secondary placeholder:text-on-surface-variant/40"
                autoFocus
              />
            </div>
          )}

          <div className="pb-2 max-h-60 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-xs text-on-surface-variant/50 px-4 py-3 text-center">No clients found</p>
            ) : (
              filtered.map(c => {
                const accent = clientAccent(c.name)
                return (
                  <button
                    key={c.id}
                    onClick={() => pick(c.id)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-container/60 transition-colors text-left"
                  >
                    <div
                      className="size-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                      style={{ background: accent }}
                    >
                      {getInitials(c.name)}
                    </div>
                    <span className="flex-1 text-sm font-medium text-on-surface truncate">{c.name}</span>
                    <ChevronRight className="size-3.5 text-on-surface-variant/30 shrink-0" />
                  </button>
                )
              })
            )}
          </div>

          {clients.length === 0 && (
            <div className="px-4 py-4 text-center">
              <p className="text-xs text-on-surface-variant/55 mb-3">No clients yet. Add a client first.</p>
              <Link href="/dashboard/clients"
                onClick={() => onOpenChange(false)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-ds-secondary hover:underline">
                Go to Clients <ArrowRight className="size-3" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Metric card ─────────────────────────────────── */
function MetricCard({ icon: Icon, label, amount, count, iconBg, iconColor, pulse, pulseColor, urgent, plain }: {
  icon: React.ElementType; label: string; amount: string; count: string
  iconBg: string; iconColor: string; pulse?: boolean; pulseColor?: string; urgent?: boolean; plain?: boolean
}) {
  return (
    <div className={cn('bg-white rounded-xl border shadow-sm p-4 flex flex-col gap-3', urgent ? 'border-red-100' : 'border-outline-variant/20')}>
      <div className="flex items-center justify-between">
        <div className={cn('size-9 rounded-lg flex items-center justify-center shrink-0', iconBg)}>
          <Icon className={cn('size-4', iconColor)} />
        </div>
        {pulse && pulseColor && (
          <span className={cn('size-2 rounded-full', pulseColor, urgent ? 'animate-pulse' : '')} />
        )}
      </div>
      <div>
        <p className={cn('font-extrabold text-on-surface tracking-tight leading-none', plain ? 'text-[28px]' : 'text-[22px]')}>
          {amount}
        </p>
        <p className="text-[13px] font-semibold text-on-surface mt-1.5">{label}</p>
        <p className="text-[11px] text-on-surface-variant/55 mt-0.5">{count}</p>
      </div>
    </div>
  )
}

/* ── Filter button ───────────────────────────────── */
function InvoiceFilterButton({ statusFilter, onStatusChange, clientFilter, onClientChange, clients }: {
  statusFilter: string; onStatusChange: (s: string) => void
  clientFilter: string; onClientChange: (c: string) => void
  clients: { id: string; name: string }[]
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isFiltered = statusFilter !== 'all' || clientFilter !== 'all'

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const STATUS_OPTIONS = [
    { value: 'all',     label: 'All statuses', dot: null      },
    { value: 'draft',   label: 'Draft',        dot: '#94a3b8' },
    { value: 'sent',    label: 'Sent',         dot: '#3b82f6' },
    { value: 'overdue', label: 'Overdue',      dot: '#ef4444' },
    { value: 'paid',    label: 'Paid',         dot: '#10b981' },
  ]

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen(p => !p)}
        className={cn(
          'h-9 px-2.5 rounded-lg border transition-all flex items-center gap-1.5',
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
          <div className="px-4 pt-3.5 pb-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Status</p>
          </div>
          <div className="px-2 pb-2">
            {STATUS_OPTIONS.map(opt => (
              <button key={opt.value}
                onClick={() => onStatusChange(opt.value)}
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

          {clients.length > 0 && (
            <>
              <div className="h-px bg-outline-variant/15 mx-4" />
              <div className="px-4 pt-3 pb-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Client</p>
              </div>
              <div className="px-2 pb-3 max-h-44 overflow-y-auto">
                <button
                  onClick={() => onClientChange('all')}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-colors',
                    clientFilter === 'all' ? 'bg-ds-secondary text-white font-semibold' : 'text-on-surface hover:bg-surface-container/60',
                  )}>
                  <span className="size-2 rounded-full shrink-0 bg-outline-variant/30" />
                  <span className="flex-1">All clients</span>
                  {clientFilter === 'all' && <Check className="size-3.5 shrink-0" />}
                </button>
                {clients.map(c => (
                  <button key={c.id}
                    onClick={() => onClientChange(c.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-colors',
                      clientFilter === c.id ? 'bg-ds-secondary text-white font-semibold' : 'text-on-surface hover:bg-surface-container/60',
                    )}>
                    <User className="size-3 shrink-0 opacity-50" />
                    <span className="flex-1 truncate">{c.name}</span>
                    {clientFilter === c.id && <Check className="size-3.5 shrink-0" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Empty state ─────────────────────────────────── */
function EmptyInvoices({ clients }: { clients: { id: string; name: string }[] }) {
  const [pickerOpen, setPickerOpen] = useState(false)

  return (
    <div className="w-full min-h-screen" style={{ background: '#f4f6fa' }}>
      <div className="bg-white border-b border-outline-variant/30 px-4 sm:px-8 pt-7 pb-6 flex items-center justify-between gap-4">
        <h1 className="text-[22px] font-bold text-on-surface tracking-tight">Invoices</h1>
        <ClientPickerButton open={pickerOpen} onOpenChange={setPickerOpen} clients={clients} />
      </div>

      <div className="flex flex-col items-center justify-center min-h-[58vh] text-center px-6">
        <div className="relative mb-8">
          <div className="size-24 rounded-3xl bg-emerald-50 flex items-center justify-center shadow-sm">
            <Banknote className="size-11 text-emerald-500/70" strokeWidth={1.5} />
          </div>
          <div className="absolute -top-1.5 -right-1.5 size-6 rounded-full bg-ds-secondary/15 flex items-center justify-center">
            <ArrowUpRight className="size-3 text-ds-secondary" />
          </div>
          <div className="absolute -bottom-1 -left-3 size-4 rounded-full bg-emerald-200/80" />
          <div className="absolute top-3 -left-4 size-2.5 rounded-full bg-ds-secondary/20" />
        </div>

        <h2 className="text-[22px] font-bold text-on-surface tracking-tight">No invoices yet</h2>
        <p className="text-sm text-on-surface-variant mt-2.5 max-w-sm leading-relaxed">
          Create and send invoices to your clients — they can pay securely online. Payments go straight to your Stripe account.
        </p>

        <div className="flex items-center gap-3 mt-7">
          {clients.length > 0 ? (
            <ClientPickerButton open={pickerOpen} onOpenChange={setPickerOpen} clients={clients} />
          ) : (
            <Link
              href="/dashboard/clients"
              className="inline-flex items-center gap-1.5 h-10 px-6 rounded-lg bg-ds-secondary text-white text-sm font-semibold hover:bg-ds-secondary-container transition-colors shadow-sm"
            >
              Add a Client First
            </Link>
          )}
        </div>

        <p className="mt-8 text-[11px] text-on-surface-variant/50 max-w-xs">
          Clients can pay invoices directly from their portal — no Stripe account needed on their end.
        </p>
      </div>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCurrency, formatDate, getInitials } from '@/lib/format'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import {
  TrendingUp, AlertTriangle, CheckCircle2, FileText,
  ArrowRight, Banknote, ArrowUpRight,
} from 'lucide-react'

export const revalidate = 0

/* ── Status config ─────────────────────────────────────── */
const STATUS_CFG = {
  draft:   { label: 'Draft',   pill: 'bg-slate-100 text-slate-600',          dot: 'bg-slate-400',   accent: '#94a3b8' },
  sent:    { label: 'Sent',    pill: 'bg-blue-50 text-blue-700',              dot: 'bg-blue-500',    accent: '#3b82f6' },
  paid:    { label: 'Paid',    pill: 'bg-emerald-50 text-emerald-700',        dot: 'bg-emerald-500', accent: '#10b981' },
  overdue: { label: 'Overdue', pill: 'bg-red-50 text-red-700',                dot: 'bg-red-500',     accent: '#ef4444' },
}

/* ── Client accent colour (deterministic by name) ──────── */
const ACCENTS = ['#0051d5','#7c3aed','#059669','#d97706','#dc2626','#0891b2','#9333ea','#16a34a']
function clientAccent(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0
  return ACCENTS[Math.abs(h) % ACCENTS.length]
}

/* ── Group ordering ─────────────────────────────────────── */
const GROUPS = [
  { key: 'overdue', label: 'Overdue',           headerCls: 'text-red-600'     },
  { key: 'sent',    label: 'Awaiting Payment',  headerCls: 'text-blue-600'    },
  { key: 'draft',   label: 'Drafts',            headerCls: 'text-on-surface-variant' },
  { key: 'paid',    label: 'Paid',              headerCls: 'text-emerald-600' },
] as const

export default async function InvoicesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, clients ( id, name )')
    .eq('freelancer_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const list = invoices ?? []

  const totalOutstanding = list.filter(i => i.status === 'sent').reduce((s, i) => s + Number(i.total), 0)
  const totalOverdue     = list.filter(i => i.status === 'overdue').reduce((s, i) => s + Number(i.total), 0)
  const totalPaid        = list.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.total), 0)
  const totalDraft       = list.filter(i => i.status === 'draft').reduce((s, i) => s + Number(i.total), 0)

  const sentCount    = list.filter(i => i.status === 'sent').length
  const overdueCount = list.filter(i => i.status === 'overdue').length
  const paidCount    = list.filter(i => i.status === 'paid').length
  const draftCount   = list.filter(i => i.status === 'draft').length

  const groups = GROUPS
    .map(g => ({ ...g, items: list.filter(i => i.status === g.key) }))
    .filter(g => g.items.length > 0)

  return (
    <div className="w-full min-h-screen" style={{ background: '#f4f6fa' }}>

      {/* ── Page header ─────────────────────────────── */}
      <div className="bg-white border-b border-outline-variant/30 px-8 pt-7 pb-6">
        <h1 className="text-[22px] font-bold text-on-surface tracking-tight">Invoices</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">
          {list.length > 0
            ? `${list.length} total · ${paidCount} paid · ${formatCurrency(totalPaid)} collected`
            : 'Create and send invoices to clients'}
        </p>
      </div>

      {/* ── Content ─────────────────────────────────── */}
      <div className="px-8 py-8 pb-14 flex flex-col gap-8">
        {list.length === 0 ? (
          <EmptyInvoices />
        ) : (
          <>
            {/* ── 4 Metric cards ──────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <MetricCard
                icon={TrendingUp}
                label="Outstanding"
                amount={formatCurrency(totalOutstanding)}
                count={`${sentCount} invoice${sentCount !== 1 ? 's' : ''} sent`}
                iconBg="bg-ds-secondary/10"
                iconColor="text-ds-secondary"
                pulse={totalOutstanding > 0}
                pulseColor="bg-ds-secondary"
              />
              <MetricCard
                icon={AlertTriangle}
                label="Overdue"
                amount={formatCurrency(totalOverdue)}
                count={`${overdueCount} past due date`}
                iconBg="bg-red-50"
                iconColor="text-red-600"
                pulse={totalOverdue > 0}
                pulseColor="bg-red-500"
                urgent={totalOverdue > 0}
              />
              <MetricCard
                icon={CheckCircle2}
                label="Collected"
                amount={formatCurrency(totalPaid)}
                count={`${paidCount} invoice${paidCount !== 1 ? 's' : ''} paid`}
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
              />
              <MetricCard
                icon={FileText}
                label="Drafts"
                amount={formatCurrency(totalDraft)}
                count={`${draftCount} draft${draftCount !== 1 ? 's' : ''}`}
                iconBg="bg-slate-100"
                iconColor="text-slate-500"
              />
            </div>

            {/* ── Grouped invoice list ─────────────── */}
            {groups.map(group => (
              <section key={group.key}>
                {/* Group header */}
                <div className="flex items-center gap-3 mb-4">
                  <span className={cn('text-[11px] font-bold uppercase tracking-widest whitespace-nowrap', group.headerCls)}>
                    {group.label}
                  </span>
                  <span className="text-[11px] font-semibold bg-white border border-outline-variant/30 text-on-surface-variant/50 px-2 py-0.5 rounded-full">
                    {group.items.length}
                  </span>
                  <div className="flex-1 h-px bg-outline-variant/25" />
                </div>

                {/* Invoice rows */}
                <div className="bg-white rounded-xl border border-black/6 shadow-sm overflow-hidden divide-y divide-outline-variant/15">
                  {group.items.map(inv => {
                    const cfg      = STATUS_CFG[inv.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.draft
                    const client   = inv.clients as { id: string; name: string } | null
                    const accent   = client ? clientAccent(client.name) : '#94a3b8'
                    const invNum   = (inv as Record<string, unknown>).invoice_number as string
                      ?? `INV-${inv.id.slice(0, 6).toUpperCase()}`
                    const isOverdue = inv.status === 'overdue'
                    const isPaid    = inv.status === 'paid'
                    const href      = client ? `/dashboard/clients/${client.id}/invoices` : '#'

                    return (
                      <Link
                        key={inv.id}
                        href={href}
                        className={cn(
                          'relative flex items-center gap-4 px-5 py-3.5 group transition-colors',
                          isOverdue ? 'bg-red-50/40 hover:bg-red-50/70' : 'hover:bg-surface-container/20',
                        )}
                      >
                        {/* Status left accent strip */}
                        <div
                          className="absolute left-0 top-0 bottom-0 w-[3px]"
                          style={{ background: cfg.accent }}
                        />

                        {/* Client avatar */}
                        <div
                          className="size-9 rounded-lg flex items-center justify-center text-white text-[11px] font-bold shrink-0 select-none"
                          style={{ background: accent }}
                        >
                          {client ? getInitials(client.name) : '?'}
                        </div>

                        {/* Client name + invoice # */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-on-surface truncate leading-tight">
                            {client?.name ?? 'No client'}
                          </p>
                          <p className="text-[11px] text-on-surface-variant/55 mt-0.5">{invNum}</p>
                        </div>

                        {/* Due date */}
                        <div className="hidden sm:block w-28 shrink-0">
                          {inv.due_date ? (
                            <p className={cn(
                              'text-[12px] font-medium',
                              isOverdue ? 'text-red-600 font-semibold' : 'text-on-surface-variant',
                            )}>
                              {formatDate(inv.due_date)}
                            </p>
                          ) : (
                            <p className="text-[12px] text-on-surface-variant/35">—</p>
                          )}
                        </div>

                        {/* Amount */}
                        <div className="w-24 text-right shrink-0">
                          <p className={cn(
                            'text-sm font-bold tabular-nums',
                            isPaid    ? 'text-emerald-600' :
                            isOverdue ? 'text-red-700'     : 'text-on-surface',
                          )}>
                            {formatCurrency(Number(inv.total))}
                          </p>
                        </div>

                        {/* Status pill */}
                        <div className="hidden md:flex w-20 justify-end shrink-0">
                          <span className={cn(
                            'inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full',
                            cfg.pill,
                          )}>
                            <span className={cn('size-1.5 rounded-full', cfg.dot)} />
                            {cfg.label}
                          </span>
                        </div>

                        {/* Hover arrow */}
                        <ArrowRight className="size-4 text-on-surface-variant/25 opacity-0 group-hover:opacity-100 group-hover:text-ds-secondary transition-all shrink-0" />
                      </Link>
                    )
                  })}
                </div>
              </section>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

/* ── Metric card ────────────────────────────────────────── */
function MetricCard({
  icon: Icon, label, amount, count,
  iconBg, iconColor, pulse, pulseColor, urgent,
}: {
  icon: React.ElementType
  label: string
  amount: string
  count: string
  iconBg: string
  iconColor: string
  pulse?: boolean
  pulseColor?: string
  urgent?: boolean
}) {
  return (
    <div className={cn(
      'bg-white rounded-xl border shadow-sm p-4 flex flex-col gap-3',
      urgent ? 'border-red-100' : 'border-black/6',
    )}>
      <div className="flex items-center justify-between">
        <div className={cn('size-9 rounded-lg flex items-center justify-center shrink-0', iconBg)}>
          <Icon className={cn('size-4', iconColor)} />
        </div>
        {pulse && pulseColor && (
          <span className={cn('size-2 rounded-full', pulseColor, urgent ? 'animate-pulse' : '')} />
        )}
      </div>
      <div>
        <p className="text-[22px] font-extrabold text-on-surface tracking-tight leading-none">{amount}</p>
        <p className="text-[13px] font-semibold text-on-surface mt-1.5">{label}</p>
        <p className="text-[11px] text-on-surface-variant/55 mt-0.5">{count}</p>
      </div>
    </div>
  )
}

/* ── Empty state ────────────────────────────────────────── */
function EmptyInvoices() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[58vh] text-center px-6">
      <div className="relative mb-8">
        <div className="size-28 rounded-3xl bg-emerald-50 flex items-center justify-center">
          <div className="size-18 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <Banknote className="size-10 text-emerald-600/70" strokeWidth={1.5} />
          </div>
        </div>
        <div className="absolute -top-1.5 -right-1.5 size-6 rounded-full bg-ds-secondary/15 flex items-center justify-center">
          <ArrowUpRight className="size-3 text-ds-secondary" />
        </div>
        <div className="absolute -bottom-1 -left-3 size-4 rounded-full bg-emerald-200" />
        <div className="absolute top-3 -left-4 size-2.5 rounded-full bg-ds-secondary/20" />
      </div>

      <h2 className="text-2xl font-bold text-on-surface tracking-tight max-w-xs">No invoices yet</h2>
      <p className="text-base text-on-surface-variant mt-3 max-w-sm leading-relaxed">
        Create invoices inside a client portal and let your clients pay securely online via Stripe.
      </p>

      <div className="flex items-center gap-3 mt-8">
        <Link
          href="/dashboard/clients"
          className="inline-flex items-center justify-center h-10 px-6 rounded-md bg-ds-secondary text-white text-sm font-semibold hover:bg-ds-secondary-container transition-colors shadow-sm shadow-ds-secondary/20"
        >
          Go to Clients
        </Link>
        <a
          href="https://docs.portalkit.io"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center h-10 px-6 rounded-md border border-outline-variant text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors"
        >
          Learn More
        </a>
      </div>

      <p className="mt-10 text-xs text-on-surface-variant/60 max-w-xs">
        Tip: Clients can pay invoices directly from their portal — no Stripe account needed on their end.
      </p>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import {
  FileText, ExternalLink, TrendingUp, AlertTriangle,
  CheckCircle2, Clock, Banknote, ArrowUpRight,
} from 'lucide-react'

export const revalidate = 0

const STATUS_CONFIG = {
  draft:   { label: 'Draft',   cls: 'bg-surface-container text-on-surface-variant',       icon: Clock,          dot: 'bg-slate-400' },
  sent:    { label: 'Sent',    cls: 'bg-blue-50 text-blue-700',                           icon: TrendingUp,     dot: 'bg-blue-500'  },
  paid:    { label: 'Paid',    cls: 'bg-emerald-50 text-emerald-700',                     icon: CheckCircle2,   dot: 'bg-emerald-500'},
  overdue: { label: 'Overdue', cls: 'bg-red-50 text-red-700',                             icon: AlertTriangle,  dot: 'bg-red-500'   },
}

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

  const list             = invoices ?? []
  const totalOutstanding = list.filter(i => i.status === 'sent').reduce((s, i) => s + Number(i.total), 0)
  const totalOverdue     = list.filter(i => i.status === 'overdue').reduce((s, i) => s + Number(i.total), 0)
  const totalPaid        = list.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.total), 0)
  const sentCount        = list.filter(i => i.status === 'sent').length
  const overdueCount     = list.filter(i => i.status === 'overdue').length
  const paidCount        = list.filter(i => i.status === 'paid').length

  return (
    <div className="w-full min-h-screen">
      {/* ── Page header ─────────────────────────────── */}
      <div className="px-8 pt-8 pb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-on-surface tracking-tight">Invoices</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            {list.length > 0 ? `${list.length} total · ${paidCount} paid` : 'Create and send invoices to clients'}
          </p>
        </div>
      </div>

      <div className="px-8 pb-12 flex flex-col gap-6">
        {list.length === 0 ? (
          <EmptyInvoices />
        ) : (
          <>
            {/* ── Summary metrics ─────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <MetricCard
                label="Outstanding"
                value={formatCurrency(totalOutstanding)}
                sub={`${sentCount} invoice${sentCount !== 1 ? 's' : ''} sent`}
                icon={TrendingUp}
                highlight={totalOutstanding > 0}
                highlightClass="bg-ds-secondary text-white"
              />
              <MetricCard
                label="Overdue"
                value={formatCurrency(totalOverdue)}
                sub={`${overdueCount} past due date`}
                icon={AlertTriangle}
                highlight={totalOverdue > 0}
                highlightClass="bg-red-600 text-white"
              />
              <MetricCard
                label="Collected"
                value={formatCurrency(totalPaid)}
                sub={`${paidCount} invoice${paidCount !== 1 ? 's' : ''} paid`}
                icon={CheckCircle2}
                highlight={false}
                highlightClass=""
              />
            </div>

            {/* ── Invoice list ────────────────────────── */}
            <div className="bg-white rounded-md shadow-sm overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_160px_130px_110px_72px] gap-4 px-5 py-3 bg-surface-container/50">
                <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Invoice</p>
                <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Client</p>
                <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Due</p>
                <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider text-right">Amount</p>
                <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider text-right">Status</p>
              </div>

              <div className="divide-y divide-outline-variant/30">
                {list.map(inv => {
                  const cfg = STATUS_CONFIG[inv.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.draft
                  const StatusIcon = cfg.icon
                  const client = inv.clients as { id: string; name: string } | null
                  const invNum = (inv as Record<string, unknown>).invoice_number as string
                    ?? `INV-${inv.id.slice(0, 6).toUpperCase()}`
                  const isOverdue = inv.status === 'overdue'
                  const isPaid    = inv.status === 'paid'

                  return (
                    <div
                      key={inv.id}
                      className={cn(
                        'relative grid grid-cols-[1fr_160px_130px_110px_72px] gap-4 items-center pl-5 pr-5 py-4 transition-colors group',
                        isOverdue ? 'bg-red-50/40 hover:bg-red-50/70' : 'hover:bg-surface-container/30'
                      )}
                    >
                      {/* Status left border accent */}
                      <div className={cn(
                        'absolute left-0 top-0 bottom-0 w-0.75',
                        isOverdue ? 'bg-red-500' : isPaid ? 'bg-emerald-500' : 'bg-transparent'
                      )} />

                      {/* Invoice # */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn('size-2 rounded-full shrink-0', cfg.dot)} />
                        <p className="text-sm font-semibold text-on-surface">{invNum}</p>
                      </div>

                      {/* Client */}
                      <p className="text-sm text-on-surface-variant truncate">{client?.name ?? '—'}</p>

                      {/* Due date */}
                      <p className={cn('text-sm', isOverdue ? 'text-red-600 font-semibold' : 'text-on-surface-variant')}>
                        {inv.due_date ? formatDate(inv.due_date) : '—'}
                      </p>

                      {/* Amount */}
                      <p className={cn('text-sm font-bold text-right tabular-nums', isPaid ? 'text-emerald-600' : isOverdue ? 'text-red-700' : 'text-on-surface')}>
                        {formatCurrency(Number(inv.total))}
                      </p>

                      {/* Status + action */}
                      <div className="flex items-center justify-end gap-2">
                        <span className={cn('inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full', cfg.cls)}>
                          <StatusIcon className="size-2.5" />
                          {cfg.label}
                        </span>
                        {client && (
                          <Link href={`/dashboard/clients/${client.id}/invoices`} className="opacity-0 group-hover:opacity-100 transition-opacity text-on-surface-variant hover:text-ds-secondary">
                            <ExternalLink className="size-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function MetricCard({ label, value, sub, icon: Icon, highlight, highlightClass }: {
  label: string; value: string; sub: string
  icon: React.ElementType; highlight: boolean; highlightClass: string
}) {
  return (
    <div className={cn('rounded-md p-5 relative overflow-hidden', highlight ? highlightClass : 'bg-white shadow-sm')}>
      {highlight && (
        <>
          <div className="absolute -right-6 -top-6 size-28 rounded-full bg-white/6" />
          <div className="absolute -right-2 bottom-0 size-16 rounded-full bg-white/4" />
        </>
      )}
      <div className={cn('size-8 rounded-md flex items-center justify-center mb-3 relative', highlight ? 'bg-white/15' : 'bg-surface-container')}>
        <Icon className={cn('size-4', highlight ? 'text-white' : 'text-on-surface-variant')} />
      </div>
      <p className={cn('text-2xl font-extrabold tracking-tight relative', highlight ? 'text-white' : 'text-on-surface')}>{value}</p>
      <p className={cn('text-sm font-semibold mt-1 relative', highlight ? 'text-white/80' : 'text-on-surface')}>{label}</p>
      <p className={cn('text-xs mt-0.5 relative', highlight ? 'text-white/55' : 'text-on-surface-variant')}>{sub}</p>
    </div>
  )
}

function EmptyInvoices() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[58vh] text-center px-6">
      {/* Layered illustration */}
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

      <h2 className="text-2xl font-bold text-on-surface tracking-tight max-w-xs">
        No invoices yet
      </h2>
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

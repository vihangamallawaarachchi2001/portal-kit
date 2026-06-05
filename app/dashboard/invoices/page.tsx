import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { FileText, ExternalLink, TrendingUp, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'

export const revalidate = 0

const STATUS_CONFIG = {
  draft:   { label: 'Draft',   class: 'bg-surface-container text-on-surface-variant',        icon: Clock         },
  sent:    { label: 'Sent',    class: 'bg-blue-50 text-blue-700 border border-blue-100',     icon: TrendingUp    },
  paid:    { label: 'Paid',    class: 'bg-green-50 text-green-700 border border-green-100',  icon: CheckCircle2  },
  overdue: { label: 'Overdue', class: 'bg-red-50 text-red-700 border border-red-100',        icon: AlertTriangle },
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

  const list = invoices ?? []
  const totalOutstanding = list.filter(i => i.status === 'sent').reduce((s, i) => s + Number(i.total), 0)
  const totalOverdue     = list.filter(i => i.status === 'overdue').reduce((s, i) => s + Number(i.total), 0)
  const totalPaid        = list.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.total), 0)

  return (
    <div className="w-full">
      {/* Page hero */}
      <div className="px-8 pt-8 pb-6 border-b border-outline-variant/50 bg-white">
        <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-1">Invoices</p>
        <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">All Invoices</h1>
        <p className="text-sm text-on-surface-variant mt-1">Track and manage invoices across all clients.</p>
      </div>

      <div className="p-8 flex flex-col gap-6">
        {/* Summary cards */}
        {list.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <SummaryCard
              label="Outstanding" value={formatCurrency(totalOutstanding)}
              sub={`${list.filter(i => i.status === 'sent').length} sent`}
              colored={totalOutstanding > 0} coloredClass="bg-ds-secondary text-white"
            />
            <SummaryCard
              label="Overdue" value={formatCurrency(totalOverdue)}
              sub={`${list.filter(i => i.status === 'overdue').length} overdue`}
              colored={totalOverdue > 0} coloredClass="bg-red-600 text-white"
            />
            <SummaryCard
              label="Collected" value={formatCurrency(totalPaid)}
              sub={`${list.filter(i => i.status === 'paid').length} paid`}
              colored={false} coloredClass=""
            />
          </div>
        )}

        {/* Invoice table */}
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center bg-white rounded-2xl border border-outline-variant">
            <div className="size-14 rounded-2xl bg-surface-container flex items-center justify-center">
              <FileText className="size-6 text-on-surface-variant" />
            </div>
            <div>
              <p className="text-base font-semibold text-on-surface">No invoices yet</p>
              <p className="text-sm text-on-surface-variant mt-1 max-w-sm">Go to a client portal to create and send invoices.</p>
            </div>
            <Link href="/dashboard/clients" className="h-9 px-5 rounded-xl bg-ds-secondary text-white text-sm font-semibold hover:bg-ds-secondary-container transition-colors">
              Go to Clients
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-outline-variant overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_140px_110px_100px_80px] gap-4 px-5 py-3 border-b border-outline-variant bg-surface-container/50">
              {['Invoice / Client', 'Due Date', 'Amount', 'Status', ''].map(h => (
                <p key={h} className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider last:text-right">{h}</p>
              ))}
            </div>
            {/* Rows */}
            <div className="divide-y divide-outline-variant/60">
              {list.map(inv => {
                const cfg = STATUS_CONFIG[inv.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.draft
                const StatusIcon = cfg.icon
                const client = inv.clients as { id: string; name: string } | null
                return (
                  <div key={inv.id} className="grid grid-cols-[1fr_140px_110px_100px_80px] gap-4 items-center px-5 py-3.5 hover:bg-surface-container/40 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-on-surface">
                        {(inv as Record<string, unknown>).invoice_number as string ?? `INV-${inv.id.slice(0, 6).toUpperCase()}`}
                      </p>
                      <p className="text-xs text-on-surface-variant truncate mt-0.5">{client?.name ?? '—'}</p>
                    </div>
                    <p className="text-sm text-on-surface-variant">{inv.due_date ? formatDate(inv.due_date) : '—'}</p>
                    <p className="text-sm font-bold text-on-surface text-right">{formatCurrency(Number(inv.total))}</p>
                    <div className="flex justify-center">
                      <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full', cfg.class)}>
                        <StatusIcon className="size-3" />{cfg.label}
                      </span>
                    </div>
                    <div className="flex justify-end">
                      {client && (
                        <Link href={`/dashboard/clients/${client.id}/invoices`} className="flex items-center gap-1 text-xs font-semibold text-ds-secondary hover:text-ds-secondary-container transition-colors">
                          View <ExternalLink className="size-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryCard({ label, value, sub, colored, coloredClass }: {
  label: string; value: string; sub: string; colored: boolean; coloredClass: string
}) {
  return (
    <div className={cn('rounded-2xl p-5 relative overflow-hidden', colored ? coloredClass : 'bg-white border border-outline-variant')}>
      {colored && (
        <>
          <div className="absolute -right-4 -top-4 size-24 rounded-full bg-white/6" />
          <div className="absolute right-2 bottom-2 size-14 rounded-full bg-white/4" />
        </>
      )}
      <p className={cn('text-2xl font-extrabold tracking-tight relative', colored ? 'text-white' : 'text-on-surface')}>{value}</p>
      <p className={cn('text-sm font-semibold mt-1 relative', colored ? 'text-white/80' : 'text-on-surface')}>{label}</p>
      <p className={cn('text-xs mt-0.5 relative', colored ? 'text-white/55' : 'text-on-surface-variant')}>{sub}</p>
    </div>
  )
}

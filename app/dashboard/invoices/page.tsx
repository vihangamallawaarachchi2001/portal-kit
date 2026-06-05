import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { FileText, ExternalLink } from 'lucide-react'

export const revalidate = 0

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  draft:   { label: 'Draft',   className: 'bg-surface-container text-on-surface-variant' },
  sent:    { label: 'Sent',    className: 'bg-blue-50 text-blue-600' },
  paid:    { label: 'Paid',    className: 'bg-green-50 text-green-700' },
  overdue: { label: 'Overdue', className: 'bg-red-50 text-red-600' },
}

export default async function InvoicesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, clients(id, name)')
    .eq('freelancer_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const outstanding = (invoices ?? [])
    .filter(i => i.status === 'sent' || i.status === 'overdue')
    .reduce((s, i) => s + Number(i.total), 0)

  return (
    <div className="p-8 flex flex-col gap-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Invoices</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            {(invoices ?? []).length} total · {formatCurrency(outstanding)} outstanding
          </p>
        </div>
      </div>

      {(invoices ?? []).length === 0 ? (
        <div className="bg-white rounded-xl border border-outline-variant p-16 text-center">
          <FileText className="size-8 text-on-surface-variant mx-auto mb-3" />
          <p className="text-sm font-semibold text-on-surface mb-1">No invoices yet</p>
          <p className="text-xs text-on-surface-variant">Create invoices from a client's Invoices tab.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-outline-variant overflow-hidden">
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-5 py-2.5 bg-surface-container text-[11px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">
            <span>Invoice #</span>
            <span>Client</span>
            <span>Due</span>
            <span>Amount</span>
            <span>Status</span>
            <span />
          </div>
          <div className="divide-y divide-outline-variant">
            {(invoices ?? []).map((inv: { id: string; invoice_number: string; total: number; currency: string; status: string; due_date: string | null; clients: { id: string; name: string } | { id: string; name: string }[] | null }) => {
              const cfg = STATUS_CONFIG[inv.status] ?? STATUS_CONFIG.draft
              const client = Array.isArray(inv.clients) ? inv.clients[0] : inv.clients

              return (
                <div key={inv.id} className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-surface-container/40 transition-colors">
                  <span className="text-sm font-semibold text-on-surface font-mono">{inv.invoice_number}</span>
                  <span className="text-sm text-on-surface truncate">
                    {client ? (
                      <Link href={`/dashboard/clients/${client.id}`} className="hover:text-ds-secondary transition-colors">
                        {client.name}
                      </Link>
                    ) : '—'}
                  </span>
                  <span className="text-sm text-on-surface-variant">{inv.due_date ? formatDate(inv.due_date) : '—'}</span>
                  <span className="text-sm font-bold text-on-surface">{formatCurrency(inv.total, inv.currency)}</span>
                  <span className={cn('text-[11px] font-bold px-2 py-0.5 rounded-md', cfg.className)}>{cfg.label}</span>
                  {client && (
                    <Link
                      href={`/dashboard/clients/${client.id}/invoices`}
                      className="size-7 flex items-center justify-center text-on-surface-variant hover:text-ds-secondary transition-colors"
                      title="View"
                    >
                      <ExternalLink className="size-3.5" />
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

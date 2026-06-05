'use client'

import { useState, useTransition, useEffect } from 'react'
import { Invoice } from '@/types/database'
import { formatCurrency, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  CheckCircle, Clock, AlertTriangle, FileText, CreditCard, Loader2, ChevronDown, ChevronUp,
} from 'lucide-react'
import { EmptyState } from '@/components/dashboard/empty-state'

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  sent:    { label: 'Awaiting Payment', className: 'bg-blue-50 text-blue-600 border-blue-200',   icon: Clock },
  paid:    { label: 'Paid',             className: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle },
  overdue: { label: 'Overdue',          className: 'bg-red-50 text-red-600 border-red-200',       icon: AlertTriangle },
}

interface LineItem { description: string; quantity: number; unit_price: number }

export function PortalInvoices({ invoices, slug, justPaid }: { invoices: Invoice[]; slug: string; justPaid?: boolean }) {
  const [isPending, startTransition] = useTransition()
  const [payingId, setPayingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    if (justPaid) toast.success('Payment received! Thank you.')
  }, [justPaid])

  function handlePay(invoiceId: string) {
    setPayingId(invoiceId)
    startTransition(async () => {
      const res = await fetch(`/api/invoices/${invoiceId}/checkout`, { method: 'POST' })
      if (res.ok) {
        const { url } = await res.json()
        window.location.href = url
      } else {
        toast.error('Could not start payment. Please try again.')
        setPayingId(null)
      }
    })
  }

  const unpaid = invoices.filter(i => i.status === 'sent' || i.status === 'overdue')
  const paid = invoices.filter(i => i.status === 'paid')

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold text-on-surface">Invoices</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">View and pay your outstanding invoices securely via Stripe.</p>
      </div>

      {invoices.length === 0 ? (
        <EmptyState icon={FileText} title="No invoices yet" description="Your freelancer hasn't sent any invoices yet." />
      ) : (
        <>
          {unpaid.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-on-surface">Outstanding</h2>
              <div className="flex flex-col gap-3">
                {unpaid.map(inv => {
                  const cfg = STATUS_CONFIG[inv.status] ?? STATUS_CONFIG.sent
                  const StatusIcon = cfg.icon
                  const expanded = expandedId === inv.id

                  return (
                    <div key={inv.id} className={cn(
                      'bg-white rounded-xl border-2 p-5 flex flex-col gap-4',
                      inv.status === 'overdue' ? 'border-red-200' : 'border-ds-secondary/20'
                    )}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-on-surface">{inv.invoice_number}</p>
                          {inv.due_date && (
                            <p className={cn('text-xs mt-0.5', inv.status === 'overdue' ? 'text-red-500 font-semibold' : 'text-on-surface-variant')}>
                              Due {formatDate(inv.due_date)}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-on-surface">{formatCurrency(inv.total, inv.currency)}</p>
                          <span className={cn('inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border mt-1', cfg.className)}>
                            <StatusIcon className="size-3" />{cfg.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => handlePay(inv.id)}
                          disabled={isPending}
                          className="flex items-center gap-2 h-10 px-5 rounded-lg bg-ds-secondary text-white font-semibold text-sm hover:bg-ds-secondary-container transition-colors disabled:opacity-50"
                        >
                          {payingId === inv.id && isPending
                            ? <><Loader2 className="size-4 animate-spin" />Redirecting to Stripe…</>
                            : <><CreditCard className="size-4" />Pay now</>
                          }
                        </button>
                        <button
                          onClick={() => setExpandedId(expanded ? null : inv.id)}
                          className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-on-surface"
                        >
                          {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                          {expanded ? 'Hide' : 'View'} details
                        </button>
                      </div>

                      {expanded && (
                        <div className="bg-surface-container rounded-xl p-4 flex flex-col gap-2 text-sm">
                          {(inv.line_items as LineItem[]).map((item, i) => (
                            <div key={i} className="flex justify-between">
                              <span className="text-on-surface-variant">{item.description} × {item.quantity}</span>
                              <span className="font-medium">{formatCurrency(item.quantity * item.unit_price, inv.currency)}</span>
                            </div>
                          ))}
                          {inv.tax_rate > 0 && (
                            <div className="flex justify-between text-on-surface-variant border-t border-outline-variant pt-2 mt-1">
                              <span>Tax ({inv.tax_rate}%)</span>
                              <span>{formatCurrency(inv.tax_amount, inv.currency)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold border-t border-outline-variant pt-2 mt-1">
                            <span>Total</span>
                            <span>{formatCurrency(inv.total, inv.currency)}</span>
                          </div>
                          {inv.notes && <p className="text-xs text-on-surface-variant mt-1 italic">{inv.notes}</p>}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {paid.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-on-surface-variant">Paid</h2>
              <div className="bg-white rounded-xl border border-outline-variant divide-y divide-outline-variant overflow-hidden">
                {paid.map(inv => (
                  <div key={inv.id} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{inv.invoice_number}</p>
                      {inv.paid_at && <p className="text-xs text-on-surface-variant">Paid {formatDate(inv.paid_at)}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-on-surface">{formatCurrency(inv.total, inv.currency)}</span>
                      <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border bg-green-50 text-green-700 border-green-200">
                        <CheckCircle className="size-3" />Paid
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

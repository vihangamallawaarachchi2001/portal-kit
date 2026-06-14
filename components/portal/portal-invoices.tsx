'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { Invoice, BankDetails } from '@/types/database'
import { formatCurrency, formatDate, formatFileSize, effectiveInvoiceStatus } from '@/lib/format'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  CheckCircle, Clock, AlertTriangle, FileText, CreditCard, Loader2,
  ChevronDown, ChevronUp, Banknote, MessageCircle, Upload, Paperclip, Download,
} from 'lucide-react'
import Link from 'next/link'
import { EmptyState } from '@/components/dashboard/empty-state'
import { isStripeSupported } from '@/lib/currencies'

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  sent:    { label: 'Awaiting Payment', className: 'bg-blue-50 text-blue-600 border-blue-200',   icon: Clock },
  paid:    { label: 'Paid',             className: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle },
  overdue: { label: 'Overdue',          className: 'bg-red-50 text-red-600 border-red-200',       icon: AlertTriangle },
}

interface LineItem { description: string; quantity: number; unit_price: number }

interface Receipt {
  id: string
  filename: string
  file_size: number
  uploaded_at: string
}

export function PortalInvoices({
  invoices, slug, justPaid, bankDetails, supportedCurrencies, stripeConnected = false, receiptsByInvoice = {},
}: {
  invoices: Invoice[]
  slug: string
  justPaid?: boolean
  bankDetails?: BankDetails | null
  supportedCurrencies?: string[]
  stripeConnected?: boolean
  receiptsByInvoice?: Record<string, Receipt[]>
}) {
  const [isPending, startTransition] = useTransition()
  const [payingId, setPayingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [localReceipts, setLocalReceipts] = useState<Record<string, Receipt[]>>(receiptsByInvoice)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pendingUploadInvId = useRef<string | null>(null)

  const dynamicSet = supportedCurrencies ? new Set(supportedCurrencies) : undefined
  const isSupportedCurrency = (code: string) => isStripeSupported(code, dynamicSet)
  const canPayViaStripe = (inv: Invoice) => stripeConnected && isSupportedCurrency(inv.currency)
  const canPayViaBank = (inv: Invoice) => !canPayViaStripe(inv) && !!bankDetails

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

  function triggerReceiptUpload(invoiceId: string) {
    pendingUploadInvId.current = invoiceId
    fileInputRef.current?.click()
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    const invoiceId = pendingUploadInvId.current
    if (!file || !invoiceId) return
    e.target.value = ''

    setUploadingId(invoiceId)
    try {
      const uploadUrlRes = await fetch(`/api/portal/invoices/${invoiceId}/receipt-upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, mime_type: file.type, file_size: file.size }),
      })
      if (!uploadUrlRes.ok) throw new Error('Failed to get upload URL')
      const { signed_url, storage_path } = await uploadUrlRes.json()

      const uploadRes = await fetch(signed_url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })
      if (!uploadRes.ok) throw new Error('Upload failed')

      const regRes = await fetch(`/api/portal/invoices/${invoiceId}/receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storage_path, filename: file.name, file_size: file.size, mime_type: file.type }),
      })
      if (!regRes.ok) throw new Error('Failed to register receipt')
      const { receipt } = await regRes.json()

      setLocalReceipts(prev => ({
        ...prev,
        [invoiceId]: [receipt, ...(prev[invoiceId] ?? [])],
      }))
      setExpandedId(invoiceId)
      toast.success('Receipt uploaded successfully')
    } catch {
      toast.error('Failed to upload receipt. Please try again.')
    } finally {
      setUploadingId(null)
      pendingUploadInvId.current = null
    }
  }

  const unpaid = invoices.filter(i => {
    const eff = effectiveInvoiceStatus(i.status, i.due_date)
    return eff === 'sent' || eff === 'overdue'
  })
  const paid = invoices.filter(i => i.status === 'paid')

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold text-on-surface">Invoices</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">View and pay your outstanding invoices.</p>
      </div>

      {/* Hidden file input for receipt uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={handleFileSelected}
      />

      {invoices.length === 0 ? (
        <EmptyState icon={FileText} title="No invoices yet" description="Your freelancer hasn't sent any invoices yet." />
      ) : (
        <>
          {unpaid.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-on-surface">Outstanding</h2>
              <div className="flex flex-col gap-3">
                {unpaid.map(inv => {
                  const effStatus = effectiveInvoiceStatus(inv.status, inv.due_date)
                  const cfg = STATUS_CONFIG[effStatus] ?? STATUS_CONFIG.sent
                  const StatusIcon = cfg.icon
                  const expanded = expandedId === inv.id
                  const isOverdue = effStatus === 'overdue'
                  const stripeOk = canPayViaStripe(inv)
                  const bankOk = canPayViaBank(inv)
                  const receipts = localReceipts[inv.id] ?? []

                  return (
                    <div key={inv.id} className={cn(
                      'bg-white rounded-xl border-2 p-5 flex flex-col gap-4',
                      isOverdue ? 'border-red-200' : 'border-ds-secondary/20'
                    )}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-on-surface">{inv.invoice_number}</p>
                          {inv.due_date && (
                            <p className={cn('text-xs mt-0.5', isOverdue ? 'text-red-500 font-semibold' : 'text-on-surface-variant')}>
                              {isOverdue ? 'Was due' : 'Due'} {formatDate(inv.due_date)}
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
                        {stripeOk ? (
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
                        ) : bankOk ? (
                          <>
                            <button
                              onClick={() => setExpandedId(expanded ? null : inv.id)}
                              className="flex items-center gap-2 h-10 px-5 rounded-lg bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors"
                            >
                              <Banknote className="size-4" />View bank details
                            </button>
                            <button
                              onClick={() => triggerReceiptUpload(inv.id)}
                              disabled={uploadingId === inv.id}
                              className="flex items-center gap-2 h-10 px-4 rounded-lg bg-surface-container border border-outline-variant text-on-surface text-sm font-medium hover:bg-surface-container/80 transition-colors disabled:opacity-50"
                            >
                              {uploadingId === inv.id
                                ? <><Loader2 className="size-4 animate-spin" />Uploading…</>
                                : <><Upload className="size-4" />Upload receipt</>
                              }
                            </button>
                          </>
                        ) : (
                          <Link
                            href={`/p/${slug}/messages`}
                            className="flex items-center gap-2 h-10 px-5 rounded-lg bg-surface-container border border-outline-variant text-on-surface text-sm font-medium hover:bg-surface-container/80 transition-colors"
                          >
                            <MessageCircle className="size-4" />Contact freelancer for payment details
                          </Link>
                        )}

                        <button
                          onClick={() => setExpandedId(expanded ? null : inv.id)}
                          className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-on-surface"
                        >
                          {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                          {expanded ? 'Hide' : 'View'} details
                        </button>

                        <a
                          href={`/api/invoices/${inv.id}/pdf`}
                          download={`invoice-${inv.invoice_number}.pdf`}
                          className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-on-surface"
                        >
                          <Download className="size-3.5" />PDF
                        </a>
                      </div>

                      {expanded && (
                        <div className="bg-surface-container rounded-xl p-4 flex flex-col gap-3 text-sm">
                          {/* Line items */}
                          <div className="flex flex-col gap-2">
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

                          {/* Bank transfer details */}
                          {bankOk && (
                            <div className="pt-3 border-t border-outline-variant">
                              <p className="text-xs font-semibold text-on-surface mb-2 flex items-center gap-1.5">
                                <Banknote className="size-3.5" />Bank transfer details
                              </p>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                {(bankDetails as BankDetails).bank_name && (
                                  <><span className="text-on-surface-variant">Bank</span><span className="font-medium">{(bankDetails as BankDetails).bank_name}</span></>
                                )}
                                {(bankDetails as BankDetails).account_holder && (
                                  <><span className="text-on-surface-variant">Account name</span><span className="font-medium">{(bankDetails as BankDetails).account_holder}</span></>
                                )}
                                {(bankDetails as BankDetails).account_number && (
                                  <><span className="text-on-surface-variant">Account number</span><span className="font-mono font-medium">{(bankDetails as BankDetails).account_number}</span></>
                                )}
                                {(bankDetails as BankDetails).routing_number && (
                                  <><span className="text-on-surface-variant">Routing / BSB</span><span className="font-mono font-medium">{(bankDetails as BankDetails).routing_number}</span></>
                                )}
                                {(bankDetails as BankDetails).country && (
                                  <><span className="text-on-surface-variant">Country</span><span className="font-medium">{(bankDetails as BankDetails).country}</span></>
                                )}
                              </div>
                              <p className="text-xs text-on-surface-variant mt-3">
                                Once paid, upload your receipt above so your freelancer can confirm receipt.
                              </p>
                            </div>
                          )}

                          {/* Uploaded receipts */}
                          {receipts.length > 0 && (
                            <div className="pt-3 border-t border-outline-variant">
                              <p className="text-xs font-semibold text-on-surface mb-2 flex items-center gap-1.5">
                                <Paperclip className="size-3.5" />Uploaded receipts
                              </p>
                              <div className="flex flex-col gap-1.5">
                                {receipts.map(r => (
                                  <div key={r.id} className="flex items-center gap-2 text-xs">
                                    <Paperclip className="size-3 text-on-surface-variant shrink-0" />
                                    <span className="text-on-surface truncate flex-1">{r.filename}</span>
                                    <span className="text-on-surface-variant shrink-0">{formatFileSize(r.file_size)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
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
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-on-surface">{formatCurrency(inv.total, inv.currency)}</span>
                      <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border bg-green-50 text-green-700 border-green-200">
                        <CheckCircle className="size-3" />Paid
                      </span>
                      <a
                        href={`/api/invoices/${inv.id}/pdf`}
                        download={`invoice-${inv.invoice_number}.pdf`}
                        className="text-on-surface-variant hover:text-on-surface transition-colors"
                        title="Download PDF"
                      >
                        <Download className="size-4" />
                      </a>
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

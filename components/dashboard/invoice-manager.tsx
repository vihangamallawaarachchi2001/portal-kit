'use client'

import { useState, useTransition, useEffect } from 'react'
import { Invoice, Project, LineItem } from '@/types/database'
import { formatCurrency, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Plus, Trash2, Send, FileText, Loader2, ChevronDown, ChevronUp, X,
  Receipt, CalendarDays, Percent, FolderOpen, Download, CreditCard,
} from 'lucide-react'
import { UpgradePrompt } from '@/components/upgrade-prompt'
import { CURRENCIES, isStripeSupported } from '@/lib/currencies'
import { EmptyState } from './empty-state'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const STATUS_CONFIG: Record<Invoice['status'], { label: string; className: string }> = {
  draft:   { label: 'Draft',   className: 'bg-surface-container text-on-surface-variant border-outline-variant' },
  sent:    { label: 'Sent',    className: 'bg-blue-50 text-blue-600 border-blue-200' },
  paid:    { label: 'Paid',    className: 'bg-green-50 text-green-700 border-green-200' },
  overdue: { label: 'Overdue', className: 'bg-red-50 text-red-600 border-red-200' },
}

interface InvoiceManagerProps {
  clientId: string
  clientName: string
  clientEmail: string
  invoices: Invoice[]
  projects: Pick<Project, 'id' | 'title'>[]
  freelancerName: string
  businessName: string
  plan?: string
  stripeConnected?: boolean
  hasBankDetails?: boolean
}

const EMPTY_LINE: LineItem = { description: '', quantity: 1, unit_price: 0 }

export function InvoiceManager({
  clientId, clientName, invoices, projects, plan = 'free', stripeConnected = false, hasBankDetails = false,
}: InvoiceManagerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [modalOpen, setModalOpen]       = useState(false)
  const [expandedId, setExpandedId]     = useState<string | null>(null)
  const [upgradeFeature, setUpgradeFeature] = useState<string | null>(null)
  const [stripeSet, setStripeSet] = useState<Set<string> | null>(null)

  useEffect(() => {
    fetch('/api/billing/stripe-currencies')
      .then(r => r.json())
      .then((d: { currencies: string[] }) => setStripeSet(new Set(d.currencies)))
      .catch(() => {})
  }, [])

  // Form state
  const [lineItems, setLineItems] = useState<LineItem[]>([{ ...EMPTY_LINE }])
  const [taxRate, setTaxRate] = useState('0')
  const [currency, setCurrency] = useState('USD')
  const [dueDate, setDueDate] = useState('')
  const [projectId, setProjectId] = useState('')
  const [notes, setNotes] = useState('')

  function addLine() { setLineItems(l => [...l, { ...EMPTY_LINE }]) }
  function removeLine(i: number) { setLineItems(l => l.filter((_, idx) => idx !== i)) }
  function updateLine(i: number, field: keyof LineItem, value: string) {
    setLineItems(l => l.map((item, idx) =>
      idx === i ? { ...item, [field]: field === 'description' ? value : parseFloat(value) || 0 } : item
    ))
  }

  const subtotal = lineItems.reduce((s, l) => s + l.quantity * l.unit_price, 0)
  const taxAmt = subtotal * (parseFloat(taxRate) / 100 || 0)
  const total = subtotal + taxAmt

  function resetForm() {
    setLineItems([{ ...EMPTY_LINE }])
    setTaxRate('0')
    setCurrency('USD')
    setDueDate('')
    setProjectId('')
    setNotes('')
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await fetch(`/api/clients/${clientId}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          line_items: lineItems.filter(l => l.description),
          tax_rate: parseFloat(taxRate) || 0,
          currency,
          due_date: dueDate || null,
          project_id: projectId || null,
          notes: notes || null,
        }),
      })
      if (res.ok) {
        toast.success('Invoice created')
        resetForm()
        setModalOpen(false)
        router.refresh()
      } else if (res.status === 402) {
        const d = await res.json()
        setModalOpen(false)
        setUpgradeFeature(d.code ?? 'invoice_monthly_limit')
      } else {
        const d = await res.json()
        toast.error(d.error ?? 'Failed to create invoice')
      }
    })
  }

  function handleSend(invoiceId: string) {
    startTransition(async () => {
      const res = await fetch(`/api/invoices/${invoiceId}/send`, { method: 'POST' })
      if (res.ok) {
        toast.success('Invoice sent to client')
        router.refresh()
      } else {
        toast.error('Failed to send invoice')
      }
    })
  }

  function handleResend(invoiceId: string) {
    startTransition(async () => {
      const res = await fetch(`/api/invoices/${invoiceId}/resend`, { method: 'POST' })
      if (res.ok) {
        toast.success('Invoice resent to client')
      } else {
        const d = await res.json().catch(() => ({}))
        toast.error(d.error ?? 'Failed to resend invoice')
      }
    })
  }

  function handleDelete(invoiceId: string) {
    startTransition(async () => {
      const res = await fetch(`/api/invoices/${invoiceId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Invoice deleted')
        router.refresh()
      } else {
        toast.error('Cannot delete a paid invoice')
      }
    })
  }

  const INV_COL = 'grid-cols-[minmax(0,1fr)_110px_130px_120px_100px]'

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-on-surface">Invoices for {clientName}</h2>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-ds-secondary text-white text-sm font-semibold hover:bg-ds-secondary-container transition-colors"
        >
          <Plus className="size-4" />New invoice
        </button>
      </div>

      {invoices.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No invoices yet"
          description="Create an invoice for this client and send it directly through their portal."
        />
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-150 bg-white rounded-lg border border-outline-variant/20 shadow-sm overflow-hidden">
            {/* Table header */}
            <div className={cn('grid px-5 py-2.5 bg-surface-container/50 border-b border-outline-variant/15', INV_COL)}>
              {['Invoice', 'Status', 'Amount', 'Due Date', ''].map((h, i) => (
                <p key={i} className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{h}</p>
              ))}
            </div>
            {/* Rows */}
            <div className="divide-y divide-outline-variant/10">
              {invoices.map(inv => {
                const cfg      = STATUS_CONFIG[inv.status]
                const expanded = expandedId === inv.id
                const isOverdue = inv.status === 'overdue'
                const isPaid    = inv.status === 'paid'

                return (
                  <div key={inv.id} className="group">
                    <div className={cn(
                      'relative grid items-center px-5 py-3.5 transition-colors',
                      INV_COL,
                      isOverdue ? 'bg-red-50/30 hover:bg-red-50/60' : 'hover:bg-surface-container/20',
                    )}>
                      {/* Left accent */}
                      <div className={cn(
                        'absolute left-0 top-0 bottom-0 w-0.75',
                        isOverdue ? 'bg-red-500' : isPaid ? 'bg-emerald-500' : 'bg-transparent',
                      )} />

                      {/* Invoice # + expand toggle */}
                      <div className="flex items-center gap-2 min-w-0 pr-3">
                        <button
                          onClick={() => setExpandedId(expanded ? null : inv.id)}
                          className="shrink-0 text-on-surface-variant hover:text-on-surface transition-colors"
                        >
                          {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                        </button>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-on-surface truncate">{inv.invoice_number}</p>
                        </div>
                      </div>

                      {/* Status */}
                      <span className={cn('w-fit inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full border', cfg.className)}>
                        {cfg.label}
                      </span>

                      {/* Amount */}
                      <span className={cn(
                        'text-sm font-bold tabular-nums',
                        isPaid ? 'text-emerald-600' : isOverdue ? 'text-red-600' : 'text-on-surface',
                      )}>
                        {formatCurrency(inv.total, inv.currency)}
                      </span>

                      {/* Due date */}
                      <p className={cn(
                        'text-[12px]',
                        isOverdue ? 'text-red-500 font-medium' : 'text-on-surface-variant',
                      )}>
                        {inv.due_date ? formatDate(inv.due_date) : '—'}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        {inv.status === 'draft' && (
                          <button
                            onClick={() => handleSend(inv.id)}
                            disabled={isPending}
                            className="flex items-center gap-1 h-7 px-2.5 rounded-lg text-xs font-semibold text-white bg-ds-secondary hover:bg-ds-secondary-container transition-colors"
                          >
                            <Send className="size-3" />Send
                          </button>
                        )}
                        {(inv.status === 'sent' || inv.status === 'overdue') && (
                          <button
                            onClick={() => handleResend(inv.id)}
                            disabled={isPending}
                            title="Resend invoice email to client"
                            className="flex items-center gap-1 h-7 px-2.5 rounded-lg text-xs font-semibold text-ds-secondary bg-ds-secondary/8 hover:bg-ds-secondary/15 transition-colors"
                          >
                            <Send className="size-3" />Resend
                          </button>
                        )}
                        <a
                          href={`/api/invoices/${inv.id}/pdf`}
                          download={`invoice-${inv.invoice_number}.pdf`}
                          title="Download PDF"
                          className="size-7 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-ds-secondary hover:bg-ds-secondary/8 transition-colors"
                        >
                          <Download className="size-3.5" />
                        </a>
                        {inv.status !== 'paid' && (
                          <button
                            onClick={() => handleDelete(inv.id)}
                            className="size-7 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded line items */}
                    {expanded && (
                      <div className="px-10 pb-4 bg-surface-container/20 border-t border-outline-variant/15">
                        <div className="pt-3 flex flex-col gap-2">
                          <div className="grid grid-cols-[1fr_80px_80px_100px] text-[11px] font-bold text-on-surface-variant uppercase tracking-wider pb-2 border-b border-outline-variant/30">
                            <span>Description</span>
                            <span className="text-right">Qty</span>
                            <span className="text-right">Unit price</span>
                            <span className="text-right">Total</span>
                          </div>
                          {(inv.line_items as LineItem[]).map((item, i) => (
                            <div key={i} className="grid grid-cols-[1fr_80px_80px_100px] text-sm">
                              <span className="text-on-surface">{item.description}</span>
                              <span className="text-right text-on-surface-variant">{item.quantity}</span>
                              <span className="text-right text-on-surface-variant">{formatCurrency(item.unit_price, inv.currency)}</span>
                              <span className="text-right font-semibold">{formatCurrency(item.quantity * item.unit_price, inv.currency)}</span>
                            </div>
                          ))}
                          <div className="flex flex-col items-end gap-1 pt-2 border-t border-outline-variant/30 text-sm">
                            <span className="text-on-surface-variant">Subtotal: {formatCurrency(inv.subtotal, inv.currency)}</span>
                            {inv.tax_rate > 0 && (
                              <span className="text-on-surface-variant">Tax ({inv.tax_rate}%): {formatCurrency(inv.tax_amount, inv.currency)}</span>
                            )}
                            <span className="font-bold text-base text-on-surface">Total: {formatCurrency(inv.total, inv.currency)}</span>
                          </div>
                          {inv.notes && (
                            <p className="text-xs text-on-surface-variant mt-1 italic">Note: {inv.notes}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Create invoice modal */}
      <Dialog open={modalOpen} onOpenChange={v => { if (!v) resetForm(); setModalOpen(v) }}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden gap-0 max-h-[92vh] flex flex-col">
          <DialogTitle className="sr-only">New invoice</DialogTitle>
          <DialogDescription className="sr-only">Create a new invoice for this client.</DialogDescription>

          {/* ── Header ───────────────────────────────── */}
          <div
            className="px-6 pt-6 pb-5 border-b border-outline-variant/30 shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(0,81,213,0.06) 0%, transparent 70%)' }}
          >
            <div className="flex items-start gap-4">
              <div className="size-10 rounded-md bg-ds-secondary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Receipt className="size-5 text-ds-secondary" />
              </div>
              <div>
                <h2 className="text-base font-bold text-on-surface">New invoice</h2>
                <p className="text-sm text-on-surface-variant mt-0.5 leading-relaxed">
                  Create an invoice for <span className="font-semibold text-on-surface">{clientName}</span> and send it for online payment.
                </p>
              </div>
            </div>
          </div>

          {/* ── Stripe nudge ─────────────────────────── */}
          {!stripeConnected && (
            <div className="mx-6 mt-4 flex items-start gap-3 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
              <CreditCard className="size-4 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-900 leading-snug">
                Clients can&apos;t pay online until you connect Stripe.{' '}
                <Link
                  href="/dashboard/settings/billing"
                  onClick={() => setModalOpen(false)}
                  className="font-semibold underline underline-offset-2 hover:opacity-80"
                >
                  Set up payments →
                </Link>
              </p>
            </div>
          )}

          {/* ── Scrollable form body ─────────────────── */}
          <form onSubmit={handleCreate} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

              {/* Line items */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-on-surface">
                  Line items <span className="text-red-500">*</span>
                </label>

                <div className="rounded-md border border-outline-variant overflow-hidden">
                  {/* Column headers */}
                  <div className="grid grid-cols-[1fr_60px_96px_32px] gap-2 px-3 py-2 bg-surface-container/60 border-b border-outline-variant">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Description</span>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider text-center">Qty</span>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider text-right">Unit price</span>
                    <span />
                  </div>

                  {/* Rows */}
                  <div className="divide-y divide-outline-variant/40">
                    {lineItems.map((item, i) => (
                      <div key={i} className="grid grid-cols-[1fr_60px_96px_32px] gap-2 items-center px-3 py-2">
                        <Input
                          value={item.description}
                          onChange={e => updateLine(i, 'description', e.target.value)}
                          placeholder="Service or product description"
                          required
                          className="h-9 rounded-md border-0 shadow-none focus-visible:ring-0 px-0 text-sm bg-transparent"
                        />
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={e => updateLine(i, 'quantity', e.target.value)}
                          min="0.01"
                          step="0.01"
                          className="h-9 rounded-md text-center text-sm"
                        />
                        <Input
                          type="number"
                          value={item.unit_price}
                          onChange={e => updateLine(i, 'unit_price', e.target.value)}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className="h-9 rounded-md text-right text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeLine(i)}
                          disabled={lineItems.length === 1}
                          className="size-7 flex items-center justify-center rounded-md text-on-surface-variant hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-25"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addLine}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-ds-secondary hover:text-ds-secondary/80 transition-colors w-fit"
                >
                  <Plus className="size-3.5" />Add line
                </button>
              </div>

              {/* Totals preview */}
              <div className="rounded-md bg-surface-container/60 border border-outline-variant overflow-hidden">
                <div className="px-4 py-3 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-sm text-on-surface-variant">
                    <span>Subtotal</span>
                    <span className="tabular-nums">{formatCurrency(subtotal)}</span>
                  </div>
                  {parseFloat(taxRate) > 0 && (
                    <div className="flex justify-between items-center text-sm text-on-surface-variant">
                      <span>Tax ({taxRate}%)</span>
                      <span className="tabular-nums">{formatCurrency(taxAmt)}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center px-4 py-3 bg-ds-secondary/8 border-t border-ds-secondary/15">
                  <span className="text-sm font-bold text-ds-secondary">Total due</span>
                  <span className="text-xl font-extrabold text-ds-secondary tabular-nums tracking-tight">
                    {formatCurrency(total)} <span className="text-sm font-semibold opacity-70">{currency}</span>
                  </span>
                </div>
              </div>

              {/* Settings grid */}
              <div className="grid grid-cols-2 gap-4">

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Tax rate</label>
                  <div className="relative">
                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-on-surface-variant/60 pointer-events-none" />
                    <Input
                      type="number"
                      value={taxRate}
                      onChange={e => setTaxRate(e.target.value)}
                      min="0"
                      max="100"
                      step="0.01"
                      className="h-10 rounded-md pr-8"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Due date</label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-on-surface-variant/60 pointer-events-none" />
                    <Input
                      type="date"
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                      className="h-10 rounded-md pl-9"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">
                    Project <span className="text-[10px] font-normal text-on-surface-variant">(optional)</span>
                  </label>
                  <Select
                    value={projectId || '__none__'}
                    onValueChange={v => setProjectId(v === '__none__' ? '' : v)}
                  >
                    <SelectTrigger className="h-10 rounded-md border-outline-variant">
                      {projectId ? (
                        <span className="flex items-center gap-2 flex-1 min-w-0">
                          <FolderOpen className="size-3.5 text-on-surface-variant shrink-0" />
                          <span className="text-sm truncate">{projects.find(p => p.id === projectId)?.title ?? 'Project'}</span>
                        </span>
                      ) : (
                        <SelectValue placeholder="None" />
                      )}
                    </SelectTrigger>
                    <SelectContent className="z-[200]">
                      <SelectItem value="__none__" className="rounded-md">
                        <span className="text-on-surface-variant">None</span>
                      </SelectItem>
                      {projects.map(p => (
                        <SelectItem key={p.id} value={p.id} className="rounded-md">
                          <span className="flex items-center gap-2">
                            <FolderOpen className="size-3.5 text-on-surface-variant shrink-0" />
                            {p.title}
                          </span>
                        </SelectItem>
                      ))}
                      {projects.length === 0 && (
                        <div className="px-3 py-2 text-xs text-on-surface-variant italic">
                          No projects for this client yet
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Currency — Pro+ only; free plan is locked to USD */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Currency</label>
                  {plan === 'free' ? (
                    <div className="h-10 px-3 rounded-md border border-outline-variant bg-surface-container/50 flex items-center justify-between text-sm text-on-surface-variant">
                      <span className="font-medium text-on-surface">USD</span>
                      <span className="text-[10px] text-on-surface-variant/60 font-medium uppercase tracking-wide">Pro to unlock</span>
                    </div>
                  ) : (
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="h-10 rounded-md border-outline-variant">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 z-[200]">
                        {CURRENCIES.map(c => (
                          <SelectItem key={c.code} value={c.code} className="rounded-md">
                            <span className="flex items-center gap-2">
                              <span className="font-mono text-[11px] font-bold text-on-surface-variant w-8">{c.code}</span>
                              <span className="text-sm">{c.name}</span>
                              {!isStripeSupported(c.code, stripeSet ?? undefined) && (
                                <span className="text-[10px] text-on-surface-variant/50 ml-auto">bank transfer only</span>
                              )}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {currency && !isStripeSupported(currency, stripeSet ?? undefined) && plan !== 'free' && (
                    <div className="flex flex-col gap-1">
                      <p className="text-[11px] text-amber-700 bg-amber-50 rounded px-2 py-1 leading-snug">
                        {currency} isn&apos;t supported by Stripe — clients will pay via bank transfer.
                      </p>
                      {!hasBankDetails && (
                        <p className="text-[11px] text-on-surface-variant px-1">
                          No bank details on file.{' '}
                          <Link href="/dashboard/settings?tab=bank" className="text-ds-secondary underline font-medium">
                            Add bank details →
                          </Link>
                          {' '}so clients know how to pay.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface">
                  Notes <span className="text-[10px] font-normal text-on-surface-variant">(visible to client)</span>
                </label>
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Payment terms, bank details, thank-you note…"
                  rows={2}
                  className="rounded-md resize-none text-sm"
                />
              </div>

            </div>

            {/* ── Footer ──────────────────────────────── */}
            <div className="px-6 py-4 border-t border-outline-variant/30 flex items-center justify-end gap-2.5 bg-surface-container/20 shrink-0">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={isPending}
                className="inline-flex items-center h-9 px-4 rounded-md text-sm font-semibold text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={isPending || lineItems.every(l => !l.description)}
                className="inline-flex items-center h-9 px-5 rounded-md"
              >
                {isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
                Create invoice
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <UpgradePrompt
        open={upgradeFeature !== null}
        feature={upgradeFeature ?? 'invoice_monthly_limit'}
        onClose={() => setUpgradeFeature(null)}
      />
    </div>
  )
}

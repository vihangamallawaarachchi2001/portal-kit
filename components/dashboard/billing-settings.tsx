'use client'

import { useState, useTransition, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  CheckCircle2, Loader2, Zap, ArrowRight, CreditCard, Users, HardDrive,
  Link2, Link2Off, Star, Building2, AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { BankDetails } from '@/types/database'

const PLANS = [
  {
    id: 'free' as const,
    name: 'Free',
    price: { monthly: 0, annual: 0 },
    features: ['1 active client portal', '3 file uploads', 'Stripe invoice payments', 'PortalKit branding'],
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: { monthly: 15, annual: 12.5 },
    features: ['Unlimited client portals', '5 GB file storage', 'Remove PortalKit branding', 'PDF invoices', 'Priority support'],
    popular: true,
  },
  {
    id: 'business' as const,
    name: 'Business',
    price: { monthly: 29, annual: 24 },
    features: ['Everything in Pro', '20 GB storage', 'White-label portal', 'Weekly digest emails', 'Dedicated support'],
  },
]

interface BillingSettingsProps {
  plan: string
  subscriptionStatus: string | null
  hasBilling: boolean
  usage: { clients: number; files: number }
  justUpgraded?: boolean
  stripeConnectStatus?: 'success' | 'pending' | 'error' | null
  connectAccountId: string | null
  connectOnboarded: boolean
  bankDetails: BankDetails | null
}

export function BillingSettings({
  plan, subscriptionStatus, hasBilling, usage, justUpgraded,
  stripeConnectStatus, connectAccountId, connectOnboarded, bankDetails,
}: BillingSettingsProps) {
  const [billing, setBilling]         = useState<'monthly' | 'annual'>('monthly')
  const [isPending, startTransition]  = useTransition()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [connectPending, startConnect] = useTransition()
  const [bankForm, setBankForm] = useState<BankDetails>(bankDetails ?? {
    bank_name: '', account_holder: '', account_number: '', routing_number: '', country: '', currency: '',
  })
  const [bankPending, startBank] = useTransition()

  useEffect(() => {
    if (justUpgraded) toast.success('Plan upgraded! Your new limits are now active.')
  }, [justUpgraded])

  useEffect(() => {
    if (stripeConnectStatus === 'success') toast.success('Stripe account connected! Payments will now go directly to you.')
    if (stripeConnectStatus === 'pending') toast('Stripe setup incomplete — finish it to enable direct payments.')
    if (stripeConnectStatus === 'error') toast.error('Could not verify Stripe account. Please try again.')
  }, [stripeConnectStatus])

  function handleConnectStripe() {
    startConnect(async () => {
      const res = await fetch('/api/billing/stripe-connect', { method: 'POST' })
      if (res.ok) { const { url } = await res.json(); window.location.href = url }
      else toast.error('Failed to start Stripe Connect. Please try again.')
    })
  }

  function handleDisconnectStripe() {
    startConnect(async () => {
      const res = await fetch('/api/billing/stripe-connect', { method: 'DELETE' })
      if (res.ok) { toast.success('Stripe account disconnected.'); window.location.reload() }
      else toast.error('Failed to disconnect. Please try again.')
    })
  }

  function handleSaveBankDetails(e: React.FormEvent) {
    e.preventDefault()
    startBank(async () => {
      const res = await fetch('/api/settings/bank-details', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bankForm),
      })
      if (res.ok) toast.success('Bank details saved.')
      else toast.error('Failed to save bank details.')
    })
  }

  function handleUpgrade(planId: string) {
    setLoadingPlan(planId)
    startTransition(async () => {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId, billing }),
      })
      if (res.ok) { const { url } = await res.json(); window.location.href = url }
      else { toast.error('Failed to start checkout'); setLoadingPlan(null) }
    })
  }

  function handleManageBilling() {
    startTransition(async () => {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      if (res.ok) { const { url } = await res.json(); window.location.href = url }
      else toast.error('Failed to open billing portal')
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Current plan + usage */}
      <div className="bg-white rounded-md border border-outline-variant overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant bg-surface-container/40">
          <h2 className="text-sm font-bold text-on-surface">Current Plan</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">Your active subscription and usage.</p>
        </div>
        <div className="p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-md bg-ds-secondary/10 flex items-center justify-center">
                <CreditCard className="size-5 text-ds-secondary" />
              </div>
              <div>
                <p className="text-base font-bold text-on-surface capitalize">{plan} plan</p>
                <p className="text-sm text-on-surface-variant">
                  {plan === 'free' ? 'Free forever' : subscriptionStatus === 'active' ? 'Active subscription' : subscriptionStatus ?? 'Unknown'}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleManageBilling} disabled={isPending} className="rounded-md h-9">
              {isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              {hasBilling ? 'Manage billing' : 'Set up billing'}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UsageCard icon={Users} label="Client portals" used={usage.clients} max={plan === 'free' ? 1 : null} unit="portal" />
            <UsageCard icon={HardDrive} label="File uploads" used={usage.files} max={plan === 'free' ? 3 : null} unit="file" />
          </div>
        </div>
      </div>

      {/* Upgrade */}
      {plan === 'free' && (
        <div className="bg-white rounded-md border border-outline-variant overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant bg-surface-container/40 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-sm font-bold text-on-surface">Upgrade Your Plan</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">Unlock unlimited portals, more storage, and premium features.</p>
            </div>
            <div className="flex items-center bg-surface-container border border-outline-variant rounded-md p-0.5">
              {(['monthly', 'annual'] as const).map(p => (
                <button key={p} onClick={() => setBilling(p)} className={cn('px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all', billing === p ? 'bg-white text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface')}>
                  {p === 'monthly' ? 'Monthly' : 'Annual · 20% off'}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PLANS.filter(p => p.id !== 'free').map(p => (
              <div key={p.id} className={cn('rounded-md border-2 p-5 flex flex-col gap-4 relative overflow-hidden', p.popular ? 'border-ds-secondary' : 'border-outline-variant')}>
                {p.popular && (
                  <div className="absolute top-0 right-0">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white uppercase tracking-wider bg-ds-secondary px-3 py-1 rounded-bl-xl">
                      <Zap className="size-2.5" /> Popular
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-extrabold text-on-surface text-lg">{p.name}</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-extrabold text-on-surface">${billing === 'annual' ? p.price.annual : p.price.monthly}</span>
                    <span className="text-sm text-on-surface-variant">/mo</span>
                  </div>
                  {billing === 'annual' && <p className="text-xs text-ds-tertiary-action font-semibold mt-0.5">Billed ${(p.price.annual * 12).toFixed(0)}/year</p>}
                </div>
                <ul className="flex flex-col gap-2 flex-1">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-on-surface">
                      <CheckCircle2 className="size-4 text-ds-secondary shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleUpgrade(p.id)}
                  disabled={isPending}
                  className={cn('h-10 rounded-md font-semibold text-sm transition-colors flex items-center justify-center gap-2', p.popular ? 'bg-ds-secondary text-white hover:bg-ds-secondary-container shadow-md shadow-ds-secondary/20' : 'border-2 border-ds-secondary/30 text-ds-secondary hover:bg-ds-secondary/5')}
                >
                  {loadingPlan === p.id && isPending ? <Loader2 className="size-4 animate-spin" /> : <><ArrowRight className="size-4" />Upgrade to {p.name}</>}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Stripe Connect ──────────────────────────────────────────── */}
      <div className="bg-white rounded-md border border-outline-variant overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant bg-surface-container/40">
          <h2 className="text-sm font-bold text-on-surface">Payment Receiving</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Control where client invoice payments land.
          </p>
        </div>

        <div className="p-6 flex flex-col gap-6">

          {/* Stripe Connect card */}
          <div className={cn(
            'rounded-md border-2 p-5 flex flex-col gap-4',
            connectOnboarded ? 'border-emerald-300 bg-emerald-50/40' : 'border-ds-secondary/30 bg-ds-secondary/3'
          )}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={cn(
                  'size-10 rounded-md flex items-center justify-center shrink-0',
                  connectOnboarded ? 'bg-emerald-100' : 'bg-ds-secondary/10'
                )}>
                  {connectOnboarded ? <CheckCircle2 className="size-5 text-emerald-600" /> : <Link2 className="size-5 text-ds-secondary" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-on-surface">Connect your Stripe account</p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-full">
                      <Star className="size-2.5" />Recommended
                    </span>
                  </div>
                  {connectOnboarded ? (
                    <p className="text-xs text-emerald-700 mt-0.5 font-medium">
                      Connected — client payments go directly into your Stripe account.
                    </p>
                  ) : connectAccountId ? (
                    <p className="text-xs text-amber-600 mt-0.5">
                      Stripe account linked but onboarding not complete. Finish setup to enable direct payments.
                    </p>
                  ) : (
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Payments go directly into your own Stripe account. Instant payouts, full control.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {connectOnboarded ? (
                  <button
                    onClick={handleDisconnectStripe}
                    disabled={connectPending}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    {connectPending ? <Loader2 className="size-3 animate-spin" /> : <Link2Off className="size-3" />}
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={handleConnectStripe}
                    disabled={connectPending}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-semibold text-white bg-ds-secondary hover:bg-ds-secondary-container transition-colors shadow-sm"
                  >
                    {connectPending ? <Loader2 className="size-3 animate-spin" /> : <Link2 className="size-3" />}
                    {connectAccountId ? 'Resume setup' : 'Connect Stripe'}
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center pt-1">
              {[
                { label: 'Direct payouts', desc: 'To your bank' },
                { label: 'Zero extra fees', desc: 'Beyond Stripe rates' },
                { label: 'Real-time dashboard', desc: 'In Stripe' },
              ].map(b => (
                <div key={b.label} className="bg-white/60 rounded-md p-2.5 border border-outline-variant/40">
                  <p className="text-xs font-semibold text-on-surface">{b.label}</p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* No Stripe → bank details fallback */}
          {!connectOnboarded && (
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 p-4 rounded-md bg-amber-50 border border-amber-200">
                <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">No Stripe account connected</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Client payments currently land in the PortalKit account. Add your bank details below so we can transfer your earnings manually, or connect Stripe above for instant automatic payouts.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-md border border-outline-variant overflow-hidden">
                <div className="px-5 py-3.5 border-b border-outline-variant bg-surface-container/40 flex items-center gap-2">
                  <Building2 className="size-4 text-on-surface-variant" />
                  <p className="text-sm font-semibold text-on-surface">Bank details for manual transfer</p>
                </div>
                <form onSubmit={handleSaveBankDetails} className="p-5 flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-semibold">Bank name</Label>
                      <Input
                        placeholder="Commonwealth Bank"
                        value={bankForm.bank_name}
                        onChange={e => setBankForm(f => ({ ...f, bank_name: e.target.value }))}
                        className="h-9 text-sm rounded-md"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-semibold">Account holder name</Label>
                      <Input
                        placeholder="Jane Smith"
                        value={bankForm.account_holder}
                        onChange={e => setBankForm(f => ({ ...f, account_holder: e.target.value }))}
                        className="h-9 text-sm rounded-md"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-semibold">Account number</Label>
                      <Input
                        placeholder="1234 5678"
                        value={bankForm.account_number}
                        onChange={e => setBankForm(f => ({ ...f, account_number: e.target.value }))}
                        className="h-9 text-sm rounded-md"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-semibold">BSB / Routing / Sort code</Label>
                      <Input
                        placeholder="062-000"
                        value={bankForm.routing_number}
                        onChange={e => setBankForm(f => ({ ...f, routing_number: e.target.value }))}
                        className="h-9 text-sm rounded-md"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-semibold">Country</Label>
                      <Input
                        placeholder="Australia"
                        value={bankForm.country}
                        onChange={e => setBankForm(f => ({ ...f, country: e.target.value }))}
                        className="h-9 text-sm rounded-md"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-semibold">Currency</Label>
                      <Input
                        placeholder="AUD"
                        value={bankForm.currency}
                        onChange={e => setBankForm(f => ({ ...f, currency: e.target.value.toUpperCase() }))}
                        className="h-9 text-sm rounded-md"
                        maxLength={3}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[11px] text-on-surface-variant">Your details are stored securely and used only for payouts.</p>
                    <Button type="submit" disabled={bankPending} size="sm" className="h-9 rounded-md">
                      {bankPending && <Loader2 className="size-3.5 mr-1.5 animate-spin" />}
                      Save bank details
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function UsageCard({ icon: Icon, label, used, max, unit }: { icon: React.ElementType; label: string; used: number; max: number | null; unit: string }) {
  const pct     = max != null ? Math.min((used / max) * 100, 100) : 0
  const atLimit = max != null && used >= max
  return (
    <div className="flex flex-col gap-2.5 p-4 rounded-md bg-surface-container/50 border border-outline-variant/60">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-on-surface-variant" />
          <span className="text-xs font-semibold text-on-surface">{label}</span>
        </div>
        <span className={cn('text-xs font-bold', atLimit ? 'text-red-600' : 'text-on-surface')}>
          {used}{max != null ? `/${max}` : ''} {max == null ? `${unit}s` : ''}
        </span>
      </div>
      {max != null ? (
        <div className="w-full bg-outline-variant/30 rounded-full h-1.5">
          <div className={cn('h-1.5 rounded-full transition-all', atLimit ? 'bg-red-500' : 'bg-ds-secondary')} style={{ width: `${pct}%` }} />
        </div>
      ) : (
        <p className="text-xs text-ds-tertiary-action font-semibold">Unlimited</p>
      )}
    </div>
  )
}

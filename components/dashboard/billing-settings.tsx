'use client'

import { useState, useTransition, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { CheckCircle2, Loader2, Zap, ArrowRight, CreditCard, Users, HardDrive } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
}

export function BillingSettings({ plan, subscriptionStatus, hasBilling, usage, justUpgraded }: BillingSettingsProps) {
  const [billing, setBilling]         = useState<'monthly' | 'annual'>('monthly')
  const [isPending, startTransition]  = useTransition()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  useEffect(() => {
    if (justUpgraded) toast.success('Plan upgraded! Your new limits are now active.')
  }, [justUpgraded])

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
      <div className="bg-white rounded-2xl border border-outline-variant overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant bg-surface-container/40">
          <h2 className="text-sm font-bold text-on-surface">Current Plan</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">Your active subscription and usage.</p>
        </div>
        <div className="p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-ds-secondary/10 flex items-center justify-center">
                <CreditCard className="size-5 text-ds-secondary" />
              </div>
              <div>
                <p className="text-base font-bold text-on-surface capitalize">{plan} plan</p>
                <p className="text-sm text-on-surface-variant">
                  {plan === 'free' ? 'Free forever' : subscriptionStatus === 'active' ? 'Active subscription' : subscriptionStatus ?? 'Unknown'}
                </p>
              </div>
            </div>
            {hasBilling && (
              <Button variant="outline" size="sm" onClick={handleManageBilling} disabled={isPending} className="rounded-xl h-9">
                {isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                Manage billing
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UsageCard icon={Users} label="Client portals" used={usage.clients} max={plan === 'free' ? 1 : null} unit="portal" />
            <UsageCard icon={HardDrive} label="File uploads" used={usage.files} max={plan === 'free' ? 3 : null} unit="file" />
          </div>
        </div>
      </div>

      {/* Upgrade */}
      {plan === 'free' && (
        <div className="bg-white rounded-2xl border border-outline-variant overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant bg-surface-container/40 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-sm font-bold text-on-surface">Upgrade Your Plan</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">Unlock unlimited portals, more storage, and premium features.</p>
            </div>
            <div className="flex items-center bg-surface-container border border-outline-variant rounded-xl p-0.5">
              {(['monthly', 'annual'] as const).map(p => (
                <button key={p} onClick={() => setBilling(p)} className={cn('px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all', billing === p ? 'bg-white text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface')}>
                  {p === 'monthly' ? 'Monthly' : 'Annual · 20% off'}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PLANS.filter(p => p.id !== 'free').map(p => (
              <div key={p.id} className={cn('rounded-2xl border-2 p-5 flex flex-col gap-4 relative overflow-hidden', p.popular ? 'border-ds-secondary' : 'border-outline-variant')}>
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
                  className={cn('h-10 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2', p.popular ? 'bg-ds-secondary text-white hover:bg-ds-secondary-container shadow-md shadow-ds-secondary/20' : 'border-2 border-ds-secondary/30 text-ds-secondary hover:bg-ds-secondary/5')}
                >
                  {loadingPlan === p.id && isPending ? <Loader2 className="size-4 animate-spin" /> : <><ArrowRight className="size-4" />Upgrade to {p.name}</>}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function UsageCard({ icon: Icon, label, used, max, unit }: { icon: React.ElementType; label: string; used: number; max: number | null; unit: string }) {
  const pct     = max != null ? Math.min((used / max) * 100, 100) : 0
  const atLimit = max != null && used >= max
  return (
    <div className="flex flex-col gap-2.5 p-4 rounded-xl bg-surface-container/50 border border-outline-variant/60">
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

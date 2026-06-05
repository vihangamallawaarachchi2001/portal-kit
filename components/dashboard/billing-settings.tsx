'use client'

import { useState, useTransition, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { CheckCircle, Loader2, Zap, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const PLANS = [
  {
    id: 'free' as const,
    name: 'Free',
    price: { monthly: 0, annual: 0 },
    limits: '1 client · 3 files',
    features: ['1 active client portal', '3 file uploads', 'PortalKit branding'],
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: { monthly: 15, annual: 12.5 },
    limits: 'Unlimited clients · 5GB',
    features: ['Unlimited client portals', '5GB file storage', 'No branding', 'PDF invoices', 'Priority support'],
    popular: true,
  },
  {
    id: 'business' as const,
    name: 'Business',
    price: { monthly: 29, annual: 24 },
    limits: 'Unlimited clients · 20GB',
    features: ['Everything in Pro', '20GB storage', 'White-label portal', 'Weekly digest', 'Dedicated support'],
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
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const [isPending, startTransition] = useTransition()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  useEffect(() => {
    if (justUpgraded) toast.success('Plan upgraded successfully! Your new limits are now active.')
  }, [justUpgraded])

  function handleUpgrade(planId: string) {
    setLoadingPlan(planId)
    startTransition(async () => {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId, billing }),
      })
      if (res.ok) {
        const { url } = await res.json()
        window.location.href = url
      } else {
        toast.error('Failed to start checkout')
        setLoadingPlan(null)
      }
    })
  }

  function handleManageBilling() {
    startTransition(async () => {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      if (res.ok) {
        const { url } = await res.json()
        window.location.href = url
      } else {
        toast.error('Failed to open billing portal')
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Current plan */}
      <div className="bg-white rounded-xl border border-outline-variant p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-on-surface">Current plan</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-on-surface capitalize">{plan} plan</p>
            <p className="text-sm text-on-surface-variant">
              {plan === 'free' ? 'Free forever' : subscriptionStatus === 'active' ? 'Active subscription' : subscriptionStatus ?? 'Unknown status'}
            </p>
          </div>
          {hasBilling && (
            <Button variant="outline" size="sm" onClick={handleManageBilling} disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              Manage billing
            </Button>
          )}
        </div>

        {/* Usage */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Usage</p>
          <div className="flex flex-col gap-1.5">
            <UsageBar label="Clients" used={usage.clients} max={plan === 'free' ? 1 : null} />
            <UsageBar label="Files" used={usage.files} max={plan === 'free' ? 3 : null} />
          </div>
        </div>
      </div>

      {/* Plan cards */}
      {plan === 'free' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-on-surface">Upgrade your plan</h2>
            <div className="flex items-center bg-surface-container border border-outline-variant rounded-xl p-0.5">
              {(['monthly', 'annual'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setBilling(p)}
                  className={cn('px-4 py-1.5 rounded-lg text-xs font-semibold transition-all',
                    billing === p ? 'bg-white text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                  )}
                >
                  {p === 'monthly' ? 'Monthly' : 'Annual · 20% off'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PLANS.filter(p => p.id !== 'free').map(p => (
              <div
                key={p.id}
                className={cn(
                  'bg-white rounded-xl border-2 p-5 flex flex-col gap-4',
                  p.popular ? 'border-ds-secondary' : 'border-outline-variant'
                )}
              >
                {p.popular && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-ds-secondary uppercase tracking-wider w-fit">
                    <Zap className="size-3" />Most popular
                  </span>
                )}
                <div>
                  <p className="font-bold text-on-surface text-lg">{p.name}</p>
                  <p className="text-2xl font-extrabold text-on-surface mt-1">
                    ${billing === 'annual' ? p.price.annual : p.price.monthly}
                    <span className="text-sm font-normal text-on-surface-variant">/mo</span>
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{p.limits}</p>
                </div>
                <ul className="flex flex-col gap-1.5 flex-1">
                  {p.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-on-surface">
                      <CheckCircle className="size-3.5 text-ds-secondary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleUpgrade(p.id)}
                  disabled={isPending}
                  className={cn(
                    'h-10 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2',
                    p.popular
                      ? 'bg-ds-secondary text-white hover:bg-ds-secondary-container'
                      : 'border border-outline-variant text-on-surface hover:border-ds-secondary/40'
                  )}
                >
                  {loadingPlan === p.id && isPending
                    ? <Loader2 className="size-4 animate-spin" />
                    : <><ChevronRight className="size-4" />Upgrade to {p.name}</>
                  }
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function UsageBar({ label, used, max }: { label: string; used: number; max: number | null }) {
  const pct = max != null ? Math.min((used / max) * 100, 100) : 0
  const atLimit = max != null && used >= max

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-on-surface-variant">{label}</span>
        <span className={cn('font-semibold', atLimit ? 'text-red-500' : 'text-on-surface')}>
          {used}{max != null ? `/${max}` : ''} {max == null ? '(unlimited)' : ''}
        </span>
      </div>
      {max != null && (
        <div className="w-full bg-surface-container rounded-full h-1.5">
          <div
            className={cn('h-1.5 rounded-full transition-all', atLimit ? 'bg-red-500' : 'bg-ds-secondary')}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  )
}

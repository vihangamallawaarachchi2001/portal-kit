'use client'

import { Check, X, Zap } from 'lucide-react'
import Link from 'next/link'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

interface FeatureConfig {
  title: string
  description: string
  requiredPlan: 'pro' | 'business'
  highlights: string[]
}

const FEATURES: Record<string, FeatureConfig> = {
  client_limit: {
    title: 'Unlimited client portals',
    description: "You've reached the 3-portal limit on the Free plan.",
    requiredPlan: 'pro',
    highlights: ['Unlimited client portals', 'Unlimited invoices', 'Custom domain', 'Remove PortalKit branding'],
  },
  invoice_monthly_limit: {
    title: '3 invoices/month limit reached',
    description: "You've sent 3 invoices this month. Upgrade for unlimited invoices.",
    requiredPlan: 'pro',
    highlights: ['Unlimited invoices', 'Stripe payment collection', 'PDF invoice export', 'Multi-currency invoices'],
  },
  invoice_gating: {
    title: 'Unlimited invoices',
    description: 'Create and send unlimited professional invoices with Pro.',
    requiredPlan: 'pro',
    highlights: ['Unlimited invoices', 'Stripe payment collection', 'PDF invoice export', 'Multi-currency invoices'],
  },
  invoice_stripe: {
    title: 'Stripe payment collection',
    description: 'Let clients pay invoices online. Available on Pro and above.',
    requiredPlan: 'pro',
    highlights: ['Stripe payment collection', 'Unlimited invoices', 'PDF invoice export', 'Multi-currency invoices'],
  },
  invoice_pdf: {
    title: 'PDF invoice export',
    description: 'Export professional PDF invoices for your records. Available on Pro and above.',
    requiredPlan: 'pro',
    highlights: ['PDF invoice export', 'Stripe payment collection', 'Unlimited invoices'],
  },
  invoice_multicurrency: {
    title: 'Multi-currency invoices',
    description: 'Invoice clients in any currency. Available on Pro and above.',
    requiredPlan: 'pro',
    highlights: ['Multi-currency invoices', 'Unlimited invoices', 'Stripe payment collection'],
  },
  file_limit: {
    title: '10 files per portal limit',
    description: "You've reached the 10-file limit for this portal on the Free plan.",
    requiredPlan: 'pro',
    highlights: ['Unlimited file uploads', '5 GB storage', 'File versioning', 'Unlimited portals'],
  },
  storage_limit: {
    title: '500 MB storage limit',
    description: "You've used all 500 MB of free storage.",
    requiredPlan: 'pro',
    highlights: ['5 GB storage', 'Unlimited file uploads', 'File versioning'],
  },
  custom_domain: {
    title: 'Custom domain',
    description: 'Use your own domain for client portals. Available on Pro and above.',
    requiredPlan: 'pro',
    highlights: ['Custom domain', 'Remove PortalKit branding', 'Unlimited portals', 'Priority support'],
  },
  remove_branding: {
    title: 'Remove PortalKit branding',
    description: "Hide the \"Powered by PortalKit\" badge. Available on Pro and above.",
    requiredPlan: 'pro',
    highlights: ['Remove PortalKit branding', 'Custom domain', 'Unlimited portals'],
  },
  team_members: {
    title: 'Team members',
    description: 'Invite up to 5 team members to collaborate on client work. Available on Business.',
    requiredPlan: 'business',
    highlights: ['Up to 5 team members', 'Granular client permissions', 'Advanced analytics', 'Full white labeling'],
  },
  analytics: {
    title: 'Advanced analytics',
    description: 'Track portal engagement and invoice performance. Available on Business.',
    requiredPlan: 'business',
    highlights: ['Advanced analytics', 'Team members', 'Full white labeling', 'Dedicated onboarding call'],
  },
  white_label: {
    title: 'Full white labeling',
    description: 'Complete brand customization for every client-facing surface. Available on Business.',
    requiredPlan: 'business',
    highlights: ['Full white labeling', 'Team members', 'Advanced analytics', 'Dedicated onboarding call'],
  },
  client_permissions: {
    title: 'Granular client permissions',
    description: 'Control exactly what each client can see and do. Available on Business.',
    requiredPlan: 'business',
    highlights: ['Granular client permissions', 'Team members', 'Advanced analytics', 'Full white labeling'],
  },
}

interface UpgradePromptProps {
  open: boolean
  feature: string
  onClose: () => void
}

export function UpgradePrompt({ open, feature, onClose }: UpgradePromptProps) {
  const cfg      = FEATURES[feature] ?? FEATURES.client_limit
  const isPro    = cfg.requiredPlan === 'pro'
  const planName = isPro ? 'Pro' : 'Business'
  const planPrice = isPro ? '$15/mo' : '$29/mo'

  const headerStyle = isPro
    ? { background: 'linear-gradient(145deg, #003299 0%, #0051d5 55%, #2d66f0 100%)' }
    : { background: 'linear-gradient(145deg, #07111e 0%, #0e1f33 55%, #182e47 100%)' }

  function remindLater() {
    try {
      localStorage.setItem(
        `upgrade_prompt_${feature}_dismissed`,
        String(Date.now() + SEVEN_DAYS_MS),
      )
    } catch { /* localStorage unavailable */ }
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-sm p-0 overflow-hidden gap-0">
        <DialogTitle className="sr-only">Upgrade to {planName}</DialogTitle>
        <DialogDescription className="sr-only">
          {cfg.description} Upgrade to {planName} to unlock {cfg.title}.
        </DialogDescription>

        {/* ── Gradient header ───────────────────────── */}
        <div className="px-7 pt-8 pb-7 text-center relative" style={headerStyle}>
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3.5 right-3.5 size-7 flex items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="size-3.5" />
          </button>

          <div className="size-14 rounded-2xl bg-white/15 ring-2 ring-white/20 flex items-center justify-center mx-auto mb-4">
            <Zap className="size-7 text-amber-400 fill-amber-400/20" />
          </div>

          <p className="text-[10px] font-bold uppercase tracking-widest text-white/45 mb-1.5">
            {planName} plan — {planPrice}
          </p>
          <h2 className="text-[1.1rem] font-bold text-white leading-snug">{cfg.title}</h2>
          <p className="text-[13px] text-white/60 mt-2 leading-relaxed">{cfg.description}</p>
        </div>

        {/* ── Feature highlights ────────────────────── */}
        <div className="px-7 py-5 space-y-2.5 border-b border-outline-variant">
          {cfg.highlights.map(h => (
            <div key={h} className="flex items-center gap-3">
              <span className="size-5 rounded-full bg-ds-secondary/10 flex items-center justify-center shrink-0">
                <Check className="size-3 text-ds-secondary" strokeWidth={3} />
              </span>
              <span className="text-[13px] text-on-surface">{h}</span>
            </div>
          ))}
        </div>

        {/* ── CTAs ─────────────────────────────────── */}
        <div className="px-7 py-5 flex flex-col gap-2">
          <Link
            href={`/dashboard/settings/billing?plan=${cfg.requiredPlan}`}
            onClick={onClose}
            className="flex items-center justify-center gap-2 h-10 w-full rounded-xl bg-ds-secondary text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            <Zap className="size-3.5" />
            Upgrade to {planName} — {planPrice}
          </Link>
          <button
            onClick={remindLater}
            className="h-9 text-[13px] text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Remind me later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Utility: check if a feature's upgrade prompt was dismissed within 7 days.
// Call client-side before opening a prompt proactively (limit banners, etc.).
export function isUpgradePromptDismissed(feature: string): boolean {
  try {
    const stored = localStorage.getItem(`upgrade_prompt_${feature}_dismissed`)
    if (!stored) return false
    return parseInt(stored, 10) > Date.now()
  } catch {
    return false
  }
}

'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Camera, Check, FileText, Layers, Lock, Zap } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useRef, useState, useTransition } from 'react'
import { uploadAvatarToStorage, updateProfile } from './onboard-actions'
import { createClient } from '@/lib/supabase/client'

const PLANS = [
  {
    id: 'free',
    name: 'Starter',
    badge: undefined as string | undefined,
    monthly: { display: 'Free', period: 'forever', billed: null as string | null, save: null as string | null },
    annual: { display: 'Free', period: 'forever', billed: null as string | null, save: null as string | null },
    description: 'Everything you need to start managing clients professionally.',
    features: [
      '1 active client portal',
      '3 file uploads',
      'Stripe invoice payments',
      'Client portal access',
      'Email notifications',
      'PortalKit branding',
    ],
    popular: false,
    cta: 'Get started free',
  },
  {
    id: 'pro',
    name: 'Pro',
    badge: 'Most Popular' as string | undefined,
    monthly: { display: '$15', period: '/month', billed: null as string | null, save: null as string | null },
    annual: { display: '$12.50', period: '/month', billed: 'Billed $150/year', save: 'Save $30' },
    description: 'For freelancers who want to impress clients and get paid faster.',
    features: [
      'Unlimited client portals',
      '5GB file storage',
      'No PortalKit branding',
      'File versioning',
      'Priority support',
      'PDF invoice download',
    ],
    popular: true,
    cta: 'Start 14-day free trial',
  },
  {
    id: 'business',
    name: 'Business',
    badge: undefined as string | undefined,
    monthly: { display: '$29', period: '/month', billed: null as string | null, save: null as string | null },
    annual: { display: '$24', period: '/month', billed: 'Billed $290/year', save: 'Save $58' },
    description: 'For agencies and established freelancers who need more capacity.',
    features: [
      'Everything in Pro',
      '20GB file storage',
      'White-label portal',
      'Weekly digest emails',
      'Advanced analytics',
      'Dedicated support',
    ],
    popular: false,
    cta: 'Start 14-day free trial',
  },
]

interface ProfileData {
  fullName: string
  businessName: string
  tagline: string
  avatarUrl: string | null
  avatarFile: File | null
}

export default function OnBoardingScreen() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly')
  const [profile, setProfile] = useState<ProfileData>({
    fullName: '',
    businessName: '',
    tagline: '',
    avatarUrl: null,
    avatarFile: null,
  })
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const update =
    (field: keyof Omit<ProfileData, 'avatarUrl' | 'avatarFile'>) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setProfile(prev => ({ ...prev, [field]: e.target.value }))

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfile(prev => ({
        ...prev,
        avatarUrl: URL.createObjectURL(file),
        avatarFile: file,
      }))
    }
  }

  const handleContinue = () => {
    if (!profile.fullName.trim()) {
      setError('Please enter your full name.')
      return
    }
    setError(null)
    setStep(1)
  }

  const handleFinish = () => {
    if (!selectedPlan) return

    startTransition(async () => {
      try {
        setError(null)
        let avatarUrl: string | null = null

        if (profile.avatarFile) {
          avatarUrl = await uploadAvatarToStorage(profile.avatarFile)
        }

        // For paid plans: save profile (free tier) then redirect to Stripe checkout.
        // The plan upgrade happens after payment; onboarding is still marked complete.
        await updateProfile({
          fullName: profile.fullName,
          businessName: profile.businessName,
          tagline: profile.tagline,
          avatarUrl,
          plan: 'free', // always start on free; paid plans go through Stripe
        })

        // Refresh the JWT so the proxy sees onboarding_complete = true in the
        // cookie before we navigate. Without this, the stale token causes the
        // proxy to redirect back to /onboarding in an infinite loop.
        await createClient().auth.refreshSession()

        if (selectedPlan !== 'free') {
          // Redirect to Stripe checkout for paid plans
          const res = await fetch('/api/billing/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan: selectedPlan, billing: billingPeriod }),
          })
          if (res.ok) {
            const { url } = await res.json()
            window.location.href = url
            return
          }
          // If Stripe fails, fall through to dashboard (user can upgrade later)
        }

        router.push('/dashboard')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.')
      }
    })
  }

  const displayBusiness = profile.businessName || profile.fullName || 'Your Business'
  const displayInitials = displayBusiness
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
  const displayTagline = profile.tagline || 'Professional services for amazing clients'
  const portalSlug = (profile.businessName || profile.fullName || 'yourbusiness')
    .toLowerCase()
    .replace(/\s+/g, '')

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="sticky top-0 bg-white z-10 border-b border-outline-variant bg-surface/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-8 py-3.5 max-w-6xl mx-auto w-full">
          <Link href="/" className="flex items-center gap-2.5 shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span className="flex items-center justify-center size-8 rounded-md bg-ds-secondary shrink-0">
              <Layers className="size-[18px] text-white" strokeWidth={1.75} />
            </span>
            <span className="font-bold text-lg tracking-tight text-on-surface">PortalKit</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-on-surface-variant tabular-nums">Step {step + 1} of 2</span>
            <div className="flex items-center gap-1.5">
              {[0, 1].map(i => (
                <div
                  key={i}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-500',
                    step >= i ? 'w-8 bg-ds-secondary' : 'w-5 bg-outline-variant'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      {step === 0 ? (
        <main className="max-w-6xl mx-auto w-full px-8 py-14 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-14 lg:gap-20 items-start">
          {/* Form */}
          <div className="flex flex-col gap-9 max-w-md">
            <div className="flex flex-col gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ds-secondary/10 border border-ds-secondary/20 w-fit text-xs font-semibold text-ds-secondary">
                <span className="size-1.5 rounded-full bg-ds-secondary inline-block" />
                Profile Setup
              </span>
              <h1 className="text-[1.85rem] font-bold text-on-surface tracking-tight leading-[1.2]">
                Build your<br />client-facing brand
              </h1>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                This is how clients see you across invoices, proposals, and your shared portal.
              </p>
            </div>

            {/* Avatar upload */}
            <div className="flex flex-col gap-2.5">
              <Label className="font-semibold text-on-surface text-sm">Logo / Profile photo</Label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative size-[88px] rounded-2xl border-2 border-dashed border-outline-variant bg-surface-container hover:border-ds-secondary/50 hover:bg-ds-secondary/5 transition-all duration-200 group overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                >
                  {profile.avatarUrl ? (
                    <>
                      <img src={profile.avatarUrl} alt="Logo" className="size-full object-cover" />
                      <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="size-5 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center size-full gap-1.5">
                      <div className="size-9 rounded-xl bg-ds-secondary/10 flex items-center justify-center group-hover:bg-ds-secondary/20 transition-colors">
                        <Camera className="size-[18px] text-ds-secondary" />
                      </div>
                      <span className="text-[10px] font-bold text-ds-secondary/70 tracking-wider">UPLOAD</span>
                    </div>
                  )}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-on-surface">Add a logo or photo</p>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    PNG, JPG, SVG up to 2 MB.<br />Appears on invoices, portals & emails.
                  </p>
                </div>
              </div>
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="full-name" className="font-semibold text-on-surface text-sm">Full Name <span className="text-red-500">*</span></Label>
                <Input id="full-name" type="text" placeholder="Jane Smith" value={profile.fullName} onChange={update('fullName')} className="h-10" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="business-name" className="font-semibold text-on-surface text-sm">Business Name</Label>
                <Input id="business-name" type="text" placeholder="Smith Studio" value={profile.businessName} onChange={update('businessName')} className="h-10" />
                <p className="text-xs text-on-surface-variant">Shown on all client documents. Defaults to your name if blank.</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <Label htmlFor="tagline" className="font-semibold text-on-surface text-sm">Tagline</Label>
                  <span className="text-[10px] font-semibold text-on-surface-variant px-1.5 py-0.5 rounded-md bg-surface-container border border-outline-variant">optional</span>
                </div>
                <Input id="tagline" type="text" placeholder="Design that drives results" value={profile.tagline} onChange={update('tagline')} className="h-10" />
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex flex-col gap-3">
              <button
                onClick={handleContinue}
                className="w-full h-11 rounded-xl bg-ds-secondary hover:bg-ds-secondary-container text-white font-semibold text-sm transition-colors shadow-sm"
              >
                Continue
              </button>
              <div className="flex items-center justify-center gap-1.5">
                <Lock className="size-3 text-on-surface-variant" />
                <p className="text-xs text-on-surface-variant">Your data is encrypted and never shared</p>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="sticky top-24 flex flex-col gap-3 hidden lg:flex">
            <div className="flex items-center gap-2 px-1">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ds-tertiary-action opacity-60" />
                <span className="relative inline-flex rounded-full size-2 bg-ds-tertiary-action" />
              </span>
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Live Preview</p>
            </div>
            <div className="rounded-2xl bg-surface-container-low border border-outline-variant p-4 flex flex-col gap-4">
              <div className="rounded-xl overflow-hidden border border-outline-variant/70 shadow-md">
                <div className="bg-surface-container-high flex items-center gap-3 px-3 py-2.5 border-b border-outline-variant/50">
                  <div className="flex items-center gap-[5px] shrink-0">
                    <div className="size-2.5 rounded-full bg-ds-error/60" />
                    <div className="size-2.5 rounded-full bg-amber-400/60" />
                    <div className="size-2.5 rounded-full bg-ds-tertiary-action/60" />
                  </div>
                  <div className="flex-1 bg-surface-container rounded-md px-2.5 py-1 text-[10px] text-on-surface-variant font-medium">
                    portalkit.app/{portalSlug}
                  </div>
                </div>
                <div className="px-5 py-4 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #0051d5 0%, #316bf3 100%)' }}>
                  <div className="flex items-center gap-3">
                    {profile.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="" className="size-10 rounded-xl object-cover ring-2 ring-white/25" />
                    ) : (
                      <div className="size-10 rounded-xl bg-white/15 ring-2 ring-white/25 flex items-center justify-center text-white font-bold text-sm">
                        {displayInitials || 'PK'}
                      </div>
                    )}
                    <div>
                      <p className="text-white font-semibold text-sm leading-snug">{displayBusiness}</p>
                      <p className="text-white/60 text-[11px]">{displayTagline}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-surface px-4 py-4 flex flex-col gap-3">
                  <div>
                    <p className="text-xs font-semibold text-on-surface">Welcome back 👋</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">Here's your snapshot with {displayBusiness}.</p>
                  </div>
                  <div className="bg-white rounded-xl border border-outline-variant/50 px-3 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-lg bg-ds-secondary/10 flex items-center justify-center shrink-0">
                        <FileText className="size-3.5 text-ds-secondary" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-on-surface leading-tight">Website Redesign</p>
                        <p className="text-[9px] text-on-surface-variant">INV-001 · Due Jun 15</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[11px] font-bold text-on-surface">$2,400</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold">Pending</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-center text-on-surface-variant">Preview updates live as you fill in your details</p>
          </div>
        </main>
      ) : (
        <main className="max-w-5xl mx-auto w-full px-8 py-14 flex flex-col gap-10">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ds-secondary/10 border border-ds-secondary/20 text-xs font-semibold text-ds-secondary">
              <Zap className="size-3" />
              Choose Your Plan
            </span>
            <h1 className="text-[2.1rem] font-bold text-on-surface tracking-tight leading-tight">
              Simple pricing,<br />powerful features
            </h1>
            <p className="text-sm text-on-surface-variant max-w-sm leading-relaxed">
              Start free, upgrade anytime. All paid plans include a 14-day free trial — no credit card required.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="flex items-center bg-surface-container border border-outline-variant rounded-xl p-1 gap-0.5">
              {(['monthly', 'annual'] as const).map(period => (
                <button key={period} type="button" onClick={() => setBillingPeriod(period)}
                  className={cn('px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2',
                    billingPeriod === period ? 'bg-white text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                  )}>
                  {period === 'monthly' ? 'Monthly' : 'Annually'}
                  {period === 'annual' && (
                    <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-md transition-colors',
                      billingPeriod === 'annual' ? 'bg-ds-tertiary-action/15 text-ds-tertiary-action' : 'bg-outline-variant/40 text-on-surface-variant'
                    )}>Save 20%</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            {PLANS.map(plan => {
              const selected = selectedPlan === plan.id
              const pricing = billingPeriod === 'annual' ? plan.annual : plan.monthly
              const headerStyle =
                plan.id === 'free'
                  ? { background: 'linear-gradient(145deg, #383b50 0%, #505468 100%)' }
                  : plan.id === 'pro'
                  ? { background: 'linear-gradient(145deg, #003299 0%, #0051d5 55%, #2d66f0 100%)' }
                  : { background: 'linear-gradient(145deg, #07111e 0%, #0e1f33 55%, #182e47 100%)' }

              return (
                <button key={plan.id} type="button" onClick={() => setSelectedPlan(plan.id)}
                  className={cn('group flex flex-col text-left rounded-2xl overflow-hidden border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    selected ? 'border-ds-secondary shadow-xl shadow-ds-secondary/15 -translate-y-1.5'
                      : cn('border-outline-variant hover:-translate-y-0.5', plan.popular ? 'hover:shadow-xl hover:shadow-ds-secondary/10' : 'hover:shadow-lg')
                  )}>
                  <div className="flex flex-col gap-4 p-6 pb-5" style={headerStyle}>
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-white/55">{plan.name}</p>
                      {plan.badge && (
                        <span className="inline-flex items-center gap-1 bg-white/15 border border-white/20 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                          <Zap className="size-2" />{plan.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[2.6rem] font-extrabold text-white leading-none tracking-tight">{pricing.display}</span>
                      <span className="text-sm text-white/45 font-medium pb-1">{pricing.period}</span>
                    </div>
                    {billingPeriod === 'annual' && pricing.save ? (
                      <div className="inline-flex items-center gap-1.5 bg-ds-tertiary-action/20 border border-ds-tertiary-action/30 rounded-lg px-2.5 py-1 w-fit">
                        <Check className="size-3 text-ds-tertiary-action" strokeWidth={3} />
                        <span className="text-[11px] font-semibold text-ds-tertiary-action">{pricing.save}</span>
                        <span className="text-[10px] text-white/35">·</span>
                        <span className="text-[10px] text-white/35">{pricing.billed}</span>
                      </div>
                    ) : (
                      plan.annual.save && billingPeriod === 'monthly'
                        ? <p className="text-[11px] text-white/35">Switch to annual and {plan.annual.save.toLowerCase()}</p>
                        : <p className="text-[11px] text-white/35 invisible">–</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-5 p-6 bg-white flex-1">
                    <p className="text-xs text-on-surface-variant leading-relaxed">{plan.description}</p>
                    <ul className="flex flex-col gap-2.5 flex-1">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-start gap-2.5">
                          <span className="size-[18px] rounded-full bg-ds-secondary/10 flex items-center justify-center shrink-0 mt-px">
                            <Check className="size-2.5 text-ds-secondary" strokeWidth={3} />
                          </span>
                          <span className="text-[13px] text-on-surface leading-snug">{f}</span>
                        </li>
                      ))}
                    </ul>
                    <div className={cn('w-full h-10 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all mt-2',
                      selected ? 'bg-ds-secondary text-white'
                        : plan.popular ? 'bg-ds-secondary text-white'
                        : 'bg-surface-container-low border border-outline-variant text-on-surface-variant group-hover:border-ds-secondary/30 group-hover:text-on-surface'
                    )}>
                      {selected ? <><Check className="size-4" strokeWidth={2.5} />Selected</> : plan.cta}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <div className="flex flex-col items-center gap-5 pt-2">
            <button
              disabled={!selectedPlan || isPending}
              onClick={handleFinish}
              className={cn('h-12 px-12 rounded-xl font-semibold text-sm transition-all duration-200',
                selectedPlan && !isPending
                  ? 'bg-ds-secondary text-white hover:bg-ds-secondary-container shadow-md shadow-ds-secondary/20'
                  : 'bg-surface-container text-on-surface-variant cursor-not-allowed border border-outline-variant'
              )}
            >
              {isPending
                ? 'Setting up your account…'
                : selectedPlan
                ? `Continue with ${PLANS.find(p => p.id === selectedPlan)?.name}`
                : 'Select a plan to continue'}
            </button>
            <div className="flex items-center gap-4 text-xs text-on-surface-variant">
              {['No credit card required', 'Cancel anytime', '14-day free trial'].map((t, i) => (
                <React.Fragment key={t}>
                  {i > 0 && <span className="size-1 rounded-full bg-outline-variant shrink-0" />}
                  <span className="flex items-center gap-1.5">
                    <Check className="size-3 text-ds-tertiary-action" strokeWidth={3} />
                    {t}
                  </span>
                </React.Fragment>
              ))}
            </div>
            <button onClick={() => setStep(0)} className="text-xs text-on-surface-variant hover:text-on-surface transition-colors">
              ← Back to profile setup
            </button>
          </div>
        </main>
      )}
    </div>
  )
}

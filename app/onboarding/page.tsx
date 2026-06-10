'use client'

import { cn } from '@/lib/utils'
import { Check, CreditCard, ExternalLink, FileText, Layers, Loader2, Lock, Users } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { saveFullName, skipStripeConnect, finishOnboarding } from './onboard-actions'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

export default function OnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawStep = parseInt(searchParams.get('step') ?? '0', 10)
  const initialStep = isNaN(rawStep) ? 0 : Math.min(Math.max(rawStep, 0), 2)

  const [step, setStep]             = useState(initialStep)
  const [fullName, setFullName]     = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [error, setError]           = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [stripeLoading, setStripeLoading] = useState(false)

  // ── Live preview values (step 0) ────────────────────────────────────────
  const displayName    = fullName.trim() || 'Your Name'
  const displayInitials = displayName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  const portalSlug     = toSlug(fullName || 'yourname')

  // ── Step 0: save name + advance ─────────────────────────────────────────
  async function handleStep0() {
    if (!fullName.trim()) { setError('Please enter your name.'); return }
    setError(null)
    startTransition(async () => {
      try {
        await saveFullName(fullName)
        setStep(1)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong.')
      }
    })
  }

  // ── Step 1: launch Stripe Connect ───────────────────────────────────────
  async function handleConnectStripe() {
    setStripeLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/billing/stripe-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: 'onboarding' }),
      })
      if (!res.ok) throw new Error('Failed to start Stripe onboarding.')
      const { url } = await res.json()
      window.location.href = url
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
      setStripeLoading(false)
    }
  }

  // ── Step 1: skip Stripe ─────────────────────────────────────────────────
  async function handleSkipStripe() {
    setError(null)
    startTransition(async () => {
      try {
        await skipStripeConnect()
        setStep(2)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong.')
      }
    })
  }

  // ── Step 2: create first client + finish ────────────────────────────────
  async function handleCreateClient(e: React.FormEvent) {
    e.preventDefault()
    if (!clientName.trim()) { setError('Client name is required.'); return }
    setError(null)
    startTransition(async () => {
      try {
        const slug = toSlug(clientName) || 'client'
        const res = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: clientName.trim(), email: clientEmail.trim(), portal_slug: slug }),
        })

        let clientId: string | null = null
        if (res.ok) {
          const data = await res.json()
          clientId = data.id
        } else if (res.status === 409) {
          // Slug taken — append timestamp suffix and retry
          const slugFallback = `${slug}-${Date.now().toString(36)}`
          const retry = await fetch('/api/clients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: clientName.trim(), email: clientEmail.trim(), portal_slug: slugFallback }),
          })
          if (retry.ok) clientId = (await retry.json()).id
          else throw new Error('Could not create client. Please try again.')
        } else {
          const d = await res.json()
          throw new Error(d.error ?? 'Failed to create client.')
        }

        await finishOnboarding()
        await createClient().auth.refreshSession()
        router.push(clientId ? `/dashboard/clients/${clientId}` : '/dashboard')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong.')
      }
    })
  }

  // ── Step 2: skip client creation ─────────────────────────────────────────
  async function handleSkipClient() {
    setError(null)
    startTransition(async () => {
      try {
        await finishOnboarding()
        await createClient().auth.refreshSession()
        router.push('/dashboard')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong.')
      }
    })
  }

  return (
    <div className="min-h-screen bg-surface">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 bg-surface/80 backdrop-blur-sm z-10 border-b border-outline-variant">
        <div className="flex items-center justify-between px-8 py-3.5 max-w-6xl mx-auto w-full">
          <Link href="/" className="flex items-center gap-2.5 shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span className="flex items-center justify-center size-8 rounded-md bg-ds-secondary shrink-0">
              <Layers className="size-4.5 text-white" strokeWidth={1.75} />
            </span>
            <span className="font-bold text-lg tracking-tight text-on-surface">PortalKit</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-on-surface-variant tabular-nums">Step {step + 1} of 3</span>
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-500',
                    step > i ? 'w-8 bg-ds-secondary' : step === i ? 'w-8 bg-ds-secondary' : 'w-5 bg-outline-variant'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── Step 0: Name ────────────────────────────────────────────────────── */}
      {step === 0 && (
        <main className="max-w-6xl mx-auto w-full px-8 py-14 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-14 lg:gap-20 items-start">

          {/* Form */}
          <div className="flex flex-col gap-9 max-w-md">
            <div className="flex flex-col gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ds-secondary/10 border border-ds-secondary/20 w-fit text-xs font-semibold text-ds-secondary">
                <span className="size-1.5 rounded-full bg-ds-secondary inline-block" />
                Getting started
              </span>
              <h1 className="text-[1.85rem] font-bold text-on-surface tracking-tight leading-[1.2]">
                What should we<br />call you?
              </h1>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                This is how you appear to clients across invoices, portals, and emails.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="full-name" className="font-semibold text-on-surface text-sm">
                Your name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="full-name"
                type="text"
                placeholder="Jane Smith"
                value={fullName}
                onChange={e => { setFullName(e.target.value); setError(null) }}
                onKeyDown={e => e.key === 'Enter' && handleStep0()}
                autoFocus
                className="h-10"
              />
              <p className="text-xs text-on-surface-variant">
                You can add a business name, logo, and tagline from Settings after sign-up.
              </p>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex flex-col gap-3">
              <button
                onClick={handleStep0}
                disabled={isPending}
                className="w-full h-11 rounded-xl bg-ds-secondary hover:bg-ds-secondary-container text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isPending ? <><Loader2 className="size-4 animate-spin" />Saving…</> : 'Continue →'}
              </button>
              <div className="flex items-center justify-center gap-1.5">
                <Lock className="size-3 text-on-surface-variant" />
                <p className="text-xs text-on-surface-variant">Your data is encrypted and never shared</p>
              </div>
            </div>
          </div>

          {/* Live preview */}
          <div className="sticky top-24 hidden lg:flex flex-col gap-3">
            <div className="flex items-center gap-2 px-1">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ds-tertiary-action opacity-60" />
                <span className="relative inline-flex rounded-full size-2 bg-ds-tertiary-action" />
              </span>
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Live Preview</p>
            </div>
            <div className="rounded-2xl bg-surface-container-low border border-outline-variant p-4">
              <div className="rounded-xl overflow-hidden border border-outline-variant/70 shadow-md">
                <div className="bg-surface-container-high flex items-center gap-3 px-3 py-2.5 border-b border-outline-variant/50">
                  <div className="flex items-center gap-1.25 shrink-0">
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
                    <div className="size-10 rounded-xl bg-white/15 ring-2 ring-white/25 flex items-center justify-center text-white font-bold text-sm">
                      {displayInitials}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm leading-snug">{displayName}</p>
                      <p className="text-white/60 text-[11px]">Client portal</p>
                    </div>
                  </div>
                </div>
                <div className="bg-surface px-4 py-4 flex flex-col gap-3">
                  <div>
                    <p className="text-xs font-semibold text-on-surface">Welcome back 👋</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">Here's your snapshot with {displayName}.</p>
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
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold">Pending</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-center text-on-surface-variant">Preview updates as you type</p>
          </div>
        </main>
      )}

      {/* ── Step 1: Stripe Connect ──────────────────────────────────────────── */}
      {step === 1 && (
        <main className="flex-1 flex items-center justify-center px-8 py-14">
          <div className="w-full max-w-md flex flex-col gap-8">

            {/* Icon */}
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="size-16 rounded-2xl bg-ds-secondary/10 border border-ds-secondary/15 flex items-center justify-center">
                <CreditCard className="size-8 text-ds-secondary" />
              </div>
              <div className="space-y-1.5">
                <h1 className="text-2xl font-bold text-on-surface tracking-tight">Get paid through your portals</h1>
                <p className="text-sm text-on-surface-variant leading-relaxed max-w-sm mx-auto">
                  Connect Stripe so clients can pay invoices directly — no chasing, no back-and-forth.
                </p>
              </div>
            </div>

            {/* Benefits */}
            <div className="rounded-xl border border-outline-variant bg-surface-container-low p-5 space-y-3">
              {[
                'Clients pay invoices with a single click',
                'Payments land in your bank within 2 business days',
                'Invoice status updates automatically when paid',
              ].map(b => (
                <div key={b} className="flex items-start gap-3">
                  <span className="size-5 rounded-full bg-ds-secondary/10 border border-ds-secondary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="size-3 text-ds-secondary" strokeWidth={3} />
                  </span>
                  <span className="text-sm text-on-surface leading-snug">{b}</span>
                </div>
              ))}
            </div>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            {/* CTAs */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleConnectStripe}
                disabled={stripeLoading || isPending}
                className="w-full h-11 rounded-xl bg-ds-secondary hover:bg-ds-secondary-container text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {stripeLoading ? (
                  <><Loader2 className="size-4 animate-spin" />Redirecting to Stripe…</>
                ) : (
                  <><ExternalLink className="size-4" />Connect Stripe</>
                )}
              </button>
              <button
                onClick={handleSkipStripe}
                disabled={stripeLoading || isPending}
                className="w-full h-10 rounded-xl border border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-outline transition-colors text-sm font-medium disabled:opacity-50"
              >
                {isPending ? <Loader2 className="size-4 animate-spin mx-auto" /> : "Skip for now — I'll set this up later"}
              </button>
            </div>

            <p className="text-center text-xs text-on-surface-variant/60">
              Takes about 2 minutes. You can also connect Stripe later from{' '}
              <span className="font-medium">Settings → Billing</span>.
            </p>

          </div>
        </main>
      )}

      {/* ── Step 2: Create First Client ─────────────────────────────────────── */}
      {step === 2 && (
        <main className="flex-1 flex items-center justify-center px-8 py-14">
          <div className="w-full max-w-md flex flex-col gap-8">

            {/* Header */}
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="size-16 rounded-2xl bg-ds-secondary/10 border border-ds-secondary/15 flex items-center justify-center">
                <Users className="size-8 text-ds-secondary" />
              </div>
              <div className="space-y-1.5">
                <h1 className="text-2xl font-bold text-on-surface tracking-tight">Add your first client</h1>
                <p className="text-sm text-on-surface-variant leading-relaxed max-w-sm mx-auto">
                  Create a portal for your first client. You can share the link as soon as you're done.
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateClient} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="client-name" className="font-semibold text-on-surface text-sm">
                  Client name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="client-name"
                  type="text"
                  placeholder="Acme Corp"
                  value={clientName}
                  onChange={e => { setClientName(e.target.value); setError(null) }}
                  autoFocus
                  className="h-10"
                />
                {clientName.trim() && (
                  <p className="text-xs text-on-surface-variant">
                    Portal URL: <span className="font-mono text-ds-secondary">portalkit.app/p/{toSlug(clientName)}</span>
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="client-email" className="font-semibold text-on-surface text-sm">
                  Client email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="client-email"
                  type="email"
                  placeholder="client@example.com"
                  value={clientEmail}
                  onChange={e => { setClientEmail(e.target.value); setError(null) }}
                  className="h-10"
                />
                <p className="text-xs text-on-surface-variant">Used to send them their portal access link.</p>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={isPending}
                className="w-full h-11 rounded-xl bg-ds-secondary hover:bg-ds-secondary-container text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isPending ? <><Loader2 className="size-4 animate-spin" />Creating portal…</> : 'Create portal →'}
              </button>
            </form>

            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleSkipClient}
                disabled={isPending}
                className="text-sm text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-50"
              >
                I'll do this later → go to dashboard
              </button>
            </div>

          </div>
        </main>
      )}

    </div>
  )
}

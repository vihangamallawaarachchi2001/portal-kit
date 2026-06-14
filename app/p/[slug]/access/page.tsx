'use client'

import { useState, useTransition, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Layers, Loader2, CheckCircle, Mail, ArrowRight, AlertCircle } from 'lucide-react'
import { getInitials } from '@/lib/format'

interface Branding {
  businessName: string
  tagline: string | null
  avatarUrl: string | null
  hideBranding: boolean
}

export default function PortalAccessPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const token = searchParams.get('token')

  const [, startTransition] = useTransition()
  const [tokenStatus, setTokenStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>(
    token ? 'verifying' : 'idle'
  )
  const [tokenError, setTokenError] = useState('')

  const [email, setEmail] = useState('')
  const [requestStatus, setRequestStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [requestError, setRequestError] = useState('')

  const [branding, setBranding] = useState<Branding | null>(null)

  // Fetch public branding
  useEffect(() => {
    fetch(`/api/portal/${slug}/branding`)
      .then(r => r.json())
      .then(d => d.data && setBranding(d.data))
      .catch(() => {})
  }, [slug])

  // Auto-verify token if present
  useEffect(() => {
    if (!token) return
    setTokenStatus('verifying')
    startTransition(async () => {
      const res = await fetch('/api/portal/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, slug }),
      })
      if (res.ok) {
        setTokenStatus('success')
        setTimeout(() => router.push(`/p/${slug}`), 1200)
      } else {
        const d = await res.json().catch(() => ({}))
        setTokenStatus('error')
        setTokenError(d.error ?? 'Invalid or expired link')
      }
    })
  }, [token, slug, router])

  function handleRequestAccess(e: React.FormEvent) {
    e.preventDefault()
    if (!email || requestStatus === 'sending') return
    setRequestStatus('sending')
    setRequestError('')
    startTransition(async () => {
      const res = await fetch(`/api/portal/${slug}/request-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setRequestStatus('sent')
      } else {
        const d = await res.json().catch(() => ({}))
        setRequestError(d.error ?? 'Something went wrong. Please try again.')
        setRequestStatus('error')
      }
    })
  }

  // ── Token verifying / success screens ───────────────────────────────────
  if (tokenStatus === 'verifying') {
    return (
      <Screen>
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="size-16 rounded-2xl bg-ds-secondary/10 flex items-center justify-center">
            <Loader2 className="size-8 text-ds-secondary animate-spin" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-on-surface">Verifying your link…</p>
            <p className="text-sm text-on-surface-variant mt-1">Just a moment</p>
          </div>
        </div>
      </Screen>
    )
  }

  if (tokenStatus === 'success') {
    return (
      <Screen>
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="size-16 rounded-2xl bg-green-50 flex items-center justify-center">
            <CheckCircle className="size-8 text-green-500" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-on-surface">Access granted!</p>
            <p className="text-sm text-on-surface-variant mt-1">Redirecting to your portal…</p>
          </div>
        </div>
      </Screen>
    )
  }

  // ── Main access page ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f4f6fa' }}>
      {/* Top brand bar */}
      <header className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="max-w-sm mx-auto flex items-center gap-2.5">
          {branding?.avatarUrl ? (
            <img
              src={branding.avatarUrl}
              alt=""
              className="size-8 rounded-xl object-cover"
            />
          ) : (
            <div className="size-8 rounded-xl bg-ds-secondary flex items-center justify-center">
              {branding ? (
                <span className="text-[11px] font-bold text-white">{getInitials(branding.businessName)}</span>
              ) : (
                <Layers className="size-4 text-white" />
              )}
            </div>
          )}
          <div>
            <p className="text-sm font-bold text-on-surface leading-tight">
              {branding?.businessName ?? 'PortalKit'}
            </p>
            {branding?.tagline && (
              <p className="text-[11px] text-on-surface-variant leading-tight">{branding.tagline}</p>
            )}
          </div>
        </div>
      </header>

      {/* Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">

          {/* Token error banner */}
          {tokenStatus === 'error' && (
            <div className="mb-4 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
              <AlertCircle className="size-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700">{tokenError}</p>
                <p className="text-xs text-red-500 mt-0.5">Request a fresh link below.</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header strip */}
            <div
              className="px-8 py-7 text-center"
              style={{ background: 'linear-gradient(135deg, #0051d5 0%, #316bf3 100%)' }}
            >
              <div className="size-14 rounded-2xl bg-white/20 ring-2 ring-white/30 flex items-center justify-center mx-auto mb-4">
                <Layers className="size-7 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Access your portal</h1>
              <p className="text-sm text-white/70 mt-1">
                {branding ? `Your workspace with ${branding.businessName}` : 'Your client workspace'}
              </p>
            </div>

            {/* Body */}
            <div className="px-8 py-7">
              {requestStatus === 'sent' ? (
                <div className="flex flex-col items-center gap-4 py-4 text-center">
                  <div className="size-14 rounded-2xl bg-green-50 flex items-center justify-center">
                    <Mail className="size-7 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface">Check your inbox</p>
                    <p className="text-sm text-on-surface-variant mt-1.5">
                      If we found an account for <strong>{email}</strong>, a magic link is on its way. It expires in 24 hours.
                    </p>
                  </div>
                  <button
                    onClick={() => { setRequestStatus('idle'); setEmail('') }}
                    className="text-sm text-ds-secondary hover:underline"
                  >
                    Try a different email
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-on-surface-variant text-center mb-6">
                    Enter your email and we'll send you a magic link — no password needed.
                  </p>

                  <form onSubmit={handleRequestAccess} className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-on-surface" htmlFor="portal-email">
                        Email address
                      </label>
                      <input
                        id="portal-email"
                        type="email"
                        value={email}
                        onChange={e => { setEmail(e.target.value); if (requestStatus === 'error') setRequestStatus('idle') }}
                        placeholder="you@example.com"
                        required
                        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-ds-secondary/30 focus:border-ds-secondary"
                      />
                    </div>

                    {requestStatus === 'error' && requestError && (
                      <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        {requestError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={requestStatus === 'sending' || !email}
                      className="flex items-center justify-center gap-2 h-10 w-full rounded-lg bg-ds-secondary text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {requestStatus === 'sending' ? (
                        <><Loader2 className="size-4 animate-spin" />Sending…</>
                      ) : (
                        <>Send magic link <ArrowRight className="size-4" /></>
                      )}
                    </button>
                  </form>

                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <p className="text-xs text-on-surface-variant text-center">
                      Don't have a portal? Contact{' '}
                      {branding?.businessName ?? 'your freelancer'} to get set up.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {!branding?.hideBranding && (
            <p className="text-center text-[11px] text-on-surface-variant mt-5">
              Secured by PortalKit · Links expire after 24 hours
            </p>
          )}
        </div>
      </main>
    </div>
  )
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f4f6fa' }}>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-10 py-8 w-full max-w-xs">
        {children}
      </div>
    </div>
  )
}

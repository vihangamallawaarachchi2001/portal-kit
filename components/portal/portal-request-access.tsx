'use client'

import { useState, useTransition } from 'react'
import { Layers, Loader2, Mail, ArrowRight, AlertCircle } from 'lucide-react'
import { getInitials } from '@/lib/format'

interface Branding {
  businessName: string
  tagline: string | null
  avatarUrl: string | null
  hideBranding: boolean
}

interface Props {
  slug: string
  branding: Branding
  /** Show an extra message when the cookie was present but the client record was not found (e.g. portal deleted / wrong device) */
  staleCookie?: boolean
}

export function PortalRequestAccessScreen({ slug, branding, staleCookie }: Props) {
  const [, startTransition] = useTransition()
  const [email, setEmail]   = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || status === 'sending') return
    setStatus('sending')
    startTransition(async () => {
      await fetch(`/api/portal/${slug}/request-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setStatus('sent')
    })
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f4f6fa' }}>

      {/* Brand bar */}
      <header className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="max-w-sm mx-auto flex items-center gap-2.5">
          {branding.avatarUrl ? (
            <img src={branding.avatarUrl} alt="" className="size-8 rounded-xl object-cover" />
          ) : (
            <div className="size-8 rounded-xl bg-ds-secondary flex items-center justify-center shrink-0">
              <span className="text-[11px] font-bold text-white">{getInitials(branding.businessName)}</span>
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-bold text-on-surface leading-tight truncate">{branding.businessName}</p>
            {branding.tagline && (
              <p className="text-[11px] text-on-surface-variant leading-tight truncate">{branding.tagline}</p>
            )}
          </div>
        </div>
      </header>

      {/* Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">

          {staleCookie && (
            <div className="mb-4 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <AlertCircle className="size-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">
                Your session has expired or this portal is no longer available on this device. Request a new link below.
              </p>
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
                Your workspace with {branding.businessName}
              </p>
            </div>

            {/* Body */}
            <div className="px-8 py-7">
              {status === 'sent' ? (
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
                    onClick={() => { setStatus('idle'); setEmail('') }}
                    className="text-sm text-ds-secondary hover:underline"
                  >
                    Try a different email
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-on-surface-variant text-center mb-6">
                    Enter your email and we&apos;ll send you a magic link — no password needed.
                  </p>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-on-surface" htmlFor="portal-email">
                        Email address
                      </label>
                      <input
                        id="portal-email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-ds-secondary/30 focus:border-ds-secondary"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={status === 'sending' || !email}
                      className="flex items-center justify-center gap-2 h-10 w-full rounded-lg bg-ds-secondary text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {status === 'sending' ? (
                        <><Loader2 className="size-4 animate-spin" />Sending…</>
                      ) : (
                        <>Send magic link <ArrowRight className="size-4" /></>
                      )}
                    </button>
                  </form>
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <p className="text-xs text-on-surface-variant text-center">
                      Don&apos;t have a portal? Contact {branding.businessName} to get set up.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {!branding.hideBranding && (
            <p className="text-center text-[11px] text-on-surface-variant mt-5">
              Secured by PortalKit · Links expire after 24 hours
            </p>
          )}
        </div>
      </main>
    </div>
  )
}

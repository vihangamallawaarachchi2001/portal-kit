'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Layers, ArrowRight, CheckCircle2, Check, FileText, CreditCard, FolderOpen, MessageSquare, BarChart2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'

/* ─── Portal preview data (purely decorative) ───────────────────── */

const PREVIEW_FILES = [
  { name: 'Logo_v3_FINAL.fig',      ext: 'FIG', size: '2.4 MB', approved: true  },
  { name: 'Brand_Guidelines.pdf',   ext: 'PDF', size: '8.1 MB', approved: false },
  { name: 'Social_Kit_v2.zip',      ext: 'ZIP', size: '14 MB',  approved: true  },
]

const PREVIEW_STATS = [
  { icon: FolderOpen,  label: 'Files',     value: '12'    },
  { icon: CreditCard,  label: 'Invoiced',  value: '$6.4k' },
  { icon: FileText,    label: 'Approvals', value: '3'     },
]

/* ─── Google SVG icon ───────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

/* ─── Decorative portal preview ─────────────────────────────────── */
function PortalPreview() {
  return (
    <div className="relative select-none">

      {/* Floating "Invoice paid" badge */}
      <div
        className="absolute -top-3.5 -right-3.5 z-10 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-gray-800 shadow-xl"
        style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}
      >
        <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
        Invoice paid · $3,200
      </div>

      {/* Main portal card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 32px 64px -12px rgba(0,0,0,0.5)',
        }}
      >
        {/* Portal header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-extrabold shrink-0"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #0051D5)' }}
            >
              A
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-none">Acme Studio</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>Brand Refresh 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.38)' }}>Live</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {PREVIEW_STATS.map(({ icon: Icon, label, value }, i) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1.5 px-4 py-3.5"
              style={i < 2 ? { borderRight: '1px solid rgba(255,255,255,0.06)' } : {}}
            >
              <Icon size={13} strokeWidth={1.75} style={{ color: 'rgba(255,255,255,0.28)' }} />
              <span className="text-[15px] font-extrabold text-white leading-none">{value}</span>
              <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* File list */}
        <div className="px-5 pt-4 pb-1">
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] mb-3" style={{ color: 'rgba(255,255,255,0.28)' }}>
            Recent files
          </p>
          {PREVIEW_FILES.map((file, i) => (
            <div
              key={file.name}
              className="flex items-center justify-between py-2.5"
              style={i < PREVIEW_FILES.length - 1 ? { borderBottom: '1px solid rgba(255,255,255,0.05)' } : {}}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-7 h-7 rounded flex items-center justify-center text-[9px] font-bold shrink-0"
                  style={{ background: 'rgba(0,81,213,0.18)', color: '#93c5fd' }}
                >
                  {file.ext}
                </div>
                <span className="text-[12px] font-medium truncate" style={{ color: 'rgba(255,255,255,0.62)' }}>
                  {file.name}
                </span>
              </div>
              <span
                className="shrink-0 ml-3 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={
                  file.approved
                    ? { background: 'rgba(34,197,94,0.12)', color: '#4ade80' }
                    : { background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }
                }
              >
                {file.approved ? '✓ Approved' : '⏳ Review'}
              </span>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BarChart2 size={11} strokeWidth={2} style={{ color: 'rgba(255,255,255,0.3)' }} />
              <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>Project progress</span>
            </div>
            <span className="text-[11px] font-bold text-white">68%</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full"
              style={{ width: '68%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }}
            />
          </div>
        </div>
      </div>

      {/* Floating message card below */}
      <div
        className="mt-3.5 flex items-center gap-2.5 px-4 py-3 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <MessageSquare size={13} strokeWidth={1.75} style={{ color: 'rgba(255,255,255,0.28)' }} />
        <p className="text-[12px] italic" style={{ color: 'rgba(255,255,255,0.42)' }}>
          "My clients keep asking how I built this — it's just PortalKit."
        </p>
      </div>

      {/* Feature pills */}
      <div className="mt-4 flex flex-wrap gap-2">
        {['Magic link sign-in', 'No password', 'Free to start'].map(f => (
          <span
            key={f}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Check size={9} strokeWidth={3} style={{ color: '#60a5fa' }} />
            {f}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ─── Main page ─────────────────────────────────────────────────── */
export default function AuthPage() {
  const searchParams = useSearchParams()
  const urlError = searchParams.get('error')
  const next = searchParams.get('next') ?? ''

  const [email, setEmail]               = useState('')
  const [submitted, setSubmitted]       = useState(false)
  const [error, setError]               = useState<string | null>(urlError)
  const [loading, setLoading]           = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleGoogleSignIn() {
    setGoogleLoading(true)
    setError(null)
    const supabase = createClient()
    const callbackUrl = new URL(`${window.location.origin}/auth/callback`)
    if (next) callbackUrl.searchParams.set('next', next)
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl.toString() },
    })
    if (oauthError) {
      setError(oauthError.message)
      setGoogleLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const callbackUrl = new URL(`${window.location.origin}/auth/callback`)
    if (next) callbackUrl.searchParams.set('next', next)
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callbackUrl.toString() },
    })
    if (otpError) {
      setError(otpError.message)
    } else {
      setSubmitted(true)
    }
    setLoading(false)
  }

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ background: '#060b18' }}
    >

      {/* ── Background layers ──────────────────────────────────── */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        {/* Dot grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.028) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Blue orb — upper left */}
        <div
          className="absolute -top-40 -left-40 w-[700px] h-[700px]"
          style={{ background: 'radial-gradient(ellipse at center, rgba(0,81,213,0.13) 0%, transparent 68%)' }}
        />
        {/* Purple orb — lower right */}
        <div
          className="absolute -bottom-40 -right-20 w-[500px] h-[500px]"
          style={{ background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.07) 0%, transparent 65%)' }}
        />
        {/* Top edge accent */}
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(0,81,213,0.5), transparent)' }}
        />
      </div>

      {/* ── Top bar ────────────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <span
            className="flex items-center justify-center size-8 rounded-lg shrink-0 transition-opacity group-hover:opacity-90"
            style={{ background: '#0051D5' }}
          >
            <Layers className="size-4.5 text-white" strokeWidth={1.75} />
          </span>
          <span className="font-bold text-white tracking-tight">PortalKit</span>
        </Link>
        <Link
          href="/"
          className="text-sm transition-colors"
          style={{ color: 'rgba(255,255,255,0.38)' }}
          onMouseOver={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
          onMouseOut={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.38)')}
        >
          ← Back to home
        </Link>
      </header>

      {/* ── Main content ───────────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-5xl grid lg:grid-cols-[1fr_440px] gap-16 xl:gap-24 items-center">

          {/* Left: portal preview (desktop only) */}
          <div className="hidden lg:block">
            <div className="mb-8 space-y-3">
              <p
                className="text-[11px] font-bold uppercase tracking-[0.15em]"
                style={{ color: '#6B9EFF' }}
              >
                The client portal for freelancers
              </p>
              <h2
                className="font-extrabold text-white leading-[1.08] tracking-tight"
                style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)' }}
              >
                One portal link.<br />
                <span
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #60a5fa, #93c5fd)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Happy clients.
                </span>
              </h2>
              <p className="text-base leading-relaxed max-w-sm" style={{ color: 'rgba(255,255,255,0.48)' }}>
                Files, invoices, approvals, and messaging — all in one branded space your clients will actually use.
              </p>
            </div>
            <PortalPreview />
          </div>

          {/* Right: auth form card */}
          <div>
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: '#ffffff',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.06), 0 24px 48px -12px rgba(0,0,0,0.28)',
              }}
            >
              {/* Blue top accent */}
              <div className="h-1" style={{ background: 'linear-gradient(90deg, #0051D5, #3b82f6, #60a5fa)' }} />

              <div className="px-8 py-8">

                {submitted ? (
                  /* ── Success state ── */
                  <div className="py-4 text-center space-y-5">
                    <div className="flex justify-center">
                      <span
                        className="flex items-center justify-center size-16 rounded-full"
                        style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}
                      >
                        <CheckCircle2 className="size-8" style={{ color: '#16a34a' }} strokeWidth={1.75} />
                      </span>
                    </div>
                    <div className="space-y-2">
                      <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Check your inbox</h1>
                      <p className="text-sm text-gray-500">We sent a sign-in link to</p>
                      <p className="text-sm font-bold text-[#0051D5] break-all">{email}</p>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      The link expires in 10 minutes. Can&apos;t find it? Check spam, or{' '}
                      <button
                        onClick={() => { setSubmitted(false); setError(null) }}
                        className="text-[#0051D5] underline underline-offset-2 hover:text-blue-700 transition-colors"
                      >
                        try again
                      </button>
                      .
                    </p>
                  </div>
                ) : (
                  /* ── Form state ── */
                  <>
                    {/* Header */}
                    <div className="mb-7">
                      <div
                        className="inline-flex items-center justify-center size-11 rounded-xl mb-5"
                        style={{ background: 'rgba(0,81,213,0.08)' }}
                      >
                        <Layers size={22} strokeWidth={1.75} style={{ color: '#0051D5' }} />
                      </div>
                      <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-tight">
                        Sign in to PortalKit
                      </h1>
                      <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                        No password — we&apos;ll email you a secure link.
                      </p>
                    </div>

                    {/* Google button */}
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={googleLoading || loading}
                      className="w-full h-11 flex items-center justify-center gap-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                      style={{
                        background: '#fff',
                        border: '1px solid #e5e7eb',
                        color: '#111827',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      }}
                      onMouseOver={e => { if (!googleLoading && !loading) e.currentTarget.style.background = '#f9fafb' }}
                      onMouseOut={e => { e.currentTarget.style.background = '#fff' }}
                    >
                      {googleLoading ? (
                        <svg className="size-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                        </svg>
                      ) : (
                        <GoogleIcon />
                      )}
                      Continue with Google
                    </button>

                    {/* Divider */}
                    <div className="relative my-5">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-100" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white px-3 text-xs text-gray-400">or continue with email</span>
                      </div>
                    </div>

                    {/* Email form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                          Email address
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                          autoFocus
                          className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all"
                          style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)' }}
                          onFocus={e => {
                            e.currentTarget.style.borderColor = '#0051D5'
                            e.currentTarget.style.background = '#fff'
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,81,213,0.1)'
                          }}
                          onBlur={e => {
                            e.currentTarget.style.borderColor = '#e5e7eb'
                            e.currentTarget.style.background = '#f9fafb'
                            e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.04)'
                          }}
                        />
                      </div>

                      {error && (
                        <div
                          className="rounded-xl px-4 py-3"
                          style={{ background: '#fef2f2', border: '1px solid #fecaca' }}
                        >
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-11 flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all disabled:opacity-70"
                        style={{
                          background: '#0051D5',
                          color: '#fff',
                          boxShadow: '0 4px 14px rgba(0,81,213,0.35)',
                        }}
                        onMouseOver={e => { if (!loading) e.currentTarget.style.background = '#003db5' }}
                        onMouseOut={e => { e.currentTarget.style.background = '#0051D5' }}
                      >
                        {loading ? (
                          <>
                            <svg className="size-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                            </svg>
                            Sending link…
                          </>
                        ) : (
                          <>
                            Send magic link
                            <ArrowRight size={15} strokeWidth={2.5} />
                          </>
                        )}
                      </button>
                    </form>

                    {/* Footer note */}
                    <p className="mt-6 text-center text-[11px] text-gray-400 leading-relaxed">
                      No account needed — enter your email to get started.{' '}
                      <Link href="/privacy" className="text-[#0051D5] hover:underline underline-offset-2">
                        Privacy policy
                      </Link>
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Trust chips below card (mobile visible) */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {['Free forever plan', '14-day trial on paid', 'Cancel anytime'].map(t => (
                <span
                  key={t}
                  className="flex items-center gap-1.5 text-[11px]"
                  style={{ color: 'rgba(255,255,255,0.32)' }}
                >
                  <Check size={10} strokeWidth={2.5} style={{ color: '#6B9EFF' }} />
                  {t}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>

    </main>
  )
}

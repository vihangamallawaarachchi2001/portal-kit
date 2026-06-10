'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Layers, Check, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useSearchParams } from 'next/navigation'

const FEATURES = [
  'Branded client portal — your name, your domain',
  'Share files and collect approvals without email threads',
  'Send invoices and track payments in one place',
]

const TESTIMONIAL = {
  quote: "My clients keep asking how I built this. I just tell them it's how I work.",
  name: 'Sarah M.',
  role: 'Brand designer, 6 years freelancing',
  initials: 'SM',
}

export default function AuthPage() {
  const searchParams = useSearchParams()
  const urlError = searchParams.get('error')
  const next = searchParams.get('next') ?? ''

  const [email, setEmail]           = useState('')
  const [submitted, setSubmitted]   = useState(false)
  const [error, setError]           = useState<string | null>(urlError)
  const [loading, setLoading]       = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleGoogleSignIn() {
    setGoogleLoading(true)
    setError(null)
    const supabase = createClient()
    const callbackUrl = new URL(`${window.location.origin}/auth/callback`)
    if (next) callbackUrl.searchParams.set('next', next)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl.toString() },
    })
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
    // On success the browser redirects — no cleanup needed
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    // Thread `next` through so the callback can redirect back to the original page
    const callbackUrl = new URL(`${window.location.origin}/auth/callback`)
    if (next) callbackUrl.searchParams.set('next', next)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: callbackUrl.toString(),
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSubmitted(true)
    }

    setLoading(false)
  }

  return (
    <>
      {/* <Header /> */}

      <main className="flex-1 flex flex-col">
        <div className="flex flex-1 min-h-[calc(100vh-4rem)]">

          {/* ── Left panel — dark visual ───────────────────────── */}
          <div className="hidden lg:flex flex-col justify-between w-[55%] bg-[#080d1a] relative overflow-hidden p-12">

            {/* Dot grid */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            />

            {/* Blue radial glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 overflow-hidden flex items-start justify-center"
              style={{ paddingTop: '20%' }}
            >
              <div
                style={{
                  width: '700px',
                  height: '400px',
                  borderRadius: '50%',
                  background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.22) 0%, transparent 70%)',
                }}
              />
            </div>

            {/* Logo */}
            <div className="relative">
              <Link href="/" className="inline-flex items-center gap-2.5">
                <span className="flex items-center justify-center size-9 rounded-lg bg-blue-600 shrink-0">
                  <Layers className="size-5 text-white" strokeWidth={1.75} />
                </span>
                <span className="font-bold text-xl text-white tracking-tight">PortalKit</span>
              </Link>
            </div>

            {/* Headline + feature list */}
            <div className="relative space-y-10">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold text-white leading-tight tracking-tight">
                  One portal link.<br />
                  <span className="bg-linear-to-r from-blue-400 via-blue-300 to-sky-400 bg-clip-text text-transparent">
                    Happy clients.
                  </span>
                </h2>
                <p className="text-base text-white/60 leading-relaxed max-w-sm">
                  Stop managing projects across five different tools. PortalKit
                  brings everything your clients need into one professional space.
                </p>
              </div>

              <ul className="space-y-3">
                {FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-3">
                    <span className="mt-0.5 flex items-center justify-center size-5 rounded-full bg-blue-600/20 border border-blue-500/30 shrink-0">
                      <Check size={11} className="text-blue-400" strokeWidth={2.5} />
                    </span>
                    <span className="text-sm text-white/75 leading-snug">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Testimonial card */}
            <div className="relative">
              <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 space-y-4">
                <p className="text-sm text-white/80 leading-relaxed italic">
                  "{TESTIMONIAL.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {TESTIMONIAL.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{TESTIMONIAL.name}</p>
                    <p className="text-xs text-white/50">{TESTIMONIAL.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right panel — form ─────────────────────────────── */}
          <div className="flex-1 flex items-center justify-center bg-surface px-6 py-12">
            <div className="w-full max-w-sm space-y-8">

              {/* Mobile-only logo */}
              <div className="lg:hidden flex justify-center">
                <Link href="/" className="inline-flex items-center gap-2.5">
                  <span className="flex items-center justify-center size-8 rounded-md bg-blue-600 shrink-0">
                    <Layers className="size-4.5 text-white" strokeWidth={1.75} />
                  </span>
                  <span className="font-bold text-lg text-on-surface tracking-tight">PortalKit</span>
                </Link>
              </div>

              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface transition-colors group"
              >
                <ArrowLeft size={15} strokeWidth={2} className="group-hover:-translate-x-0.5 transition-transform" />
                Back to home
              </Link>

              {submitted ? (
                /* ── Success state ── */
                <div className="text-center space-y-5">
                  <div className="flex justify-center">
                    <span className="flex items-center justify-center size-14 rounded-full bg-ds-tertiary-action/10 border border-ds-tertiary-action/25">
                      <CheckCircle2 className="size-7 text-ds-tertiary-action" strokeWidth={1.75} />
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <h1 className="text-xl font-bold text-on-surface">Check your inbox</h1>
                    <p className="text-sm text-on-surface-variant">
                      We sent a sign-in link to
                    </p>
                    <p className="text-sm font-semibold text-ds-secondary break-all">{email}</p>
                  </div>
                  <p className="text-xs text-on-surface-variant/70 leading-relaxed">
                    Can't find it? Check your spam folder, or{' '}
                    <button
                      onClick={() => { setSubmitted(false); setError(null) }}
                      className="text-ds-secondary underline underline-offset-2 hover:text-ds-secondary-container transition-colors"
                    >
                      try a different email
                    </button>
                    .
                  </p>
                </div>
              ) : (
                /* ── Form state ── */
                <>
                  <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-on-surface tracking-tight">
                      Sign in to PortalKit
                    </h1>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      Enter your email and we'll send you a magic link — no password needed.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label htmlFor="email" className="text-sm font-medium text-on-surface">
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
                        className="w-full h-10 rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-ds-secondary/30 focus:border-ds-secondary transition-colors"
                      />
                    </div>

                    {error && (
                      <div className="rounded-lg border border-ds-error/20 bg-ds-error-container px-4 py-3">
                        <p className="text-sm text-on-ds-error-container">{error}</p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-10 bg-ds-secondary text-on-ds-secondary font-semibold text-sm hover:bg-ds-secondary-container transition-colors"
                    >
                      {loading ? (
                        'Sending link…'
                      ) : (
                        <>
                          Send magic link
                          <ArrowRight size={15} strokeWidth={2.5} />
                        </>
                      )}
                    </Button>
                  </form>

                  {/* ── Google OAuth ── */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-outline-variant" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-surface px-3 text-on-surface-variant/60">or</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={googleLoading || loading}
                      className="w-full h-10 flex items-center justify-center gap-2.5 rounded-lg border border-outline-variant bg-surface hover:bg-surface-container transition-colors text-sm font-medium text-on-surface disabled:opacity-50"
                    >
                      {googleLoading ? (
                        <svg className="size-4 animate-spin text-on-surface-variant" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                        </svg>
                      ) : (
                        <svg className="size-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                      )}
                      Continue with Google
                    </button>
                    <p className="text-center text-[11px] text-on-surface-variant/50">
                      Backup option — use if you lose access to your email.
                    </p>
                  </div>

                  <p className="text-center text-xs text-on-surface-variant/60 leading-relaxed">
                    No account needed — just enter your email to get started.{' '}
                    <Link
                      href="/privacy"
                      className="text-ds-secondary/80 hover:text-ds-secondary underline underline-offset-2 transition-colors"
                    >
                      Privacy policy
                    </Link>
                  </p>
                </>
              )}

            </div>
          </div>

        </div>
      </main>


    </>
  )
}

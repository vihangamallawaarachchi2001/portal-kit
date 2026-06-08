'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Mail, Loader2, AlertTriangle, ArrowLeft, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AdminGate() {
  const params  = useSearchParams()
  const errCode = params.get('error')

  const [email,    setEmail]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [sent,     setSent]     = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || loading) return
    setLoading(true)
    try {
      await fetch('/api/admin/request-access', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim() }),
      })
      setSent(true)
    } catch {
      setSent(true) // show sent state even on network error (don't leak info)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-container-low flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <Image src="/logo.svg" alt="PortalKit" width={36} height={36} className="rounded-xl" />
          <span className="text-lg font-bold text-on-surface">PortalKit</span>
        </div>

        <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">

          {/* ── Error state ──────────────────────────────── */}
          {errCode && !sent && (
            <div className="p-6 text-center space-y-4">
              <div className="size-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto">
                <AlertTriangle className="size-5 text-red-500" />
              </div>
              <div>
                <h1 className="text-base font-bold text-on-surface">Link expired or already used</h1>
                <p className="text-sm text-on-surface-variant mt-1">
                  {errCode === 'invalid_or_expired'
                    ? 'This magic link has already been used or has expired. Request a new one below.'
                    : 'Something went wrong with this link. Request a new one below.'}
                </p>
              </div>
              <button
                onClick={() => { window.history.replaceState({}, '', '/admin') }}
                className="flex items-center gap-1.5 text-sm font-medium text-ds-secondary hover:text-ds-secondary-container mx-auto transition-colors"
              >
                <ArrowLeft className="size-3.5" /> Try again
              </button>
            </div>
          )}

          {/* ── Sent / check email state ──────────────────── */}
          {sent && (
            <div className="p-6 text-center space-y-4">
              <div className="size-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto">
                <Mail className="size-5 text-emerald-500" />
              </div>
              <div>
                <h1 className="text-base font-bold text-on-surface">Check your inbox</h1>
                <p className="text-sm text-on-surface-variant mt-1">
                  If that email matches the admin account, a magic link was sent. It expires in <strong>1 hour</strong>.
                </p>
              </div>
              <button
                onClick={() => setSent(false)}
                className="flex items-center gap-1.5 text-sm font-medium text-ds-secondary hover:text-ds-secondary-container mx-auto transition-colors"
              >
                <ArrowLeft className="size-3.5" /> Send again
              </button>
            </div>
          )}

          {/* ── Default: email input form ─────────────────── */}
          {!sent && !errCode && (
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <h1 className="text-base font-bold text-on-surface">Admin Access</h1>
                <p className="text-sm text-on-surface-variant mt-1">
                  Enter your admin email to receive a one-time magic link.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-on-surface-variant/40 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    autoFocus
                    required
                    className={cn(
                      'h-10 w-full pl-9 pr-3 rounded-md border text-sm bg-white',
                      'placeholder:text-on-surface-variant/40 text-on-surface',
                      'border-outline-variant/60 focus:border-ds-secondary',
                      'focus:ring-2 focus:ring-ds-secondary/20 focus:outline-none transition-all',
                    )}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className={cn(
                  'w-full h-10 rounded-md text-sm font-semibold flex items-center justify-center gap-2',
                  'bg-ds-secondary text-white hover:bg-ds-secondary-container transition-colors',
                  'shadow-sm shadow-ds-secondary/20 disabled:opacity-40',
                )}
              >
                {loading
                  ? <Loader2 className="size-4 animate-spin" />
                  : <Send className="size-3.5" />}
                {loading ? 'Sending…' : 'Send magic link'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-on-surface-variant/50 mt-5">
          Only the registered admin email can access this area.
        </p>
      </div>
    </div>
  )
}

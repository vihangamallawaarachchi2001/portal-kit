'use client'

import { useState } from 'react'
import { Loader2, CheckCircle2, ArrowRight } from 'lucide-react'

interface WaitlistFormProps {
  source: string
  initialSpotsRemaining: number
}

export function WaitlistForm({ source, initialSpotsRemaining }: WaitlistFormProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle')
  const [spotsRemaining, setSpotsRemaining] = useState(initialSpotsRemaining)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || status === 'loading') return
    setStatus('loading')

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source }),
      })
      const data = await res.json() as { spots_remaining?: number; error?: string }

      if (res.status === 409) {
        setStatus('duplicate')
      } else if (res.ok) {
        setSpotsRemaining(data.spots_remaining ?? 0)
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="size-14 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <CheckCircle2 className="size-7 text-emerald-400" />
        </div>
        <div>
          <p className="text-xl font-bold text-white">You&apos;re on the list.</p>
          <p className="text-white/60 text-sm mt-1">Check your inbox for a confirmation.</p>
        </div>
        {spotsRemaining > 0 && (
          <p className="text-xs text-white/40">
            {spotsRemaining} founding member {spotsRemaining === 1 ? 'spot' : 'spots'} remaining.
          </p>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
          className="flex-1 h-12 px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/35 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all"
        />
        <button
          type="submit"
          disabled={status === 'loading' || !email}
          className="h-12 px-5 rounded-xl bg-white text-[#0051D5] text-sm font-bold hover:bg-white/90 transition-colors disabled:opacity-60 flex items-center gap-2 shrink-0"
        >
          {status === 'loading' ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <span>Claim spot</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </div>

      {status === 'duplicate' && (
        <p className="text-amber-300 text-xs text-center">
          That email is already on the list.
        </p>
      )}
      {status === 'error' && (
        <p className="text-red-400 text-xs text-center">
          Something went wrong — please try again.
        </p>
      )}

      <p className="text-white/35 text-xs text-center">
        No credit card required. Founding member discount applied automatically at checkout.
      </p>
    </form>
  )
}

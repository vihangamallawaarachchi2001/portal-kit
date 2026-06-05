'use client'

import { useState, useTransition } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Layers, Mail, Loader2, CheckCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEffect } from 'react'

export default function PortalAccessPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const token = searchParams.get('token')

  const [, startTransition] = useTransition()
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  // Auto-verify if token present in URL
  useEffect(() => {
    if (token) {
      setStatus('verifying')
      startTransition(async () => {
        const res = await fetch('/api/portal/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, slug }),
        })
        if (res.ok) {
          setStatus('success')
          setTimeout(() => router.push(`/p/${slug}`), 1000)
        } else {
          const d = await res.json()
          setStatus('error')
          setError(d.error ?? 'Invalid or expired link')
        }
      })
    }
  }, [token, slug, router])

  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 text-ds-secondary animate-spin" />
          <p className="text-sm text-on-surface-variant">Verifying your link…</p>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <CheckCircle className="size-8 text-green-500" />
          <p className="text-sm text-on-surface-variant">Access granted! Redirecting…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-outline-variant shadow-sm p-8 flex flex-col gap-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-12 rounded-xl bg-ds-secondary flex items-center justify-center">
            <Layers className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-on-surface">Access your portal</h1>
            <p className="text-sm text-on-surface-variant mt-1">
              Ask your freelancer to send you a new magic link to access this portal.
            </p>
          </div>
        </div>

        {(status === 'error' || error) && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-600 font-medium">{error}</p>
            <p className="text-xs text-red-500 mt-1">
              The link may have expired or already been used. Contact your freelancer for a new one.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 text-left">
          <div className="flex items-start gap-3">
            <div className="size-6 rounded-full bg-ds-secondary/10 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[10px] font-bold text-ds-secondary">1</span>
            </div>
            <p className="text-sm text-on-surface-variant">Contact your freelancer and ask them to send you a portal access link.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="size-6 rounded-full bg-ds-secondary/10 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[10px] font-bold text-ds-secondary">2</span>
            </div>
            <p className="text-sm text-on-surface-variant">Check your email for a link from PortalKit.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="size-6 rounded-full bg-ds-secondary/10 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[10px] font-bold text-ds-secondary">3</span>
            </div>
            <p className="text-sm text-on-surface-variant">Click the link — it will open directly to your portal. No password needed.</p>
          </div>
        </div>

        <p className="text-xs text-on-surface-variant">
          Your data is secure. Links expire after 24 hours and are single-use only.
        </p>
      </div>
    </div>
  )
}

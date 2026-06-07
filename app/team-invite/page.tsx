'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'

export default function TeamInviteAcceptPage() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const token        = searchParams.get('token')
  const [state, setState] = useState<'loading' | 'accepted' | 'already' | 'error'>('loading')

  useEffect(() => {
    if (!token) { setState('error'); return }

    fetch('/api/settings/team/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.already_accepted) setState('already')
        else if (d.accepted)    setState('accepted')
        else                    setState('error')
      })
      .catch(() => setState('error'))
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-lg p-8 text-center flex flex-col items-center gap-5">
        {state === 'loading' && (
          <>
            <Loader2 className="size-10 text-ds-secondary animate-spin" />
            <p className="text-sm text-on-surface-variant">Accepting invitation…</p>
          </>
        )}

        {(state === 'accepted' || state === 'already') && (
          <>
            <div className="size-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="size-8 text-emerald-600" />
            </div>
            <div>
              <p className="text-base font-bold text-on-surface">
                {state === 'already' ? 'Already accepted' : 'Invitation accepted!'}
              </p>
              <p className="text-sm text-on-surface-variant mt-1.5 leading-relaxed">
                {state === 'already'
                  ? 'You have already accepted this invitation.'
                  : "You've been added to the workspace. Sign in to get started."}
              </p>
            </div>
            <Link
              href="/auth"
              className="w-full inline-flex items-center justify-center h-10 rounded-lg bg-ds-secondary text-white text-sm font-semibold hover:bg-ds-secondary-container transition-colors"
            >
              Sign in to PortalKit →
            </Link>
          </>
        )}

        {state === 'error' && (
          <>
            <div className="size-16 rounded-2xl bg-red-50 flex items-center justify-center">
              <XCircle className="size-8 text-red-500" />
            </div>
            <div>
              <p className="text-base font-bold text-on-surface">Invalid invitation</p>
              <p className="text-sm text-on-surface-variant mt-1.5 leading-relaxed">
                This invitation link is invalid or has expired. Ask your team owner to resend the invite.
              </p>
            </div>
            <Link
              href="/"
              className="text-sm font-semibold text-ds-secondary hover:underline"
            >
              Go to homepage
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

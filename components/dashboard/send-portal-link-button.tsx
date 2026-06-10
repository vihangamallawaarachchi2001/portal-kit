'use client'

import { useState, useTransition } from 'react'
import { Send, CheckCircle, Loader2, Copy, Link2 } from 'lucide-react'
import { toast } from 'sonner'

export function SendPortalLinkButton({ clientId, clientEmail }: { clientId: string; clientEmail?: string }) {
  const [sent, setSent] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSend() {
    if (sent || isPending) return
    startTransition(async () => {
      const res = await fetch(`/api/clients/${clientId}/magic-link`, { method: 'POST' })
      if (res.ok) {
        setSent(true)
        toast.success(clientEmail
          ? `Access link sent to ${clientEmail}. You'll be notified when they open their portal.`
          : 'Access link sent to client.')
        setTimeout(() => setSent(false), 5000)
      } else {
        toast.error('Failed to send portal link')
      }
    })
  }

  return (
    <button
      onClick={handleSend}
      disabled={isPending || sent}
      className="flex items-center gap-1.5 h-8 sm:h-9 px-3 sm:px-4 rounded-lg bg-white/15 text-white text-xs sm:text-sm font-bold hover:bg-white/25 transition-colors border border-white/25 shrink-0 disabled:opacity-70"
    >
      {isPending ? (
        <Loader2 className="size-3.5 animate-spin shrink-0" />
      ) : sent ? (
        <CheckCircle className="size-3.5 shrink-0" />
      ) : (
        <Send className="size-3.5 shrink-0" />
      )}
      <span className="hidden sm:inline">{sent ? 'Link sent!' : 'Send portal link'}</span>
      <span className="sm:hidden">{sent ? 'Sent!' : 'Link'}</span>
    </button>
  )
}

export function CopyPortalLinkButton({ clientId }: { clientId: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'copied'>('idle')
  const [, startTransition] = useTransition()

  function handleCopy() {
    if (status !== 'idle') return
    setStatus('loading')
    startTransition(async () => {
      const res = await fetch(`/api/clients/${clientId}/magic-link`, { method: 'POST' })
      if (res.ok) {
        const { portalUrl } = await res.json()
        await navigator.clipboard.writeText(portalUrl).catch(() => {
          toast.error('Could not access clipboard')
          setStatus('idle')
          return
        })
        setStatus('copied')
        toast.success('Magic link copied to clipboard')
        setTimeout(() => setStatus('idle'), 4000)
      } else {
        toast.error('Failed to generate link')
        setStatus('idle')
      }
    })
  }

  return (
    <button
      onClick={handleCopy}
      disabled={status !== 'idle'}
      className="flex items-center gap-1.5 h-8 sm:h-9 px-3 sm:px-4 rounded-lg bg-white/15 text-white text-xs sm:text-sm font-bold hover:bg-white/25 transition-colors border border-white/25 shrink-0 disabled:opacity-70"
    >
      {status === 'loading' ? (
        <Loader2 className="size-3.5 animate-spin shrink-0" />
      ) : status === 'copied' ? (
        <CheckCircle className="size-3.5 shrink-0" />
      ) : (
        <Copy className="size-3.5 shrink-0" />
      )}
      <span className="hidden sm:inline">{status === 'copied' ? 'Copied!' : 'Copy magic link'}</span>
      <span className="sm:hidden">
        {status === 'loading' ? <Link2 className="size-3.5" /> : status === 'copied' ? '✓' : <Copy className="size-3.5" />}
      </span>
    </button>
  )
}

'use client'

import { useState, useTransition } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { slugify } from '@/lib/format'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle, Users, Globe, AtSign, Zap } from 'lucide-react'
import Link from 'next/link'

interface AddClientModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan?: string
  clientCount?: number
}

export function AddClientModal({ open, onOpenChange, plan = 'free', clientCount = 0 }: AddClientModalProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName]               = useState('')
  const [email, setEmail]             = useState('')
  const [slug, setSlug]               = useState('')
  const [slugManual, setSlugManual]   = useState(false)
  const [slugError, setSlugError]     = useState<string | null>(null)
  const [error, setError]             = useState<string | null>(null)
  const [limitHit, setLimitHit]       = useState(false)

  const atClientLimit = plan === 'free' && clientCount >= 1

  function handleNameChange(value: string) {
    setName(value)
    if (!slugManual) setSlug(slugify(value))
  }

  function handleSlugChange(value: string) {
    setSlugManual(true)
    setSlug(value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
    setSlugError(null)
  }

  async function checkSlug(value: string) {
    if (!value) return
    const res  = await fetch(`/api/clients/check-slug?slug=${encodeURIComponent(value)}`)
    const data = await res.json()
    if (!data.available) setSlugError('That slug is taken — try another.')
    else setSlugError(null)
  }

  function reset() {
    setName(''); setEmail(''); setSlug('')
    setSlugManual(false); setSlugError(null); setError(null); setLimitHit(false)
  }

  function handleClose() {
    if (!isPending) { reset(); onOpenChange(false) }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (slugError) return
    startTransition(async () => {
      setError(null)
      try {
        const res  = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), email: email.trim(), portal_slug: slug }),
        })
        const data = await res.json()
        if (res.status === 402) { setLimitHit(true); return }
        if (!res.ok) { setError(data.error ?? 'Failed to create client'); return }
        toast.success(`${name} — portal is live!`)
        reset(); onOpenChange(false); router.refresh()
      } catch {
        setError('Something went wrong. Please try again.')
      }
    })
  }

  const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? 'https://portalkit.io'
  const previewUrl = slug ? `${appUrl}/p/${slug}` : null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden gap-0">
        <DialogTitle className="sr-only">Create client portal</DialogTitle>

        {(atClientLimit || limitHit) ? (
          /* ── Upgrade gate ──────────────────────── */
          <div className="flex flex-col items-center text-center gap-5 px-8 py-10">
            <div className="size-14 rounded-2xl bg-amber-50 flex items-center justify-center">
              <Zap className="size-7 text-amber-500" />
            </div>
            <div>
              <p className="text-base font-bold text-on-surface">Client portal limit reached</p>
              <p className="text-sm text-on-surface-variant mt-2 leading-relaxed max-w-xs">
                The Free plan allows 1 active client portal. Upgrade to Pro for unlimited clients.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <Link
                href="/dashboard/settings/billing"
                onClick={handleClose}
                className="inline-flex items-center gap-1.5 h-9 px-5 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors"
              >
                <Zap className="size-3.5" />
                Upgrade to Pro
              </Link>
              <button
                onClick={handleClose}
                className="h-9 px-4 rounded-lg border border-outline-variant text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
        {/* ── Header ──────────────────────────────── */}
        <div
          className="px-6 pt-6 pb-5 border-b border-outline-variant/30"
          style={{ background: 'linear-gradient(135deg, rgba(0,81,213,0.05) 0%, transparent 70%)' }}
        >
          <div className="flex items-start gap-4">
            <div className="size-10 rounded-md bg-ds-secondary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Users className="size-5 text-ds-secondary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-on-surface">Create client portal</h2>
              <p className="text-sm text-on-surface-variant mt-0.5 leading-relaxed">
                A private workspace your client accesses via a magic link — no account required.
              </p>
            </div>
          </div>
        </div>

        {/* ── Form body ───────────────────────────── */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 flex flex-col gap-5">

            {/* Client name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface" htmlFor="ac-name">
                Client or company name <span className="text-red-500">*</span>
              </label>
              <Input
                id="ac-name"
                value={name}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="Acme Corp"
                required
                disabled={isPending}
                className="h-10 rounded-md"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface" htmlFor="ac-email">
                Client email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-on-surface-variant/60 pointer-events-none" />
                <Input
                  id="ac-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="hello@acmecorp.com"
                  required
                  disabled={isPending}
                  className="h-10 rounded-md pl-8"
                />
              </div>
            </div>

            {/* Portal slug */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface" htmlFor="ac-slug">
                Portal URL <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center rounded-md border border-input bg-white overflow-hidden h-10 focus-within:ring-2 focus-within:ring-ds-secondary/30 focus-within:border-ds-secondary transition-all">
                <span className="px-3 text-xs text-on-surface-variant bg-surface-container border-r border-input h-full flex items-center shrink-0 select-none font-mono">
                  /p/
                </span>
                <input
                  id="ac-slug"
                  value={slug}
                  onChange={e => handleSlugChange(e.target.value)}
                  onBlur={() => checkSlug(slug)}
                  placeholder="acme-corp"
                  required
                  disabled={isPending}
                  className="flex-1 px-3 text-sm outline-none bg-transparent h-full font-mono"
                />
              </div>

              {/* Live URL preview */}
              {previewUrl && !slugError && (
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-surface-container/60">
                  <Globe className="size-3 text-on-surface-variant/50 shrink-0" />
                  <span className="text-[11px] text-on-surface-variant font-mono truncate">
                    {appUrl}/p/<span className="text-ds-secondary font-bold">{slug}</span>
                  </span>
                </div>
              )}

              {slugError && (
                <p className="flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="size-3 shrink-0" />{slugError}
                </p>
              )}

              {!slugError && !previewUrl && (
                <p className="text-xs text-on-surface-variant">
                  Lowercase letters, numbers and hyphens only.
                </p>
              )}
            </div>

            {/* General error */}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-red-50 text-red-700">
                <AlertCircle className="size-4 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* ── Footer ────────────────────────────── */}
          <div className="px-6 py-4 border-t border-outline-variant/30 flex items-center justify-end gap-2.5 bg-surface-container/20">
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="inline-flex items-center h-9 px-4 rounded-md text-sm font-semibold text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
            >
              Cancel
            </button>
            <Button
              type="submit"
              disabled={isPending || !!slugError || !name || !email || !slug}
              className="h-9 px-5 rounded-md"
            >
              {isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
              Create portal
            </Button>
          </div>
        </form>
        </>
        )}

      </DialogContent>
    </Dialog>
  )
}

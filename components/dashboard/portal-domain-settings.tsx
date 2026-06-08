'use client'

import { useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { Globe, CheckCircle2, XCircle, Loader2, Zap, Copy, Trash2, RefreshCw, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import Link from 'next/link'

interface PortalDomainSettingsProps {
  plan: string
  initialDomain: string | null
  initialVerified: boolean
  initialHideBranding: boolean
}

export function PortalDomainSettings({ plan, initialDomain, initialVerified, initialHideBranding }: PortalDomainSettingsProps) {
  const [domain, setDomain]         = useState(initialDomain ?? '')
  const [saved, setSaved]           = useState(initialDomain)
  const [verified, setVerified]     = useState(initialVerified)
  const [hideBranding, setHideBranding] = useState(initialHideBranding)
  const [brandingPending, setBrandingPending] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [verifying, setVerifying]   = useState(false)

  const isProOrBusiness = plan === 'pro' || plan === 'business'
  const isBusinessPlan  = plan === 'business'

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await fetch('/api/settings/portal', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ custom_domain: domain.trim().toLowerCase() || null }),
      })
      if (res.ok) {
        const d = await res.json()
        setSaved(d.custom_domain)
        setVerified(false)
        toast.success('Custom domain saved')
      } else if (res.status === 402) {
        toast.error('Custom domains require a Pro or Business plan.')
      } else {
        const d = await res.json().catch(() => ({}))
        toast.error(d.error ?? 'Failed to save domain')
      }
    })
  }

  function handleRemove() {
    startTransition(async () => {
      const res = await fetch('/api/settings/portal', { method: 'DELETE' })
      if (res.ok) {
        setSaved(null)
        setDomain('')
        setVerified(false)
        toast.success('Custom domain removed')
      } else {
        toast.error('Failed to remove domain')
      }
    })
  }

  async function handleVerify() {
    setVerifying(true)
    try {
      const res = await fetch('/api/settings/portal/verify', { method: 'POST' })
      const d = await res.json()
      if (d.verified) {
        setVerified(true)
        toast.success('Domain verified successfully!')
      } else {
        setVerified(false)
        toast.error(`DNS not configured yet. Add a CNAME record pointing to ${d.cname_target}`)
      }
    } catch {
      toast.error('Verification check failed — try again.')
    } finally {
      setVerifying(false)
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => toast.success('Copied to clipboard'))
  }

  async function toggleBranding() {
    setBrandingPending(true)
    const next = !hideBranding
    setHideBranding(next)
    try {
      const res = await fetch('/api/settings/portal', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hide_branding: next }),
      })
      if (res.ok) {
        toast.success(next ? 'PortalKit branding hidden' : 'PortalKit branding restored')
      } else {
        setHideBranding(!next)
        if (res.status === 402) toast.error('White-label requires the Business plan.')
        else toast.error('Failed to update branding setting')
      }
    } catch {
      setHideBranding(!next)
      toast.error('Failed to update branding setting')
    } finally {
      setBrandingPending(false)
    }
  }

  const cnameTarget = process.env.NEXT_PUBLIC_PORTAL_CNAME_TARGET ?? 'portals.portalkit.io'

  return (
    <div className="flex flex-col gap-6 px-8 pt-8 pb-12">
      <div className="mb-2">
        <h2 className="text-lg font-bold text-on-surface tracking-tight">Portal Settings</h2>
        <p className="text-sm text-on-surface-variant mt-0.5">Configure your client portal domain and branding.</p>
      </div>

      {/* Custom domain card */}
      <div className="bg-white rounded-md shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-outline-variant/40 bg-surface-container/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-md bg-ds-secondary/10 flex items-center justify-center">
              <Globe className="size-3.5 text-ds-secondary" />
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface">Custom Domain</p>
              <p className="text-xs text-on-surface-variant">Serve your client portals from your own domain.</p>
            </div>
          </div>
          {!isProOrBusiness && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-700">Pro</span>
          )}
        </div>

        <div className="px-5 py-5 flex flex-col gap-5">
          {!isProOrBusiness ? (
            /* ── Upgrade gate ── */
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="size-12 rounded-xl bg-amber-50 flex items-center justify-center">
                <Zap className="size-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">Custom domains require Pro or Business</p>
                <p className="text-xs text-on-surface-variant mt-1.5 max-w-sm leading-relaxed">
                  Use your own domain like <span className="font-mono bg-surface-container px-1 rounded">portal.youragency.com</span> instead of the default PortalKit URL.
                </p>
              </div>
              <Link
                href="/dashboard/settings/billing"
                className="inline-flex items-center gap-1.5 h-9 px-5 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors"
              >
                <Zap className="size-3.5" />
                Upgrade to Pro
              </Link>
            </div>
          ) : (
            <>
              {/* ── Domain input ── */}
              <form onSubmit={handleSave} className="flex items-end gap-3">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Domain</label>
                  <Input
                    value={domain}
                    onChange={e => setDomain(e.target.value)}
                    placeholder="portal.yourdomain.com"
                    disabled={isPending}
                    className="h-10 rounded-md font-mono text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isPending || !domain.trim()}
                  className="h-10 px-5 rounded-md bg-ds-secondary text-white text-sm font-semibold hover:bg-ds-secondary-container transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                >
                  {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                  Save
                </button>
                {saved && (
                  <button
                    type="button"
                    onClick={handleRemove}
                    disabled={isPending}
                    title="Remove custom domain"
                    className="h-10 w-10 rounded-md flex items-center justify-center text-on-surface-variant hover:text-red-500 hover:bg-red-50 transition-colors border border-outline-variant/40 disabled:opacity-50"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </form>

              {/* ── Status badge ── */}
              {saved && (
                <div className="flex items-center justify-between p-3 rounded-lg border border-outline-variant/30 bg-surface-container/20">
                  <div className="flex items-center gap-2">
                    {verified
                      ? <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                      : <XCircle      className="size-4 text-amber-500 shrink-0" />}
                    <div>
                      <p className="text-sm font-mono font-semibold text-on-surface">{saved}</p>
                      <p className={cn('text-xs mt-0.5', verified ? 'text-emerald-600' : 'text-amber-600')}>
                        {verified ? 'Verified and active' : 'Not verified — DNS setup required'}
                      </p>
                    </div>
                  </div>
                  {!verified && (
                    <button
                      onClick={handleVerify}
                      disabled={verifying}
                      className="h-8 px-3 rounded-md text-xs font-semibold text-ds-secondary bg-ds-secondary/8 hover:bg-ds-secondary/15 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {verifying ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
                      Verify
                    </button>
                  )}
                </div>
              )}

              {/* ── DNS instructions ── */}
              {saved && !verified && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 flex flex-col gap-3">
                  <p className="text-xs font-bold text-blue-900">DNS Setup Instructions</p>
                  <p className="text-xs text-blue-800 leading-relaxed">
                    Add the following CNAME record to your DNS provider (Cloudflare, Route 53, GoDaddy, etc.):
                  </p>
                  <div className="bg-white rounded-md border border-blue-200 overflow-hidden">
                    <div className="grid grid-cols-[80px_1fr_1fr_32px] text-[10px] font-bold uppercase tracking-wider text-blue-700 px-3 py-2 bg-blue-100/60 border-b border-blue-200">
                      <span>Type</span>
                      <span>Name</span>
                      <span>Value</span>
                      <span />
                    </div>
                    <div className="grid grid-cols-[80px_1fr_1fr_32px] items-center px-3 py-2.5 gap-2">
                      <span className="text-xs font-bold text-on-surface font-mono">CNAME</span>
                      <span className="text-xs font-mono text-on-surface truncate">{saved}</span>
                      <span className="text-xs font-mono text-on-surface truncate">{cnameTarget}</span>
                      <button
                        onClick={() => copyToClipboard(cnameTarget)}
                        className="size-7 rounded flex items-center justify-center text-on-surface-variant hover:text-ds-secondary hover:bg-ds-secondary/8 transition-colors"
                        title="Copy value"
                      >
                        <Copy className="size-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    DNS changes can take up to 24 hours to propagate. Click <strong>Verify</strong> above once done.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* White-label card */}
      <div className="bg-white rounded-md shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-outline-variant/40 bg-surface-container/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-md bg-ds-secondary/10 flex items-center justify-center">
              <EyeOff className="size-3.5 text-ds-secondary" />
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface">White-label</p>
              <p className="text-xs text-on-surface-variant">Remove PortalKit branding from your client portals.</p>
            </div>
          </div>
          {!isBusinessPlan && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-700">Business</span>
          )}
        </div>

        <div className="px-5 py-4">
          {!isBusinessPlan ? (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="size-12 rounded-xl bg-amber-50 flex items-center justify-center">
                <Zap className="size-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">White-label requires the Business plan</p>
                <p className="text-xs text-on-surface-variant mt-1.5 max-w-sm leading-relaxed">
                  Remove the "PortalKit" badge and "Secured by PortalKit" footer from all client-facing portal pages.
                </p>
              </div>
              <Link
                href="/dashboard/settings/billing"
                className="inline-flex items-center gap-1.5 h-9 px-5 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors"
              >
                <Zap className="size-3.5" />
                Upgrade to Business
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-on-surface">Hide PortalKit branding</p>
                <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                  {hideBranding
                    ? 'PortalKit branding is hidden from your client portals.'
                    : 'Clients see "Secured by PortalKit" and the PortalKit badge on their portal pages.'}
                </p>
              </div>
              <button
                onClick={toggleBranding}
                disabled={brandingPending}
                aria-checked={hideBranding}
                role="switch"
                className={cn(
                  'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60',
                  hideBranding ? 'bg-ds-secondary' : 'bg-outline-variant/60',
                )}
              >
                {brandingPending ? (
                  <Loader2 className="size-3.5 text-white absolute inset-0 m-auto animate-spin" />
                ) : (
                  <span className={cn(
                    'pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 mt-0.5',
                    hideBranding ? 'translate-x-4' : 'translate-x-0.5',
                  )} />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

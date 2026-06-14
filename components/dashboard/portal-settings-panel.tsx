'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  Paperclip, FileText, MessageSquare, CalendarCheck, CalendarDays,
  Info, ShieldOff, Shield, Eye, EyeOff,
} from 'lucide-react'
import { DEFAULT_PORTAL_FEATURES } from '@/lib/validations'
import type { PortalFeatures } from '@/lib/validations'

const FEATURE_CONFIG: {
  key: keyof typeof DEFAULT_PORTAL_FEATURES
  label: string
  description: string
  icon: React.ElementType
  accent: string
}[] = [
  {
    key:         'files',
    label:       'Files',
    description: 'Client can view deliverables, approve work, and upload reference files.',
    icon:        Paperclip,
    accent:      '#f59e0b',
  },
  {
    key:         'invoices',
    label:       'Invoices',
    description: 'Client can view invoices and pay online via Stripe or bank transfer.',
    icon:        FileText,
    accent:      '#0051d5',
  },
  {
    key:         'messages',
    label:       'Messages',
    description: 'Client can send and receive messages with you in real time.',
    icon:        MessageSquare,
    accent:      '#0051d5',
  },
  {
    key:         'milestones',
    label:       'Milestones',
    description: 'Client can view project milestones and progress.',
    icon:        CalendarCheck,
    accent:      '#0f766e',
  },
  {
    key:         'meetings',
    label:       'Meetings',
    description: 'Client can view scheduled meetings and request new ones.',
    icon:        CalendarDays,
    accent:      '#9333ea',
  },
]

interface PortalSettingsPanelProps {
  clientId:       string
  clientName:     string
  portalFeatures: PortalFeatures
  portalClosed?:  boolean
}

export function PortalSettingsPanel({ clientId, clientName, portalFeatures, portalClosed = false }: PortalSettingsPanelProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [features, setFeatures] = useState<Required<PortalFeatures>>({
    ...DEFAULT_PORTAL_FEATURES,
    ...portalFeatures,
  })
  const [isClosed, setIsClosed] = useState(portalClosed)
  const [closePending, setClosePending] = useState(false)

  function handleToggle(key: keyof typeof DEFAULT_PORTAL_FEATURES, value: boolean) {
    const next = { ...features, [key]: value }
    setFeatures(next)

    startTransition(async () => {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portal_features: next }),
      })
      if (res.ok) {
        toast.success(`${FEATURE_CONFIG.find(f => f.key === key)?.label} ${value ? 'enabled' : 'disabled'}`)
        router.refresh()
      } else {
        setFeatures(prev => ({ ...prev, [key]: !value }))
        toast.error('Failed to save portal settings')
      }
    })
  }

  async function handleTogglePortal() {
    const next = !isClosed
    setIsClosed(next)
    setClosePending(true)
    const res = await fetch(`/api/clients/${clientId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portal_closed: next }),
    })
    setClosePending(false)
    if (res.ok) {
      toast.success(next ? `Portal closed for ${clientName}` : `Portal reopened for ${clientName}`)
      router.refresh()
    } else {
      setIsClosed(!next)
      toast.error('Failed to update portal status')
    }
  }

  const enabledCount = Object.values(features).filter(Boolean).length

  return (
    <div className="flex flex-col gap-8 max-w-2xl">

      {/* Portal status card */}
      <div className={`rounded-2xl border p-6 transition-all ${isClosed ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${isClosed ? 'bg-red-100' : 'bg-emerald-100'}`}>
              {isClosed
                ? <ShieldOff className="size-5 text-red-600" />
                : <Shield className="size-5 text-emerald-600" />
              }
            </div>
            <div>
              <p className={`text-sm font-bold ${isClosed ? 'text-red-800' : 'text-emerald-800'}`}>
                Portal is {isClosed ? 'closed' : 'open'}
              </p>
              <p className={`text-xs mt-0.5 ${isClosed ? 'text-red-600' : 'text-emerald-600'}`}>
                {isClosed
                  ? `${clientName} sees a "portal closed" screen and cannot access any content.`
                  : `${clientName} can access their portal and all enabled sections.`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleTogglePortal}
            disabled={closePending}
            className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 ${
              isClosed
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                : 'bg-red-600 text-white hover:bg-red-700 shadow-sm'
            }`}
          >
            {isClosed ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            {isClosed ? 'Reopen portal' : 'Close portal'}
          </button>
        </div>
      </div>

      {/* Section visibility */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-bold text-on-surface">Section visibility</h2>
          <p className="text-xs text-on-surface-variant">
            Control which sections {clientName} can see. Changes take effect immediately.
          </p>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-ds-secondary/5 border border-ds-secondary/15">
          <Info className="size-3.5 text-ds-secondary mt-0.5 shrink-0" />
          <p className="text-xs text-on-surface-variant leading-relaxed">
            The <strong className="text-on-surface">Overview</strong> tab is always visible.
            {enabledCount === 0 && (
              <span className="text-amber-600 font-semibold"> All sections are hidden — clients only see the overview.</span>
            )}
          </p>
        </div>

        {/* Feature toggles */}
        <div className="flex flex-col gap-2">
          {FEATURE_CONFIG.map(({ key, label, description, icon: Icon, accent }) => {
            const enabled = features[key]
            return (
              <div
                key={key}
                className={`flex items-center gap-4 px-4 py-4 rounded-xl border transition-all ${
                  enabled
                    ? 'bg-white border-slate-200 shadow-sm'
                    : 'bg-slate-50/50 border-slate-100'
                }`}
              >
                <div
                  className="size-9 rounded-lg flex items-center justify-center shrink-0 transition-all"
                  style={{ background: enabled ? accent + '15' : 'rgba(0,0,0,0.04)' }}
                >
                  <Icon
                    className="size-4.5 transition-colors"
                    style={{ color: enabled ? accent : '#94a3b8' }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold transition-colors ${enabled ? 'text-on-surface' : 'text-slate-400'}`}>
                    {label}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{description}</p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  aria-label={`Toggle ${label}`}
                  onClick={() => handleToggle(key, !enabled)}
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-secondary/50 ${
                    enabled ? 'bg-ds-secondary' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block size-3.5 rounded-full bg-white shadow-sm transition-transform ${
                      enabled ? 'translate-x-4.5' : 'translate-x-0.75'
                    }`}
                  />
                </button>
              </div>
            )
          })}
        </div>

        <p className="text-xs text-on-surface-variant/50">
          Settings only apply to <strong className="text-on-surface-variant">{clientName}</strong>&apos;s portal. Each client is configured independently.
        </p>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { X, Building2, ImageIcon, CreditCard } from 'lucide-react'
import Link from 'next/link'

type NudgeType = 'business_name' | 'avatar' | 'stripe'

interface ProfileNudgesProps {
  businessName: string | null
  avatarUrl: string | null
  stripeConnected: boolean
  stripeSkipped: boolean
}

const NUDGE_CONFIG: Record<NudgeType, {
  icon: React.ReactNode
  text: string
  linkHref: string
  linkText: string
}> = {
  business_name: {
    icon: <Building2 className="size-4 text-blue-600" />,
    text: 'Add a business name so clients see your brand on portals and invoices.',
    linkHref: '/dashboard/settings/profile',
    linkText: 'Add business name →',
  },
  avatar: {
    icon: <ImageIcon className="size-4 text-blue-600" />,
    text: 'Add a profile photo or logo — clients see it in their portal header.',
    linkHref: '/dashboard/settings/profile',
    linkText: 'Upload photo →',
  },
  stripe: {
    icon: <CreditCard className="size-4 text-blue-600" />,
    text: 'Connect Stripe to let clients pay invoices directly through their portal.',
    linkHref: '/dashboard/settings/billing',
    linkText: 'Connect Stripe →',
  },
}

export function ProfileNudges({ businessName, avatarUrl, stripeConnected, stripeSkipped }: ProfileNudgesProps) {
  const [dismissed, setDismissed] = useState<Set<NudgeType>>(new Set())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const d = new Set<NudgeType>()
    if (localStorage.getItem('pk_nudge_business_name')) d.add('business_name')
    if (localStorage.getItem('pk_nudge_avatar')) d.add('avatar')
    if (localStorage.getItem('pk_nudge_stripe')) d.add('stripe')
    setDismissed(d)
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Show at most ONE nudge — priority: business_name → avatar → stripe
  let active: NudgeType | null = null
  if (!businessName && !dismissed.has('business_name')) active = 'business_name'
  else if (!avatarUrl && !dismissed.has('avatar')) active = 'avatar'
  else if (!stripeConnected && stripeSkipped && !dismissed.has('stripe')) active = 'stripe'

  if (!active) return null

  const cfg = NUDGE_CONFIG[active]
  const key = active

  function dismiss() {
    localStorage.setItem(`pk_nudge_${key}`, '1')
    setDismissed(prev => new Set([...prev, key]))
  }

  return (
    <div className="mx-4 sm:mx-6 mt-4 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
      <span className="size-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
        {cfg.icon}
      </span>
      <p className="flex-1 text-sm text-blue-900 leading-snug">
        {cfg.text}{' '}
        <Link
          href={cfg.linkHref}
          className="font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
        >
          {cfg.linkText}
        </Link>
      </p>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="shrink-0 size-6 flex items-center justify-center rounded-md hover:bg-blue-100 text-blue-400 hover:text-blue-700 transition-colors"
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}

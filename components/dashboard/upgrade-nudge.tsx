'use client'

import Link from 'next/link'
import { Zap, ArrowRight } from 'lucide-react'
import { usePathname } from 'next/navigation'

export function UpgradeNudge() {
  const pathname = usePathname()
  // Hide on the messages/chats page — the nudge obstructs the send button
  if (pathname.startsWith('/dashboard/chats')) return null

  return (
    <Link
      href="/dashboard/settings/billing"
      className="fixed bottom-6 right-6 z-50 group"
      aria-label="Upgrade to Pro"
    >
      {/* Outer glow */}
      <span
        className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"
        style={{ background: 'linear-gradient(135deg, #0051d5 0%, #7c3aed 100%)' }}
      />

      {/* Card */}
      <span
        className="relative flex items-center gap-3 px-4 py-3 rounded-md shadow-xl transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #0f1f3d 0%, #0d1627 100%)',
          border: '1px solid rgba(255,255,255,0.10)',
        }}
      >
        <span
          className="size-8 rounded-md flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(251,191,36,0.1) 100%)' }}
        >
          <Zap className="size-4 text-amber-400 fill-amber-400" />
        </span>

        <span className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-white leading-tight">Upgrade to Pro</span>
          <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>
            From $15/mo · Unlimited clients
          </span>
        </span>

        <ArrowRight
          className="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        />
      </span>

      <span className="absolute -top-1 -right-1 size-3 flex items-center justify-center">
        <span className="absolute inline-flex size-full rounded-full bg-amber-400 opacity-75 animate-ping" />
        <span className="relative size-2 rounded-full bg-amber-400" />
      </span>
    </Link>
  )
}

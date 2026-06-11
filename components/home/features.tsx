import { Upload, Receipt, MessageSquare, BarChart2, Palette, ShieldCheck, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { ReactNode } from 'react'

const FEATURES: {
  icon: LucideIcon
  title: string
  description: ReactNode
}[] = [
  {
    icon: Upload,
    title: 'File Approvals',
    description: (
      <>
        Centralize all versions. Clients approve with one click, or leave
        annotated feedback directly on files.
      </>
    ),
  },
  {
    icon: Receipt,
    title: 'Invoice Tracking',
    description: (
      <>
        Link your{' '}
        <span className="text-ds-secondary font-medium">Stripe or PayPal.</span>{' '}
        See exactly when a client views an invoice and when it gets paid.
      </>
    ),
  },
  {
    icon: MessageSquare,
    title: 'Secure Messaging',
    description: (
      <>
        Move client conversations out of your inbox. Threaded chats keep
        context exactly where the work is.
      </>
    ),
  },
  {
    icon: BarChart2,
    title: 'Live Progress Bars',
    description: (
      <>
        Clients can see project status at a glance without ever having to ask{' '}
        <span className="text-ds-secondary font-medium">"how is it going?".</span>
      </>
    ),
  },
  {
    icon: Palette,
    title: 'White Labeling',
    description: (
      <>
        Apply your own colors, logo, and domain.{' '}
        <span className="text-ds-secondary font-medium">PortalKit</span>{' '}
        feels like your own proprietary software.
      </>
    ),
  },
  {
    icon: ShieldCheck,
    title: 'Client Permissions',
    description: (
      <>
        Granular control over what clients see. Keep internal drafts hidden
        until they are ready.
      </>
    ),
  },
]

export default function Features() {
  return (
    <section className="bg-surface py-24 px-6">
      <div className="mx-auto max-w-7xl">

        {/* ── Header row ──────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div className="max-w-sm space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-on-surface leading-snug">
              Everything you need to deliver excellence
            </h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Our features are designed to handle the friction of client
              communication, so you can focus on the{' '}
              <span className="text-ds-secondary font-medium">creative work.</span>
            </p>
          </div>

          <Button
            asChild
            size="sm"
            className="self-start md:self-auto shrink-0 bg-ds-secondary text-on-ds-secondary font-semibold px-5 tracking-wide uppercase text-xs"
          >
            <Link href="/features">Explore all features</Link>
          </Button>
        </div>

        {/* ── Feature cards grid ──────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6"
            >
              {/* Icon box */}
              <div className="flex items-center justify-center size-10 rounded-lg border border-ds-secondary/20 bg-ds-secondary/8 text-ds-secondary shrink-0">
                <Icon size={18} strokeWidth={1.75} />
              </div>

              {/* Text */}
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-on-surface">{title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

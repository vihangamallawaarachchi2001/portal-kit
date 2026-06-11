import Image from 'next/image'
import { GitBranch, FileCheck, Receipt } from 'lucide-react'

const CALLOUTS = [
  {
    icon: GitBranch,
    title: 'Real-time milestones',
    description: 'Clients see every project stage live — no more status update calls.',
  },
  {
    icon: FileCheck,
    title: 'One-click approvals',
    description: 'Review and approve files without a single email thread.',
  },
  {
    icon: Receipt,
    title: 'Instant invoicing',
    description: 'Send and collect payment in one place, fully tracked.',
  },
]

const BADGE = 'hidden md:flex absolute items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/85 backdrop-blur-md border border-white/60 shadow-lg text-sm font-semibold z-10 transition-transform duration-200 hover:scale-105 cursor-default select-none'

export default function ProductShowcase() {
  return (
    <section className="relative py-28 bg-surface overflow-hidden">

      {/* Background glow — centered below the image */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 55% at 50% 70%, rgba(0,81,213,0.045) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6">

        {/* ── Heading ── */}
        <div className="max-w-2xl mb-12">
          <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-ds-secondary mb-4">
            See it in action
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-on-surface leading-[1.06] mb-5">
            Transparency is the<br className="hidden sm:block" /> ultimate luxury.
          </h2>
          <p className="text-lg text-on-surface-variant leading-relaxed max-w-xl">
            Stop hunting through email threads. Give your clients a dedicated,
            high-fidelity space to track milestones, approve deliverables,
            and manage invoices — all in one branded portal.
          </p>
        </div>

        {/* ── Feature callouts ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14">
          {CALLOUTS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex items-start gap-4">
              <div
                className="flex items-center justify-center size-10 rounded-xl shrink-0 mt-0.5"
                style={{ background: 'rgba(0,81,213,0.08)' }}
              >
                <Icon size={18} strokeWidth={1.75} style={{ color: '#0051D5' }} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-on-surface">{title}</p>
                <p className="text-sm text-on-surface-variant leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Browser frame ── */}
        <div
          className="relative rounded-2xl border border-outline-variant bg-white overflow-hidden"
          style={{
            boxShadow: '0 8px 24px -4px rgba(0,81,213,0.08), 0 32px 64px -12px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.04)',
          }}
        >
          {/* Chrome bar */}
          <div className="flex items-center gap-3 px-4 h-11 bg-[#f5f5f5] border-b border-outline-variant shrink-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
              <span className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
              <span className="w-3 h-3 rounded-full bg-[#28C840]" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="flex items-center gap-2 w-full max-w-xs h-6 rounded-md bg-gray-200/70 px-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-[11px] text-gray-500 font-medium truncate">
                  app.portalkit.com/dashboard
                </span>
              </div>
            </div>
            <div className="w-14 shrink-0" aria-hidden />
          </div>

          {/* Dashboard image + annotation badges */}
          {/*
            IMPORTANT: Badge positions are calibrated for dashboard.png at its
            natural 1869×963 (1.94:1) ratio. If this image changes, re-verify
            badge positions across viewport widths before shipping.
          */}
          <div className="relative">
            <Image
              src="/dashboard.png"
              alt="PortalKit dashboard showing project milestones, file approvals, and invoice tracking"
              width={1869}
              height={963}
              priority
              className="w-full h-auto block"
            />

            {/* Badge 1 — Pending Approvals (top-right) */}
            <div className={BADGE} style={{ top: '11%', right: '3%' }}>
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
              <span className="text-amber-700">3 Pending Approvals</span>
            </div>

            {/* Badge 2 — Invoice Paid (mid-left) */}
            <div className={BADGE} style={{ top: '44%', left: '2.5%' }}>
              <span
                className="inline-flex items-center justify-center w-4 h-4 rounded-full shrink-0"
                style={{ background: 'var(--ds-tertiary-action)' }}
              >
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden>
                  <path d="M1.5 4.5L3.5 6.5L7 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="text-on-surface">Invoice Paid</span>
              <span className="text-on-surface-variant font-normal">·</span>
              <span style={{ color: 'var(--ds-tertiary-action)' }}>$3,200</span>
            </div>

            {/* Badge 3 — Progress (bottom-right) */}
            <div className={BADGE} style={{ bottom: '10%', right: '7%' }}>
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: 'var(--ds-secondary)' }}
              />
              <span className="text-on-surface">68% Complete</span>
              <span className="text-on-surface-variant font-normal">·</span>
              <span className="text-on-surface-variant font-medium">Phase 2</span>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, FileText } from 'lucide-react'
import { Header } from '@/components/public/header'
import Footer from '@/components/public/footer'

export const metadata: Metadata = {
  title: 'Platform',
  description:
    'Explore the full PortalKit platform — file approvals, invoicing, messaging, progress tracking, white labeling, and client permissions.',
}

/* ─── Reusable primitives (server-safe) ─────────────────────────── */

function DotGrid() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}
    />
  )
}

function Eyebrow({ label, dark }: { label: string; dark: boolean }) {
  return (
    <p
      className="text-[11px] font-semibold tracking-[0.16em] uppercase mb-4"
      style={{ color: dark ? '#6B9EFF' : '#0051D5' }}
    >
      {label}
    </p>
  )
}

function Bullet({ text, dark }: { text: string; dark: boolean }) {
  return (
    <li className="flex items-start gap-2.5">
      <span
        className="flex items-center justify-center w-4 h-4 rounded-sm shrink-0 mt-0.5"
        style={{ background: dark ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.12)' }}
      >
        <Check size={9} strokeWidth={3} style={{ color: dark ? '#4ade80' : '#16a34a' }} />
      </span>
      <span
        className="text-sm leading-relaxed"
        style={{ color: dark ? 'rgba(255,255,255,0.72)' : '#374151' }}
      >
        {text}
      </span>
    </li>
  )
}

/* ─── Page ────────────────────────────────────────────────────────── */

export default function PlatformPage() {
  return (
    <>
      <Header />
      <main className="pt-16">

        {/* ══ Hero ═══════════════════════════════════════════════════ */}
        <section className="relative bg-[#060b18] pt-36 pb-28 px-6 overflow-hidden">
          <DotGrid />
          {/* Blue glow offset toward the feature cards */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 65% at 68% 42%, rgba(0,81,213,0.11) 0%, transparent 65%)',
            }}
          />

          <div className="relative max-w-7xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-12 xl:gap-20 items-center">

            {/* ── Left: headline ── */}
            <div className="space-y-8 max-w-xl">
              <p
                className="text-[11px] font-semibold tracking-[0.16em] uppercase"
                style={{ color: '#6B9EFF' }}
              >
                Platform
              </p>
              <h1
                className="font-extrabold tracking-tight text-white leading-[1.03]"
                style={{ fontSize: 'clamp(2.75rem, 5.5vw, 4.25rem)' }}
              >
                Everything in one<br />premium workspace.
              </h1>
              <p
                className="text-xl leading-relaxed max-w-md"
                style={{ color: 'rgba(255,255,255,0.52)' }}
              >
                Six integrated tools that replace the email threads, scattered files, and
                missed payments slowing your business down.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/auth"
                  className="inline-flex items-center justify-center h-12 px-8 rounded bg-[#0051D5] text-white text-base font-semibold hover:brightness-110 transition-all"
                  style={{ boxShadow: '0 4px 20px rgba(0,81,213,0.4)' }}
                >
                  Start for free
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center h-12 px-8 rounded text-base font-semibold text-white transition-all hover:bg-white/8"
                  style={{ border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.05)' }}
                >
                  View pricing
                </Link>
              </div>
            </div>

            {/* ── Right: 3×2 feature mini-card bento ── */}
            <div className="grid grid-cols-2 gap-3">

              {/* 1 — File Approvals */}
              <Link
                href="#approvals"
                className="rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 hover:scale-[1.025]"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono truncate pr-2" style={{ color: 'rgba(255,255,255,0.32)' }}>
                      logo_suite_v3.svg
                    </span>
                    <span
                      className="shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}
                    >
                      Approved
                    </span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full w-full rounded-full" style={{ background: '#22c55e' }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono truncate pr-2" style={{ color: 'rgba(255,255,255,0.32)' }}>
                      homepage_v2.fig
                    </span>
                    <span
                      className="shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}
                    >
                      Awaiting
                    </span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full w-1/3 rounded-full" style={{ background: '#f59e0b' }} />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">File Approvals</p>
                  <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Review &amp; approve deliverables
                  </p>
                </div>
              </Link>

              {/* 2 — Invoicing */}
              <Link
                href="#invoicing"
                className="rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 hover:scale-[1.025]"
                style={{ background: 'rgba(0,81,213,0.09)', border: '1px solid rgba(0,81,213,0.24)' }}
              >
                <div>
                  <p className="text-[10px] font-mono mb-1" style={{ color: 'rgba(255,255,255,0.28)' }}>
                    INV-0042
                  </p>
                  <p className="text-2xl font-extrabold text-white leading-none">$3,500</p>
                  <span
                    className="inline-block mt-2 text-[9px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}
                  >
                    Paid via Stripe
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Invoicing</p>
                  <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Collect payments in-portal
                  </p>
                </div>
              </Link>

              {/* 3 — Messaging */}
              <Link
                href="#messaging"
                className="rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 hover:scale-[1.025]"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex flex-col gap-1.5">
                  <div
                    className="self-start rounded-xl rounded-bl-sm px-3 py-1.5"
                    style={{ background: 'rgba(255,255,255,0.09)' }}
                  >
                    <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.58)' }}>Any revisions?</p>
                  </div>
                  <div
                    className="self-end rounded-xl rounded-br-sm px-3 py-1.5"
                    style={{ background: 'rgba(0,81,213,0.55)' }}
                  >
                    <p className="text-[10px] text-white/75">Done by Friday!</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Messaging</p>
                  <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Move chats out of email
                  </p>
                </div>
              </Link>

              {/* 4 — Progress */}
              <Link
                href="#progress"
                className="rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 hover:scale-[1.025]"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="space-y-2">
                  {[
                    { pct: 100, color: '#22c55e' },
                    { pct: 72,  color: '#0051D5' },
                    { pct: 35,  color: '#0051D5' },
                  ].map(({ pct, color }, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div
                        className="flex-1 h-1.5 rounded-full overflow-hidden"
                        style={{ background: 'rgba(255,255,255,0.07)' }}
                      >
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <span
                        className="text-[9px] font-mono w-5 text-right shrink-0"
                        style={{ color: 'rgba(255,255,255,0.25)' }}
                      >
                        {pct}%
                      </span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Progress Tracking</p>
                  <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Real-time project visibility
                  </p>
                </div>
              </Link>

              {/* 5 — White Labeling */}
              <Link
                href="#branding"
                className="rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 hover:scale-[1.025]"
                style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.2)' }}
              >
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: '#7c3aed' }}
                    >
                      <span className="text-white text-[10px] font-bold">PS</span>
                    </div>
                    <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.65)' }}>
                      Pixel Studio
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-1 rounded-full w-3/4" style={{ background: 'rgba(167,139,250,0.28)' }} />
                    <div className="h-1 rounded-full w-1/2" style={{ background: 'rgba(255,255,255,0.1)' }} />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">White Labeling</p>
                  <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Your brand, your portal
                  </p>
                </div>
              </Link>

              {/* 6 — Permissions */}
              <Link
                href="#permissions"
                className="rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 hover:scale-[1.025]"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="space-y-1.5">
                  {[
                    { label: 'View deliverables', on: true  },
                    { label: 'Download files',    on: true  },
                    { label: 'View invoices',     on: false },
                  ].map(({ label, on }) => (
                    <div key={label} className="flex items-center justify-between py-0.5">
                      <span
                        className="text-[10px]"
                        style={{ color: on ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.26)' }}
                      >
                        {label}
                      </span>
                      <div
                        className="w-7 h-3.5 rounded-full flex items-center shrink-0"
                        style={{
                          background: on ? '#0051D5' : 'rgba(255,255,255,0.1)',
                          justifyContent: on ? 'flex-end' : 'flex-start',
                          padding: '1.5px',
                        }}
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-white" />
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Permissions</p>
                  <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Control what clients see
                  </p>
                </div>
              </Link>

            </div>
          </div>
        </section>

        {/* ══ File Approvals — light ═════════════════════════════════ */}
        <section id="approvals" className="bg-[#f8fafc] py-24 px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">

            <div>
              <Eyebrow label="File Management" dark={false} />
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 leading-[1.06] mb-5">
                File approvals that<br />actually work.
              </h2>
              <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-md">
                Centralize every version in one place. Clients approve with one click, or leave
                annotated feedback directly on files — no more emailing PDF markups.
              </p>
              <ul className="space-y-3">
                {[
                  'Full version history with timestamps',
                  'Annotated feedback on any file type',
                  'Email notifications on approval or rejection',
                  'Bulk upload via drag and drop',
                ].map(t => <Bullet key={t} text={t} dark={false} />)}
              </ul>
            </div>

            {/* Mock */}
            <div
              className="rounded-2xl border border-gray-200 bg-white p-5"
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
            >
              <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-4">
                Project deliverables
              </p>
              <div className="space-y-2.5 mb-4">
                {[
                  { name: 'logo_suite_v3.svg', size: '2.4 MB', status: 'Approved',  sc: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
                  { name: 'brand_guide.pdf',   size: '8.1 MB', status: 'In review', sc: 'text-blue-700 bg-blue-50 border-blue-100'          },
                  { name: 'homepage_v2.fig',   size: '12 MB',  status: 'Awaiting',  sc: 'text-amber-700 bg-amber-50 border-amber-100'       },
                ].map(({ name, size, status, sc }) => (
                  <div key={name} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <FileText size={13} className="text-[#0051D5]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{name}</p>
                        <p className="text-xs text-gray-400">{size}</p>
                      </div>
                    </div>
                    <span className={`shrink-0 ml-2 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${sc}`}>
                      {status}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <div className="flex-1 py-2.5 rounded-xl text-center text-xs font-semibold text-gray-500 bg-gray-100">
                  Request changes
                </div>
                <div className="flex-1 py-2.5 rounded-xl text-center text-xs font-bold text-white bg-[#0051D5]">
                  ✓ Approve all
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ Invoicing — dark ══════════════════════════════════════ */}
        <section id="invoicing" className="relative bg-[#060b18] py-24 px-6 overflow-hidden">
          <DotGrid />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 55% 50% at 75% 50%, rgba(0,81,213,0.07) 0%, transparent 70%)' }}
          />

          <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">

            {/* Mock (left) */}
            <div
              className="rounded-2xl p-6"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-[10px] font-mono tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    INVOICE #INV-0042
                  </p>
                  <p className="text-3xl font-extrabold text-white">$3,500.00</p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400">
                  Paid
                </span>
              </div>
              <div
                className="space-y-2.5 text-sm pb-5 mb-5"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
              >
                {[
                  { label: 'Brand identity design',    amount: '$2,000' },
                  { label: 'Website design (5 pages)', amount: '$1,500' },
                ].map(({ label, amount }) => (
                  <div key={label} className="flex justify-between">
                    <span style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</span>
                    <span className="font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>{amount}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2.5">
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(34,197,94,0.2)' }}
                >
                  <Check size={9} strokeWidth={3} className="text-emerald-400" />
                </span>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>
                  Paid via Stripe · Nov 12, 2024
                </span>
              </div>
            </div>

            {/* Copy (right) */}
            <div>
              <Eyebrow label="Invoicing" dark />
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-[1.06] mb-5">
                Know exactly when<br />clients pay.
              </h2>
              <p className="text-lg leading-relaxed mb-8 max-w-md" style={{ color: 'rgba(255,255,255,0.52)' }}>
                Connect Stripe and send invoices directly through the portal. See when a client
                views an invoice, get notified the moment it's paid — no more chasing.
              </p>
              <ul className="space-y-3">
                {[
                  'Stripe payment collection',
                  'Real-time "viewed" and "paid" notifications',
                  'Multi-currency invoice support',
                  'Automated payment reminders',
                ].map(t => <Bullet key={t} text={t} dark />)}
              </ul>
            </div>
          </div>
        </section>

        {/* ══ Messaging — light ══════════════════════════════════════ */}
        <section id="messaging" className="bg-white py-24 px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">

            <div>
              <Eyebrow label="Communication" dark={false} />
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 leading-[1.06] mb-5">
                Move conversations<br />out of your inbox.
              </h2>
              <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-md">
                Threaded client chats live right where the work is — attached to the relevant
                project or file. Context is always preserved, nothing gets buried.
              </p>
              <ul className="space-y-3">
                {[
                  'Threaded conversations per project or file',
                  'Rich text with file attachments',
                  'Read receipts and message timestamps',
                  'Email notifications for new messages',
                ].map(t => <Bullet key={t} text={t} dark={false} />)}
              </ul>
            </div>

            {/* Mock */}
            <div
              className="rounded-2xl border border-gray-200 bg-white p-5"
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
            >
              <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-4">
                Brand project · Messages
              </p>
              <div className="space-y-3 mb-4">
                <div className="flex gap-2.5 items-end">
                  <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center shrink-0 text-xs font-bold text-violet-600">S</div>
                  <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[80%]">
                    <p className="text-sm text-gray-800">Can we adjust the logo colors to be a bit warmer?</p>
                    <p className="text-[10px] text-gray-400 mt-1">10:24 AM</p>
                  </div>
                </div>
                <div className="flex gap-2.5 items-end justify-end">
                  <div className="bg-[#0051D5] rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[80%]">
                    <p className="text-sm text-white">Of course! I&apos;ll have a new version ready by EOD.</p>
                    <p className="text-[10px] text-white/60 mt-1">10:31 AM</p>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-xs font-bold text-blue-600">Y</div>
                </div>
                <div className="flex gap-2.5 items-end">
                  <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center shrink-0 text-xs font-bold text-violet-600">S</div>
                  <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-2.5">
                    <p className="text-sm text-gray-800">Perfect, thank you! ✨</p>
                    <p className="text-[10px] text-gray-400 mt-1">10:33 AM</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <div className="flex-1 h-9 rounded-xl bg-gray-100 px-3 flex items-center">
                  <span className="text-xs text-gray-400">Type a message...</span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#0051D5] flex items-center justify-center shrink-0">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path d="M12 7L2 2l2 5-2 5 10-5z" fill="white" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ Progress Tracking — dark ═══════════════════════════════ */}
        <section id="progress" className="relative bg-[#060b18] py-24 px-6 overflow-hidden">
          <DotGrid />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 55% 50% at 25% 50%, rgba(0,81,213,0.07) 0%, transparent 70%)' }}
          />

          <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">

            <div>
              <Eyebrow label="Transparency" dark />
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-[1.06] mb-5">
                End the &ldquo;how is it<br />going?&rdquo; calls.
              </h2>
              <p className="text-lg leading-relaxed mb-8 max-w-md" style={{ color: 'rgba(255,255,255,0.52)' }}>
                Clients see exactly where the project stands at any moment — no status update
                needed. Visible progress builds trust and eliminates micromanaging.
              </p>
              <ul className="space-y-3">
                {[
                  'Real-time progress bars per milestone',
                  'Phase-level visibility (design, dev, review)',
                  'Completion percentage updated automatically',
                  'Optional client-facing timeline view',
                ].map(t => <Bullet key={t} text={t} dark />)}
              </ul>
            </div>

            {/* Mock (right) */}
            <div
              className="rounded-2xl p-6"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <p className="text-[10px] font-mono tracking-wider mb-5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                PROJECT ALPHA — PROGRESS
              </p>
              <div className="space-y-5">
                {[
                  { label: 'Brand strategy', pct: 100, color: '#22c55e' },
                  { label: 'UI design',       pct: 75,  color: '#0051D5' },
                  { label: 'Development',     pct: 40,  color: '#0051D5' },
                  { label: 'Content writing', pct: 15,  color: '#f59e0b' },
                ].map(({ label, pct, color }) => (
                  <div key={label}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{label}</span>
                      <span
                        className="text-xs font-bold font-mono"
                        style={{ color: pct === 100 ? '#4ade80' : 'rgba(255,255,255,0.4)' }}
                      >
                        {pct}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══ White Labeling — light ═════════════════════════════════ */}
        <section id="branding" className="bg-[#f8fafc] py-24 px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">

            {/* Mock (left) */}
            <div
              className="rounded-2xl overflow-hidden border border-gray-200"
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
            >
              <div className="h-11 flex items-center gap-3 px-4" style={{ background: '#1a0533' }}>
                <div className="w-6 h-6 rounded-md bg-purple-500 flex items-center justify-center shrink-0">
                  <span className="text-white text-[10px] font-bold">P</span>
                </div>
                <span className="text-xs font-bold text-white">Pixel Studio</span>
                <div className="ml-auto flex gap-2">
                  <div className="h-1.5 w-14 rounded-full bg-white/20" />
                  <div className="h-1.5 w-10 rounded-full bg-white/20" />
                </div>
              </div>
              <div className="p-5" style={{ background: '#0d0020' }}>
                <div className="h-2 w-28 rounded-full bg-white/20 mb-4" />
                <div className="grid grid-cols-2 gap-3">
                  {[0, 1, 2, 3].map(i => (
                    <div
                      key={i}
                      className="rounded-xl p-3.5 space-y-2.5"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <div className="h-1.5 w-3/4 rounded-full bg-purple-400/40" />
                      <div className="h-1.5 w-1/2 rounded-full bg-white/20" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Eyebrow label="White Labeling" dark={false} />
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 leading-[1.06] mb-5">
                Your brand.<br />Your portal.
              </h2>
              <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-md">
                Apply your own logo, colors, and domain. Clients see your brand everywhere —
                not PortalKit&apos;s. To them, it looks like proprietary software your studio built.
              </p>
              <ul className="space-y-3">
                {[
                  'Custom domain (clients.yourbrand.com)',
                  'Upload your logo and brand colors',
                  'Custom email sender name',
                  'Remove all PortalKit references',
                ].map(t => <Bullet key={t} text={t} dark={false} />)}
              </ul>
            </div>
          </div>
        </section>

        {/* ══ Client Permissions — dark ══════════════════════════════ */}
        <section id="permissions" className="relative bg-[#060b18] py-24 px-6 overflow-hidden">
          <DotGrid />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 55% 50% at 75% 50%, rgba(0,81,213,0.07) 0%, transparent 70%)' }}
          />

          <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">

            {/* Mock (left) */}
            <div
              className="rounded-2xl p-6"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <p className="text-[10px] font-mono tracking-wider mb-5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                CLIENT ACCESS — SARAH K.
              </p>
              <div>
                {[
                  { label: 'View deliverables',   on: true  },
                  { label: 'Download files',       on: true  },
                  { label: 'Leave comments',       on: true  },
                  { label: 'View invoices',        on: false },
                  { label: 'See internal notes',   on: false },
                  { label: 'View team activity',   on: false },
                ].map(({ label, on }, i, arr) => (
                  <div
                    key={label}
                    className="flex items-center justify-between py-3.5"
                    style={{
                      borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                    }}
                  >
                    <span
                      className="text-sm"
                      style={{ color: on ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.32)' }}
                    >
                      {label}
                    </span>
                    <div
                      className="w-9 h-5 rounded-full flex items-center shrink-0 transition-colors"
                      style={{
                        background: on ? '#0051D5' : 'rgba(255,255,255,0.1)',
                        justifyContent: on ? 'flex-end' : 'flex-start',
                        padding: '2px',
                      }}
                    >
                      <div className="w-3.5 h-3.5 rounded-full bg-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Eyebrow label="Access Control" dark />
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-[1.06] mb-5">
                Control exactly<br />what clients see.
              </h2>
              <p className="text-lg leading-relaxed mb-8 max-w-md" style={{ color: 'rgba(255,255,255,0.52)' }}>
                Keep internal drafts, team notes, and sensitive materials hidden until you&apos;re
                ready. Clients only see what you want them to see — nothing more.
              </p>
              <ul className="space-y-3">
                {[
                  'Per-client visibility settings',
                  'Hide files until marked "ready for review"',
                  'Control invoice access independently',
                  'Separate internal and client-facing views',
                ].map(t => <Bullet key={t} text={t} dark />)}
              </ul>
            </div>
          </div>
        </section>

        {/* ══ Testimonials — light ══════════════════════════════════ */}
        <section className="bg-white py-24 px-6">
          <div className="max-w-7xl mx-auto">

            <div className="max-w-xl mb-14">
              <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#0051D5] mb-4">
                Real freelancers
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 leading-[1.06] mb-4">
                Used by people who take<br />their work seriously.
              </h2>
              <p className="text-lg text-gray-500 leading-relaxed">
                No onboarding call needed. Here&apos;s what they say after switching.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* Quote 1 */}
              <div
                className="rounded-2xl bg-white border border-gray-200 p-7 flex flex-col gap-5"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
              >
                <span className="inline-flex self-start text-[10px] font-bold tracking-[0.08em] uppercase px-2.5 py-1 rounded-full bg-blue-50 text-[#0051D5] border border-blue-100">
                  File Approvals
                </span>
                <p className="text-[15px] text-gray-700 leading-relaxed italic flex-1">
                  &ldquo;My clients used to send feedback across three separate email chains. Now
                  it&rsquo;s one thread attached to the actual file. I genuinely don&rsquo;t know
                  how I worked without it.&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center shrink-0 text-sm font-bold text-violet-700">
                    S
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Sarah Kim</p>
                    <p className="text-xs text-gray-400">Brand Designer</p>
                  </div>
                </div>
              </div>

              {/* Quote 2 */}
              <div
                className="rounded-2xl bg-white border border-gray-200 p-7 flex flex-col gap-5"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
              >
                <span className="inline-flex self-start text-[10px] font-bold tracking-[0.08em] uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                  Invoicing
                </span>
                <p className="text-[15px] text-gray-700 leading-relaxed italic flex-1">
                  &ldquo;I got paid while I was asleep. Invoice out Monday night, payment landed
                  Tuesday morning — zero chasing. That alone is worth the subscription ten
                  times over.&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-sm font-bold text-amber-700">
                    M
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Marcus T.</p>
                    <p className="text-xs text-gray-400">Freelance Developer</p>
                  </div>
                </div>
              </div>

              {/* Quote 3 */}
              <div
                className="rounded-2xl bg-white border border-gray-200 p-7 flex flex-col gap-5"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
              >
                <span className="inline-flex self-start text-[10px] font-bold tracking-[0.08em] uppercase px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                  White Labeling
                </span>
                <p className="text-[15px] text-gray-700 leading-relaxed italic flex-1">
                  &ldquo;My clients think I built a custom portal just for them. The white labeling
                  is that seamless. It&rsquo;s become a core part of my agency pitch — clients
                  expect it now.&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-sm font-bold text-blue-700">
                    L
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Leila R.</p>
                    <p className="text-xs text-gray-400">UX Consultant</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ══ CTA — blue gradient ════════════════════════════════════ */}
        <section
          className="relative overflow-hidden py-28 px-6"
          style={{ background: 'linear-gradient(150deg, #002a9e 0%, #0051D5 55%, #1268ff 100%)' }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
          <div className="relative max-w-xl mx-auto text-center space-y-6">
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.06]">
              See every feature<br />in action.
            </h2>
            <p className="text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.62)' }}>
              Start free and explore the full platform. No credit card, no commitment.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/auth"
                className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 rounded bg-white text-[#003db5] text-base font-bold hover:brightness-95 transition-all"
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
              >
                Start for free
              </Link>
              <Link
                href="/pricing"
                className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 rounded text-base font-semibold text-white transition-all hover:bg-white/10"
                style={{ border: '1px solid rgba(255,255,255,0.28)', background: 'rgba(255,255,255,0.07)' }}
              >
                View pricing
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 pt-2">
              {['No credit card required', 'Setup in under 10 minutes', 'Cancel anytime'].map(item => (
                <div key={item} className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.42)' }}>
                  <Check size={11} strokeWidth={2.5} style={{ color: 'rgba(255,255,255,0.5)' }} className="shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}

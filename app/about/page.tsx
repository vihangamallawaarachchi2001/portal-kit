import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, Zap, Eye, Heart, Shield } from 'lucide-react'
import { Header } from '@/components/public/header'
import Footer from '@/components/public/footer'

export const metadata: Metadata = {
  title: 'About',
  description:
    'PortalKit was built by freelancers who got tired of losing clients not because of their work, but because of how they delivered it.',
}

/* ─── Primitives ────────────────────────────────────────────────── */

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

/* ─── Data ──────────────────────────────────────────────────────── */

const STATS = [
  { value: '2026',      label: 'Year founded'        },
  { value: '< 10 min', label: 'To set up a portal'   },
  { value: '0',        label: 'Accounts for clients' },
  { value: '1',        label: 'Place for all of it'  },
]

const VALUES = [
  {
    Icon: Zap,
    title: 'Simplicity first',
    body: "If a freelancer can't set it up in 10 minutes, it's not done. Every feature earns its place by solving a real problem, not by sounding impressive.",
  },
  {
    Icon: Eye,
    title: 'Radical transparency',
    body: 'No hidden fees, no dark patterns, no lock-in. The relationship between a tool and its users should be as honest as the work you do for your clients.',
  },
  {
    Icon: Heart,
    title: 'Client-centric delivery',
    body: "Great freelance work deserves a great delivery experience. We obsess over the client side of PortalKit just as much as the freelancer side.",
  },
  {
    Icon: Shield,
    title: 'Reliability as a feature',
    body: "When you're presenting to a client, things need to work. We treat uptime, security, and performance as core features, not afterthoughts.",
  },
]

/* ─── Page ──────────────────────────────────────────────────────── */

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="pt-16">

        {/* ══ Hero ═════════════════════════════════════════════════ */}
        <section className="relative bg-[#060b18] pt-36 pb-28 px-6 overflow-hidden">
          <DotGrid />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 65% 55% at 50% 60%, rgba(0,81,213,0.1) 0%, transparent 70%)' }}
          />

          <div className="relative max-w-3xl mx-auto text-center space-y-8">
            <p className="text-[11px] font-semibold tracking-[0.16em] uppercase" style={{ color: '#6B9EFF' }}>
              Our story
            </p>

            <h1
              className="font-extrabold tracking-tight text-white leading-[1.06]"
              style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)' }}
            >
              We built the tool we<br />
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>always wished existed.</span>
            </h1>

            <p className="text-xl leading-relaxed max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.52)' }}>
              PortalKit started when we realised we were losing clients not because of our
              work — but because of how we delivered it.
            </p>

            <div
              className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full text-sm"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.45)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-[#0051D5]" />
              Founded 2026 &nbsp;·&nbsp; Built by freelancers &nbsp;·&nbsp; For freelancers
            </div>
          </div>
        </section>

        {/* ══ Story — light ════════════════════════════════════════ */}
        <section className="bg-[#f8fafc] py-24 px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-16 lg:gap-20 items-start">

            {/* Left: story copy */}
            <div className="space-y-6">
              <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#0051D5]">
                The problem we lived through
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 leading-[1.06]">
                Great work.<br />Messy delivery.
              </h2>
              <p className="text-lg text-gray-500 leading-relaxed">
                Before PortalKit, we ran our client projects the way most freelancers do —
                email threads for feedback, Dropbox links for files, a separate invoicing
                app that clients never bothered logging into, and constant &ldquo;how is it
                going?&rdquo; check-ins that ate up half our week.
              </p>
              <p className="text-lg text-gray-500 leading-relaxed">
                We were doing excellent work but delivering it in a way that felt fragmented
                and unprofessional. Some clients sensed that and walked away — not because
                our design was bad, but because the experience of working with us felt
                disorganised.
              </p>
              <p className="text-lg text-gray-500 leading-relaxed">
                In 2026, after researching every tool on the market and finding nothing that
                fit the freelance workflow, we built PortalKit — a single, branded portal
                that a freelancer can set up in minutes and a client can access with one
                link, no account required.
              </p>
            </div>

            {/* Right: founder note + indie note */}
            <div className="lg:sticky lg:top-28 space-y-4">

              {/* Founder quote */}
              <div
                className="rounded-2xl p-7"
                style={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: 'rgba(0,81,213,0.2)' }}
                >
                  <span className="text-xl leading-none" style={{ color: '#6B9EFF' }}>✦</span>
                </div>
                <blockquote
                  className="text-[15px] leading-relaxed italic mb-6"
                  style={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  &ldquo;We realised the gap wasn&apos;t in the quality of the work — it was
                  in the delivery experience. Clients pay for both. PortalKit is our answer
                  to that.&rdquo;
                </blockquote>
                <div className="pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-sm font-semibold text-white">The PortalKit Team</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Founders · 2026</p>
                </div>
              </div>

              {/* Indie note */}
              <div
                className="rounded-2xl p-5"
                style={{ background: 'rgba(0,81,213,0.05)', border: '1px solid rgba(0,81,213,0.14)' }}
              >
                <p className="text-[13px] text-gray-600 leading-relaxed">
                  PortalKit is a small, independent product. No VC funding, no
                  growth-at-all-costs pressure. We move deliberately and only ship things
                  that actually solve problems.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ══ Stats — dark ══════════════════════════════════════════ */}
        <section className="relative bg-[#060b18] py-20 px-6 overflow-hidden">
          <DotGrid />
          <div className="relative max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-12">
            {STATS.map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center text-center gap-2">
                <span
                  className="font-extrabold tracking-tight leading-none"
                  style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#6B9EFF' }}
                >
                  {value}
                </span>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.42)' }}>{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ══ Values — light ════════════════════════════════════════ */}
        <section className="bg-white py-24 px-6">
          <div className="max-w-7xl mx-auto">

            <div className="max-w-xl mb-14">
              <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#0051D5] mb-4">
                What we believe
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 leading-[1.06]">
                The principles behind<br />every decision.
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {VALUES.map(({ Icon, title, body }) => (
                <div
                  key={title}
                  className="flex gap-5 rounded-2xl bg-white border border-gray-200 p-7"
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                >
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0 mt-0.5"
                    style={{ background: 'rgba(0,81,213,0.08)' }}
                  >
                    <Icon size={18} strokeWidth={1.75} style={{ color: '#0051D5' }} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-gray-900 mb-2">{title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ══ What we replaced — dark ═══════════════════════════════ */}
        <section className="relative bg-[#060b18] py-24 px-6 overflow-hidden">
          <DotGrid />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(0,81,213,0.07) 0%, transparent 65%)' }}
          />

          <div className="relative max-w-7xl mx-auto">
            <div className="max-w-xl mb-14">
              <p className="text-[11px] font-semibold tracking-[0.16em] uppercase mb-4" style={{ color: '#6B9EFF' }}>
                What we set out to fix
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-[1.06]">
                Five tools.<br />One portal.
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { from: 'Email threads',        to: 'Client messaging',    desc: 'Threaded, per-project — no lost context.'  },
                { from: 'Dropbox / WeTransfer', to: 'File approvals',      desc: 'Versioned, annotated, one-click approved.' },
                { from: 'FreshBooks / Wave',    to: 'Stripe invoicing',    desc: 'Send, collect, track — in the portal.'     },
                { from: 'Status update calls',  to: 'Progress tracking',   desc: 'Live milestones, visible 24/7.'            },
                { from: 'Generic portal',       to: 'White-labeled brand', desc: 'Clients see your brand, not PortalKit.'    },
              ].map(({ from, to, desc }) => (
                <div
                  key={from}
                  className="rounded-2xl p-5 flex flex-col gap-4"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div>
                    <p
                      className="text-xs font-mono line-through mb-2"
                      style={{ color: 'rgba(255,255,255,0.25)', textDecorationColor: 'rgba(255,80,80,0.4)' }}
                    >
                      {from}
                    </p>
                    <div className="h-px w-full mb-2" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    <p className="text-sm font-semibold text-white">{to}</p>
                  </div>
                  <p className="text-[11px] leading-relaxed mt-auto" style={{ color: 'rgba(255,255,255,0.38)' }}>
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ Talk to us — light ════════════════════════════════════ */}
        <section className="bg-white py-24 px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-16 lg:gap-20 items-center">

            {/* Left: copy */}
            <div className="space-y-6">
              <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#0051D5]">
                Get in touch
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 leading-[1.06]">
                We&apos;re a small team.<br />We read every message.
              </h2>
              <p className="text-lg text-gray-500 leading-relaxed max-w-md">
                Whether you have a question, a feature idea, or you just want to share
                how you&apos;re using PortalKit — we genuinely want to hear it. Your
                feedback directly shapes what we build next.
              </p>
              <p className="text-lg text-gray-500 leading-relaxed max-w-md">
                We&apos;re not a faceless SaaS. There&apos;s a real person on the other
                end of every reply, and we aim to respond within one business day.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 h-12 px-8 rounded bg-[#0051D5] text-white text-base font-semibold hover:brightness-110 transition-all"
                style={{ boxShadow: '0 4px 20px rgba(0,81,213,0.28)' }}
              >
                Send us a message
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>

            {/* Right: contact option cards */}
            <div className="flex flex-col gap-3">
              {[
                {
                  label:   'Questions & feedback',
                  desc:    'Anything about the product, pricing, or how to get the most out of PortalKit.',
                  time:    'Replies within 1 business day',
                  tcolor:  'text-emerald-600',
                  tbg:     'bg-emerald-50',
                },
                {
                  label:   'Bug reports',
                  desc:    'Something not working as expected? Tell us exactly what happened and we\'ll fix it.',
                  time:    'Acknowledged within 4 hours',
                  tcolor:  'text-amber-700',
                  tbg:     'bg-amber-50',
                },
                {
                  label:   'Partnership & press',
                  desc:    'Integrations, co-marketing, media enquiries, and anything else that doesn\'t fit above.',
                  time:    'Replies within 2 business days',
                  tcolor:  'text-blue-700',
                  tbg:     'bg-blue-50',
                },
              ].map(({ label, desc, time, tcolor, tbg }) => (
                <Link
                  key={label}
                  href="/contact"
                  className="group flex flex-col gap-2 rounded-2xl bg-white border border-gray-200 p-5 transition-all duration-200 hover:border-gray-300 hover:shadow-sm"
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[15px] font-semibold text-gray-900">{label}</p>
                    <svg
                      className="shrink-0 mt-0.5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all"
                      width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden
                    >
                      <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                  <span className={`self-start text-[10px] font-semibold px-2.5 py-1 rounded-full ${tcolor} ${tbg}`}>
                    {time}
                  </span>
                </Link>
              ))}
            </div>

          </div>
        </section>

        {/* ══ CTA — blue gradient ═══════════════════════════════════ */}
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
              Join us in raising<br />the bar.
            </h2>
            <p className="text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.62)' }}>
              Your clients deserve a better delivery experience. So do you.
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
                href="/platform"
                className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 rounded text-base font-semibold text-white transition-all hover:bg-white/10"
                style={{ border: '1px solid rgba(255,255,255,0.28)', background: 'rgba(255,255,255,0.07)' }}
              >
                Explore the platform
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

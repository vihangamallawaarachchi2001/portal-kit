import type { Metadata } from 'next'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { Header } from '@/components/public/header'
import Footer from '@/components/public/footer'
import PricingSection from '@/components/pricing/pricing-section'

export const metadata: Metadata = {
  title: 'Pricing — PortalKit',
  description:
    'Start for free, upgrade when ready. Simple, transparent pricing with no hidden fees for freelancers and agencies.',
}

const PRICING_FAQS = [
  {
    q: 'Is there really a free plan?',
    a: 'Yes. The Free plan is free forever — no credit card required. It includes 3 active client portals and unlimited projects, which is plenty to experience PortalKit before committing.',
  },
  {
    q: 'How does the 14-day trial work?',
    a: 'When you upgrade to Pro or Business, you get 14 days of full access at no charge. Cancel any time before it ends and you will not be billed.',
  },
  {
    q: 'Can I change plans at any time?',
    a: 'Yes. Upgrade or downgrade instantly from your account settings. When upgrading mid-cycle, you pay a prorated amount for the remainder of the period.',
  },
  {
    q: 'How does annual billing work?',
    a: 'Annual billing is charged once per year and saves you 20%. Pro works out to $12/mo ($144/yr) and Business to $23/mo ($276/yr). You can switch to annual any time from settings.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit and debit cards (Visa, Mastercard, Amex) via Stripe. For Business annual plans, bank transfers can be arranged — just contact us.',
  },
  {
    q: 'What happens to my data if I cancel?',
    a: 'Your data is yours. After cancellation you have 30 days to export everything before permanent deletion. We send reminders throughout that window.',
  },
]

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

export default function PricingPage() {
  return (
    <>
      <Header />
      <main className="pt-16">

        {/* ══ Hero ════════════════════════════════════════════════════ */}
        <section className="relative bg-[#060b18] pt-36 pb-20 px-6 overflow-hidden">
          <DotGrid />
          {/* Glow offset toward the bento side */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 65% at 68% 42%, rgba(0,81,213,0.11) 0%, transparent 65%)',
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(0,81,213,0.4), transparent)' }}
          />

          <div className="relative max-w-7xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-12 xl:gap-20 items-center">

            {/* Left: headline */}
            <div className="space-y-8 max-w-xl">
              <p className="text-[11px] font-semibold tracking-[0.16em] uppercase" style={{ color: '#6B9EFF' }}>
                Pricing
              </p>
              <h1
                className="font-extrabold tracking-tight text-white leading-[1.03]"
                style={{ fontSize: 'clamp(2.75rem, 5.5vw, 4.25rem)' }}
              >
                Simple pricing,<br />
                <span
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #60a5fa, #93c5fd)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  no surprises.
                </span>
              </h1>
              <p className="text-xl leading-relaxed max-w-md" style={{ color: 'rgba(255,255,255,0.52)' }}>
                Start for free and upgrade as your business grows. Every paid plan includes a 14-day free trial — no credit card required.
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
                  href="#compare"
                  className="inline-flex items-center justify-center h-12 px-8 rounded text-base font-semibold text-white transition-all hover:bg-white/8"
                  style={{ border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.05)' }}
                >
                  Compare plans ↓
                </Link>
              </div>
              {/* Trust chips */}
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {['No credit card for Free', '14-day trial on paid plans', 'Cancel anytime'].map(t => (
                  <span key={t} className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>
                    <Check size={11} strokeWidth={2.5} className="text-blue-400/70 shrink-0" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: 2×2 trust bento */}
            <div className="grid grid-cols-2 gap-3">

              {/* Free forever */}
              <div
                className="rounded-2xl p-5 flex flex-col gap-3"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div>
                  <p className="text-[10px] font-mono mb-1" style={{ color: 'rgba(255,255,255,0.28)' }}>free plan</p>
                  <p className="text-3xl font-extrabold text-white leading-none">$0</p>
                  <span
                    className="inline-block mt-2 text-[9px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}
                  >
                    Forever
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Free forever</p>
                  <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    No card, no expiry, no catch
                  </p>
                </div>
              </div>

              {/* 14-day trial */}
              <div
                className="rounded-2xl p-5 flex flex-col gap-3"
                style={{ background: 'rgba(0,81,213,0.09)', border: '1px solid rgba(0,81,213,0.24)' }}
              >
                <div>
                  <p className="text-[10px] font-mono mb-1" style={{ color: 'rgba(255,255,255,0.28)' }}>free trial</p>
                  <p className="text-3xl font-extrabold text-white leading-none">14 days</p>
                  <span
                    className="inline-block mt-2 text-[9px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
                  >
                    No commitment
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Full Pro & Business access</p>
                  <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Try every feature before paying
                  </p>
                </div>
              </div>

              {/* Annual savings */}
              <div
                className="rounded-2xl p-5 flex flex-col gap-3"
                style={{ background: 'rgba(0,81,213,0.09)', border: '1px solid rgba(0,81,213,0.24)' }}
              >
                <div>
                  <p className="text-[10px] font-mono mb-1" style={{ color: 'rgba(255,255,255,0.28)' }}>annual billing</p>
                  <p className="text-3xl font-extrabold text-white leading-none">20% off</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-mono line-through" style={{ color: 'rgba(255,255,255,0.3)' }}>$15/mo</span>
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}
                    >
                      $12/mo
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Save up to $72 / year</p>
                  <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Switch to annual any time
                  </p>
                </div>
              </div>

              {/* Cancel anytime */}
              <div
                className="rounded-2xl p-5 flex flex-col gap-3"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div>
                  <p className="text-[10px] font-mono mb-1" style={{ color: 'rgba(255,255,255,0.28)' }}>no lock-in</p>
                  <p className="text-3xl font-extrabold text-white leading-none">Cancel</p>
                  <span
                    className="inline-block mt-2 text-[9px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
                  >
                    Anytime
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">No questions asked</p>
                  <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    30 days to export your data
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ══ Toggle + Cards + Comparison table (client component) ═══ */}
        <PricingSection />

        {/* ══ FAQ ═════════════════════════════════════════════════════ */}
        <section className="bg-[#f8fafc] py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#0051D5] mb-3">FAQ</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Common questions
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-10">
              {PRICING_FAQS.map(({ q, a }) => (
                <div key={q} className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span
                      className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                      style={{ background: 'rgba(0,81,213,0.08)' }}
                    >
                      <span className="text-[10px] font-black text-[#0051D5]">Q</span>
                    </span>
                    <h3 className="text-sm font-bold text-gray-900 leading-snug">{q}</h3>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed pl-8">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ CTA ═════════════════════════════════════════════════════ */}
        <section
          className="relative overflow-hidden py-24 px-6"
          style={{ background: 'linear-gradient(150deg, #002a9e 0%, #0051D5 55%, #1268ff 100%)' }}
        >
          <DotGrid />
          <div className="relative max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              Ready to get started?
            </h2>
            <p className="text-lg" style={{ color: 'rgba(255,255,255,0.62)' }}>
              No credit card required. Your first portal takes under 10 minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/auth"
                className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 rounded text-base font-bold hover:brightness-95 transition-all"
                style={{ background: '#fff', color: '#003db5', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
              >
                Start for free
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 rounded text-base font-semibold text-white transition-all hover:bg-white/10"
                style={{ border: '1px solid rgba(255,255,255,0.28)', background: 'rgba(255,255,255,0.07)' }}
              >
                Talk to us
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-1">
              {['No credit card', '14-day free trial', 'Cancel anytime'].map(item => (
                <div key={item} className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  <Check size={12} strokeWidth={2.5} className="text-blue-300/70 shrink-0" />
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

import type { Metadata } from 'next'
import Link from 'next/link'
import { Mail, CreditCard, Shield, MessageSquare, Clock, BookOpen, Check, Users, HeartHandshake } from 'lucide-react'
import { Header } from '@/components/public/header'
import Footer from '@/components/public/footer'
import ContactForm from '@/components/contact/contact-form'

export const metadata: Metadata = {
  title: 'Contact — PortalKit',
  description: 'Get in touch with the PortalKit team. We reply within one business day.',
}

const CONTACT_ROUTES = [
  {
    icon: MessageSquare,
    label: 'General enquiries',
    description: 'Questions about features, the platform, or getting started.',
    email: 'hello@portalkit.com',
    color: '#0051D5',
    bg: 'rgba(0,81,213,0.07)',
  },
  {
    icon: CreditCard,
    label: 'Billing & plans',
    description: 'Subscription changes, invoices, refunds, and plan questions.',
    email: 'billing@portalkit.com',
    color: '#7c3aed',
    bg: 'rgba(124,58,237,0.07)',
  },
  {
    icon: Shield,
    label: 'Security',
    description: 'Vulnerability reports and security-related concerns.',
    email: 'security@portalkit.com',
    color: '#059669',
    bg: 'rgba(5,150,105,0.07)',
  },
]

const QUICK_LINKS = [
  { icon: BookOpen, label: 'Pricing & plan details',   href: '/pricing'  },
  { icon: Shield,   label: 'Security overview',         href: '/security' },
  { icon: Mail,     label: 'Privacy Policy',             href: '/privacy'  },
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

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="pt-16">

        {/* ── Hero ──────────────────────────────────────────────── */}
        <section className="relative bg-[#060b18] pt-36 pb-28 px-6 overflow-hidden">
          <DotGrid />
          {/* Blue glow offset toward the bento side */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 65% at 68% 42%, rgba(0,81,213,0.11) 0%, transparent 65%)',
            }}
          />

          <div className="relative max-w-7xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-12 xl:gap-20 items-center">

            {/* Left: headline + CTAs */}
            <div className="space-y-8 max-w-xl">
              <p
                className="text-[11px] font-semibold tracking-[0.16em] uppercase"
                style={{ color: '#6B9EFF' }}
              >
                Contact
              </p>
              <h1
                className="font-extrabold tracking-tight text-white leading-[1.03]"
                style={{ fontSize: 'clamp(2.75rem, 5.5vw, 4.25rem)' }}
              >
                We&apos;d love to<br />hear from you.
              </h1>
              <p
                className="text-xl leading-relaxed max-w-md"
                style={{ color: 'rgba(255,255,255,0.52)' }}
              >
                We&apos;re a small team and we read every message. You&apos;ll hear back from
                a real person — not a bot — within one business day.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="#contact-form"
                  className="inline-flex items-center justify-center h-12 px-8 rounded bg-[#0051D5] text-white text-base font-semibold hover:brightness-110 transition-all"
                  style={{ boxShadow: '0 4px 20px rgba(0,81,213,0.4)' }}
                >
                  Send a message
                </Link>
                <a
                  href="mailto:hello@portalkit.com"
                  className="inline-flex items-center justify-center h-12 px-8 rounded text-base font-semibold text-white transition-all hover:bg-white/8"
                  style={{ border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.05)' }}
                >
                  Email us directly
                </a>
              </div>
              {/* Trust chips */}
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {[
                  'Replies in < 1 business day',
                  'Real people, no bots',
                  'Free support on all plans',
                ].map(t => (
                  <span key={t} className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>
                    <Check size={11} strokeWidth={2.5} className="text-blue-400/70 shrink-0" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: 2×2 contact bento */}
            <div className="grid grid-cols-2 gap-3">

              {/* Response time */}
              <div
                className="rounded-2xl p-5 flex flex-col gap-3"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div>
                  <p className="text-[10px] font-mono mb-1" style={{ color: 'rgba(255,255,255,0.28)' }}>response time</p>
                  <p className="text-3xl font-extrabold text-white leading-none">&lt; 1 day</p>
                  <span
                    className="inline-block mt-2 text-[9px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}
                  >
                    ● Typically faster
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">One business day</p>
                  <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Mon–Fri, 9 am–6 pm AEST
                  </p>
                </div>
              </div>

              {/* Human support */}
              <div
                className="rounded-2xl p-5 flex flex-col gap-3"
                style={{ background: 'rgba(0,81,213,0.09)', border: '1px solid rgba(0,81,213,0.24)' }}
              >
                <div>
                  <p className="text-[10px] font-mono mb-1" style={{ color: 'rgba(255,255,255,0.28)' }}>support type</p>
                  <div className="flex items-center gap-2">
                    <Users size={28} strokeWidth={1.5} className="text-blue-300 shrink-0" />
                  </div>
                  <span
                    className="inline-block mt-2 text-[9px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.6)' }}
                  >
                    No AI bots
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Real people</p>
                  <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Straight to our inbox, always
                  </p>
                </div>
              </div>

              {/* Channels */}
              <div
                className="rounded-2xl p-5 flex flex-col gap-3"
                style={{ background: 'rgba(0,81,213,0.09)', border: '1px solid rgba(0,81,213,0.24)' }}
              >
                <div>
                  <p className="text-[10px] font-mono mb-1" style={{ color: 'rgba(255,255,255,0.28)' }}>contact channels</p>
                  <p className="text-3xl font-extrabold text-white leading-none">3</p>
                  <span
                    className="inline-block mt-2 text-[9px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.6)' }}
                  >
                    General · Billing · Security
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Right inbox, first time</p>
                  <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Route your question directly
                  </p>
                </div>
              </div>

              {/* Free support */}
              <div
                className="rounded-2xl p-5 flex flex-col gap-3"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div>
                  <p className="text-[10px] font-mono mb-1" style={{ color: 'rgba(255,255,255,0.28)' }}>cost</p>
                  <div className="flex items-center gap-2">
                    <HeartHandshake size={28} strokeWidth={1.5} className="text-white/70 shrink-0" />
                  </div>
                  <span
                    className="inline-block mt-2 text-[9px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
                  >
                    All plans
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Free for everyone</p>
                  <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Including the free tier
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── Main content ──────────────────────────────────────── */}
        <section id="contact-form" className="bg-white py-20 px-6 scroll-mt-16">
          <div className="max-w-5xl mx-auto">
            <div className="lg:grid lg:grid-cols-[340px_1fr] gap-14 items-start">

              {/* Left: contact info sidebar */}
              <aside className="space-y-8 lg:sticky lg:top-24 mb-10 lg:mb-0">

                {/* Response time */}
                <div
                  className="rounded-2xl p-5 flex items-start gap-4"
                  style={{ background: '#f8fafc', border: '1px solid #e5e7eb' }}
                >
                  <span
                    className="flex items-center justify-center size-10 rounded-xl shrink-0"
                    style={{ background: 'rgba(0,81,213,0.08)' }}
                  >
                    <Clock size={18} strokeWidth={1.75} style={{ color: '#0051D5' }} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-gray-900">One business day</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                      Our support hours are Mon–Fri, 9 am–6 pm AEST.
                      Critical issues are escalated outside business hours.
                    </p>
                  </div>
                </div>

                {/* Contact routes */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400 mb-3">
                    Contact by topic
                  </p>
                  <div className="space-y-2.5">
                    {CONTACT_ROUTES.map(({ icon: Icon, label, description, email, color, bg }) => (
                      <div
                        key={email}
                        className="rounded-xl p-4 flex items-start gap-3.5"
                        style={{ background: '#f8fafc', border: '1px solid #e5e7eb' }}
                      >
                        <span
                          className="flex items-center justify-center size-8 rounded-lg shrink-0 mt-0.5"
                          style={{ background: bg }}
                        >
                          <Icon size={15} strokeWidth={1.75} style={{ color }} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{label}</p>
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
                          <a
                            href={`mailto:${email}`}
                            className="inline-block mt-1.5 text-xs font-medium text-blue-600 hover:underline underline-offset-2"
                          >
                            {email}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick links */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400 mb-3">
                    Quick answers
                  </p>
                  <div className="space-y-1">
                    {QUICK_LINKS.map(({ icon: Icon, label, href }) => (
                      <Link
                        key={href}
                        href={href}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors group"
                      >
                        <Icon size={14} strokeWidth={1.75} className="text-gray-400 group-hover:text-blue-500 shrink-0 transition-colors" />
                        {label}
                        <span className="ml-auto text-gray-300 group-hover:text-gray-500 text-xs">→</span>
                      </Link>
                    ))}
                  </div>
                </div>

              </aside>

              {/* Right: form */}
              <div>
                <ContactForm />
              </div>

            </div>
          </div>
        </section>

        {/* ── Enterprise CTA ────────────────────────────────────── */}
        <section className="bg-gray-50 py-16 px-6" style={{ borderTop: '1px solid #f1f5f9' }}>
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">

              {/* Enterprise card */}
              <div
                className="rounded-2xl p-7 space-y-4"
                style={{
                  background: 'linear-gradient(135deg, #060b18 0%, #0d1a35 100%)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold"
                  style={{ background: 'rgba(0,81,213,0.25)', color: '#93c5fd', border: '1px solid rgba(0,81,213,0.3)' }}
                >
                  Enterprise / Agency
                </div>
                <h3 className="text-lg font-bold text-white">Managing multiple clients?</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Our Business plan is built for agencies — unlimited portals, team members, full
                  white labelling, and a dedicated onboarding call to get your team up and running fast.
                </p>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-blue-300 transition-colors"
                >
                  View Business plan →
                </Link>
              </div>

              {/* Transparent / honest card */}
              <div
                className="rounded-2xl p-7 space-y-4"
                style={{ background: '#fff', border: '1px solid #e5e7eb' }}
              >
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold"
                  style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}
                >
                  Our promise
                </div>
                <h3 className="text-lg font-bold text-gray-900">No sales calls. No pressure.</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  When you contact us, you&apos;re talking to the people who built PortalKit.
                  We&apos;ll give you an honest answer — including if something isn&apos;t the right fit
                  for what you need.
                </p>
                <Link
                  href="/auth"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Start for free instead →
                </Link>
              </div>

            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}

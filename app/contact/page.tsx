import type { Metadata } from 'next'
import Link from 'next/link'
import { Mail, CreditCard, Shield, MessageSquare, Clock, BookOpen } from 'lucide-react'
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
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.028) 1px, transparent 1px)',
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
        <section className="relative bg-[#060b18] pt-28 pb-16 px-6 overflow-hidden">
          <DotGrid />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(0,81,213,0.45), transparent)' }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 right-1/4 w-[600px] h-[500px]"
            style={{ background: 'radial-gradient(ellipse at center, rgba(0,81,213,0.11) 0%, transparent 68%)' }}
          />

          <div className="relative max-w-5xl mx-auto">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] mb-4" style={{ color: '#6B9EFF' }}>
              Contact
            </p>
            <h1
              className="font-extrabold text-white tracking-tight leading-[1.06]"
              style={{ fontSize: 'clamp(2.5rem, 4.5vw, 3.5rem)' }}
            >
              We&apos;d love to<br />
              <span
                style={{
                  backgroundImage: 'linear-gradient(90deg, #60a5fa, #93c5fd)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                hear from you.
              </span>
            </h1>
            <p className="mt-5 text-base max-w-md leading-relaxed" style={{ color: 'rgba(255,255,255,0.48)' }}>
              We&apos;re a small team and we read every message. Send us a note and you&apos;ll
              hear back from a real person within one business day.
            </p>

            {/* Response time pill */}
            <div
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.10)',
                color: 'rgba(255,255,255,0.55)',
              }}
            >
              <span
                className="size-2 rounded-full shrink-0"
                style={{ background: '#4ade80', boxShadow: '0 0 6px #4ade80' }}
              />
              Typically replies within 1 business day
            </div>
          </div>
        </section>

        {/* ── Main content ──────────────────────────────────────── */}
        <section className="bg-white py-20 px-6">
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

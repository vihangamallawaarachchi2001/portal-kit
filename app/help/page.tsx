import type { Metadata } from 'next'
import Link from 'next/link'
import { PlayCircle, Palette, FolderOpen, CreditCard, Users, Settings, Mail, ChevronDown, ArrowRight } from 'lucide-react'
import { Header } from '@/components/public/header'
import Footer from '@/components/public/footer'
import { PageHero } from '@/components/public/page-hero'

export const metadata: Metadata = {
  title: 'Help Center',
  description:
    'Find answers, guides, and support for PortalKit. Browse by category or contact our team directly.',
}

const CATEGORIES = [
  {
    icon: PlayCircle,
    title: 'Getting Started',
    description: 'Set up your first portal, invite a client, and understand the basics.',
    articles: 12,
    href: '#getting-started',
    color: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
  },
  {
    icon: Palette,
    title: 'Portal Customization',
    description: 'Custom domains, branding, colors, and white-label configuration.',
    articles: 8,
    href: '#customization',
    color: 'bg-violet-500/10 border-violet-500/20 text-violet-500',
  },
  {
    icon: FolderOpen,
    title: 'File Management',
    description: 'Uploading, versioning, approvals, and client-facing file permissions.',
    articles: 11,
    href: '#files',
    color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
  },
  {
    icon: CreditCard,
    title: 'Invoices & Payments',
    description: 'Connecting Stripe or PayPal, sending invoices, and payment tracking.',
    articles: 9,
    href: '#payments',
    color: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
  },
  {
    icon: Users,
    title: 'Team & Permissions',
    description: 'Adding team members, setting client access levels, and managing roles.',
    articles: 7,
    href: '#team',
    color: 'bg-rose-500/10 border-rose-500/20 text-rose-500',
  },
  {
    icon: Settings,
    title: 'Billing & Account',
    description: 'Plan changes, invoices, cancellation, and account deletion.',
    articles: 6,
    href: '#billing',
    color: 'bg-ds-secondary/10 border-ds-secondary/20 text-ds-secondary',
  },
]

const FAQS = [
  {
    question: 'How do I send my first client portal?',
    answer:
      'Create a project from your dashboard, add your deliverables, then click "Share portal" to generate a unique link. Send that link to your client — no signup needed on their end.',
  },
  {
    question: "My client says they can't open the portal. What should I check?",
    answer:
      "First, check that the portal link hasn't expired (links are valid for 90 days by default). If it expired, regenerate it from your project settings. Also confirm the client is using a modern browser — Chrome, Safari, Firefox, and Edge all work.",
  },
  {
    question: 'Can I have multiple portals for the same client?',
    answer:
      'Yes. Each project gets its own portal link. You can have as many portals per client as your plan allows, each with its own files, invoices, and messages.',
  },
  {
    question: 'How do I connect Stripe to send invoices?',
    answer:
      "Go to Settings → Integrations → Stripe, then click \"Connect Stripe account\". You'll be redirected to Stripe's OAuth flow. Once connected, you can attach payment requests to any project.",
  },
  {
    question: 'How do I export all my data?',
    answer:
      "Go to Settings → Account → Export data. You'll receive a ZIP file by email within a few minutes containing all your projects, files, messages, and invoice history.",
  },
]

export default function HelpPage() {
  return (
    <>
      <Header />
      <main className="pt-16">

        <PageHero
          eyebrow="Help Center"
          headline="How can"
          accentLine="we help?"
          description="Browse guides by topic, search for an answer, or reach our team directly. We reply to every message."
        >
          {/* Search bar styled for dark bg */}
          <div className="flex items-center gap-3 max-w-sm mx-auto mt-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
            <svg className="size-4 shrink-0" viewBox="0 0 20 20" fill="none" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <path d="M17.5 17.5l-4.167-4.167M14.167 8.333A5.833 5.833 0 1 1 2.5 8.333a5.833 5.833 0 0 1 11.667 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Search the Help Center…</span>
          </div>
        </PageHero>

        {/* ── Help categories ───────────────────────────────────── */}
        <section className="bg-surface py-20 px-6">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-lg font-bold text-on-surface mb-8">Browse by topic</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CATEGORIES.map(({ icon: Icon, title, description, articles, href, color }) => (
                <Link
                  key={title}
                  href={href}
                  className="group flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 transition-all hover:border-ds-secondary/30 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className={`flex items-center justify-center size-10 rounded-lg border ${color}`}>
                      <Icon size={18} strokeWidth={1.75} />
                    </div>
                    <ArrowRight size={15} className="text-on-surface-variant group-hover:text-ds-secondary transition-colors mt-0.5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-on-surface group-hover:text-ds-secondary transition-colors">
                      {title}
                    </h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{description}</p>
                  </div>
                  <p className="text-xs text-on-surface-variant">{articles} articles</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Quick FAQ ─────────────────────────────────────────── */}
        <section className="bg-surface-container-low py-20 px-6">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col lg:flex-row gap-16">
              <div className="lg:w-72 shrink-0 lg:sticky lg:top-24 lg:self-start space-y-4">
                <p className="text-sm font-semibold uppercase tracking-widest text-ds-secondary">Quick answers</p>
                <h2 className="text-2xl font-bold tracking-tight text-on-surface leading-snug">
                  Common<br />questions
                </h2>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Can&apos;t find what you need?{' '}
                  <a href="mailto:support@portalkit.com" className="text-ds-secondary hover:underline underline-offset-4">
                    Email our team
                  </a>
                  .
                </p>
              </div>
              <div className="flex-1 divide-y divide-outline-variant">
                {FAQS.map(({ question, answer }) => (
                  <details key={question} className="group py-1">
                    <summary className="flex cursor-pointer list-none select-none items-start justify-between gap-6 py-4 [&::-webkit-details-marker]:hidden">
                      <span className="text-base font-medium text-on-surface group-open:text-ds-secondary transition-colors leading-snug">
                        {question}
                      </span>
                      <ChevronDown
                        size={18}
                        strokeWidth={2}
                        className="shrink-0 mt-0.5 text-on-surface-variant transition-transform duration-200 group-open:rotate-180"
                      />
                    </summary>
                    <div className="pb-5">
                      <p className="text-sm text-on-surface-variant leading-relaxed">{answer}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Contact section ───────────────────────────────────── */}
        <section className="relative bg-[#080d1a] py-16 px-6 overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          <div className="relative mx-auto max-w-5xl">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-center size-11 rounded-xl bg-blue-500/15 border border-blue-500/20 text-blue-400">
                  <Mail size={20} strokeWidth={1.75} />
                </div>
                <h2 className="text-xl font-bold text-white">Still need help?</h2>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Our team replies to every support request. No bots, no ticket queues —
                  real people who actually read your message.
                </p>
                <a
                  href="mailto:support@portalkit.com"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400 underline-offset-4 hover:underline"
                >
                  support@portalkit.com
                </a>
              </div>
              <div className="flex-1 rounded-xl border border-white/10 bg-white/5 p-6 space-y-4 backdrop-blur-sm">
                <h3 className="text-sm font-semibold text-white">Response times</h3>
                <div className="space-y-3">
                  {[
                    { plan: 'Free',     time: '3–5 business days' },
                    { plan: 'Pro',      time: 'Within 1 business day' },
                    { plan: 'Business', time: 'Within 4 hours (business hours)' },
                  ].map(({ plan, time }) => (
                    <div key={plan} className="flex items-center justify-between text-sm">
                      <span className="font-medium text-white">{plan}</span>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>{time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}

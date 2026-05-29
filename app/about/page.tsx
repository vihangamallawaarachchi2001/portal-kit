import type { Metadata } from 'next'
import Link from 'next/link'
import { Heart, Zap, Eye, Shield, Check } from 'lucide-react'
import { Header } from '@/components/public/header'
import Footer from '@/components/public/footer'
import { PageHero } from '@/components/public/page-hero'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'About',
  description:
    'PortalKit was built by freelancers, for freelancers. Learn about our mission to make client collaboration professional, simple, and stress-free.',
}

const VALUES = [
  {
    icon: Zap,
    title: 'Simplicity first',
    description:
      "If a freelancer can't set it up in 10 minutes, it's not done. Every feature earns its place by solving a real problem, not by sounding impressive.",
  },
  {
    icon: Eye,
    title: 'Radical transparency',
    description:
      'No hidden fees, no dark patterns, no lock-in. The relationship between a tool and its users should be as honest as the work you do for your clients.',
  },
  {
    icon: Heart,
    title: 'Client-centric delivery',
    description:
      "Great freelance work deserves a great delivery experience. We obsess over the client side of PortalKit just as much as the freelancer side.",
  },
  {
    icon: Shield,
    title: 'Reliability as a feature',
    description:
      "When you're presenting to a client, things need to work. We treat uptime, security, and performance as core features, not afterthoughts.",
  },
]

const STATS = [
  { value: '2023',   label: 'Year founded' },
  { value: '2,000+', label: 'Freelancers served' },
  { value: '$4M+',   label: 'Invoiced through portals' },
  { value: '98%',    label: 'Client satisfaction' },
]

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="pt-16">

        <PageHero
          eyebrow="About PortalKit"
          headline="Built by freelancers,"
          accentLine="for freelancers."
          description="We got tired of losing clients not because of our work, but because of how we delivered it. So we built the tool we always wished existed."
        />

        {/* ── Our story ─────────────────────────────────────────── */}
        <section className="bg-surface py-20 px-6">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col md:flex-row gap-16 items-start">
              <div className="flex-1 space-y-5">
                <p className="text-sm font-semibold uppercase tracking-widest text-ds-secondary">Our story</p>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface">
                  The problem we lived through
                </h2>
                <p className="text-base text-on-surface-variant leading-relaxed">
                  Before PortalKit, we ran our client projects the way most freelancers
                  do: email threads for feedback, Dropbox links for files, separate
                  invoicing apps that clients never bothered logging into, and constant
                  &ldquo;how is it going?&rdquo; check-ins that ate up half our week.
                </p>
                <p className="text-base text-on-surface-variant leading-relaxed">
                  We were doing excellent work, but delivering it in a way that felt
                  fragmented and unprofessional. Clients sensed that. Some walked away
                  not because our design was bad, but because the experience of
                  working with us felt disorganised.
                </p>
                <p className="text-base text-on-surface-variant leading-relaxed">
                  In 2023, after researching every tool on the market and finding
                  nothing that fit the freelance workflow, we built PortalKit —
                  a single, branded portal that a freelancer can set up in minutes
                  and a client can use without creating an account.
                </p>
              </div>
              <div className="flex-1 md:max-w-xs">
                <div className="rounded-2xl bg-[#080d1a] border border-white/10 p-6 space-y-5">
                  <div
                    className="size-12 rounded-xl bg-ds-secondary/20 flex items-center justify-center text-2xl"
                    aria-hidden
                  >
                    ✦
                  </div>
                  <blockquote className="text-sm leading-relaxed italic" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    &ldquo;We realised the gap wasn&apos;t in the quality of work — it was in
                    the delivery experience. PortalKit is our answer to that.&rdquo;
                  </blockquote>
                  <div className="border-t border-white/10 pt-4">
                    <p className="text-sm font-semibold text-white">The PortalKit Team</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Founders, 2023</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats bar (dark, like home) ───────────────────────── */}
        <section className="bg-[#080d1a] px-6 py-16 border-y border-white/5">
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
              {STATS.map(({ value, label }) => (
                <div key={label} className="flex flex-col items-center text-center gap-2">
                  <span className="text-3xl md:text-4xl font-bold tracking-tight text-blue-400">{value}</span>
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Values ────────────────────────────────────────────── */}
        <section className="bg-surface py-20 px-6">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-14 space-y-3">
              <p className="text-sm font-semibold uppercase tracking-widest text-ds-secondary">What we believe</p>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface">
                The principles behind every decision
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {VALUES.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="flex gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6"
                >
                  <div className="flex items-center justify-center size-10 rounded-lg bg-ds-secondary/10 border border-ds-secondary/20 text-ds-secondary shrink-0">
                    <Icon size={20} strokeWidth={1.75} />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-semibold text-on-surface">{title}</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Dark CTA ──────────────────────────────────────────── */}
        <section className="relative bg-[#080d1a] py-20 px-6 overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          <div className="relative mx-auto max-w-xl text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-white">Join us in raising the bar</h2>
            <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Your clients deserve a better delivery experience. So do you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg" className="w-full sm:w-auto bg-ds-secondary text-on-ds-secondary font-semibold px-8">
                <Link href="/auth/login">Start for free</Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="w-full sm:w-auto border border-white/20 bg-white/5 text-white font-semibold px-8 backdrop-blur-sm">
                <Link href="/help">Talk to us</Link>
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {['No credit card', 'Setup in 10 min', 'Cancel anytime'].map(item => (
                <div key={item} className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <Check size={12} strokeWidth={2.5} className="text-blue-400/70 shrink-0" />
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

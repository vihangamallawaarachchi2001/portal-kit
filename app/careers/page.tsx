import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Clock, Check } from 'lucide-react'
import { Header } from '@/components/public/header'
import Footer from '@/components/public/footer'
import { PageHero } from '@/components/public/page-hero'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Careers',
  description:
    'Join the PortalKit team. We\'re building the professional standard for freelance client delivery.',
}

const PERKS = [
  { title: 'Remote-first', description: 'Work from anywhere. We have no office and no plans to get one.' },
  { title: 'Async by default', description: 'Fewer meetings, better documentation, and respect for deep work.' },
  { title: 'Ownership', description: 'Small team means your work ships and matters immediately.' },
  { title: 'Tools budget', description: '$150/month for software, hardware, or learning that makes you better.' },
]

const OPEN_ROLES = [
  {
    title: 'Senior Full-Stack Engineer',
    type: 'Full-time',
    location: 'Remote',
    team: 'Engineering',
    href: 'mailto:careers@portalkit.com?subject=Application: Senior Full-Stack Engineer',
  },
  {
    title: 'Product Designer',
    type: 'Full-time',
    location: 'Remote',
    team: 'Design',
    href: 'mailto:careers@portalkit.com?subject=Application: Product Designer',
  },
]

export default function CareersPage() {
  return (
    <>
      <Header />
      <main className="pt-16">

        <PageHero
          eyebrow="Careers"
          headline="Build the future of"
          accentLine="freelance delivery."
          description="We're a small, remote team on a mission to help freelancers look as professional as the work they create."
        />

        {/* ── Open roles ────────────────────────────────────────── */}
        <section className="bg-surface py-20 px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-xl font-bold text-on-surface mb-8">Open roles</h2>
            <div className="space-y-3">
              {OPEN_ROLES.map(({ title, type, location, team, href }) => (
                <a
                  key={title}
                  href={href}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-5 hover:border-ds-secondary/40 transition-colors"
                >
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-on-surface group-hover:text-ds-secondary transition-colors">
                      {title}
                    </h3>
                    <p className="text-sm text-on-surface-variant">{team}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                      <MapPin size={13} />
                      {location}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                      <Clock size={13} />
                      {type}
                    </div>
                    <span className="text-xs font-semibold text-ds-secondary">Apply →</span>
                  </div>
                </a>
              ))}
            </div>
            <p className="text-sm text-on-surface-variant mt-6">
              Don&apos;t see a fit? Send a speculative application to{' '}
              <a href="mailto:careers@portalkit.com" className="text-ds-secondary hover:underline underline-offset-4">
                careers@portalkit.com
              </a>
              .
            </p>
          </div>
        </section>

        {/* ── Perks ─────────────────────────────────────────────── */}
        <section className="bg-surface-container-low py-20 px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-xl font-bold text-on-surface mb-8">How we work</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PERKS.map(({ title, description }) => (
                <div key={title} className="rounded-xl border border-outline-variant bg-surface p-5 space-y-1.5">
                  <h3 className="text-sm font-semibold text-on-surface">{title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Dark CTA ──────────────────────────────────────────── */}
        <section className="relative bg-[#080d1a] py-20 px-6 overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          <div className="relative mx-auto max-w-xl text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-white">Sound like you?</h2>
            <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Email us and introduce yourself. No recruiters, no ATS — a real person reads every application.
            </p>
            <Button asChild size="lg" className="bg-ds-secondary text-on-ds-secondary font-semibold px-8">
              <Link href="mailto:careers@portalkit.com">Get in touch</Link>
            </Button>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {['Fully remote', 'Small team', 'Real ownership'].map(item => (
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

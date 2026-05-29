import type { Metadata } from 'next'
import Link from 'next/link'
import { Lock, Shield, Key, Search, Check } from 'lucide-react'
import { Header } from '@/components/public/header'
import Footer from '@/components/public/footer'
import { PageHero } from '@/components/public/page-hero'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Security',
  description:
    'PortalKit is built with security at its core. Learn how we protect your data and your clients\' information.',
}

const PILLARS = [
  {
    icon: Lock,
    title: 'Encrypted everywhere',
    description:
      'All data is encrypted in transit using TLS 1.3 and at rest using AES-256. This applies to every file, message, and invoice stored on our platform.',
    points: ['TLS 1.3 for all connections', 'AES-256 encryption at rest', 'Encrypted database backups'],
  },
  {
    icon: Key,
    title: 'No-password client access',
    description:
      'Clients access portals via time-limited, cryptographically signed tokens — not passwords. There are no client accounts to create, compromise, or forget.',
    points: ['HMAC-signed access tokens', '90-day expiry by default', 'Instant link revocation'],
  },
  {
    icon: Shield,
    title: 'Role-based access control',
    description:
      'Every action on the platform is gated by an explicit permission. Freelancers control exactly what each client can see, download, and interact with.',
    points: ['Granular per-client permissions', 'Row-level security in the database', 'Audit log for all sensitive actions'],
  },
  {
    icon: Search,
    title: 'Ongoing security review',
    description:
      'We conduct internal security reviews before every major release and engage third-party security researchers annually through our responsible disclosure programme.',
    points: ['Annual third-party security audits', 'Responsible disclosure programme', 'Dependency vulnerability scanning'],
  },
]

const STANDARDS = [
  { label: 'GDPR', description: 'Data processing agreements available for EU customers' },
  { label: 'CCPA', description: 'California privacy rights honoured for all users' },
  { label: 'TLS 1.3', description: 'All connections use the latest TLS standard' },
  { label: 'AES-256', description: 'Industry-standard encryption for all stored data' },
  { label: 'SOC 2 Type II', description: 'Audit in progress — expected completion Q3 2025' },
]

export default function SecurityPage() {
  return (
    <>
      <Header />
      <main className="pt-16">

        <PageHero
          eyebrow="Security"
          headline="Security you"
          accentLine="can trust."
          description="Your data and your clients' data are protected by multiple layers of security — from the database all the way to the browser."
        />

        {/* ── Security pillars ──────────────────────────────────── */}
        <section className="bg-surface py-20 px-6">
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PILLARS.map(({ icon: Icon, title, description, points }) => (
                <div
                  key={title}
                  className="flex flex-col gap-5 rounded-xl border border-outline-variant bg-surface-container-lowest p-6"
                >
                  <div className="flex items-center justify-center size-11 rounded-xl bg-ds-secondary/10 text-ds-secondary shrink-0">
                    <Icon size={22} strokeWidth={1.75} />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-base font-semibold text-on-surface">{title}</h2>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{description}</p>
                  </div>
                  <ul className="space-y-2 border-t border-outline-variant pt-4">
                    {points.map(p => (
                      <li key={p} className="flex items-center gap-2.5">
                        <Check size={13} strokeWidth={2.5} className="text-ds-tertiary-action shrink-0" />
                        <span className="text-sm text-on-surface-variant">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Standards & compliance ────────────────────────────── */}
        <section className="bg-surface-container-low py-16 px-6">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-xl font-bold text-on-surface mb-8">Standards &amp; compliance</h2>
            <div className="rounded-xl border border-outline-variant overflow-hidden">
              {STANDARDS.map(({ label, description }, i) => (
                <div
                  key={label}
                  className={`flex items-start gap-6 px-6 py-4 ${i < STANDARDS.length - 1 ? 'border-b border-outline-variant/60' : ''} ${i % 2 === 0 ? 'bg-surface' : 'bg-surface-container-lowest'}`}
                >
                  <span className="text-sm font-bold text-ds-secondary w-28 shrink-0 pt-0.5">{label}</span>
                  <p className="text-sm text-on-surface-variant">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Responsible disclosure ────────────────────────────── */}
        <section className="bg-surface py-16 px-6">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 space-y-4">
              <h2 className="text-lg font-bold text-on-surface">Responsible disclosure</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                We welcome security researchers who responsibly disclose vulnerabilities.
                If you discover a security issue in PortalKit, please email{' '}
                <a href="mailto:security@portalkit.com" className="text-ds-secondary hover:underline underline-offset-4">
                  security@portalkit.com
                </a>{' '}
                with a detailed description. We aim to acknowledge all reports within
                48 hours and resolve confirmed vulnerabilities within 30 days.
              </p>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                We ask that you avoid accessing user data beyond what&apos;s necessary to
                demonstrate the issue, and that you give us reasonable time to address
                the problem before public disclosure.
              </p>
            </div>
          </div>
        </section>

        {/* ── Dark CTA ──────────────────────────────────────────── */}
        <section className="relative bg-[#080d1a] py-20 px-6 overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          <div className="relative mx-auto max-w-xl text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-white">Questions about security?</h2>
            <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Our team is happy to answer detailed security questions before you commit to any plan.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg" className="w-full sm:w-auto bg-ds-secondary text-on-ds-secondary font-semibold px-8">
                <Link href="/help">Contact us</Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="w-full sm:w-auto border border-white/20 bg-white/5 text-white font-semibold px-8 backdrop-blur-sm">
                <Link href="/auth/login">Start free</Link>
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {['TLS 1.3 encrypted', 'AES-256 at rest', 'GDPR compliant'].map(item => (
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

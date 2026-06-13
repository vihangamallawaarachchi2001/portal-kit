import type { Metadata } from 'next'
import Link from 'next/link'
import { Lock, Shield, Key, Search, Check, Mail } from 'lucide-react'
import { Header } from '@/components/public/header'
import Footer from '@/components/public/footer'
import { CalendarDays } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Security — PortalKit',
  description: 'How PortalKit protects your data and your clients\' information across every layer of the platform.',
}

const PILLARS = [
  {
    icon: Lock,
    title: 'Encrypted everywhere',
    description:
      'All data is encrypted in transit using TLS 1.3 and at rest using AES-256. This applies to every file, message, and invoice stored on the platform — including database backups.',
    points: ['TLS 1.3 for all connections', 'AES-256 encryption at rest', 'Encrypted database backups'],
  },
  {
    icon: Key,
    title: 'No-password client access',
    description:
      'Clients access their portals via time-limited, cryptographically signed tokens — not passwords. There are no client accounts to create, compromise, or forget.',
    points: ['HMAC-signed access tokens', '90-day expiry by default', 'Instant link revocation by freelancer'],
  },
  {
    icon: Shield,
    title: 'Row-level security',
    description:
      'Every query is enforced by row-level security (RLS) policies at the database layer — not just at the application layer. Freelancers can only ever read and write their own data.',
    points: ['RLS on every table', 'Granular per-client permissions', 'Principle of least privilege enforced'],
  },
  {
    icon: Search,
    title: 'Ongoing security review',
    description:
      'We conduct internal security reviews before every major release and maintain a responsible disclosure programme for external researchers.',
    points: ['Pre-release security reviews', 'Responsible disclosure programme', 'Automated dependency scanning'],
  },
]

const STANDARDS = [
  { label: 'GDPR',          status: 'compliant',     description: 'Data processing agreements available for EU customers.' },
  { label: 'CCPA',          status: 'compliant',     description: 'California privacy rights honoured for all users. We do not sell personal data.' },
  { label: 'AU Privacy Act',status: 'compliant',     description: 'Compliant with the Privacy Act 1988 (Cth) and Australian Privacy Principles.' },
  { label: 'TLS 1.3',       status: 'enforced',      description: 'All platform connections use TLS 1.3. Older TLS versions are rejected.' },
  { label: 'AES-256',       status: 'enforced',      description: 'Industry-standard encryption for all data at rest, including backups.' },
  { label: 'SOC 2 Type II', status: 'in-progress',   description: 'We are actively working towards SOC 2 Type II certification.' },
]

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  compliant:   { bg: '#f0fdf4', color: '#15803d', label: 'Compliant'    },
  enforced:    { bg: '#eff6ff', color: '#1d4ed8', label: 'Enforced'     },
  'in-progress': { bg: '#fefce8', color: '#a16207', label: 'In progress' },
}

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

export default function SecurityPage() {
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
            className="pointer-events-none absolute -top-32 left-1/4 w-[600px] h-[400px]"
            style={{ background: 'radial-gradient(ellipse at center, rgba(0,81,213,0.11) 0%, transparent 68%)' }}
          />

          <div className="relative max-w-5xl mx-auto">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] mb-4" style={{ color: '#6B9EFF' }}>
              Security
            </p>
            <h1
              className="font-extrabold text-white tracking-tight leading-[1.06]"
              style={{ fontSize: 'clamp(2.5rem, 4.5vw, 3.5rem)' }}
            >
              Security you<br />
              <span
                style={{
                  backgroundImage: 'linear-gradient(90deg, #60a5fa, #93c5fd)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                can trust.
              </span>
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  color: 'rgba(255,255,255,0.45)',
                }}
              >
                <CalendarDays size={11} />
                Last updated: 12 June 2026
              </div>
            </div>
            <p className="mt-4 text-base max-w-xl leading-relaxed" style={{ color: 'rgba(255,255,255,0.48)' }}>
              Your data and your clients&apos; data are protected by multiple independent security
              layers — from the database all the way to the browser.
            </p>
          </div>
        </section>

        {/* ── Security pillars ──────────────────────────────────── */}
        <section className="bg-white py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-12">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-blue-600 mb-3">
                How we protect your data
              </p>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Defence in depth
              </h2>
              <p className="mt-2 text-base text-gray-500 max-w-lg leading-relaxed">
                We do not rely on a single security control. Every layer of the platform
                has independent protections so that a failure in one does not compromise the rest.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {PILLARS.map(({ icon: Icon, title, description, points }) => (
                <div
                  key={title}
                  className="flex flex-col gap-5 rounded-2xl p-7"
                  style={{ background: '#f8fafc', border: '1px solid #e5e7eb' }}
                >
                  <div
                    className="flex items-center justify-center size-11 rounded-xl shrink-0"
                    style={{ background: 'rgba(0,81,213,0.08)' }}
                  >
                    <Icon size={22} strokeWidth={1.75} style={{ color: '#0051D5' }} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
                  </div>
                  <ul className="space-y-2.5 pt-4 border-t border-gray-200">
                    {points.map(p => (
                      <li key={p} className="flex items-center gap-2.5">
                        <span
                          className="shrink-0 w-4 h-4 rounded flex items-center justify-center"
                          style={{ background: 'rgba(34,197,94,0.12)' }}
                        >
                          <Check size={9} strokeWidth={3} style={{ color: '#16a34a' }} />
                        </span>
                        <span className="text-sm text-gray-600">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Standards & compliance ────────────────────────────── */}
        <section className="bg-gray-50 py-20 px-6" style={{ borderTop: '1px solid #f1f5f9' }}>
          <div className="max-w-5xl mx-auto">
            <div className="mb-10">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-blue-600 mb-3">
                Standards &amp; compliance
              </p>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Built to meet global standards
              </h2>
            </div>

            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
            >
              {STANDARDS.map(({ label, status, description }, i) => {
                const style = STATUS_STYLES[status]
                return (
                  <div
                    key={label}
                    className="flex items-start gap-5 px-6 py-4"
                    style={{
                      background: i % 2 === 0 ? '#ffffff' : '#fafafa',
                      borderBottom: i < STANDARDS.length - 1 ? '1px solid #f1f5f9' : undefined,
                    }}
                  >
                    <span
                      className="text-xs font-bold w-32 shrink-0 pt-0.5"
                      style={{ color: '#374151' }}
                    >
                      {label}
                    </span>
                    <p className="flex-1 text-sm text-gray-500 leading-relaxed">{description}</p>
                    <span
                      className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                      style={{ background: style.bg, color: style.color }}
                    >
                      {style.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── Responsible disclosure ────────────────────────────── */}
        <section className="bg-white py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">

              {/* Disclosure card */}
              <div
                className="rounded-2xl p-8 space-y-4"
                style={{ background: '#f8fafc', border: '1px solid #e5e7eb' }}
              >
                <div
                  className="flex items-center justify-center size-11 rounded-xl"
                  style={{ background: 'rgba(0,81,213,0.08)' }}
                >
                  <Mail size={20} strokeWidth={1.75} style={{ color: '#0051D5' }} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Responsible disclosure</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  We welcome security researchers who responsibly disclose vulnerabilities.
                  If you discover a security issue in PortalKit, email{' '}
                  <a
                    href="mailto:security@portalkit.com"
                    className="text-blue-600 hover:underline underline-offset-4"
                  >
                    security@portalkit.com
                  </a>{' '}
                  with a detailed description of the issue and steps to reproduce it.
                </p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  We aim to acknowledge all reports within 48 hours and resolve confirmed
                  vulnerabilities within 30 days. We ask that you avoid accessing user data
                  beyond what is necessary to demonstrate the issue, and give us reasonable
                  time to address it before public disclosure.
                </p>
              </div>

              {/* Data practices card */}
              <div
                className="rounded-2xl p-8 space-y-4"
                style={{ background: '#f8fafc', border: '1px solid #e5e7eb' }}
              >
                <div
                  className="flex items-center justify-center size-11 rounded-xl"
                  style={{ background: 'rgba(0,81,213,0.08)' }}
                >
                  <Shield size={20} strokeWidth={1.75} style={{ color: '#0051D5' }} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Data practices</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  We do not sell your data or your clients&apos; data. Files, invoices,
                  and messages you store on PortalKit are used solely to provide the Service.
                  Our engineers access customer data only when necessary to diagnose a
                  reported issue, and only with appropriate access controls in place.
                </p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  For full details on how we handle personal information, see our{' '}
                  <Link href="/privacy" className="text-blue-600 hover:underline underline-offset-4">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Dark CTA ──────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden py-24 px-6"
          style={{ background: 'linear-gradient(150deg, #002a9e 0%, #0051D5 55%, #1268ff 100%)' }}
        >
          <DotGrid />
          <div className="relative max-w-xl mx-auto text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Questions about security?
            </h2>
            <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Our team is happy to answer detailed security questions before you commit to any plan.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 rounded text-base font-bold transition-all hover:brightness-95"
                style={{ background: '#fff', color: '#003db5', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
              >
                Contact us
              </Link>
              <Link
                href="/auth"
                className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 rounded text-base font-semibold text-white transition-all hover:bg-white/10"
                style={{ border: '1px solid rgba(255,255,255,0.28)', background: 'rgba(255,255,255,0.07)' }}
              >
                Start for free
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {['TLS 1.3 encrypted', 'AES-256 at rest', 'GDPR compliant'].map(item => (
                <div key={item} className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  <Check size={11} strokeWidth={2.5} className="text-blue-300/70 shrink-0" />
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

import Link from 'next/link'
import { CalendarDays } from 'lucide-react'
import { Header } from './header'
import Footer from './footer'

/* ─── Types ──────────────────────────────────────────────────────── */

export interface TocItem   { id: string; label: string }
export interface NavLink   { label: string; href: string }

interface LegalPageProps {
  eyebrow?: string
  titleLine1: string
  titleAccent: string
  description: string
  updatedDate: string
  toc: TocItem[]
  relatedLinks: NavLink[]
  children: React.ReactNode
}

/* ─── Page wrapper ───────────────────────────────────────────────── */

export function LegalPage({
  eyebrow = 'Legal',
  titleLine1,
  titleAccent,
  description,
  updatedDate,
  toc,
  relatedLinks,
  children,
}: LegalPageProps) {
  return (
    <>
      <Header />
      <main className="pt-16">

        {/* ── Hero ──────────────────────────────────────────────── */}
        <section className="relative bg-[#060b18] pt-28 pb-16 px-6 overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.028) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
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
              {eyebrow}
            </p>
            <h1
              className="font-extrabold text-white tracking-tight leading-[1.06]"
              style={{ fontSize: 'clamp(2.5rem, 4.5vw, 3.5rem)' }}
            >
              {titleLine1}<br />
              <span
                style={{
                  backgroundImage: 'linear-gradient(90deg, #60a5fa, #93c5fd)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {titleAccent}
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
                Last updated: {updatedDate}
              </div>
            </div>
            <p className="mt-4 text-base max-w-xl leading-relaxed" style={{ color: 'rgba(255,255,255,0.48)' }}>
              {description}
            </p>
          </div>
        </section>

        {/* ── Content ───────────────────────────────────────────── */}
        <section className="bg-white py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-16 items-start">

              {/* TOC sidebar */}
              <aside className="hidden lg:block sticky top-24 self-start">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400 mb-3">
                  Contents
                </p>
                <nav>
                  <ul className="space-y-0.5">
                    {toc.map(item => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className="block text-sm text-gray-500 hover:text-gray-900 py-1.5 px-2.5 rounded-lg hover:bg-gray-50 transition-colors duration-100"
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>

                {relatedLinks.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400 mb-3">
                      Related policies
                    </p>
                    <ul className="space-y-0.5">
                      {relatedLinks.map(link => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className="block text-sm text-blue-600 hover:text-blue-800 py-1.5 px-2.5 rounded-lg hover:bg-blue-50 transition-colors duration-100"
                          >
                            {link.label} →
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-gray-100">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400 mb-3">
                    Questions?
                  </p>
                  <a
                    href="mailto:legal@portalkit.com"
                    className="block text-sm text-gray-500 hover:text-gray-900 py-1.5 px-2.5 rounded-lg hover:bg-gray-50 transition-colors duration-100"
                  >
                    legal@portalkit.com
                  </a>
                </div>
              </aside>

              {/* Main content */}
              <div className="space-y-0 mt-8 lg:mt-0">
                {children}
              </div>

            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}

/* ─── Section ────────────────────────────────────────────────────── */

export function LegalSection({
  id,
  number,
  title,
  children,
}: {
  id: string
  number: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28 py-10 border-t border-gray-100 first:pt-0 first:border-t-0"
    >
      <div className="flex items-baseline gap-3 mb-5">
        <span className="text-[11px] font-bold text-gray-300 tabular-nums shrink-0 pt-0.5">{number}</span>
        <h2 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h2>
      </div>
      <div className="space-y-4 text-[15px] text-gray-600 leading-[1.8]">
        {children}
      </div>
    </section>
  )
}

/* ─── Sub-section ────────────────────────────────────────────────── */

export function LegalSub({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="mt-5 pl-5 border-l-2 border-gray-100 space-y-3">
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      <div className="text-[14px] text-gray-600 leading-[1.8] space-y-3">{children}</div>
    </div>
  )
}

/* ─── Inline link helper ─────────────────────────────────────────── */

export function LegalLink({ href, children }: { href: string; children: React.ReactNode }) {
  const isExternal = href.startsWith('http')
  return isExternal ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline underline-offset-4"
    >
      {children}
    </a>
  ) : (
    <Link href={href} className="text-blue-600 hover:underline underline-offset-4">
      {children}
    </Link>
  )
}

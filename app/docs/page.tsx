import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, ArrowRight, Check } from 'lucide-react'
import { Header } from '@/components/public/header'
import Footer from '@/components/public/footer'
import { PageHero } from '@/components/public/page-hero'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Documentation',
  description:
    'PortalKit developer documentation — coming soon. In the meantime, visit the Help Center.',
}

const RESOURCES = [
  {
    title: 'Help Center',
    description: 'Step-by-step guides for setting up portals, invoices, and file approvals.',
    href: '/help',
    tag: 'Available now',
    tagColor: 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20',
  },
  {
    title: 'Security overview',
    description: 'How PortalKit protects your data and your clients\' information.',
    href: '/security',
    tag: 'Available now',
    tagColor: 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20',
  },
  {
    title: 'REST API reference',
    description: 'Full API documentation for programmatic portal and project management.',
    href: '#',
    tag: 'Coming soon',
    tagColor: 'text-blue-400 bg-blue-400/10 border border-blue-400/20',
  },
  {
    title: 'Webhook events',
    description: 'Receive real-time events for invoice payments, file approvals, and more.',
    href: '#',
    tag: 'Coming soon',
    tagColor: 'text-blue-400 bg-blue-400/10 border border-blue-400/20',
  },
]

export default function DocsPage() {
  return (
    <>
      <Header />
      <main className="pt-16">

        <PageHero
          eyebrow="Documentation"
          headline="Docs coming"
          accentLine="soon."
          description="Developer documentation, API reference, and webhook guides are in progress. Everything you need to get started is in the Help Center."
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-1.5">
            <BookOpen size={13} className="text-blue-400 shrink-0" />
            <span className="text-sm font-medium text-blue-300">API & webhooks coming Q3 2025</span>
          </div>
        </PageHero>

        {/* ── Resources ─────────────────────────────────────────── */}
        <section className="bg-surface py-20 px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-lg font-bold text-on-surface mb-8">Available resources</h2>
            <div className="space-y-3">
              {RESOURCES.map(({ title, description, href, tag, tagColor }) => (
                <Link
                  key={title}
                  href={href}
                  className="group flex items-start justify-between gap-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-5 hover:border-ds-secondary/40 transition-colors"
                >
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <p className="text-sm font-semibold text-on-surface group-hover:text-ds-secondary transition-colors">
                        {title}
                      </p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${tagColor}`}>
                        {tag}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">{description}</p>
                  </div>
                  <ArrowRight size={15} className="text-on-surface-variant group-hover:text-ds-secondary transition-colors shrink-0 mt-0.5" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Dark CTA ──────────────────────────────────────────── */}
        <section className="relative bg-[#080d1a] py-20 px-6 overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          <div className="relative mx-auto max-w-xl text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-white">Need help right now?</h2>
            <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Our team answers every support message. No bots, no ticket queues.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg" className="w-full sm:w-auto bg-ds-secondary text-on-ds-secondary font-semibold px-8">
                <Link href="/help">Visit Help Center</Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="w-full sm:w-auto border border-white/20 bg-white/5 text-white font-semibold px-8 backdrop-blur-sm">
                <Link href="/">Back to home</Link>
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {['Reply within 1 business day', 'Real people', 'No ticket queue'].map(item => (
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

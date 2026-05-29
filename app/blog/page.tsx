import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Header } from '@/components/public/header'
import Footer from '@/components/public/footer'
import { PageHero } from '@/components/public/page-hero'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Guides, tips, and insights for freelancers — coming soon from the PortalKit team.',
}

const TOPICS = [
  'Client management',
  'Getting paid faster',
  'Freelance workflows',
  'Portal best practices',
  'Agency scaling',
  'Client onboarding',
]

const UPCOMING = [
  {
    title: 'How to set up your first client portal in under 10 minutes',
    tag: 'Getting started',
    tagColor: 'text-blue-400 bg-blue-400/10 border border-blue-400/20',
  },
  {
    title: 'Stop losing clients because of how you deliver — not what you deliver',
    tag: 'Client management',
    tagColor: 'text-violet-400 bg-violet-400/10 border border-violet-400/20',
  },
  {
    title: 'The freelancer\'s guide to invoice tracking that actually gets paid',
    tag: 'Getting paid faster',
    tagColor: 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20',
  },
]

export default function BlogPage() {
  return (
    <>
      <Header />
      <main className="pt-16">

        <PageHero
          eyebrow="Blog"
          headline="Guides for"
          accentLine="modern freelancers."
          description="Practical articles on client management, getting paid faster, and building a professional delivery workflow."
        />

        {/* ── Coming soon state ─────────────────────────────────── */}
        <section className="bg-surface py-20 px-6">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col lg:flex-row gap-16">

              {/* Left: topics */}
              <div className="lg:w-56 shrink-0 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Topics</p>
                <div className="flex flex-wrap lg:flex-col gap-2">
                  {TOPICS.map(topic => (
                    <span
                      key={topic}
                      className="text-xs font-medium text-on-surface-variant bg-surface-container-low border border-outline-variant px-3 py-1.5 rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right: upcoming posts */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-on-surface">Coming soon</h2>
                  <span className="text-xs font-medium text-on-surface-variant bg-surface-container-low border border-outline-variant px-2.5 py-1 rounded-full">
                    3 articles in progress
                  </span>
                </div>
                {UPCOMING.map(({ title, tag, tagColor }) => (
                  <div
                    key={title}
                    className="group flex items-start justify-between gap-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-5 opacity-70"
                  >
                    <div className="space-y-2.5 min-w-0">
                      <span className={`inline-flex text-xs font-semibold px-2.5 py-0.5 rounded-full ${tagColor}`}>
                        {tag}
                      </span>
                      <h3 className="text-sm font-semibold text-on-surface leading-snug">{title}</h3>
                    </div>
                    <ArrowRight size={15} className="text-outline-variant shrink-0 mt-1" />
                  </div>
                ))}
                <p className="text-sm text-on-surface-variant pt-2">
                  Want to be notified when we publish?{' '}
                  <a href="mailto:hello@portalkit.com" className="text-ds-secondary hover:underline underline-offset-4">
                    Drop us your email.
                  </a>
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ── Dark CTA ──────────────────────────────────────────── */}
        <section className="relative bg-[#080d1a] py-16 px-6 overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          <div className="relative mx-auto max-w-xl text-center space-y-5">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Ready to try PortalKit?
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Start for free while we finish the blog. Your first portal takes under 10 minutes to set up.
            </p>
            <Button asChild size="lg" className="bg-ds-secondary text-on-ds-secondary font-semibold px-8">
              <Link href="/auth">Start for free</Link>
            </Button>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}

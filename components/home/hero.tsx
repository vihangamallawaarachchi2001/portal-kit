import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomeHero() {
  return (
    <section
      className="relative flex flex-col items-center justify-center min-h-screen pt-20 pb-24 px-6 text-center overflow-hidden bg-[#080d1a]"
    >
      {/* Dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Blue radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden flex items-start justify-center"
        style={{ paddingTop: '10%' }}
      >
        <div
          style={{
            width: '900px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.22) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Announcement pill */}
      <div className="relative mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
        <span className="size-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <p className="text-sm font-medium text-white/70">
          Free to start — no credit card required
        </p>
      </div>

      {/* Headline */}
      <div className="relative mb-6 max-w-4xl">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08]">
          <span className="text-white">Your clients deserve</span>
          <br />
          <span className="bg-linear-to-r from-blue-400 via-blue-300 to-sky-400 bg-clip-text text-transparent">
            a better experience.
          </span>
        </h1>
      </div>

      {/* Subheading */}
      <p
        className="relative mb-10 max-w-xl text-lg md:text-xl leading-relaxed"
        style={{ color: 'rgba(255,255,255,0.6)' }}
      >
        One branded link replaces the email chaos. Share files, collect
        approvals, send invoices — your clients see everything in one
        professional portal.
      </p>

      {/* CTAs */}
      <div className="relative flex flex-col sm:flex-row items-center gap-3">
        <Button
          asChild
          size="lg"
          className="w-full sm:w-auto bg-ds-secondary text-on-ds-secondary font-semibold px-8 text-base h-12"
        >
          <Link href="/auth">Start for free</Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="ghost"
          className="w-full sm:w-auto border border-white/20 bg-white/5 text-white font-semibold px-8 text-base h-12 backdrop-blur-sm"
        >
          <Link href="/dashboard">
            See a live demo
            <ArrowRight size={17} />
          </Link>
        </Button>
      </div>

    </section>
  )
}

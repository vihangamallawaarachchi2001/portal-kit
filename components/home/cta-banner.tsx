import Link from 'next/link'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

const TRUST = [
  'No credit card required',
  'Setup in under 10 minutes',
  'Cancel anytime',
]

export default function CTABanner() {
  return (
    <section
      className="relative bg-[#080d1a] overflow-hidden py-28 px-6"
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
        className="pointer-events-none absolute inset-0 overflow-hidden flex items-end justify-center"
      >
        <div
          style={{
            width: '800px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.22) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-2xl text-center space-y-8">

        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
          <span className="size-2 rounded-full bg-blue-400 animate-pulse shrink-0" />
          <p className="text-sm font-medium text-white/70">
            Trusted by 2,000+ freelancers worldwide
          </p>
        </div>

        {/* Headline */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
          <span className="text-white">Ready to impress</span>
          <br />
          <span className="bg-linear-to-r from-blue-400 via-blue-300 to-sky-400 bg-clip-text text-transparent">
            your clients?
          </span>
        </h2>

        {/* Subtext */}
        <p
          className="text-lg leading-relaxed max-w-md mx-auto"
          style={{ color: 'rgba(255,255,255,0.6)' }}
        >
          Set up your first client portal in minutes. No code, no complexity,
          no long-term commitment.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto bg-ds-secondary text-on-ds-secondary font-semibold px-8 text-base h-12"
          >
            <Link href="/auth/login">Start for free</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="ghost"
            className="w-full sm:w-auto border border-white/20 bg-white/5 text-white font-semibold px-8 text-base h-12 backdrop-blur-sm"
          >
            <Link href="/demo">Book a demo</Link>
          </Button>
        </div>

        {/* Trust elements */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
          {TRUST.map(item => (
            <div
              key={item}
              className="flex items-center gap-1.5 text-xs"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              <Check size={12} strokeWidth={2.5} className="text-blue-400/70 shrink-0" />
              {item}
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

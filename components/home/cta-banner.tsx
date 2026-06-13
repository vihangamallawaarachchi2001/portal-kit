import Link from 'next/link'
import { Check } from 'lucide-react'

const TRUST = [
  'No credit card required',
  'Setup in under 10 minutes',
  'Cancel anytime',
]

export default function CTABanner() {
  return (
    <section
      className="relative overflow-hidden py-32 px-6"
      style={{
        background: 'linear-gradient(150deg, #002a9e 0%, #0051D5 55%, #1268ff 100%)',
      }}
    >

      {/* Dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Top-right highlight orb */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 w-lg h-lg rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.09) 0%, transparent 65%)' }}
      />

      {/* Bottom-left depth shadow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(0,0,80,0.35) 0%, transparent 70%)' }}
      />

      <div className="relative max-w-2xl mx-auto text-center space-y-8">

        {/* Eyebrow pill */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium"
          style={{
            background: 'rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.8)',
            border: '1px solid rgba(255,255,255,0.18)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse shrink-0" />
          Free forever. No credit card required.
        </div>

        {/* Headline */}
        <h2 className="text-5xl sm:text-6xl lg:text-[4.5rem] font-extrabold tracking-tight leading-[1.04] text-white">
          Ready to impress<br />your clients?
        </h2>

        {/* Subtext */}
        <p
          className="text-xl leading-relaxed max-w-md mx-auto"
          style={{ color: 'rgba(255,255,255,0.62)' }}
        >
          Set up your first portal in minutes. No code, no complexity,
          no long-term commitment.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/auth"
            className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 rounded bg-white text-[#003db5] text-base font-bold hover:brightness-95 transition-all"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
          >
            Start for free
          </Link>
          <Link
            href="/demo"
            className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 rounded text-base font-semibold text-white transition-all hover:bg-white/10"
            style={{ border: '1px solid rgba(255,255,255,0.28)', background: 'rgba(255,255,255,0.07)' }}
          >
            Book a demo
          </Link>
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 pt-2">
          {TRUST.map(item => (
            <div
              key={item}
              className="flex items-center gap-1.5 text-xs"
              style={{ color: 'rgba(255,255,255,0.42)' }}
            >
              <Check size={11} strokeWidth={2.5} style={{ color: 'rgba(255,255,255,0.5)' }} className="shrink-0" />
              {item}
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

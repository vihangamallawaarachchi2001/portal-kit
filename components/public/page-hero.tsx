interface PageHeroProps {
  eyebrow: string
  headline: string
  accentLine?: string
  description?: string
  compact?: boolean
  children?: React.ReactNode
}

export function PageHero({
  eyebrow,
  headline,
  accentLine,
  description,
  compact = false,
  children,
}: PageHeroProps) {
  return (
    <section
      className={`relative bg-[#080d1a] ${compact ? 'py-16' : 'py-24'} px-6 overflow-hidden`}
    >
      {/* Dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      {/* Blue radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(37,99,235,0.2) 0%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-2xl text-center space-y-5">
        {/* Eyebrow pill */}
        <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
          <span className="size-2 rounded-full bg-blue-400 shrink-0" />
          <p className="text-sm font-medium text-white/70">{eyebrow}</p>
        </div>

        {/* Headline */}
        <h1
          className={`font-bold tracking-tight leading-[1.08] ${
            compact ? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl'
          }`}
        >
          <span className="text-white">{headline}</span>
          {accentLine && (
            <>
              <br />
              <span className="bg-linear-to-r from-blue-400 via-blue-300 to-sky-400 bg-clip-text text-transparent">
                {accentLine}
              </span>
            </>
          )}
        </h1>

        {/* Description */}
        {description && (
          <p
            className={`leading-relaxed max-w-md mx-auto ${compact ? 'text-base' : 'text-lg'}`}
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            {description}
          </p>
        )}

        {children}
      </div>
    </section>
  )
}

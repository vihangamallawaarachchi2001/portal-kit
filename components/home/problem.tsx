import { Mail, Folder, Receipt, RefreshCw } from 'lucide-react'

const PROBLEMS = [
  {
    Icon: Mail,
    category: 'Email',
    accentColor: '#f87171',
    artifact: 'Re: Re: Re: Re: Feedback on v14_FINAL_revised.pdf',
    detail: '47 messages · comment on page 4 somewhere',
    label: 'Feedback buried in thread chaos',
    description: 'By the time you find the right comment, the deadline has already passed.',
  },
  {
    Icon: Folder,
    category: 'Files',
    accentColor: '#fbbf24',
    artifact: 'brand_assets_v14_FINAL_revised_USE_THIS_ONE(2).zip',
    detail: '"Can you resend the latest version?" — 4th time',
    label: 'Nobody knows which file is final',
    description: 'Twenty minutes hunting for a link you shared three months ago.',
  },
  {
    Icon: Receipt,
    category: 'Invoice',
    accentColor: '#f87171',
    artifact: 'Invoice #1041 · $3,200 · Sent 18 days ago',
    detail: 'Status: Unopened · "Did you see my invoice?"',
    label: 'Invoices that go cold',
    description: "You're left guessing while your cash flow quietly dries up.",
  },
  {
    Icon: RefreshCw,
    category: 'Status',
    accentColor: '#fbbf24',
    artifact: '"Quick sync call" · Every Monday · 9:00 AM',
    detail: 'Week 14 of ∞ · "So... how\'s it going?"',
    label: '"How is it going?" on loop',
    description: "Clients are anxious. The same 5-minute status call, every single week.",
  },
]

export default function Problem() {
  return (
    <section className="relative bg-[#060b18] py-28 px-6 overflow-hidden">

      {/* Dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      {/* Warm red glow behind cards */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 55% 50% at 78% 50%, rgba(248,113,113,0.055) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto grid lg:grid-cols-[1fr_1.15fr] gap-16 lg:gap-20 items-center">

        {/* ── Left: narrative ── */}
        <div>
          <p
            className="text-[11px] font-semibold tracking-[0.16em] uppercase mb-5"
            style={{ color: 'rgba(251,191,36,0.85)' }}
          >
            Sound familiar?
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.06] mb-6">
            Great work,<br />buried under<br />bad process.
          </h2>
          <p
            className="text-lg leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.52)', maxWidth: '360px' }}
          >
            Freelancers don't lose clients over craft. They lose them over scattered
            communication — and by the time a client feels confused or ignored,
            the damage is already done.
          </p>
        </div>

        {/* ── Right: problem cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PROBLEMS.map(({ Icon, category, accentColor, artifact, detail, label, description }) => (
            <div
              key={label}
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              {/* Top accent line */}
              <div
                className="h-px"
                style={{ background: `linear-gradient(90deg, ${accentColor}80, transparent 65%)` }}
              />
              <div className="p-5">
                {/* Category tag */}
                <div
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.12em] uppercase mb-4"
                  style={{ color: accentColor }}
                >
                  <Icon size={10} strokeWidth={2.5} />
                  {category}
                </div>
                {/* Realistic artifact preview */}
                <div
                  className="rounded-lg px-3 py-2.5 mb-2 font-mono text-[11px] leading-snug truncate"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    color: 'rgba(255,255,255,0.38)',
                    borderLeft: `2px solid ${accentColor}50`,
                  }}
                >
                  {artifact}
                </div>
                <p
                  className="text-[11px] italic mb-4 leading-snug"
                  style={{ color: 'rgba(255,255,255,0.24)' }}
                >
                  {detail}
                </p>
                {/* Pain point label + desc */}
                <p
                  className="text-[13px] font-semibold mb-1"
                  style={{ color: 'rgba(255,255,255,0.85)' }}
                >
                  {label}
                </p>
                <p
                  className="text-[12px] leading-relaxed"
                  style={{ color: 'rgba(255,255,255,0.42)' }}
                >
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

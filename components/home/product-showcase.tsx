import Image from 'next/image'
import { CheckCircle2, Clock, LayoutDashboard } from 'lucide-react'

const STATS = [
  {
    icon: LayoutDashboard,
    iconColor: '#0051D5',
    iconBg: 'rgba(0,81,213,0.1)',
    label: 'PROJECT PROGRESS',
    value: '68%',
    sub: 'Brand Identity Refresh',
    accent: (
      <div className="mt-3 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
        <div className="bg-[#0051D5] h-full rounded-full" style={{ width: '68%' }} />
      </div>
    ),
  },
  {
    icon: Clock,
    iconColor: '#D97706',
    iconBg: 'rgba(217,119,6,0.1)',
    label: 'PENDING APPROVALS',
    value: '03',
    sub: 'Action required',
    subColor: '#D97706',
  },
  {
    icon: CheckCircle2,
    iconColor: '#059669',
    iconBg: 'rgba(5,150,105,0.1)',
    label: 'NEXT MILESTONE',
    value: 'Oct 24',
    sub: 'Initial Draft Review',
  },
]

export default function ProductShowcase() {
  return (
    <section className="relative py-24 bg-surface overflow-hidden">

      {/* Subtle background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 60%, rgba(0,81,213,0.05) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6">

        {/* ── Heading ── */}
        <div className="max-w-2xl mb-16">
          <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#0051D5] mb-4">
            The Portal Experience
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-on-surface leading-[1.06] mb-6">
            Transparency is the<br className="hidden sm:block" /> ultimate luxury.
          </h2>
          <p className="text-lg text-on-surface-variant leading-relaxed">
            Stop hunting through email threads. Give your clients a dedicated,
            high-fidelity space to track milestones, approve deliverables,
            and manage invoices — all in one branded portal.
          </p>
        </div>

        {/* ── Browser frame ── */}
        <div
          className="relative rounded-2xl border border-outline-variant bg-white overflow-hidden"
          style={{ boxShadow: '0 32px 64px -16px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)' }}
        >
          {/* Browser chrome */}
          <div className="flex items-center gap-3 px-4 h-11 bg-[#f5f5f5] border-b border-outline-variant shrink-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
              <span className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
              <span className="w-3 h-3 rounded-full bg-[#28C840]" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="flex items-center gap-2 w-full max-w-xs h-6 rounded-md bg-gray-200/70 px-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-[11px] text-gray-500 font-medium truncate">
                  app.portalkit.com/portal/acme-brand-strategy
                </span>
              </div>
            </div>
            <div className="w-14 shrink-0" />
          </div>

          {/* Dashboard image */}
          <Image
            src="/dashboard.png"
            alt="PortalKit client portal dashboard"
            width={1200}
            height={750}
            priority
            className="w-full h-auto block"
          />
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6">
          {STATS.map(({ icon: Icon, iconColor, iconBg, label, value, sub, subColor, accent }) => (
            <div
              key={label}
              className="flex flex-col gap-3 p-5 rounded-xl border border-outline-variant bg-white"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold tracking-[0.14em] text-on-surface-variant">
                  {label}
                </p>
                <span
                  className="inline-flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
                  style={{ background: iconBg }}
                >
                  <Icon size={14} style={{ color: iconColor }} strokeWidth={2.5} />
                </span>
              </div>
              <p className="text-3xl font-extrabold text-on-surface tracking-tight leading-none">
                {value}
              </p>
              <p
                className="text-xs font-semibold"
                style={{ color: subColor ?? 'var(--on-surface-variant)' }}
              >
                {sub}
              </p>
              {accent}
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

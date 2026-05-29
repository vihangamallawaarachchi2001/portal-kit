import { Fragment } from 'react'
import { FolderPlus, Upload, Link2, ArrowRight, type LucideIcon } from 'lucide-react'

const STEPS: {
  number: string
  icon: LucideIcon
  iconClass: string
  title: string
  description: string
}[] = [
  {
    number: '01',
    icon: FolderPlus,
    iconClass: 'bg-blue-500/15 border-blue-500/20 text-blue-400',
    title: 'Create a Project',
    description:
      'Set up your workspace in seconds. Name your project, set a deadline, and connect your payment account.',
  },
  {
    number: '02',
    icon: Upload,
    iconClass: 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400',
    title: 'Add Deliverables',
    description:
      'Upload files for client review, attach invoices, set milestones, and leave internal notes for your team.',
  },
  {
    number: '03',
    icon: Link2,
    iconClass: 'bg-violet-500/15 border-violet-500/20 text-violet-400',
    title: 'Share One Link',
    description:
      'Your client receives a single, branded link — a polished portal with everything they need in one place.',
  },
]

export default function HowItWorks() {
  return (
    <section
      className="relative bg-[#080d1a] py-24 px-6 overflow-hidden"
    >
      {/* Dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Subtle blue glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(37,99,235,0.12) 0%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-5xl">

        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            How it works
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-snug">
            From signup to first impression
            <br className="hidden sm:block" /> in under 10 minutes
          </h2>
          <p className="max-w-md mx-auto text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Three steps to replace the email chaos with a portal your clients
            will actually enjoy using.
          </p>
        </div>

        {/* Steps */}
        <div className="flex flex-col md:flex-row items-stretch gap-3 md:gap-0">
          {STEPS.map(({ number, icon: Icon, iconClass, title, description }, i) => (
            <Fragment key={number}>
              <div className="flex-1 rounded-2xl border border-white/8 bg-white/4 p-6 flex flex-col gap-5 backdrop-blur-sm">

                {/* Top row: step number + icon */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center rounded-md border border-blue-400/25 bg-blue-400/10 px-2.5 py-1 text-xs font-mono font-bold text-blue-400">
                    {number}
                  </span>
                  <div
                    className={`flex items-center justify-center size-11 rounded-xl border ${iconClass}`}
                  >
                    <Icon size={20} strokeWidth={1.75} />
                  </div>
                </div>

                {/* Text */}
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-white">{title}</h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'rgba(255,255,255,0.55)' }}
                  >
                    {description}
                  </p>
                </div>
              </div>

              {/* Connector arrow between cards on desktop */}
              {i < STEPS.length - 1 && (
                <div
                  className="hidden md:flex items-center justify-center px-3 shrink-0"
                  aria-hidden
                >
                  <ArrowRight
                    size={18}
                    strokeWidth={1.75}
                    style={{ color: 'rgba(255,255,255,0.2)' }}
                  />
                </div>
              )}
            </Fragment>
          ))}
        </div>

      </div>
    </section>
  )
}

'use client'

import React from 'react'

const INFRA = [
  { name: 'Stripe',     color: '#635BFF', abbr: 'S'  },
  { name: 'Supabase',   color: '#3ECF8E', abbr: 'Su' },
  { name: 'Resend',     color: '#0F172A', abbr: 'R'  },
  { name: 'Next.js',    color: '#000000', abbr: 'N'  },
  { name: 'Netlify',    color: '#00C7B7', abbr: 'Ne' },
  { name: 'Railway',    color: '#7B61FF', abbr: 'Ra' },
  { name: 'Vercel',     color: '#171717', abbr: 'V'  },
  { name: 'TypeScript', color: '#3178C6', abbr: 'Ts' },
  { name: 'PostgreSQL', color: '#336791', abbr: 'Pg' },
  { name: 'Tailwind',   color: '#06B6D4', abbr: 'Tw' },
]

const CLIENT_TOOLS = [
  { name: 'Figma',        color: '#F24E1E', abbr: 'Fi' },
  { name: 'Notion',       color: '#191919', abbr: 'No' },
  { name: 'Slack',        color: '#4A154B', abbr: 'Sl' },
  { name: 'Google Drive', color: '#4285F4', abbr: 'G'  },
  { name: 'Dropbox',      color: '#0061FF', abbr: 'Dr' },
  { name: 'Loom',         color: '#625DF5', abbr: 'Lo' },
  { name: 'Linear',       color: '#5E6AD2', abbr: 'Li' },
  { name: 'HubSpot',      color: '#FF7A59', abbr: 'Hs' },
  { name: 'Airtable',     color: '#18BFFF', abbr: 'Ai' },
  { name: 'Asana',        color: '#F06A6A', abbr: 'As' },
]

function Chip({ name, color, abbr }: { name: string; color: string; abbr: string }) {
  return (
    <div
      className="inline-flex items-center gap-2.5 h-10 px-4 rounded-xl border border-gray-200/80 bg-white shrink-0 select-none"
      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)' }}
    >
      {/* Brand badge */}
      <span
        className="inline-flex items-center justify-center w-5 h-5 rounded-md text-[9px] font-extrabold shrink-0 leading-none"
        style={{
          background: `${color}1a`,
          color,
          letterSpacing: '0.01em',
        }}
      >
        {abbr}
      </span>
      <span className="text-[13px] font-semibold text-gray-700 whitespace-nowrap leading-none">
        {name}
      </span>
    </div>
  )
}

const FADE: React.CSSProperties = {
  maskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
  WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
}

function Track({
  items,
  duration,
  reverse = false,
}: {
  items: typeof INFRA
  duration: number
  reverse?: boolean
}) {
  const doubled = [...items, ...items]
  return (
    <div className="overflow-hidden" style={FADE}>
      <div
        className="flex items-center gap-3 w-max"
        style={{
          animation: `${reverse ? 'marquee-reverse' : 'marquee'} ${duration}s linear infinite`,
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.animationPlayState = 'paused')}
        onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.animationPlayState = 'running')}
      >
        {doubled.map((brand, i) => (
          <Chip key={i} {...brand} />
        ))}
      </div>
    </div>
  )
}

export default function TrustedBy() {
  return (
    <section className="relative bg-[#f8fafc] border-t border-b border-gray-100 py-10 overflow-hidden">

      {/* Top accent line */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(99,91,255,0.3) 30%, rgba(37,99,235,0.3) 70%, transparent)',
        }}
      />

      {/* Label */}
      <p className="text-center text-[11px] font-semibold tracking-[0.16em] uppercase text-gray-400 mb-7">
        Integrates with the tools you already trust
      </p>

      {/* Row 1 — left */}
      <Track items={INFRA} duration={32} />

      {/* Spacer */}
      <div className="h-3" />

      {/* Row 2 — right */}
      <Track items={CLIENT_TOOLS} duration={26} reverse />

    </section>
  )
}

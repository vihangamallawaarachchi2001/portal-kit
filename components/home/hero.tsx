import { Zap, PlayCircle, FileText, Archive, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomeHero() {
  return (
    <section className="relative flex items-center min-h-screen pt-20 pb-32 px-6 overflow-hidden bg-[#080d1a]">

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
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: '1000px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.18) 0%, transparent 68%)',
          }}
        />
      </div>

      {/* Two-column layout */}
      <div className="relative max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

        {/* ── Left: copy ──────────────────────────────────────────── */}
        <div className="flex flex-col items-start">

          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
            <Zap className="size-3.5 text-yellow-400 fill-yellow-400 shrink-0" />
            <span className="text-sm font-medium text-white/75">Version 4.0 Now Live</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-[3.75rem] font-bold tracking-tight leading-[1.06] text-white mb-6">
            Your clients deserve<br />
            a better<br />
            experience
          </h1>

          {/* Subheading */}
          <p className="text-lg leading-relaxed text-white/58 mb-10 max-w-md" style={{ color: 'rgba(255,255,255,0.58)' }}>
            The premium client portal designed for high-end creative studios
            and independent agencies. Consolidate communication, approvals,
            and billing into one seamless branded interface.
          </p>

          {/* CTAs */}
          <div className="flex flex-row items-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-[#0051D5] hover:bg-[#316BF3] text-white font-semibold px-6 text-[15px] h-11 rounded-lg"
            >
              <Link href="/auth">Create Your Portal</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="border border-white/20 bg-transparent hover:bg-white/5 text-white font-semibold px-6 text-[15px] h-11 rounded-lg"
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                <PlayCircle size={16} className="shrink-0" />
                View Demo
              </Link>
            </Button>
          </div>
        </div>

        {/* ── Right: mockup ───────────────────────────────────────── */}
        <div className="relative flex justify-center lg:justify-end pt-8 lg:pt-0">

          {/* Browser frame card */}
          <div className="relative w-full max-w-[420px]">
            <div className="bg-white rounded-xl shadow-[0_32px_80px_rgba(0,0,0,0.5)] overflow-hidden">

              {/* Browser chrome */}
              <div className="flex items-center gap-1.5 px-4 py-3 bg-[#f5f5f5] border-b border-gray-200/80">
                <div className="size-[11px] rounded-full bg-[#FF5F57]" />
                <div className="size-[11px] rounded-full bg-[#FEBC2E]" />
                <div className="size-[11px] rounded-full bg-[#28C840]" />
              </div>

              {/* Card content */}
              <div className="p-5">

                {/* Project header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-[15px] leading-snug">Acme Brand Strategy</h3>
                    <p className="text-[12px] text-gray-400 mt-0.5">Active Project · Phase 2</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shrink-0 ml-3">
                    In Progress
                  </span>
                </div>

                <div className="border-t border-gray-100 mb-1" />

                {/* File row 1 */}
                <div className="flex items-center gap-3 py-2.5">
                  <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <FileText className="size-[15px] text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-gray-900 truncate">Q3 Style Guide.pdf</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Pending your approval</p>
                  </div>
                  <button className="shrink-0 px-3 py-1.5 text-[12px] font-semibold bg-[#0051D5] hover:bg-[#316BF3] text-white rounded-md transition-colors">
                    Review
                  </button>
                </div>

                {/* File row 2 */}
                <div className="flex items-center gap-3 py-2.5">
                  <div className="size-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <Archive className="size-[15px] text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-gray-900 truncate">Brand_Assets_v2.zip</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Approved 2h ago</p>
                  </div>
                  <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
                </div>

              </div>
            </div>

            {/* Floating chat bubble */}
            <div className="absolute -bottom-10 -left-8 w-60 bg-[#111827] border border-white/10 rounded-xl p-4 shadow-2xl">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="size-7 rounded-full bg-[#0051D5] flex items-center justify-center shrink-0">
                  <span className="text-[11px] font-bold text-white">S</span>
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-white leading-none">Sarah (Creative Dir.)</p>
                  <p className="text-[10px] text-white/40 mt-1 flex items-center gap-1">
                    Typing
                    <span className="inline-flex gap-[3px] ml-0.5">
                      <span className="size-[3px] rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="size-[3px] rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '160ms' }} />
                      <span className="size-[3px] rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '320ms' }} />
                    </span>
                  </p>
                </div>
              </div>
              <p className="text-[12px] text-white/65 leading-relaxed">
                "The updated typography looks much cleaner. Approval sent!"
              </p>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}

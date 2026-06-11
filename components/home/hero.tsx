import { PlayCircle, FileText, Archive, CheckCircle2, DollarSign, Bell } from 'lucide-react'
import Link from 'next/link'

export default function HomeHero() {
  return (
    <section className="relative min-h-screen pt-32 pb-24 bg-[#080d1a] flex items-center overflow-hidden">

      {/* Dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Blue radial glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div style={{
          position: 'absolute',
          top: '45%',
          left: '35%',
          transform: 'translate(-50%, -50%)',
          width: '900px',
          height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.16) 0%, transparent 68%)',
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 w-full grid lg:grid-cols-12 gap-12 items-center">

        {/* ── Left: copy ─────────────────────────────────────── */}
        <div className="lg:col-span-6 space-y-8">

          <h1 className="text-5xl sm:text-6xl lg:text-[4.75rem] font-extrabold tracking-tight leading-[1.02] text-white">
            Your clients deserve a better experience
          </h1>

          <p className="text-lg leading-relaxed max-w-lg" style={{ color: 'rgba(255,255,255,0.58)' }}>
            The premium client portal designed for high-end creative studios and independent
            agencies. Consolidate communication, approvals, and billing into one seamless
            branded interface.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link
              href="/auth"
              className="inline-flex items-center justify-center bg-[#0051D5] text-white px-8 py-4 rounded-lg font-semibold text-base hover:brightness-110 transition-all shadow-xl shadow-blue-900/40"
            >
              Create Your Portal
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-semibold text-base text-white border border-white/20 hover:bg-white/5 transition-all"
            >
              <PlayCircle size={18} className="shrink-0" />
              View Demo
            </Link>
          </div>
        </div>

        {/* ── Right: layered mockups ──────────────────────────── */}
        <div className="lg:col-span-6 relative h-[600px] hidden lg:block">

          {/* ① Main portal card — slight clockwise tilt, straightens on hover */}
          <div className="absolute top-0 right-0 w-[480px] bg-white rounded-xl shadow-2xl border border-gray-200/80 overflow-hidden transform rotate-2 translate-x-4 hover:rotate-0 transition-transform duration-700">
            {/* Browser chrome */}
            <div className="h-10 bg-[#f5f5f5] border-b border-gray-200 flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-[10px] h-[10px] rounded-full bg-[#FF5F57]" />
                <div className="w-[10px] h-[10px] rounded-full bg-[#FEBC2E]" />
                <div className="w-[10px] h-[10px] rounded-full bg-[#28C840]" />
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Project header */}
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div>
                  <h3 className="font-bold text-[17px] text-gray-900">Acme Brand Strategy</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Active Project · Phase 2</p>
                </div>
                <span className="shrink-0 ml-3 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-semibold">
                  In Progress
                </span>
              </div>

              <div className="space-y-3">
                {/* File row 1 */}
                <div className="p-3 bg-gray-50 border border-gray-200/80 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <FileText className="size-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Q3 Style Guide.pdf</p>
                      <p className="text-xs text-gray-400">Pending your approval</p>
                    </div>
                  </div>
                  <button className="shrink-0 bg-[#0051D5] text-white text-xs px-3 py-1.5 rounded-md font-semibold">
                    Review
                  </button>
                </div>

                {/* File row 2 */}
                <div className="p-3 bg-gray-50 border border-gray-200/80 rounded-lg flex items-center justify-between opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <Archive className="size-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Brand_Assets_v2.zip</p>
                      <p className="text-xs text-gray-400">Approved 2h ago</p>
                    </div>
                  </div>
                  <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
                </div>
              </div>
            </div>
          </div>

          {/* ② Invoice paid notification — mid-left float */}
          <div
            className="absolute top-[45%] -left-2 w-56 p-3.5 rounded-xl shadow-2xl z-20 transform rotate-1 hover:rotate-0 transition-transform duration-500"
            style={{ background: 'rgba(13,18,30,0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <DollarSign className="size-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-[12px] font-bold text-white leading-none">Payment Received</p>
                <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>Invoice #1042 · $3,200</p>
              </div>
            </div>
          </div>

          {/* ③ New approval request notification — top-left area */}
          <div
            className="absolute top-[18%] -left-4 w-52 p-3.5 rounded-xl shadow-2xl z-20 transform -rotate-1 hover:rotate-0 transition-transform duration-500"
            style={{ background: 'rgba(13,18,30,0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#0051D5]/25 flex items-center justify-center shrink-0">
                <Bell className="size-4 text-[#6B9EFF]" />
              </div>
              <div>
                <p className="text-[12px] font-bold text-white leading-none">New Approval Request</p>
                <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>Homepage_v3.fig · just now</p>
              </div>
            </div>
          </div>

          {/* ④ Chat overlay — bottom-left, counter-clockwise tilt */}
          <div
            className="absolute bottom-6 left-0 w-64 p-4 rounded-xl shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-500 z-20"
            style={{ background: 'rgba(13,18,30,0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0051D5] to-[#6B9EFF] shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Sarah (Creative Dir.)</p>
                <p className="text-[10px] mt-0.5 flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Typing
                  <span className="inline-flex gap-[3px] ml-0.5">
                    <span className="size-[3px] rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="size-[3px] rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '160ms' }} />
                    <span className="size-[3px] rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '320ms' }} />
                  </span>
                </p>
              </div>
            </div>
            <div className="rounded-lg p-2.5 text-[11px] leading-relaxed" style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.82)' }}>
              "The updated typography looks much cleaner. Approval sent!"
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

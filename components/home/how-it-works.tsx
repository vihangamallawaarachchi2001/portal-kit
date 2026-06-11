export default function HowItWorks() {
  return (
    <section className="bg-[#f8fafc] py-28 px-6">
      <div className="max-w-7xl mx-auto">

        {/* ── Heading ── */}
        <div className="max-w-xl mx-auto text-center mb-14">
          <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-ds-secondary mb-4">
            How it works
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-on-surface leading-[1.06] mb-5">
            Up and running before<br className="hidden sm:block" /> your next client call.
          </h2>
          <p className="text-lg text-on-surface-variant leading-relaxed">
            Four steps to replace email chaos with a portal<br className="hidden sm:block" /> your clients will actually enjoy.
          </p>
        </div>

        {/* ── 2×2 Bento grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          {/* ① Create your portal — white */}
          <div className="flex flex-col rounded-3xl border border-gray-200 bg-white p-7 shadow-sm overflow-hidden min-h-80">
            <span className="inline-block mb-5 px-2.5 py-1 rounded-md bg-gray-100 text-[10px] font-mono font-bold text-gray-500 tracking-widest w-fit">
              01
            </span>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Create your portal</h3>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Set up your branded workspace in minutes — your subdomain, your logo, your colors.
            </p>
            {/* Illustration */}
            <div className="mt-auto pt-6">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-2 mb-3.5">
                  <div className="w-5 h-5 rounded-md bg-[#0051D5]" />
                  <span className="font-mono text-[10px] text-gray-400 truncate">acme.portalkit.com</span>
                  <span className="ml-auto shrink-0 text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                    Live
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="h-1.5 bg-gray-200 rounded-full w-4/5" />
                  <div className="h-1.5 bg-gray-200 rounded-full w-3/5" />
                  <div className="flex gap-2 pt-3">
                    <div className="h-7 bg-gray-200 rounded-lg flex-1" />
                    <div className="h-7 rounded-lg w-16" style={{ background: '#0051D5' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ② Invite your client — dark */}
          <div
            className="flex flex-col rounded-3xl p-7 overflow-hidden min-h-80"
            style={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <span
              className="inline-block mb-5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-widest w-fit"
              style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}
            >
              02
            </span>
            <h3 className="text-xl font-bold text-white mb-2">Invite your client</h3>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
              One magic link. No passwords, no account creation. Clients land straight in.
            </p>
            {/* Illustration */}
            <div className="mt-auto pt-6">
              <div
                className="rounded-xl p-4"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold text-white"
                    style={{ background: 'rgba(99,130,255,0.3)' }}
                  >
                    JD
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-white leading-none truncate">
                      jane@acmecreative.co
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      Portal link sent · just now
                    </p>
                  </div>
                  <span
                    className="shrink-0 text-[9px] font-bold px-2 py-1 rounded-full"
                    style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}
                  >
                    Sent
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ③ Clients review & approve — brand blue */}
          <div
            className="flex flex-col rounded-3xl p-7 overflow-hidden min-h-80"
            style={{ background: '#0051D5' }}
          >
            <span
              className="inline-block mb-5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-widest w-fit"
              style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}
            >
              03
            </span>
            <h3 className="text-xl font-bold text-white mb-2">Clients review & approve</h3>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Files, milestones, and invoices — all visible and actionable in one place.
            </p>
            {/* Illustration */}
            <div className="mt-auto pt-6">
              <div
                className="rounded-xl p-4"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                <div className="flex items-center gap-2.5 mb-3.5">
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(255,255,255,0.15)' }}
                  >
                    <svg width="10" height="12" viewBox="0 0 10 12" fill="none" aria-hidden>
                      <rect width="10" height="12" rx="1.5" fill="rgba(255,255,255,0.35)" />
                      <rect x="2" y="3" width="6" height="1.2" rx="0.5" fill="rgba(255,255,255,0.65)" />
                      <rect x="2" y="5.5" width="4" height="1.2" rx="0.5" fill="rgba(255,255,255,0.45)" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    Homepage_v3.fig
                  </span>
                </div>
                <div className="flex gap-2">
                  <div
                    className="flex-1 py-2 rounded-lg text-center text-[10px] font-semibold"
                    style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.55)' }}
                  >
                    Request changes
                  </div>
                  <div
                    className="flex-1 py-2 rounded-lg text-center text-[10px] font-bold"
                    style={{ background: 'white', color: '#0051D5' }}
                  >
                    ✓ Approve
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ④ Stay notified — muted light */}
          <div className="flex flex-col rounded-3xl border border-gray-200/60 bg-white p-7 overflow-hidden min-h-80">
            <span className="inline-block mb-5 px-2.5 py-1 rounded-md bg-gray-100 text-[10px] font-mono font-bold text-gray-500 tracking-widest w-fit">
              04
            </span>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Stay notified, automatically</h3>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Real-time pings when clients view, approve, or pay. No more chasing.
            </p>
            {/* Illustration — notification list */}
            <div className="mt-auto pt-6 space-y-2">
              {[
                { dot: '#22c55e', label: 'Invoice Paid',  meta: '$3,200 · just now'        },
                { dot: '#0051D5', label: 'File Approved', meta: 'Homepage_v3.fig · 5m ago' },
                { dot: '#f59e0b', label: 'New Message',   meta: 'Sarah K. · 12m ago'       },
              ].map(({ dot, label, meta }) => (
                <div
                  key={label}
                  className="flex items-center gap-2.5 rounded-xl bg-[#f8fafc] border border-gray-200/70 px-3.5 py-2.5"
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dot }} />
                  <span className="text-[11px] font-semibold text-gray-800">{label}</span>
                  <span className="ml-auto text-[10px] text-gray-400 whitespace-nowrap">{meta}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

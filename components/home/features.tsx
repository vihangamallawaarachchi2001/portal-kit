export default function Features() {
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
      {/* Subtle blue glow behind the grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 55% 65%, rgba(0,81,213,0.07) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto">

        {/* ── Heading — left-aligned ── */}
        <div className="max-w-xl mb-14">
          <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-ds-secondary mb-4">
            Features
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.06] mb-5">
            Built for the high-end workflow.
          </h2>
          <p className="text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.52)' }}>
            Generic tools feel{' '}
            <span style={{ color: '#6B9EFF' }}>generic</span>
            . PortalKit feels like an extension of your studio&apos;s{' '}
            <span style={{ color: '#6B9EFF' }}>premium brand experience</span>
            .
          </p>
        </div>

        {/* ── Asymmetric bento — 5-column grid, rows swap weight ── */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

          {/* ① Precision File Approvals — dark, wide (3/5) */}
          <div
            className="md:col-span-3 flex flex-col rounded-2xl p-7 overflow-hidden min-h-72"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <h3 className="text-lg font-bold text-white mb-2">Precision File Approvals</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '30ch' }}>
              Give clients tools to leave granular feedback directly on images, videos, and PDFs.
              No more "the blue part looks off" emails.
            </p>
            {/* Illustration */}
            <div className="mt-auto pt-6">
              <div
                className="rounded-xl p-3 mb-3"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-4 rounded bg-white/10 shrink-0" />
                  <div className="h-1.5 rounded-full bg-white/10 w-36" />
                  <div className="h-1.5 rounded-full ml-auto w-12" style={{ background: 'rgba(255,255,255,0.06)' }} />
                </div>
                <div className="h-10 rounded-lg border" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.06)' }} />
              </div>
              <div className="flex justify-end gap-2">
                <span
                  className="px-3.5 py-1.5 rounded-md text-[10px] font-semibold"
                  style={{ border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.48)' }}
                >
                  Reject
                </span>
                <span className="px-3.5 py-1.5 rounded-md text-[10px] font-semibold bg-[#0051D5] text-white">
                  Approve
                </span>
              </div>
            </div>
          </div>

          {/* ② Centralized Messaging — blue, narrow (2/5) */}
          <div
            className="md:col-span-2 flex flex-col rounded-2xl p-7 overflow-hidden min-h-72"
            style={{ background: '#0051D5' }}
          >
            <h3 className="text-lg font-bold text-white mb-2">Centralized Messaging</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)', maxWidth: '22ch' }}>
              Threaded discussions organized by project phase. Context stays where it belongs.
            </p>
            {/* Illustration — chat bubbles */}
            <div className="mt-auto pt-6 space-y-3">
              <div className="flex items-end gap-2">
                <div className="w-6 h-6 rounded-full shrink-0" style={{ background: 'rgba(255,255,255,0.2)' }} />
                <div
                  className="h-10 rounded-2xl rounded-bl-sm flex-1"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                />
              </div>
              <div className="flex items-end gap-2 justify-end">
                <div
                  className="h-10 rounded-2xl rounded-br-sm"
                  style={{ background: 'rgba(255,255,255,0.25)', width: '75%' }}
                />
                <div className="w-6 h-6 rounded-full shrink-0" style={{ background: 'rgba(255,255,255,0.2)' }} />
              </div>
            </div>
          </div>

          {/* ③ Seamless Billing — dark, narrow (2/5) */}
          <div
            className="md:col-span-2 flex flex-col rounded-2xl p-7 overflow-hidden min-h-72"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <h3 className="text-lg font-bold text-white mb-2">Seamless Billing</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '22ch' }}>
              Send invoices and collect payment in one place. See exactly when they&apos;re opened.
            </p>
            {/* Illustration — invoice card */}
            <div className="mt-auto pt-6">
              <div
                className="rounded-xl p-3.5 mb-2"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
              >
                <div className="flex justify-between items-center mb-3">
                  <span
                    className="text-[10px] font-mono tracking-wider"
                    style={{ color: 'rgba(255,255,255,0.35)' }}
                  >
                    INVOICE #982
                  </span>
                  <span className="text-[11px] font-bold text-emerald-400">$4,200.00</span>
                </div>
                <div
                  className="w-full py-2 rounded-lg text-[10px] font-bold text-gray-900 text-center"
                  style={{ background: 'rgba(255,255,255,0.92)' }}
                >
                  Pay with Stripe
                </div>
              </div>
              <p className="text-[10px] text-center" style={{ color: 'rgba(255,255,255,0.28)' }}>
                Automated invoicing and payment reminders
              </p>
            </div>
          </div>

          {/* ④ White-labeled — white, wide (3/5) */}
          <div className="md:col-span-3 flex flex-col rounded-2xl p-7 bg-white overflow-hidden min-h-72">
            <h3 className="text-lg font-bold text-gray-900 mb-2">White-labeled to your core.</h3>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Your logo, your domain, your brand colors.{' '}
              <span className="font-medium" style={{ color: '#0051D5' }}>
                We stay in the background while you take the credit.
              </span>
            </p>
            {/* Illustration — logo drop zone */}
            <div className="mt-auto pt-6">
              <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center py-9 gap-3">
                <div className="w-11 h-11 rounded-xl border border-gray-200 bg-white flex items-center justify-center shadow-sm">
                  <svg width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden>
                    <path
                      d="M8.5 12V4M8.5 4L5.5 7M8.5 4L11.5 7"
                      stroke="#9ca3af"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path d="M3 14h11" stroke="#9ca3af" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase">
                  Drop logo here
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

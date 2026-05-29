import Image from 'next/image'

export default function ProductShowcase() {
  return (
    <section className="relative bg-surface px-6 py-20 overflow-hidden">

      {/* ── Outer frame — browser window chrome ───────────────────── */}
      <div className="mx-auto max-w-5xl rounded-2xl border border-outline-variant shadow-2xl shadow-on-surface/10 overflow-hidden">

        {/* Browser top bar */}
        <div className="flex items-center gap-3 px-4 h-11 bg-surface-container-low border-b border-outline-variant">

          {/* Traffic-light dots */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="size-3 rounded-full bg-red-400" />
            <span className="size-3 rounded-full bg-yellow-400" />
            <span className="size-3 rounded-full bg-green-400" />
          </div>

          {/* URL bar */}
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2 w-full max-w-xs h-6 rounded-md bg-surface-container px-3">
              <div className="size-2 rounded-full bg-ds-tertiary-action shrink-0" />
              <span className="text-xs text-on-surface-variant font-medium truncate">
                portalkit.com/project/alpha-design-system
              </span>
            </div>
          </div>

          {/* Spacer to balance the dots */}
          <div className="w-14 shrink-0" />
        </div>

        {/* ── Viewport — dark teal canvas ─────────────────────────── */}
        <div className="relative bg-[#243b4f] flex items-center justify-center p-8 md:p-14 min-h-[420px] md:min-h-[560px]">

          {/* Swap this <div> for a real <Image> when the screenshot is ready */}
          <div className="relative w-full max-w-lg md:max-w-xl rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
            <Image
              src="/placeholder-dashboard.png"
              alt="PortalKit client portal dashboard"
              width={960}
              height={640}
              priority
              className="w-full h-auto"
              onError={undefined}
              // Remove the placeholder block below once you drop the real image in
            />

            {/* ── PLACEHOLDER — delete when real image is ready ─────── */}
            <div className="absolute inset-0 bg-surface flex flex-col overflow-hidden">

              {/* Mini app top bar */}
              <div className="flex items-center gap-3 px-4 h-10 border-b border-outline-variant bg-surface-container-lowest shrink-0">
                <div className="size-5 rounded bg-ds-primary/80" />
                <div className="h-2.5 w-24 rounded-full bg-surface-container" />
                <div className="ml-auto flex gap-2">
                  <div className="h-2.5 w-14 rounded-full bg-surface-container" />
                  <div className="h-2.5 w-14 rounded-full bg-surface-container" />
                </div>
              </div>

              <div className="flex flex-1 overflow-hidden">

                {/* Sidebar */}
                <div className="w-36 shrink-0 border-r border-outline-variant bg-surface-container-low px-3 py-4 flex flex-col gap-2.5">
                  {[70, 50, 60, 45, 55].map((w, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="size-3 rounded bg-surface-container-high shrink-0" />
                      <div
                        className="h-2 rounded-full bg-surface-container-high"
                        style={{ width: `${w}%` }}
                      />
                    </div>
                  ))}
                </div>

                {/* Main content */}
                <div className="flex-1 p-4 flex flex-col gap-4 overflow-hidden">

                  {/* Page title */}
                  <div className="h-3 w-36 rounded-full bg-on-surface/10" />

                  {/* Metric cards row */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { accent: 'bg-ds-secondary/20' },
                      { accent: 'bg-ds-tertiary-action/20' },
                      { accent: 'bg-ds-error/10' },
                    ].map(({ accent }, i) => (
                      <div key={i} className="rounded-lg border border-outline-variant bg-surface-container-lowest p-3 flex flex-col gap-2">
                        <div className={`size-5 rounded ${accent}`} />
                        <div className="h-3 w-10 rounded-full bg-surface-container-high" />
                        <div className="h-2 w-14 rounded-full bg-surface-container" />
                      </div>
                    ))}
                  </div>

                  {/* Chart area */}
                  <div className="flex-1 rounded-lg border border-outline-variant bg-surface-container-lowest p-3 flex flex-col gap-3">
                    <div className="h-2.5 w-20 rounded-full bg-surface-container-high" />
                    {/* Bar chart */}
                    <div className="flex-1 flex items-end gap-1.5 px-1 pb-1">
                      {[45, 70, 55, 85, 60, 90, 50, 75, 65, 80, 55, 70].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-sm bg-ds-secondary/30"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
            {/* ── END PLACEHOLDER ────────────────────────────────────── */}

          </div>
        </div>

      </div>
    </section>
  )
}

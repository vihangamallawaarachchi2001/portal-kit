import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, FileText, Upload, MessageSquare, BarChart2, Palette, ShieldCheck } from 'lucide-react'
import { Header } from '@/components/public/header'
import Footer from '@/components/public/footer'
import { PageHero } from '@/components/public/page-hero'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Features',
  description:
    'Explore every feature PortalKit offers — file approvals, invoice tracking, secure messaging, progress tracking, white labeling, and client permissions.',
}

export default function FeaturesPage() {
  return (
    <>
      <Header />
      <main className="pt-16">

        <PageHero
          eyebrow="Features"
          headline="Everything your client"
          accentLine="workflow needs."
          description="Purpose-built for freelancers who want to spend time on their craft, not chasing approvals and re-sending invoice emails."
        />

        {/* ── Feature 1: File Approvals ─────────────────────────── */}
        <section className="bg-surface py-20 px-6">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col md:flex-row gap-16 items-center">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 rounded-full bg-ds-secondary/10 px-3 py-1 mb-5">
                  <Upload size={13} className="text-ds-secondary" />
                  <span className="text-xs font-semibold text-ds-secondary">File Management</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface mb-4">
                  File approvals that actually work
                </h2>
                <p className="text-base text-on-surface-variant leading-relaxed mb-6">
                  Centralize all versions in one place. Clients approve with one click or
                  leave annotated feedback directly on files — no more emailing PDF markups
                  or hunting for the "final_v7_APPROVED.pdf" in an inbox.
                </p>
                <ul className="space-y-3">
                  {[
                    'Full version history with timestamps',
                    'Annotated feedback on any file type',
                    'Email notifications on approval or rejection',
                    'Bulk upload via drag and drop',
                  ].map(b => (
                    <li key={b} className="flex items-start gap-2.5">
                      <Check size={15} strokeWidth={2.5} className="text-ds-tertiary-action mt-0.5 shrink-0" />
                      <span className="text-sm text-on-surface-variant">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 md:max-w-sm w-full">
                <div className="rounded-xl bg-surface border border-outline-variant p-5 space-y-2 shadow-sm">
                  <p className="text-xs font-medium text-on-surface-variant mb-3">Project deliverables</p>
                  {[
                    { name: 'logo_suite_v3.svg', size: '2.4 MB', status: 'Approved', sc: 'text-emerald-700 bg-emerald-50' },
                    { name: 'brand_guide.pdf',   size: '8.1 MB', status: 'In review', sc: 'text-blue-700 bg-blue-50' },
                    { name: 'homepage_v2.fig',   size: '12 MB',  status: 'Awaiting',  sc: 'text-amber-700 bg-amber-50' },
                  ].map(({ name, size, status, sc }) => (
                    <div key={name} className="flex items-center justify-between rounded-lg border border-outline-variant/50 bg-surface-container-lowest px-3 py-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="size-7 rounded bg-ds-secondary/10 flex items-center justify-center shrink-0">
                          <FileText size={12} className="text-ds-secondary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-on-surface truncate">{name}</p>
                          <p className="text-xs text-on-surface-variant">{size}</p>
                        </div>
                      </div>
                      <span className={`shrink-0 ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${sc}`}>{status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Feature 2: Invoice Tracking ───────────────────────── */}
        <section className="bg-surface-container-low py-20 px-6">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col md:flex-row-reverse gap-16 items-center">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 rounded-full bg-ds-secondary/10 px-3 py-1 mb-5">
                  <BarChart2 size={13} className="text-ds-secondary" />
                  <span className="text-xs font-semibold text-ds-secondary">Invoicing</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface mb-4">
                  Know exactly when clients pay
                </h2>
                <p className="text-base text-on-surface-variant leading-relaxed mb-6">
                  Link your Stripe or PayPal account and send invoices directly through
                  the portal. See when a client views an invoice, get notified when it's
                  paid, and stop chasing payments.
                </p>
                <ul className="space-y-3">
                  {[
                    'Stripe and PayPal integration',
                    'Real-time "viewed" and "paid" notifications',
                    'Attach invoices directly to deliverables',
                    'Automated payment reminders',
                  ].map(b => (
                    <li key={b} className="flex items-start gap-2.5">
                      <Check size={15} strokeWidth={2.5} className="text-ds-tertiary-action mt-0.5 shrink-0" />
                      <span className="text-sm text-on-surface-variant">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 md:max-w-sm w-full">
                <div className="rounded-xl bg-surface border border-outline-variant p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs text-on-surface-variant">Invoice #INV-0042</p>
                      <p className="text-2xl font-bold text-on-surface mt-0.5">$3,500.00</p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">Paid</span>
                  </div>
                  <div className="space-y-2 text-xs text-on-surface-variant border-t border-outline-variant pt-4 pb-4">
                    <div className="flex justify-between">
                      <span>Brand identity design</span>
                      <span className="text-on-surface font-medium">$2,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Website design (5 pages)</span>
                      <span className="text-on-surface font-medium">$1,500</span>
                    </div>
                  </div>
                  <div className="border-t border-outline-variant pt-4 flex items-center gap-2">
                    <div className="size-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <Check size={10} strokeWidth={3} className="text-emerald-600" />
                    </div>
                    <span className="text-xs text-on-surface-variant">Paid via Stripe · Nov 12, 2024</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Feature 3: Secure Messaging ───────────────────────── */}
        <section className="bg-surface py-20 px-6">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col md:flex-row gap-16 items-center">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 rounded-full bg-ds-secondary/10 px-3 py-1 mb-5">
                  <MessageSquare size={13} className="text-ds-secondary" />
                  <span className="text-xs font-semibold text-ds-secondary">Communication</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface mb-4">
                  Move conversations out of your inbox
                </h2>
                <p className="text-base text-on-surface-variant leading-relaxed mb-6">
                  Threaded client chats live right where the work is — attached to the
                  relevant project or file. Context is always preserved, nothing
                  gets buried in an email thread from three months ago.
                </p>
                <ul className="space-y-3">
                  {[
                    'Threaded conversations per project or file',
                    'Rich text with file attachments',
                    'Read receipts and message timestamps',
                    'Email notifications for new messages',
                  ].map(b => (
                    <li key={b} className="flex items-start gap-2.5">
                      <Check size={15} strokeWidth={2.5} className="text-ds-tertiary-action mt-0.5 shrink-0" />
                      <span className="text-sm text-on-surface-variant">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 md:max-w-sm w-full">
                <div className="rounded-xl bg-surface border border-outline-variant p-5 space-y-3 shadow-sm">
                  <p className="text-xs font-medium text-on-surface-variant mb-1">Brand project · Messages</p>
                  <div className="flex gap-2.5 items-end">
                    <div className="size-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-violet-600">S</span>
                    </div>
                    <div className="bg-surface-container-low rounded-xl rounded-bl-sm px-3 py-2 max-w-[85%]">
                      <p className="text-xs text-on-surface">Can we adjust the logo colors to be a bit warmer?</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">10:24 AM</p>
                    </div>
                  </div>
                  <div className="flex gap-2.5 items-end justify-end">
                    <div className="bg-ds-secondary rounded-xl rounded-br-sm px-3 py-2 max-w-[85%]">
                      <p className="text-xs text-white">Of course! I&apos;ll update the palette and have a new version ready by EOD.</p>
                      <p className="text-xs text-white/70 mt-0.5">10:31 AM</p>
                    </div>
                    <div className="size-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-blue-600">Y</span>
                    </div>
                  </div>
                  <div className="flex gap-2.5 items-end">
                    <div className="size-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-violet-600">S</span>
                    </div>
                    <div className="bg-surface-container-low rounded-xl rounded-bl-sm px-3 py-2">
                      <p className="text-xs text-on-surface">Perfect, thank you! ✨</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">10:33 AM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Feature 4: Live Progress Bars ─────────────────────── */}
        <section className="bg-surface-container-low py-20 px-6">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col md:flex-row-reverse gap-16 items-center">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 rounded-full bg-ds-secondary/10 px-3 py-1 mb-5">
                  <BarChart2 size={13} className="text-ds-secondary" />
                  <span className="text-xs font-semibold text-ds-secondary">Transparency</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface mb-4">
                  End the &ldquo;how is it going?&rdquo; calls
                </h2>
                <p className="text-base text-on-surface-variant leading-relaxed mb-6">
                  Clients can see exactly where the project stands at any moment —
                  no status update needed. Visible progress builds trust and
                  reduces the anxiety that leads to micromanaging.
                </p>
                <ul className="space-y-3">
                  {[
                    'Real-time progress bars per milestone',
                    'Phase-level visibility (design, dev, review)',
                    'Completion percentage updated automatically',
                    'Optional client-facing timeline view',
                  ].map(b => (
                    <li key={b} className="flex items-start gap-2.5">
                      <Check size={15} strokeWidth={2.5} className="text-ds-tertiary-action mt-0.5 shrink-0" />
                      <span className="text-sm text-on-surface-variant">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 md:max-w-sm w-full">
                <div className="rounded-xl bg-surface border border-outline-variant p-5 space-y-4 shadow-sm">
                  <p className="text-xs font-medium text-on-surface-variant">Project Alpha — Progress</p>
                  {[
                    { label: 'Brand strategy', pct: 100, color: 'bg-emerald-500' },
                    { label: 'UI design',       pct: 75,  color: 'bg-ds-secondary' },
                    { label: 'Development',     pct: 40,  color: 'bg-ds-secondary' },
                    { label: 'Content writing', pct: 15,  color: 'bg-amber-400' },
                  ].map(({ label, pct, color }) => (
                    <div key={label} className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-on-surface">{label}</span>
                        <span className="text-xs font-semibold text-on-surface-variant">{pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-surface-container-high overflow-hidden">
                        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Feature 5: White Labeling ─────────────────────────── */}
        <section className="bg-surface py-20 px-6">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col md:flex-row gap-16 items-center">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 rounded-full bg-ds-secondary/10 px-3 py-1 mb-5">
                  <Palette size={13} className="text-ds-secondary" />
                  <span className="text-xs font-semibold text-ds-secondary">Branding</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface mb-4">
                  Your brand. Your portal.
                </h2>
                <p className="text-base text-on-surface-variant leading-relaxed mb-6">
                  Apply your own logo, colors, and domain. Clients see your brand
                  everywhere — not PortalKit&apos;s. To them, it looks like proprietary
                  software your agency built in-house.
                </p>
                <ul className="space-y-3">
                  {[
                    'Custom domain (clients.yourbrand.com)',
                    'Upload your logo and brand colors',
                    'Custom email sender name',
                    'Remove all PortalKit references',
                  ].map(b => (
                    <li key={b} className="flex items-start gap-2.5">
                      <Check size={15} strokeWidth={2.5} className="text-ds-tertiary-action mt-0.5 shrink-0" />
                      <span className="text-sm text-on-surface-variant">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 md:max-w-sm w-full">
                <div className="rounded-xl border border-outline-variant overflow-hidden shadow-sm">
                  <div className="bg-[#1a0533] px-4 h-10 flex items-center gap-2.5">
                    <div className="size-5 rounded bg-purple-500 flex items-center justify-center shrink-0">
                      <span className="text-white text-xs font-bold">P</span>
                    </div>
                    <span className="text-xs font-bold text-white">Pixel Studio</span>
                    <div className="ml-auto flex gap-2">
                      <div className="h-1.5 w-12 rounded-full bg-white/20" />
                      <div className="h-1.5 w-8 rounded-full bg-white/20" />
                    </div>
                  </div>
                  <div className="bg-[#0d0020] p-4 space-y-3">
                    <div className="h-2 w-32 rounded-full bg-white/20" />
                    <div className="grid grid-cols-2 gap-2">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2">
                          <div className="h-1.5 w-3/4 rounded-full bg-purple-400/40" />
                          <div className="h-1.5 w-1/2 rounded-full bg-white/20" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Feature 6: Client Permissions ─────────────────────── */}
        <section className="bg-surface-container-low py-20 px-6">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col md:flex-row-reverse gap-16 items-center">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 rounded-full bg-ds-secondary/10 px-3 py-1 mb-5">
                  <ShieldCheck size={13} className="text-ds-secondary" />
                  <span className="text-xs font-semibold text-ds-secondary">Access Control</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface mb-4">
                  Control exactly what clients see
                </h2>
                <p className="text-base text-on-surface-variant leading-relaxed mb-6">
                  Keep internal drafts, team notes, and sensitive materials hidden
                  until you&apos;re ready to share. Granular permissions mean clients
                  only see what you want them to see — nothing more, nothing less.
                </p>
                <ul className="space-y-3">
                  {[
                    'Per-client visibility settings',
                    'Hide files until marked "ready for review"',
                    'Control access to invoices independently',
                    'Separate internal and client-facing views',
                  ].map(b => (
                    <li key={b} className="flex items-start gap-2.5">
                      <Check size={15} strokeWidth={2.5} className="text-ds-tertiary-action mt-0.5 shrink-0" />
                      <span className="text-sm text-on-surface-variant">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 md:max-w-sm w-full">
                <div className="rounded-xl bg-surface border border-outline-variant p-5 shadow-sm">
                  <p className="text-xs font-medium text-on-surface-variant mb-4">Client access — Sarah K.</p>
                  <div className="space-y-1">
                    {[
                      { label: 'View deliverables',  on: true  },
                      { label: 'Download files',      on: true  },
                      { label: 'Leave comments',      on: true  },
                      { label: 'View invoices',       on: false },
                      { label: 'See internal notes',  on: false },
                      { label: 'View team activity',  on: false },
                    ].map(({ label, on }) => (
                      <div key={label} className="flex items-center justify-between py-2 border-b border-outline-variant/40 last:border-0">
                        <span className="text-xs text-on-surface">{label}</span>
                        <div className={cn(
                          'w-8 h-4 rounded-full flex items-center transition-colors',
                          on ? 'bg-ds-tertiary-action justify-end pr-0.5' : 'bg-outline-variant/50 justify-start pl-0.5'
                        )}>
                          <div className="size-3 rounded-full bg-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Dark CTA ──────────────────────────────────────────── */}
        <section className="relative bg-[#080d1a] py-20 px-6 overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          <div className="relative mx-auto max-w-xl text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-white">See every feature in action</h2>
            <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Start free and explore the full platform. No credit card, no commitment.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg" className="w-full sm:w-auto bg-ds-secondary text-on-ds-secondary font-semibold px-8">
                <Link href="/auth">Start for free</Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="w-full sm:w-auto border border-white/20 bg-white/5 text-white font-semibold px-8 backdrop-blur-sm">
                <Link href="/pricing">View pricing</Link>
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {['No credit card', 'Setup in 10 min', 'Cancel anytime'].map(item => (
                <div key={item} className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <Check size={12} strokeWidth={2.5} className="text-blue-400/70 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}

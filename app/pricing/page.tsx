import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, Minus } from 'lucide-react'
import { Header } from '@/components/public/header'
import Footer from '@/components/public/footer'
import { PageHero } from '@/components/public/page-hero'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Start for free, upgrade when ready. Simple, transparent pricing with no hidden fees for freelancers and agencies.',
}

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for freelancers just getting started.',
    cta: 'Get started free',
    href: '/auth/login',
    featured: false,
  },
  {
    name: 'Pro',
    price: '$15',
    period: 'per month',
    description: 'For growing freelancers managing multiple clients.',
    cta: 'Start 14-day trial',
    href: '/auth/login',
    featured: true,
  },
  {
    name: 'Business',
    price: '$29',
    period: 'per month',
    description: 'For agencies and high-volume freelancers.',
    cta: 'Start 14-day trial',
    href: '/auth/login',
    featured: false,
  },
]

type CellValue = boolean | string

const COMPARISON: { feature: string; free: CellValue; pro: CellValue; business: CellValue }[] = [
  { feature: 'Active client portals',     free: '1',    pro: 'Unlimited', business: 'Unlimited' },
  { feature: 'Active projects',           free: '2',    pro: 'Unlimited', business: 'Unlimited' },
  { feature: 'Team members',              free: '1',    pro: '1',         business: '5'         },
  { feature: 'File sharing & approvals',  free: true,   pro: true,        business: true        },
  { feature: 'Client messaging',          free: true,   pro: true,        business: true        },
  { feature: 'Invoice tracking',          free: false,  pro: true,        business: true        },
  { feature: 'Custom domain',             free: false,  pro: true,        business: true        },
  { feature: 'Remove PortalKit branding', free: false,  pro: true,        business: true        },
  { feature: 'Priority support',          free: false,  pro: true,        business: true        },
  { feature: 'White labeling',            free: false,  pro: false,       business: true        },
  { feature: 'Team access',              free: false,   pro: false,       business: true        },
  { feature: 'Advanced analytics',        free: false,  pro: false,       business: true        },
]

const PRICING_FAQS = [
  {
    q: 'Is there really a free plan?',
    a: 'Yes. The Free plan is free forever — no credit card required. It includes one active client portal and two projects, which is plenty to experience PortalKit before committing.',
  },
  {
    q: 'How does the 14-day trial work?',
    a: 'When you upgrade to Pro or Business, you get a 14-day free trial with full access. No charge until the trial ends, and you can cancel any time before then.',
  },
  {
    q: 'Can I change plans at any time?',
    a: 'Yes. Upgrade or downgrade instantly from your account settings. When upgrading, you pay a prorated amount. When downgrading, the change takes effect at the next billing date.',
  },
  {
    q: 'Do you offer annual billing?',
    a: 'Yes — annual billing saves you 20% compared to monthly. Switch to annual from your account settings at any time.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit and debit cards (Visa, Mastercard, Amex) via Stripe. For Business annual plans, bank transfers can be arranged — contact us.',
  },
  {
    q: 'What happens to my data if I cancel?',
    a: 'Your data is yours. After cancellation, you have 30 days to export everything before permanent deletion. We send reminders throughout that window.',
  },
]

function Cell({ value, featured }: { value: CellValue; featured?: boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check size={16} strokeWidth={2.5} className={cn('mx-auto', featured ? 'text-blue-400' : 'text-ds-tertiary-action')} />
    ) : (
      <Minus size={16} strokeWidth={2} className="mx-auto text-outline-variant" />
    )
  }
  return (
    <span className={cn('text-sm font-semibold', featured ? 'text-blue-400' : 'text-on-surface')}>
      {value}
    </span>
  )
}

export default function PricingPage() {
  return (
    <>
      <Header />
      <main className="pt-16">

        <PageHero
          eyebrow="Pricing"
          headline="Simple pricing,"
          accentLine="no surprises."
          description="Start for free. Upgrade as your business grows. Every paid plan includes a 14-day free trial."
        />

        {/* ── Pricing cards ─────────────────────────────────────── */}
        <section className="bg-surface py-20 px-6">
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {PLANS.map(({ name, price, period, description, cta, href, featured }) => (
                <div
                  key={name}
                  className={cn(
                    'relative flex flex-col rounded-xl border p-6 gap-6',
                    featured
                      ? 'border-ds-secondary bg-ds-secondary/5 shadow-xl shadow-ds-secondary/10'
                      : 'border-outline-variant bg-surface-container-lowest'
                  )}
                >
                  {featured && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center rounded-full bg-ds-secondary px-3 py-0.5 text-xs font-semibold text-on-ds-secondary">
                        Most popular
                      </span>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <p className={cn('text-sm font-semibold', featured ? 'text-ds-secondary' : 'text-on-surface-variant')}>
                      {name}
                    </p>
                    <div className="flex items-end gap-1.5">
                      <span className="text-4xl font-bold tracking-tight text-on-surface">{price}</span>
                      <span className="text-sm text-on-surface-variant pb-1">/{period}</span>
                    </div>
                    <p className="text-sm text-on-surface-variant leading-snug">{description}</p>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    className={cn(
                      'w-full font-semibold',
                      featured ? 'bg-ds-secondary text-on-ds-secondary' : 'bg-ds-primary text-on-ds-primary'
                    )}
                  >
                    <Link href={href}>{cta}</Link>
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-on-surface-variant mt-6">
              Save 20% with annual billing.{' '}
              <Link href="/auth/login" className="text-ds-secondary underline-offset-4 hover:underline">
                Switch after signup →
              </Link>
            </p>
          </div>
        </section>

        {/* ── Comparison table ──────────────────────────────────── */}
        <section className="bg-surface-container-low py-16 px-6">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-xl font-bold text-on-surface text-center mb-10">Compare plans</h2>
            <div className="rounded-xl border border-outline-variant overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left px-6 py-4 text-on-surface-variant font-medium w-1/2 bg-surface border-b border-outline-variant">
                      Feature
                    </th>
                    {PLANS.map(({ name, featured }) => (
                      <th
                        key={name}
                        className={cn(
                          'px-4 py-4 text-center font-bold border-b border-outline-variant',
                          featured
                            ? 'bg-ds-secondary/10 text-ds-secondary'
                            : 'bg-surface text-on-surface'
                        )}
                      >
                        {name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map(({ feature, free, pro, business }, i) => (
                    <tr key={feature} className={i % 2 === 0 ? 'bg-surface' : 'bg-surface-container-lowest'}>
                      <td className="px-6 py-3.5 text-on-surface-variant border-b border-outline-variant/40 last:border-0">
                        {feature}
                      </td>
                      <td className="px-4 py-3.5 text-center border-b border-outline-variant/40">
                        <Cell value={free} />
                      </td>
                      <td className="px-4 py-3.5 text-center border-b border-outline-variant/40 bg-ds-secondary/3">
                        <Cell value={pro} featured />
                      </td>
                      <td className="px-4 py-3.5 text-center border-b border-outline-variant/40">
                        <Cell value={business} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Pricing FAQ ───────────────────────────────────────── */}
        <section className="bg-surface py-20 px-6">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-xl font-bold text-on-surface text-center mb-12">Pricing questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
              {PRICING_FAQS.map(({ q, a }) => (
                <div key={q} className="space-y-2 border-l-2 border-outline-variant pl-5">
                  <h3 className="text-sm font-semibold text-on-surface">{q}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Dark CTA ──────────────────────────────────────────── */}
        <section className="relative bg-[#080d1a] py-20 px-6 overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          <div className="relative mx-auto max-w-xl text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Ready to get started?
            </h2>
            <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
              No credit card required. Your first client portal takes under 10 minutes to set up.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg" className="w-full sm:w-auto bg-ds-secondary text-on-ds-secondary font-semibold px-8">
                <Link href="/auth/login">Start for free</Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="w-full sm:w-auto border border-white/20 bg-white/5 text-white font-semibold px-8 backdrop-blur-sm">
                <Link href="/help">Talk to us</Link>
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {['No credit card', '14-day free trial', 'Cancel anytime'].map(item => (
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

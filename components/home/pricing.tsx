import Link from 'next/link'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for freelancers just getting started.',
    cta: 'Get started free',
    href: '/auth',
    featured: false,
    features: [
      '1 active client portal',
      '2 active projects',
      'File sharing & approvals',
      'Basic client messaging',
      'PortalKit branding',
    ],
  },
  {
    name: 'Pro',
    price: '$15',
    period: 'per month',
    description: 'For growing freelancers managing multiple clients.',
    cta: 'Start Pro — free trial',
    href: '/auth',
    featured: true,
    features: [
      'Unlimited client portals',
      'Unlimited projects',
      'Invoice tracking & payments',
      'Custom domain',
      'Remove PortalKit branding',
      'Priority support',
    ],
  },
  {
    name: 'Business',
    price: '$29',
    period: 'per month',
    description: 'For agencies and high-volume freelancers.',
    cta: 'Start Business — free trial',
    href: '/auth',
    featured: false,
    features: [
      'Everything in Pro',
      'Up to 5 team members',
      'Full white labeling',
      'Granular client permissions',
      'Advanced analytics',
      'Dedicated onboarding call',
    ],
  },
]

export default function Pricing() {
  return (
    <section className="bg-surface py-24 px-6" id="pricing">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="text-center mb-14 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-widest text-ds-secondary">
            Pricing
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface">
            Simple, transparent pricing
          </h2>
          <p className="max-w-xs mx-auto text-base text-on-surface-variant">
            Start free. Upgrade when you&apos;re ready.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map(({ name, price, period, description, cta, href, featured, features }) => (
            <div
              key={name}
              className={cn(
                'relative flex flex-col rounded-xl border p-6 gap-6',
                featured
                  ? 'border-ds-secondary bg-ds-secondary/5 shadow-lg shadow-ds-secondary/10'
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

              {/* Plan name & price */}
              <div className="space-y-1.5">
                <p
                  className={cn(
                    'text-sm font-semibold',
                    featured ? 'text-ds-secondary' : 'text-on-surface-variant'
                  )}
                >
                  {name}
                </p>
                <div className="flex items-end gap-1.5">
                  <span className="text-4xl font-bold tracking-tight text-on-surface">
                    {price}
                  </span>
                  <span className="text-sm text-on-surface-variant pb-1">/{period}</span>
                </div>
                <p className="text-sm text-on-surface-variant leading-snug">{description}</p>
              </div>

              {/* CTA */}
              <Button
                asChild
                size="sm"
                className={cn(
                  'w-full font-semibold',
                  featured
                    ? 'bg-ds-secondary text-on-ds-secondary'
                    : 'bg-ds-primary text-on-ds-primary'
                )}
              >
                <Link href={href}>{cta}</Link>
              </Button>

              {/* Divider */}
              <div className="border-t border-outline-variant" />

              {/* Features */}
              <ul className="space-y-3">
                {features.map(feat => (
                  <li key={feat} className="flex items-start gap-2.5">
                    <Check
                      size={15}
                      strokeWidth={2.5}
                      className={cn(
                        'shrink-0 mt-0.5',
                        featured ? 'text-ds-secondary' : 'text-ds-tertiary-action'
                      )}
                    />
                    <span className="text-sm text-on-surface-variant">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

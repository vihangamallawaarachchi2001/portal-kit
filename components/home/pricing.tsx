import Link from 'next/link'
import { Check, X } from 'lucide-react'

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: null,
    tagline: 'Forever. No card needed.',
    cta: 'Get started free',
    href: '/auth',
    featured: false,
    features: [
      { text: '3 active client portals',                  included: true  },
      { text: 'Unlimited projects',                       included: true  },
      { text: '10 file uploads / portal (500 MB total)',  included: true  },
      { text: 'File sharing & approvals',                 included: true  },
      { text: 'Client messaging',                         included: true  },
      { text: 'Milestones & progress',                    included: true  },
      { text: 'Meeting scheduler',                        included: true  },
      { text: '3 invoices / month (manual payment only)', included: true  },
      { text: 'Stripe payment collection',                included: false },
      { text: 'Custom domain',                            included: false },
      { text: 'Remove PortalKit branding',                included: false },
      { text: 'PDF invoices',                             included: false },
    ],
  },
  {
    name: 'Pro',
    price: '$15',
    period: 'mo',
    tagline: 'For serious freelancers.',
    cta: 'Start Pro',
    href: '/auth',
    featured: true,
    features: [
      { text: 'Unlimited portals',          included: true  },
      { text: 'Unlimited projects',         included: true  },
      { text: '5 GB storage',               included: true  },
      { text: 'Everything in Free',         included: true  },
      { text: 'Unlimited invoices',         included: true  },
      { text: 'Stripe payment collection',  included: true  },
      { text: 'PDF invoice export',         included: true  },
      { text: 'Multi-currency invoices',    included: true  },
      { text: 'Custom domain',              included: true  },
      { text: 'Remove branding',            included: true  },
      { text: 'Priority support',           included: true  },
      { text: 'Team members',               included: false },
      { text: 'Advanced analytics',         included: false },
    ],
  },
  {
    name: 'Business',
    price: '$29',
    period: 'mo',
    tagline: 'For agencies & teams.',
    cta: 'Start Business',
    href: '/auth',
    featured: false,
    features: [
      { text: 'Everything in Pro',           included: true },
      { text: '20 GB storage',               included: true },
      { text: 'Up to 5 team members',        included: true },
      { text: 'Full white labeling',         included: true },
      { text: 'Advanced analytics',          included: true },
      { text: 'Granular client permissions', included: true },
      { text: 'Dedicated onboarding call',   included: true },
    ],
  },
]

export default function Pricing() {
  return (
    <section className="bg-white py-28 px-6" id="pricing">
      <div className="max-w-7xl mx-auto">

        {/* ── Heading ── */}
        <div className="max-w-2xl mx-auto text-center mb-14">
          <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-ds-secondary mb-4">
            Pricing
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-on-surface leading-[1.06] mb-5">
            Simple, transparent pricing.
          </h2>
          <p className="text-lg text-on-surface-variant leading-relaxed">
            Useful, not crippled. Upgrades should feel like unlocking power,
            not escaping a prison.
          </p>
        </div>

        {/* ── Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {PLANS.map(({ name, price, period, tagline, cta, href, featured, features }) => (
            <div
              key={name}
              className="flex flex-col rounded-2xl overflow-hidden"
              style={
                featured
                  ? {
                      background: '#0d1526',
                      border: '1px solid rgba(0,81,213,0.4)',
                      boxShadow: '0 0 0 1px rgba(0,81,213,0.15), 0 24px 64px -8px rgba(0,81,213,0.28)',
                    }
                  : {
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    }
              }
            >
              {/* ── Plan header ── */}
              <div className="px-7 pt-7 pb-6">
                {/* Name + badge */}
                <div className="flex items-center gap-2.5 mb-4">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: featured ? 'rgba(255,255,255,0.6)' : '#6b7280' }}
                  >
                    {name}
                  </span>
                  {featured && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: 'rgba(0,81,213,0.5)',
                        color: '#93bbff',
                        border: '1px solid rgba(0,81,213,0.5)',
                      }}
                    >
                      Most popular
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-end gap-1 mb-1.5">
                  <span
                    className="text-5xl font-extrabold tracking-tight leading-none"
                    style={{ color: featured ? 'white' : '#111827' }}
                  >
                    {price}
                  </span>
                  {period && (
                    <span
                      className="text-sm pb-1.5"
                      style={{ color: featured ? 'rgba(255,255,255,0.45)' : '#9ca3af' }}
                    >
                      /{period}
                    </span>
                  )}
                </div>
                <p
                  className="text-sm"
                  style={{ color: featured ? 'rgba(255,255,255,0.45)' : '#9ca3af' }}
                >
                  {tagline}
                </p>
              </div>

              {/* ── CTA ── */}
              <div className="px-7 pb-6">
                <Link
                  href={href}
                  className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                  style={
                    featured
                      ? {
                          background: '#0051D5',
                          color: 'white',
                        }
                      : {
                          background: 'transparent',
                          color: '#111827',
                          border: '1px solid #d1d5db',
                        }
                  }
                >
                  {cta}
                </Link>
              </div>

              {/* ── Divider ── */}
              <div
                className="mx-7"
                style={{
                  borderTop: `1px solid ${featured ? 'rgba(255,255,255,0.08)' : '#f3f4f6'}`,
                }}
              />

              {/* ── Feature list ── */}
              <ul className="px-7 pt-5 pb-7">
                {features.map(({ text, included }) => (
                  <li
                    key={text}
                    className="flex items-start gap-2.5 py-2.5"
                    style={{
                      borderBottom: `1px solid ${featured ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
                    }}
                  >
                    {/* Icon */}
                    <span
                      className="flex items-center justify-center w-4 h-4 rounded-sm shrink-0 mt-0.5"
                      style={{
                        background: included
                          ? (featured ? 'rgba(34,197,94,0.2)'  : 'rgba(34,197,94,0.12)')
                          : (featured ? 'rgba(239,68,68,0.2)'  : 'rgba(239,68,68,0.1)' ),
                      }}
                    >
                      {included
                        ? (
                          <Check
                            size={9}
                            strokeWidth={3}
                            style={{ color: featured ? '#4ade80' : '#16a34a' }}
                          />
                        ) : (
                          <X
                            size={9}
                            strokeWidth={3}
                            style={{ color: featured ? '#f87171' : '#ef4444' }}
                          />
                        )}
                    </span>
                    {/* Text */}
                    <span
                      className="text-sm leading-snug"
                      style={{
                        color: included
                          ? (featured ? 'rgba(255,255,255,0.8)'  : '#374151')
                          : (featured ? 'rgba(255,255,255,0.32)' : '#9ca3af'),
                      }}
                    >
                      {text}
                    </span>
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

'use client'

import { useState } from 'react'
import Link from 'next/link'

type Billing = 'monthly' | 'annual'
type Cell = boolean | string

/* ─── Plan data ─────────────────────────────────────────────────── */

const PLANS = [
  {
    name: 'Free',
    tag: null,
    monthly: 0,
    annual: 0,
    annualTotal: null as number | null,
    savingsPerYear: null as number | null,
    isFree: true,
    description: 'No card needed.',
    cta: 'Get started free',
    href: '/auth',
    featured: false,
    included: [
      '3 active client portals',
      'Unlimited projects',
      '10 file uploads / portal (500 MB)',
      'File sharing & approvals',
      'Client messaging',
      'Milestones & progress',
      'Meeting scheduler',
      '3 invoices / month (manual only)',
    ],
    excluded: [
      'Stripe payment collection',
      'Custom domain',
      'Remove PortalKit branding',
      'PDF invoices',
    ],
  },
  {
    name: 'Pro',
    tag: 'Most popular',
    monthly: 15,
    annual: 12,
    annualTotal: 144 as number | null,
    savingsPerYear: 36 as number | null,
    isFree: false,
    description: 'For serious freelancers.',
    cta: 'Start 14-day free trial',
    href: '/auth',
    featured: true,
    included: [
      'Unlimited portals',
      'Unlimited projects',
      '5 GB storage',
      'Everything in Free',
      'Unlimited invoices',
      'Stripe payment collection',
      'PDF invoice export',
      'Multi-currency invoices',
      'Custom domain',
      'Priority support',
    ],
    excluded: ['Team members', 'Advanced analytics','Remove branding',],
  },
  {
    name: 'Business',
    tag: null,
    monthly: 29,
    annual: 23,
    annualTotal: 276 as number | null,
    savingsPerYear: 72 as number | null,
    isFree: false,
    description: 'For agencies & teams.',
    cta: 'Start 14-day free trial',
    href: '/auth',
    featured: false,
    included: [
      'Everything in Pro',
      '20 GB storage',
      'Up to 5 team members',
      'Full white labeling',
      'Advanced analytics',
      'Granular client permissions',
      'Dedicated onboarding call',
    ],
    excluded: [],
  },
]

/* ─── Comparison table data ─────────────────────────────────────── */

const COMPARISON: { section: string; rows: { feature: string; free: Cell; pro: Cell; business: Cell }[] }[] = [
  {
    section: 'Portals & Projects',
    rows: [
      { feature: 'Active client portals',  free: '3',         pro: 'Unlimited', business: 'Unlimited' },
      { feature: 'Projects per portal',    free: 'Unlimited', pro: 'Unlimited', business: 'Unlimited' },
      { feature: 'Team members',           free: '—',         pro: '—',         business: 'Up to 5'   },
    ],
  },
  {
    section: 'Files & Storage',
    rows: [
      { feature: 'File uploads / portal',     free: '10',    pro: 'Unlimited', business: 'Unlimited' },
      { feature: 'Storage',                   free: '500 MB', pro: '5 GB',     business: '20 GB'     },
      { feature: 'File sharing & approvals',  free: true,    pro: true,        business: true        },
    ],
  },
  {
    section: 'Client Tools',
    rows: [
      { feature: 'Client messaging',      free: true, pro: true, business: true },
      { feature: 'Milestones & progress', free: true, pro: true, business: true },
      { feature: 'Meeting scheduler',     free: true, pro: true, business: true },
    ],
  },
  {
    section: 'Invoicing & Payments',
    rows: [
      { feature: 'Invoices / month',           free: '3 (manual)', pro: 'Unlimited', business: 'Unlimited' },
      { feature: 'Stripe payment collection',  free: false,        pro: true,        business: true        },
      { feature: 'PDF invoice export',         free: false,        pro: true,        business: true        },
      { feature: 'Multi-currency invoices',    free: false,        pro: true,        business: true        },
    ],
  },
  {
    section: 'Customisation',
    rows: [
      { feature: 'Custom domain',               free: false, pro: true,  business: true },
      { feature: 'Remove PortalKit branding',   free: false, pro: true,  business: true },
      { feature: 'Full white labeling',         free: false, pro: false, business: true },
      { feature: 'Granular client permissions', free: false, pro: false, business: true },
    ],
  },
  {
    section: 'Support & Advanced',
    rows: [
      { feature: 'Priority support',          free: false, pro: true,  business: true },
      { feature: 'Advanced analytics',        free: false, pro: false, business: true },
      { feature: 'Dedicated onboarding call', free: false, pro: false, business: true },
    ],
  },
]

/* ─── Primitives ────────────────────────────────────────────────── */

function FeatureItem({ text, included, featured }: { text: string; included: boolean; featured?: boolean }) {
  return (
    <li className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <span
        className="shrink-0 w-[18px] h-[18px] rounded flex items-center justify-center mt-px"
        style={included ? { background: 'rgba(34,197,94,0.12)' } : { background: '#f3f4f6' }}
      >
        {included ? (
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#16a34a" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
            <path d="M2 2l6 6M8 2l-6 6" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </span>
      <span
        className="text-[13px] leading-snug"
        style={{
          color: included
            ? featured ? '#1e3a5f' : '#374151'
            : '#c4c9d4',
        }}
      >
        {text}
      </span>
    </li>
  )
}

function CellValue({ value, isFeatured }: { value: Cell; isFeatured?: boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <span
        className="inline-flex items-center justify-center w-5 h-5 rounded"
        style={{ background: 'rgba(34,197,94,0.12)' }}
      >
        <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
          <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#16a34a" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    ) : (
      <span className="text-gray-300 select-none">—</span>
    )
  }
  return (
    <span className="text-sm font-medium" style={{ color: isFeatured ? '#1d4ed8' : '#374151' }}>
      {value}
    </span>
  )
}

/* ─── Main component ────────────────────────────────────────────── */

export default function PricingSection() {
  const [billing, setBilling] = useState<Billing>('monthly')
  const isAnnual = billing === 'annual'

  return (
    <>
      {/* ── Toggle + cards (light bg) ─────────────────────────────── */}
      <section
        className="relative overflow-hidden pt-10 pb-24 px-6"
        style={{ background: '#f8fafc' }}
      >
        {/* Subtle dot grid — dark dots on light */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.035) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Soft top glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-0 w-200 h-75"
          style={{
            background: 'radial-gradient(ellipse 70% 80% at 50% 0%, rgba(0,81,213,0.06) 0%, transparent 70%)',
          }}
        />

        <div className="relative max-w-7xl mx-auto">

          {/* Billing toggle */}
          <div className="flex justify-center mb-12">
            <div
              className="flex items-center p-1 rounded-full"
              style={{ background: '#e2e8f0', border: '1px solid #cbd5e1' }}
            >
              <button
                onClick={() => setBilling('monthly')}
                className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                style={
                  !isAnnual
                    ? { background: '#0f172a', color: '#fff' }
                    : { color: '#64748b' }
                }
              >
                Monthly
              </button>
              <button
                onClick={() => setBilling('annual')}
                className="flex items-center gap-2.5 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                style={
                  isAnnual
                    ? { background: '#0f172a', color: '#fff' }
                    : { color: '#64748b' }
                }
              >
                Annual
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={
                    isAnnual
                      ? { background: '#dcfce7', color: '#15803d' }
                      : { background: 'rgba(34,197,94,0.15)', color: '#16a34a' }
                  }
                >
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {PLANS.map(plan => {
              const price = isAnnual ? plan.annual : plan.monthly
              return (
                <div
                  key={plan.name}
                  className="relative flex flex-col rounded-2xl"
                  style={
                    plan.featured
                      ? {
                          background: '#eff6ff',
                          border: '1px solid rgba(0,81,213,0.28)',
                          boxShadow: '0 0 0 4px rgba(0,81,213,0.06), 0 12px 32px -8px rgba(0,81,213,0.16)',
                        }
                      : {
                          background: '#ffffff',
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                        }
                  }
                >
                  {/* Most popular badge */}
                  {plan.tag && (
                    <div className="absolute -top-3.5 inset-x-0 flex justify-center">
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                        style={{ background: '#0051D5', color: '#fff' }}
                      >
                        {plan.tag}
                      </span>
                    </div>
                  )}

                  <div className="p-7 flex flex-col gap-6">
                    {/* Plan header */}
                    <div>
                      <p
                        className="text-xs font-bold uppercase tracking-widest mb-3"
                        style={{ color: plan.featured ? '#0051D5' : '#6b7280' }}
                      >
                        {plan.name}
                      </p>
                      <div className="flex items-end gap-1.5">
                        <span
                          className="font-extrabold tracking-tight leading-none"
                          style={{
                            fontSize: 'clamp(2.25rem, 3.5vw, 2.75rem)',
                            color: '#0f172a',
                          }}
                        >
                          {plan.isFree ? '$0' : `$${price}`}
                        </span>
                        <span className="pb-1.5 text-sm font-medium text-gray-400">
                          {plan.isFree ? '/ forever' : '/ mo'}
                        </span>
                      </div>

                      <div className="mt-2 min-h-5">
                        {!plan.isFree && isAnnual && plan.annualTotal ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-gray-400">
                              billed ${plan.annualTotal} / yr
                            </span>
                            <span
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                              style={{ background: '#dcfce7', color: '#15803d' }}
                            >
                              Save ${plan.savingsPerYear}/yr
                            </span>
                          </div>
                        ) : !plan.isFree ? (
                          <span className="text-[11px] text-gray-400">billed monthly</span>
                        ) : null}
                      </div>

                      <p className="mt-2 text-sm text-gray-500">{plan.description}</p>
                    </div>

                    {/* CTA */}
                    <Link
                      href={plan.href}
                      className="flex items-center justify-center h-11 rounded-xl text-sm font-bold transition-all duration-200"
                      style={
                        plan.featured
                          ? { background: '#0051D5', color: '#fff', boxShadow: '0 4px 16px rgba(0,81,213,0.35)' }
                          : { background: '#f1f5f9', color: '#374151', border: '1px solid #e2e8f0' }
                      }
                    >
                      {plan.cta}
                    </Link>

                    {/* Divider */}
                    <div className="h-px bg-gray-100" />

                    {/* Features */}
                    <ul>
                      {plan.included.map(f => (
                        <FeatureItem key={f} text={f} included featured={plan.featured} />
                      ))}
                      {plan.excluded.map(f => (
                        <FeatureItem key={f} text={f} included={false} />
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>

          <p className="text-center text-sm text-gray-400 mt-10">
            Paid plans include a 14-day free trial. No credit card required for Free.
          </p>
        </div>
      </section>

      {/* ── Comparison table ──────────────────────────────────────── */}
      <section id="compare" className="bg-white py-24 px-6" style={{ borderTop: '1px solid #f1f5f9' }}>
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0051D5] mb-3">
              Compare plans
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Everything in one place
            </h2>
            <p className="mt-4 text-base text-gray-500 max-w-md mx-auto leading-relaxed">
              A full breakdown of what each plan includes — no fine print.
            </p>
          </div>

          <div
            className="overflow-x-auto rounded-2xl"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.06)' }}
          >
            <table className="w-full min-w-140 bg-white text-sm border-collapse">
              <thead>
                <tr>
                  <th className="text-left px-6 py-5 text-xs font-semibold uppercase tracking-widest text-gray-400 w-[40%] border-b border-gray-100">
                    Feature
                  </th>
                  {PLANS.map(plan => {
                    const price = isAnnual ? plan.annual : plan.monthly
                    return (
                      <th
                        key={plan.name}
                        className="px-4 py-5 text-center border-b border-gray-100"
                        style={plan.featured ? { background: 'rgba(0,81,213,0.04)' } : {}}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className="text-xs font-bold uppercase tracking-widest"
                            style={{ color: plan.featured ? '#0051D5' : '#374151' }}
                          >
                            {plan.name}
                          </span>
                          <span className="text-lg font-extrabold text-gray-900">
                            {plan.isFree ? 'Free' : `$${price}/mo`}
                          </span>
                          {!plan.isFree && isAnnual && plan.annualTotal && (
                            <span className="text-[10px] font-medium text-gray-400">
                              ${plan.annualTotal}/yr
                            </span>
                          )}
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>

              <tbody>
                {COMPARISON.map(({ section, rows }) => (
                  <>
                    <tr key={`section-${section}`}>
                      <td
                        colSpan={4}
                        className="px-6 py-3 text-[11px] font-bold uppercase tracking-widest"
                        style={{
                          background: '#f8fafc',
                          color: '#64748b',
                          borderTop: '1px solid #e2e8f0',
                          borderBottom: '1px solid #e2e8f0',
                        }}
                      >
                        {section}
                      </td>
                    </tr>
                    {rows.map((row, i) => (
                      <tr
                        key={row.feature}
                        className="transition-colors hover:bg-gray-50"
                        style={{ borderBottom: i < rows.length - 1 ? '1px solid #f1f5f9' : undefined }}
                      >
                        <td className="px-6 py-3.5 text-sm text-gray-600 font-medium">{row.feature}</td>
                        <td className="px-4 py-3.5 text-center"><CellValue value={row.free} /></td>
                        <td className="px-4 py-3.5 text-center" style={{ background: 'rgba(0,81,213,0.03)' }}>
                          <CellValue value={row.pro} isFeatured />
                        </td>
                        <td className="px-4 py-3.5 text-center"><CellValue value={row.business} /></td>
                      </tr>
                    ))}
                  </>
                ))}

                {/* CTA row */}
                <tr style={{ borderTop: '2px solid #e2e8f0' }}>
                  <td className="px-6 py-6 text-sm text-gray-400 font-medium">Get started</td>
                  {PLANS.map(plan => (
                    <td
                      key={plan.name}
                      className="px-4 py-6 text-center"
                      style={plan.featured ? { background: 'rgba(0,81,213,0.03)' } : {}}
                    >
                      <Link
                        href={plan.href}
                        className="inline-flex items-center justify-center h-9 px-5 rounded-lg text-xs font-bold transition-all"
                        style={
                          plan.featured
                            ? { background: '#0051D5', color: '#fff', boxShadow: '0 2px 8px rgba(0,81,213,0.3)' }
                            : { background: '#f1f5f9', color: '#374151', border: '1px solid #e2e8f0' }
                        }
                      >
                        {plan.isFree ? 'Start free' : 'Free trial'}
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  )
}

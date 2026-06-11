import Link from 'next/link'
import { Layers } from 'lucide-react'

const LINKS = {
  PRODUCT: [
    { label: 'Features',  href: '/features' },
    { label: 'Pricing',   href: '/pricing'  },
    { label: 'Security',  href: '/security' },
  ],
  COMPANY: [
    { label: 'About',    href: '/about'   },
    { label: 'Blog',     href: '/blog'    },
    { label: 'Careers',  href: '/careers' },
  ],
  SUPPORT: [
    { label: 'Documentation', href: '/docs' },
    { label: 'Help Center',   href: '/help' },
  ],
} as const

const LEGAL = [
  { label: 'Privacy Policy',   href: '/privacy' },
  { label: 'Terms of Service', href: '/terms'   },
  { label: 'Cookie Policy',    href: '/cookies' },
]

export default function Footer() {
  return (
    <footer className="bg-ds-primary-container border-t border-on-ds-primary/10 px-6 pt-12 pb-8">
      <div className="mx-auto max-w-7xl">

        {/* ── Main row ─────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row gap-12">

          {/* Logo + tagline */}
          <div className="space-y-4 md:max-w-55">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex items-center justify-center size-8 rounded-md bg-on-ds-primary shrink-0">
                <Layers className="size-4 text-ds-primary-container" strokeWidth={1.75} />
              </span>
              <span className="font-bold text-lg text-on-ds-primary tracking-tight">
                PortalKit
              </span>
            </Link>
            <p className="text-sm text-on-ds-primary-container leading-relaxed">
              The modern standard for{' '}
              <span className="text-ds-secondary">client collaboration</span>{' '}
              and project delivery.
            </p>
          </div>

          {/* Link columns */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {(Object.entries(LINKS) as [string, readonly { label: string; href: string }[]][]).map(
              ([category, links]) => (
                <div key={category}>
                  <h4 className="text-xs font-bold tracking-widest text-on-ds-primary-container uppercase mb-4">
                    {category}
                  </h4>
                  <ul className="space-y-3">
                    {links.map(({ label, href }) => (
                      <li key={label}>
                        <Link
                          href={href}
                          className="text-sm text-on-ds-primary-container transition-colors"
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            )}
          </div>

        </div>

        {/* ── Bottom bar ───────────────────────────────────────────── */}
        <div className="mt-12 pt-6 border-t border-on-ds-primary/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-on-ds-primary-container">
            © {new Date().getFullYear()} PortalKit. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {LEGAL.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-xs text-on-ds-primary-container"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  )
}

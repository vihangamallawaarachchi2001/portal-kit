import Link from 'next/link'
import { Layers } from 'lucide-react'

const LINKS = {
  Product: [
    { label: 'Platform',  href: '/platform' },
    { label: 'Pricing',   href: '/pricing'  },
    { label: 'Security',  href: '/security' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Blog',  href: '/blog'  },
  ],
  Support: [
    { label: 'Contact', href: '/contact' },
  ],
} as const

const LEGAL = [
  { label: 'Privacy Policy',   href: '/privacy' },
  { label: 'Terms of Service', href: '/terms'   },
  { label: 'Cookie Policy',    href: '/cookies' },
]

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 px-6 pt-14 pb-8">
      <div className="max-w-7xl mx-auto">

        {/* ── Main row ── */}
        <div className="flex flex-col md:flex-row gap-12 pb-12 border-b border-gray-100">

          {/* Logo + tagline */}
          <div className="shrink-0 space-y-4 md:w-56">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex items-center justify-center size-8 rounded-md bg-blue-600 shrink-0">
                <Layers className="size-4.5 text-white" strokeWidth={1.75} />
              </span>
              <span className="font-bold text-lg text-gray-900 tracking-tight">PortalKit</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              Built for freelancers.<br />Loved by clients.
            </p>
          </div>

          {/* Link columns */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {(Object.entries(LINKS) as [string, readonly { label: string; href: string }[]][]).map(
              ([category, links]) => (
                <div key={category}>
                  <h4 className="text-[11px] font-bold tracking-[0.12em] uppercase text-gray-400 mb-4">
                    {category}
                  </h4>
                  <ul className="space-y-3">
                    {links.map(({ label, href }) => (
                      <li key={label}>
                        <Link
                          href={href}
                          className="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-150"
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

        {/* ── Bottom bar ── */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} PortalKit. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {LEGAL.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors duration-150"
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

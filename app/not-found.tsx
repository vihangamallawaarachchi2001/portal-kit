import type { Metadata } from 'next'
import Link from 'next/link'
import { FileQuestion, Home } from 'lucide-react'
import { Header } from '@/components/public/header'
import Footer from '@/components/public/footer'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you were looking for could not be found.',
}

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-surface flex items-center justify-center px-6 py-24">
        <div className="max-w-lg w-full text-center">

          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-ds-secondary/10 flex items-center justify-center">
                <FileQuestion className="w-12 h-12 text-ds-secondary" />
              </div>
              <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-surface-container-high border-2 border-surface flex items-center justify-center text-xs font-bold text-on-surface-variant">
                ?
              </span>
            </div>
          </div>

          {/* 404 label */}
          <p className="text-sm font-semibold uppercase tracking-widest text-ds-secondary mb-3">
            404 — Not Found
          </p>

          {/* Heading */}
          <h1 className="text-4xl font-bold text-on-surface mb-4 leading-tight">
            This page doesn&apos;t exist
          </h1>

          {/* Description */}
          <p className="text-on-surface-variant text-lg mb-10 leading-relaxed">
            The page you&apos;re looking for may have been moved, renamed, or
            removed. Let&apos;s get you back on track.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go to Homepage
              </Link>
            </Button>
            <BackButton />
          </div>

          {/* Quick nav links */}
          <div className="mt-14 pt-8 border-t border-outline-variant">
            <p className="text-sm text-on-surface-variant mb-4">
              Or jump to one of these:
            </p>
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {[
                { label: 'Platform',  href: '/platform'  },
                { label: 'Pricing',   href: '/pricing'   },
                { label: 'Docs',      href: '/docs'      },
                { label: 'Help',      href: '/help'      },
                { label: 'About',     href: '/about'    },
              ].map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm font-medium text-ds-secondary hover:text-ds-secondary-container transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}

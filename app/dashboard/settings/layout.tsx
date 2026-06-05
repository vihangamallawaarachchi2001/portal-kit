'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { User, CreditCard, Bell } from 'lucide-react'

const TABS = [
  { href: '/dashboard/settings', label: 'Profile', icon: User, exact: true },
  { href: '/dashboard/settings/billing', label: 'Billing', icon: CreditCard, exact: false },
  { href: '/dashboard/settings/notifications', label: 'Notifications', icon: Bell, exact: false },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex gap-8 min-h-screen">
      {/* Sidebar nav */}
      <div className="w-48 pt-8 pl-8 shrink-0">
        <nav className="flex flex-col gap-0.5">
          {TABS.map(tab => {
            const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-ds-secondary/10 text-ds-secondary'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                )}
              >
                <tab.icon className="size-4" />
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}

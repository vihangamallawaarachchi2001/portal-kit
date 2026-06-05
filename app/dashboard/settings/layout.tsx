'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { User, CreditCard, Bell } from 'lucide-react'

const TABS = [
  { href: '/dashboard/settings',               label: 'Profile',       icon: User,        exact: true  },
  { href: '/dashboard/settings/billing',        label: 'Billing',       icon: CreditCard,  exact: false },
  { href: '/dashboard/settings/notifications',  label: 'Notifications', icon: Bell,        exact: false },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="w-full">
      {/* Page hero */}
      <div className="px-8 pt-8 pb-0 border-b border-outline-variant/50 bg-white">
        <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-1">Account</p>
        <h1 className="text-2xl font-extrabold text-on-surface tracking-tight mb-5">Settings</h1>

        {/* Tab bar */}
        <nav className="flex items-center gap-0 -mb-px">
          {TABS.map(tab => {
            const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-all',
                  active
                    ? 'border-ds-secondary text-ds-secondary'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant/50'
                )}
              >
                <tab.icon className="size-3.5" />
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="p-8 max-w-2xl">{children}</div>
    </div>
  )
}

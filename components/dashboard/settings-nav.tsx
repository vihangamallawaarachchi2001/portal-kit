'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { User, CreditCard, Bell, LifeBuoy, Users, Globe, Shield } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/format'

const NAV = [
  { href: '/dashboard/settings',              label: 'Profile',       icon: User,       exact: true,  badge: null        },
  { href: '/dashboard/settings/billing',       label: 'Billing',       icon: CreditCard, exact: false, badge: null        },
  { href: '/dashboard/settings/notifications', label: 'Notifications', icon: Bell,       exact: false, badge: null        },
  { href: '/dashboard/settings/portal',        label: 'Portal',        icon: Globe,      exact: false, badge: 'Pro'       },
  { href: '/dashboard/settings/team',          label: 'Team',          icon: Users,      exact: false, badge: 'Business'  },
  { href: '/dashboard/settings/account',       label: 'Account',       icon: Shield,     exact: false, badge: null        },
]

interface SettingsNavProps {
  displayName: string
  avatarUrl: string | null
  plan: string
}

export function SettingsNav({ displayName, avatarUrl, plan }: SettingsNavProps) {
  const pathname = usePathname()

  return (
    <aside className="w-52 shrink-0 flex flex-col py-8 px-4 gap-0.5">
      {/* ── User identity card ────────────────────── */}
      <div className="px-3 pb-6 mb-2 border-b border-outline-variant/40 flex flex-col items-center text-center gap-3">
        <Avatar className="size-14">
          <AvatarImage src={avatarUrl ?? undefined} />
          <AvatarFallback className="text-lg bg-ds-secondary/10 text-ds-secondary font-bold">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-bold text-on-surface leading-tight">{displayName}</p>
          <span className={cn(
            'inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded',
            plan === 'free'
              ? 'bg-surface-container text-on-surface-variant'
              : plan === 'pro'
                ? 'bg-ds-secondary/10 text-ds-secondary'
                : 'bg-amber-50 text-amber-700'
          )}>
            {plan} plan
          </span>
        </div>
      </div>

      {/* ── Nav items ─────────────────────────────── */}
      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-3 mb-1.5">
        Account
      </p>
      {NAV.map(item => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-all',
              active
                ? 'bg-ds-secondary/10 text-ds-secondary'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            )}
          >
            <item.icon className={cn('size-4 shrink-0', active ? 'text-ds-secondary' : 'text-on-surface-variant')} />
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">
                {item.badge}
              </span>
            )}
          </Link>
        )
      })}

      {/* ── Support ───────────────────────────────── */}
      <div className="mt-4 pt-4 border-t border-outline-variant/40">
        <a
          href="mailto:support@portalkit.io"
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all"
        >
          <LifeBuoy className="size-4 shrink-0" />
          Help Center
        </a>
      </div>
    </aside>
  )
}

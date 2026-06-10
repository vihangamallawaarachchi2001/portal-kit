import { DashboardStats } from '@/types/database'
import { formatCurrency } from '@/lib/format'
import { DollarSign, AlertTriangle, Users, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface KpiCardsProps {
  stats: DashboardStats
}

function formatMultiCurrency(byCur: Record<string, number>): string {
  const parts = Object.entries(byCur).filter(([, amt]) => amt > 0)
  if (parts.length === 0) return formatCurrency(0)
  return parts.map(([cur, amt]) => formatCurrency(amt, cur)).join(' · ')
}

export function KpiCards({ stats }: KpiCardsProps) {
  const hasOutstanding = Object.values(stats.outstanding_by_currency).some(a => a > 0)
  const hasOverdue     = Object.values(stats.overdue_by_currency).some(a => a > 0)
  const outstandingStr = formatMultiCurrency(stats.outstanding_by_currency)
  const overdueStr     = formatMultiCurrency(stats.overdue_by_currency)

  const cards: {
    label: string
    value: string
    sub: string
    icon: React.ElementType
    href: string
    alert: boolean
    alertColor: string
    iconBg: string
    iconColor: string
  }[] = [
    {
      label: 'Outstanding',
      value: outstandingStr,
      sub: hasOutstanding ? 'Awaiting payment' : 'No unpaid invoices',
      icon: DollarSign,
      href: '/dashboard/invoices',
      alert: hasOutstanding,
      alertColor: 'text-ds-secondary',
      iconBg: 'bg-ds-secondary/10',
      iconColor: 'text-ds-secondary',
    },
    {
      label: 'Overdue',
      value: overdueStr,
      sub: hasOverdue ? 'Requires attention' : 'Nothing past due',
      icon: AlertTriangle,
      href: '/dashboard/invoices',
      alert: hasOverdue,
      alertColor: 'text-red-600',
      iconBg: hasOverdue ? 'bg-red-50' : 'bg-surface-container',
      iconColor: hasOverdue ? 'text-red-500' : 'text-on-surface-variant',
    },
    {
      label: 'Active Clients',
      value: String(stats.active_clients),
      sub: stats.active_clients === 1 ? '1 active portal' : `${stats.active_clients} active portals`,
      icon: Users,
      href: '/dashboard/clients',
      alert: false,
      alertColor: 'text-on-surface',
      iconBg: 'bg-surface-container',
      iconColor: 'text-on-surface-variant',
    },
    {
      label: 'Active Projects',
      value: String(stats.active_projects),
      sub: stats.active_projects === 1 ? '1 in progress' : `${stats.active_projects} in progress`,
      icon: FolderOpen,
      href: '/dashboard/projects',
      alert: false,
      alertColor: 'text-on-surface',
      iconBg: 'bg-surface-container',
      iconColor: 'text-on-surface-variant',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map(card => (
        <Link
          key={card.label}
          href={card.href}
          className="group bg-white rounded-md p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3"
        >
          {/* Icon + label row */}
          <div className="flex items-center justify-between">
            <div className={cn('size-8 rounded-md flex items-center justify-center shrink-0', card.iconBg)}>
              <card.icon className={cn('size-4', card.iconColor)} />
            </div>
            {card.alert && (
              <span className={cn('size-2 rounded-full shrink-0', card.label === 'Overdue' ? 'bg-red-500' : 'bg-ds-secondary')} />
            )}
          </div>

          {/* Value + label */}
          <div>
            <p className={cn(
              'font-extrabold leading-tight tracking-tight',
              card.value.includes('·') ? 'text-[0.95rem]' : 'text-[1.6rem]',
              card.alert ? card.alertColor : 'text-on-surface'
            )}>
              {card.value}
            </p>
            <p className="text-xs font-semibold text-on-surface mt-1.5">{card.label}</p>
            <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">{card.sub}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}

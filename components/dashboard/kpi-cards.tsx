import { DashboardStats } from '@/types/database'
import { formatCurrency } from '@/lib/format'
import { DollarSign, AlertTriangle, Clock, MessageSquare, Users, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KpiCardsProps {
  stats: DashboardStats
}

export function KpiCards({ stats }: KpiCardsProps) {
  const cards = [
    {
      label: 'Outstanding',
      value: formatCurrency(stats.total_outstanding),
      icon: DollarSign,
      color: 'text-ds-secondary',
      bg: 'bg-ds-secondary/8',
      description: 'Invoices sent & unpaid',
    },
    {
      label: 'Overdue',
      value: formatCurrency(stats.total_overdue),
      icon: AlertTriangle,
      color: stats.total_overdue > 0 ? 'text-red-600' : 'text-on-surface-variant',
      bg: stats.total_overdue > 0 ? 'bg-red-50' : 'bg-surface-container',
      description: 'Past due date',
    },
    {
      label: 'Pending Approvals',
      value: String(stats.pending_approvals),
      icon: Clock,
      color: stats.pending_approvals > 0 ? 'text-amber-600' : 'text-on-surface-variant',
      bg: stats.pending_approvals > 0 ? 'bg-amber-50' : 'bg-surface-container',
      description: 'Files awaiting review',
    },
    {
      label: 'Unread Messages',
      value: String(stats.unread_messages),
      icon: MessageSquare,
      color: stats.unread_messages > 0 ? 'text-ds-secondary' : 'text-on-surface-variant',
      bg: stats.unread_messages > 0 ? 'bg-ds-secondary/8' : 'bg-surface-container',
      description: 'From clients',
    },
    {
      label: 'Active Clients',
      value: String(stats.active_clients),
      icon: Users,
      color: 'text-on-surface-variant',
      bg: 'bg-surface-container',
      description: 'Non-archived portals',
    },
    {
      label: 'Active Projects',
      value: String(stats.active_projects),
      icon: FolderOpen,
      color: 'text-on-surface-variant',
      bg: 'bg-surface-container',
      description: 'In progress or review',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map(card => (
        <div key={card.label} className="bg-white rounded-xl border border-outline-variant p-4 flex flex-col gap-3">
          <div className={cn('size-9 rounded-lg flex items-center justify-center', card.bg)}>
            <card.icon className={cn('size-4', card.color)} />
          </div>
          <div>
            <p className={cn('text-xl font-bold leading-tight', card.color)}>{card.value}</p>
            <p className="text-xs font-semibold text-on-surface mt-0.5">{card.label}</p>
            <p className="text-[11px] text-on-surface-variant mt-0.5">{card.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

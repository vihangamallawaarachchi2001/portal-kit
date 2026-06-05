import { DashboardStats } from '@/types/database'
import { formatCurrency } from '@/lib/format'
import { DollarSign, AlertTriangle, Clock, MessageSquare, Users, FolderOpen, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KpiCardsProps {
  stats: DashboardStats
}

export function KpiCards({ stats }: KpiCardsProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* ── Financial row ──────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Outstanding */}
        <div className={cn(
          'relative overflow-hidden rounded-2xl p-6 flex flex-col gap-4 transition-shadow hover:shadow-lg',
          stats.total_outstanding > 0
            ? 'bg-ds-secondary text-white'
            : 'bg-white border border-outline-variant'
        )}>
          {stats.total_outstanding > 0 && (
            <>
              <div className="absolute -right-6 -top-6 size-32 rounded-full bg-white/6" />
              <div className="absolute -right-2 bottom-2 size-20 rounded-full bg-white/4" />
            </>
          )}
          <div className="flex items-start justify-between relative">
            <div className={cn(
              'size-10 rounded-xl flex items-center justify-center',
              stats.total_outstanding > 0 ? 'bg-white/15' : 'bg-ds-secondary/10'
            )}>
              <DollarSign className={cn('size-5', stats.total_outstanding > 0 ? 'text-white' : 'text-ds-secondary')} />
            </div>
            {stats.total_outstanding > 0 && (
              <span className="flex items-center gap-1 text-xs font-medium bg-white/15 text-white rounded-full px-2.5 py-1">
                <TrendingUp className="size-3" /> Active
              </span>
            )}
          </div>
          <div className="relative">
            <p className={cn('text-3xl font-extrabold tracking-tight leading-none', stats.total_outstanding > 0 ? 'text-white' : 'text-on-surface')}>
              {formatCurrency(stats.total_outstanding)}
            </p>
            <p className={cn('text-sm font-semibold mt-1.5', stats.total_outstanding > 0 ? 'text-white/80' : 'text-on-surface')}>
              Outstanding
            </p>
            <p className={cn('text-xs mt-0.5', stats.total_outstanding > 0 ? 'text-white/55' : 'text-on-surface-variant')}>
              Invoices sent & unpaid
            </p>
          </div>
        </div>

        {/* Overdue */}
        <div className={cn(
          'relative overflow-hidden rounded-2xl p-6 flex flex-col gap-4 transition-shadow hover:shadow-lg',
          stats.total_overdue > 0
            ? 'bg-red-600 text-white'
            : 'bg-white border border-outline-variant'
        )}>
          {stats.total_overdue > 0 && (
            <>
              <div className="absolute -right-6 -top-6 size-32 rounded-full bg-white/6" />
              <div className="absolute -right-2 bottom-2 size-20 rounded-full bg-white/4" />
            </>
          )}
          <div className="flex items-start justify-between relative">
            <div className={cn(
              'size-10 rounded-xl flex items-center justify-center',
              stats.total_overdue > 0 ? 'bg-white/15' : 'bg-surface-container'
            )}>
              <AlertTriangle className={cn('size-5', stats.total_overdue > 0 ? 'text-white' : 'text-on-surface-variant')} />
            </div>
            {stats.total_overdue > 0 && (
              <span className="flex items-center gap-1 text-xs font-medium bg-white/15 text-white rounded-full px-2.5 py-1">
                Action needed
              </span>
            )}
          </div>
          <div className="relative">
            <p className={cn('text-3xl font-extrabold tracking-tight leading-none', stats.total_overdue > 0 ? 'text-white' : 'text-on-surface-variant')}>
              {formatCurrency(stats.total_overdue)}
            </p>
            <p className={cn('text-sm font-semibold mt-1.5', stats.total_overdue > 0 ? 'text-white/80' : 'text-on-surface-variant')}>
              Overdue
            </p>
            <p className={cn('text-xs mt-0.5', stats.total_overdue > 0 ? 'text-white/55' : 'text-on-surface-variant')}>
              Past due date
            </p>
          </div>
        </div>
      </div>

      {/* ── Activity row ───────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ActivityCard
          label="Pending Approvals"
          value={stats.pending_approvals}
          icon={Clock}
          active={stats.pending_approvals > 0}
          activeColor="text-amber-600"
          activeBg="bg-amber-50"
          suffix={stats.pending_approvals === 1 ? 'file' : 'files'}
        />
        <ActivityCard
          label="Unread Messages"
          value={stats.unread_messages}
          icon={MessageSquare}
          active={stats.unread_messages > 0}
          activeColor="text-ds-secondary"
          activeBg="bg-ds-secondary/8"
          suffix={stats.unread_messages === 1 ? 'new' : 'new'}
        />
        <ActivityCard
          label="Active Clients"
          value={stats.active_clients}
          icon={Users}
          active={false}
          activeColor="text-on-surface"
          activeBg="bg-surface-container"
          suffix={stats.active_clients === 1 ? 'portal' : 'portals'}
        />
        <ActivityCard
          label="Active Projects"
          value={stats.active_projects}
          icon={FolderOpen}
          active={false}
          activeColor="text-on-surface"
          activeBg="bg-surface-container"
          suffix={stats.active_projects === 1 ? 'in progress' : 'in progress'}
        />
      </div>
    </div>
  )
}

function ActivityCard({
  label, value, icon: Icon, active, activeColor, activeBg, suffix,
}: {
  label: string
  value: number
  icon: React.ElementType
  active: boolean
  activeColor: string
  activeBg: string
  suffix: string
}) {
  return (
    <div className="bg-white border border-outline-variant rounded-2xl p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className={cn('size-9 rounded-xl flex items-center justify-center', active ? activeBg : 'bg-surface-container')}>
        <Icon className={cn('size-4', active ? activeColor : 'text-on-surface-variant')} />
      </div>
      <div>
        <p className={cn('text-2xl font-extrabold leading-none tracking-tight', active ? activeColor : 'text-on-surface-variant')}>
          {value}
        </p>
        <p className="text-xs font-semibold text-on-surface mt-1.5 leading-tight">{label}</p>
        <p className="text-[11px] text-on-surface-variant mt-0.5">{value} {suffix}</p>
      </div>
    </div>
  )
}

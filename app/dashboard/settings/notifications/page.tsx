'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Mail, MessageSquare, CheckCircle2, FileText, BarChart2, Zap } from 'lucide-react'

interface NotifSetting {
  id: string
  icon: React.ElementType
  label: string
  description: string
  defaultOn: boolean
  pro?: boolean
}

const NOTIFICATIONS: NotifSetting[] = [
  {
    id: 'messages',
    icon: MessageSquare,
    label: 'Client messages',
    description: 'Get notified when a client sends you a message in any portal.',
    defaultOn: true,
  },
  {
    id: 'file_review',
    icon: CheckCircle2,
    label: 'File approvals & feedback',
    description: 'Know when a client approves a file or requests changes.',
    defaultOn: true,
  },
  {
    id: 'invoice_paid',
    icon: FileText,
    label: 'Invoice payments',
    description: 'Receive an email as soon as a client pays an invoice.',
    defaultOn: true,
  },
  {
    id: 'status_change',
    icon: BarChart2,
    label: 'Project status changes',
    description: 'Be notified when a project status is updated.',
    defaultOn: false,
  },
  {
    id: 'weekly_digest',
    icon: Mail,
    label: 'Weekly digest',
    description: 'A summary of all portal activity from the past 7 days.',
    defaultOn: false,
    pro: true,
  },
]

export default function NotificationsPage() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATIONS.map(n => [n.id, n.defaultOn]))
  )

  function toggle(id: string) {
    setEnabled(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const emailGroup = NOTIFICATIONS.filter(n => !n.pro)
  const proGroup   = NOTIFICATIONS.filter(n => n.pro)

  return (
    <div className="flex flex-col gap-6 px-8 pt-8 pb-12">
      <div className="mb-2">
        <h2 className="text-lg font-bold text-on-surface tracking-tight">Notifications</h2>
        <p className="text-sm text-on-surface-variant mt-0.5">Choose what emails PortalKit sends you.</p>
      </div>
      {/* Email notifications */}
      <div className="bg-white rounded-md shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-outline-variant/40 bg-surface-container/30 flex items-center gap-2.5">
          <div className="size-7 rounded-md bg-ds-secondary/10 flex items-center justify-center">
            <Mail className="size-3.5 text-ds-secondary" />
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface">Email Notifications</p>
            <p className="text-xs text-on-surface-variant">Choose what emails PortalKit sends you.</p>
          </div>
        </div>

        <div className="divide-y divide-outline-variant/30">
          {emailGroup.map(n => (
            <NotifRow key={n.id} setting={n} on={enabled[n.id]} onToggle={() => toggle(n.id)} />
          ))}
        </div>
      </div>

      {/* Pro features */}
      <div className="bg-white rounded-md shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-outline-variant/40 bg-surface-container/30 flex items-center gap-2.5">
          <div className="size-7 rounded-md bg-amber-50 flex items-center justify-center">
            <Zap className="size-3.5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface">Pro Features</p>
            <p className="text-xs text-on-surface-variant">Enhanced notifications available on Pro and Business plans.</p>
          </div>
        </div>

        <div className="divide-y divide-outline-variant/30">
          {proGroup.map(n => (
            <NotifRow key={n.id} setting={n} on={enabled[n.id]} onToggle={() => toggle(n.id)} />
          ))}
        </div>
      </div>

      {/* Unsubscribe note */}
      <p className="text-xs text-on-surface-variant">
        To unsubscribe from all emails, use the unsubscribe link at the bottom of any email or{' '}
        <a href="mailto:support@portalkit.io" className="text-ds-secondary hover:underline font-medium">
          contact support
        </a>
        .
      </p>
    </div>
  )
}

function NotifRow({ setting, on, onToggle }: { setting: NotifSetting; on: boolean; onToggle: () => void }) {
  const Icon = setting.icon
  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-surface-container/20 transition-colors">
      <div className={cn('size-8 rounded-md flex items-center justify-center shrink-0', on ? 'bg-ds-secondary/10' : 'bg-surface-container')}>
        <Icon className={cn('size-4', on ? 'text-ds-secondary' : 'text-on-surface-variant')} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-on-surface">{setting.label}</p>
          {setting.pro && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">Pro</span>
          )}
        </div>
        <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{setting.description}</p>
      </div>

      {/* Toggle */}
      <button
        onClick={onToggle}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200',
          on ? 'bg-ds-secondary' : 'bg-outline-variant/60'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 mt-0.5',
            on ? 'translate-x-4' : 'translate-x-0.5'
          )}
        />
      </button>
    </div>
  )
}

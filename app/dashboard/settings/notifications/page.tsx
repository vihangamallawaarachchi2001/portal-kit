'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Mail, MessageSquare, CheckCircle2, FileText, BarChart2, Zap, Loader2, BellRing, Bell } from 'lucide-react'
import { DEFAULT_NOTIFICATION_PREFERENCES, NotificationPreferences } from '@/types/database'
import { usePushSubscription } from '@/hooks/use-push-subscription'

interface NotifSetting {
  id: keyof NotificationPreferences
  icon: React.ElementType
  label: string
  description: string
  pro?: boolean
}

const NOTIFICATIONS: NotifSetting[] = [
  {
    id: 'messages',
    icon: MessageSquare,
    label: 'Client messages',
    description: 'Get notified when a client sends you a message in any portal.',
  },
  {
    id: 'file_review',
    icon: CheckCircle2,
    label: 'File approvals & feedback',
    description: 'Know when a client approves a file or requests changes.',
  },
  {
    id: 'invoice_paid',
    icon: FileText,
    label: 'Invoice payments',
    description: 'Receive an email as soon as a client pays an invoice.',
  },
  {
    id: 'status_change',
    icon: BarChart2,
    label: 'Project status changes',
    description: 'Be notified when a project status is updated.',
  },
  {
    id: 'weekly_digest',
    icon: Mail,
    label: 'Weekly digest',
    description: 'A summary of all portal activity from the past 7 days.',
    pro: true,
  },
]

export default function NotificationsPage() {
  const [prefs, setPrefs]       = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState<keyof NotificationPreferences | null>(null)
  // Track save errors per key
  const [errors, setErrors]     = useState<Partial<Record<keyof NotificationPreferences, boolean>>>({})
  const latestPrefsRef          = useRef(prefs)

  useEffect(() => { latestPrefsRef.current = prefs }, [prefs])

  // Load from DB on mount
  useEffect(() => {
    fetch('/api/settings/notifications')
      .then(r => r.json())
      .then(d => {
        if (d.preferences) setPrefs({ ...DEFAULT_NOTIFICATION_PREFERENCES, ...d.preferences })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function toggle(id: keyof NotificationPreferences) {
    const newValue = !latestPrefsRef.current[id]
    // Optimistic update
    setPrefs(prev => ({ ...prev, [id]: newValue }))
    setErrors(prev => ({ ...prev, [id]: false }))
    setSaving(id)

    try {
      const res = await fetch('/api/settings/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [id]: newValue }),
      })
      if (!res.ok) throw new Error('Failed to save')
      const data = await res.json()
      if (data.preferences) setPrefs({ ...DEFAULT_NOTIFICATION_PREFERENCES, ...data.preferences })
    } catch {
      // Revert optimistic update on failure
      setPrefs(prev => ({ ...prev, [id]: !newValue }))
      setErrors(prev => ({ ...prev, [id]: true }))
    } finally {
      setSaving(null)
    }
  }

  const push = usePushSubscription()
  const emailGroup = NOTIFICATIONS.filter(n => !n.pro)
  const proGroup   = NOTIFICATIONS.filter(n => n.pro)

  return (
    <div className="flex flex-col gap-6 px-8 pt-8 pb-12">
      <div className="mb-2">
        <h2 className="text-lg font-bold text-on-surface tracking-tight">Notifications</h2>
        <p className="text-sm text-on-surface-variant mt-0.5">Manage how PortalKit notifies you.</p>
      </div>

      {/* Push notifications */}
      {push.status !== 'unsupported' && push.status !== 'unknown' && (
        <div className="bg-white rounded-md shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-outline-variant/40 bg-surface-container/30 flex items-center gap-2.5">
            <div className="size-7 rounded-md bg-ds-secondary/10 flex items-center justify-center">
              <BellRing className="size-3.5 text-ds-secondary" />
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface">Push Notifications</p>
              <p className="text-xs text-on-surface-variant">Get notified instantly in your browser, even when the tab is in the background.</p>
            </div>
          </div>

          <div className="px-5 py-4">
            {push.status === 'no-vapid' ? (
              <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
                <p className="text-sm font-semibold text-amber-800 mb-1">Setup required</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Run <code className="font-mono bg-amber-100 px-1 rounded">npx web-push generate-vapid-keys</code> and add{' '}
                  <code className="font-mono bg-amber-100 px-1 rounded">NEXT_PUBLIC_VAPID_PUBLIC_KEY</code>,{' '}
                  <code className="font-mono bg-amber-100 px-1 rounded">VAPID_PRIVATE_KEY</code> and{' '}
                  <code className="font-mono bg-amber-100 px-1 rounded">VAPID_SUBJECT</code> to your{' '}
                  <code className="font-mono bg-amber-100 px-1 rounded">.env.local</code> file.
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'size-9 rounded-lg flex items-center justify-center',
                    push.status === 'subscribed' ? 'bg-ds-secondary/10' : 'bg-surface-container',
                  )}>
                    <Bell className={cn('size-4', push.status === 'subscribed' ? 'text-ds-secondary' : 'text-on-surface-variant')} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">
                      {push.status === 'subscribed' ? 'Push notifications enabled' : 'Enable push notifications'}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {push.status === 'denied'
                        ? 'Blocked — click the lock icon in the address bar to re-enable in browser settings.'
                        : push.status === 'subscribed'
                        ? 'You will receive instant browser notifications for new messages and activity.'
                        : 'Click the toggle to allow browser push notifications.'}
                    </p>
                  </div>
                </div>

                {push.status !== 'denied' && (
                  <button
                    onClick={push.status === 'subscribed' ? push.disable : push.enable}
                    disabled={push.loading}
                    aria-checked={push.status === 'subscribed'}
                    role="switch"
                    className={cn(
                      'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60',
                      push.status === 'subscribed' ? 'bg-ds-secondary' : 'bg-outline-variant/60',
                    )}
                  >
                    {push.loading ? (
                      <Loader2 className="size-3.5 text-white absolute inset-0 m-auto animate-spin" />
                    ) : (
                      <span className={cn(
                        'pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 mt-0.5',
                        push.status === 'subscribed' ? 'translate-x-4' : 'translate-x-0.5',
                      )} />
                    )}
                  </button>
                )}
              </div>
            )}

            {push.error && (
              <p className="mt-3 text-xs text-red-500 leading-snug">{push.error}</p>
            )}
          </div>
        </div>
      )}

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
            <NotifRow
              key={n.id}
              setting={n}
              on={prefs[n.id] ?? DEFAULT_NOTIFICATION_PREFERENCES[n.id] ?? false}
              loading={loading}
              saving={saving === n.id}
              error={errors[n.id] ?? false}
              onToggle={() => toggle(n.id)}
            />
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
            <NotifRow
              key={n.id}
              setting={n}
              on={prefs[n.id] ?? DEFAULT_NOTIFICATION_PREFERENCES[n.id] ?? false}
              loading={loading}
              saving={saving === n.id}
              error={errors[n.id] ?? false}
              onToggle={() => toggle(n.id)}
            />
          ))}
        </div>
      </div>

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

function NotifRow({
  setting, on, loading, saving, error, onToggle,
}: {
  setting: NotifSetting
  on: boolean
  loading: boolean
  saving: boolean
  error: boolean
  onToggle: () => void
}) {
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
          {error && (
            <span className="text-[10px] text-red-500 font-medium">Failed to save — try again</span>
          )}
        </div>
        <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{setting.description}</p>
      </div>

      {/* Toggle */}
      <button
        onClick={onToggle}
        disabled={loading || saving}
        aria-checked={on}
        role="switch"
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60',
          on ? 'bg-ds-secondary' : 'bg-outline-variant/60',
        )}
      >
        {saving ? (
          <Loader2 className="size-3.5 text-white absolute inset-0 m-auto animate-spin" />
        ) : (
          <span
            className={cn(
              'pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 mt-0.5',
              on ? 'translate-x-4' : 'translate-x-0.5',
            )}
          />
        )}
      </button>
    </div>
  )
}

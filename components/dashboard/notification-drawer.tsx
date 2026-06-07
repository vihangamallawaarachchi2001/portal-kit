'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/format'
import { Bell, BellRing, X, MessageSquare, FileText, CheckCheck, FolderOpen } from 'lucide-react'
import Link from 'next/link'
import { usePushSubscription } from '@/hooks/use-push-subscription'

type NotifMessage = {
  id: string
  content: string
  created_at: string
  projects: { id: string; title: string; clients: { id: string; name: string } | { id: string; name: string }[] } | null
}

type NotifFile = {
  id: string
  filename: string
  created_at: string
  mime_type: string
  projects: { id: string; title: string; clients: { id: string; name: string } | { id: string; name: string }[] } | null
}

function getClient(projects: NotifMessage['projects'] | NotifFile['projects']) {
  if (!projects) return null
  const c = projects.clients
  return Array.isArray(c) ? (c[0] ?? null) : c
}

function parsePreview(content: string): string {
  try {
    const p = JSON.parse(content)
    if (p && typeof p === 'object') {
      if (p.text) return p.text
      if (Array.isArray(p.files) && p.files.length) return `📎 ${p.files.length} file${p.files.length > 1 ? 's' : ''}`
    }
  } catch {}
  return content
}

interface Props {
  unreadCount: number
}

export function NotificationBell({ unreadCount }: Props) {
  const [open, setOpen]         = useState(false)
  const [loading, setLoading]   = useState(false)
  const [messages, setMessages] = useState<NotifMessage[]>([])
  const [files, setFiles]       = useState<NotifFile[]>([])
  const drawerRef               = useRef<HTMLDivElement>(null)
  const buttonRef               = useRef<HTMLButtonElement>(null)

  const { status: pushStatus, loading: pushLoading, error: pushError, enable: handleEnablePush, disable: handleDisablePush } = usePushSubscription()

  const total = messages.length + files.length

  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetch('/api/notifications')
      .then(r => r.json())
      .then(d => { setMessages(d.messages ?? []); setFiles(d.files ?? []) })
      .finally(() => setLoading(false))
  }, [open])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        drawerRef.current && !drawerRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false) }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  return (
    <>
      {/* Bell button */}
      <button
        ref={buttonRef}
        onClick={() => setOpen(p => !p)}
        className={cn(
          'relative size-9 rounded-md flex items-center justify-center transition-colors ml-0.5',
          open
            ? 'bg-ds-secondary/10 text-ds-secondary'
            : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
        )}
        aria-label="Notifications"
      >
        <Bell className="size-4.25" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 size-2 rounded-full bg-ds-secondary ring-2 ring-white" />
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/10" aria-hidden />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={cn(
          'fixed top-14 right-0 z-50 w-full sm:w-96 bg-white border-l border-b border-outline-variant/20 shadow-2xl flex flex-col transition-transform duration-200',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
        style={{ maxHeight: 'calc(100dvh - 56px)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/15 shrink-0">
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-on-surface-variant" />
            <h2 className="text-[15px] font-bold text-on-surface">Notifications</h2>
            {total > 0 && (
              <span className="min-w-5 h-5 px-1 rounded-full bg-ds-secondary text-white text-[10px] font-bold flex items-center justify-center">
                {total}
              </span>
            )}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="size-7 rounded-md flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col divide-y divide-outline-variant/10">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3 px-4 py-3.5 animate-pulse">
                  <div className="size-8 rounded-full bg-surface-container-high shrink-0 mt-0.5" />
                  <div className="flex-1 flex flex-col gap-2 pt-0.5">
                    <div className="h-3 bg-surface-container-high rounded-full w-3/4" />
                    <div className="h-2.5 bg-surface-container rounded-full w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : total === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-3">
              <div className="size-14 rounded-2xl bg-surface-container flex items-center justify-center">
                <CheckCheck className="size-7 text-on-surface-variant/30" />
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">All caught up!</p>
                <p className="text-xs text-on-surface-variant/60 mt-1">No unread messages or pending file reviews.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              {/* Unread messages */}
              {messages.length > 0 && (
                <>
                  <div className="px-5 pt-4 pb-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
                      Unread Messages ({messages.length})
                    </p>
                  </div>
                  {messages.map(msg => {
                    const client = getClient(msg.projects)
                    const project = msg.projects
                    return (
                      <Link
                        key={msg.id}
                        href={`/dashboard/chats`}
                        onClick={() => setOpen(false)}
                        className="flex items-start gap-3 px-5 py-3.5 hover:bg-surface-container/40 transition-colors border-b border-outline-variant/8"
                      >
                        <div className="size-8 rounded-full bg-ds-secondary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <MessageSquare className="size-3.5 text-ds-secondary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-on-surface leading-tight">
                            {client?.name ?? 'Client'}
                          </p>
                          <p className="text-[12px] text-on-surface-variant mt-0.5 truncate">
                            {parsePreview(msg.content).slice(0, 80)}
                          </p>
                          {project && (
                            <p className="text-[11px] text-on-surface-variant/50 mt-0.5 flex items-center gap-1">
                              <FolderOpen className="size-3" />
                              {project.title}
                            </p>
                          )}
                        </div>
                        <span className="text-[10px] text-on-surface-variant/40 shrink-0 mt-1">
                          {formatRelativeTime(msg.created_at)}
                        </span>
                      </Link>
                    )
                  })}
                </>
              )}

              {/* Pending file reviews */}
              {files.length > 0 && (
                <>
                  <div className="px-5 pt-4 pb-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
                      Awaiting Review ({files.length})
                    </p>
                  </div>
                  {files.map(file => {
                    const client = getClient(file.projects)
                    const project = file.projects
                    return (
                      <Link
                        key={file.id}
                        href={client ? `/dashboard/clients/${client.id}/files` : '/dashboard/files'}
                        onClick={() => setOpen(false)}
                        className="flex items-start gap-3 px-5 py-3.5 hover:bg-surface-container/40 transition-colors border-b border-outline-variant/8"
                      >
                        <div className="size-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                          <FileText className="size-3.5 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-on-surface leading-tight truncate">
                            {file.filename}
                          </p>
                          <p className="text-[12px] text-amber-600 font-medium mt-0.5">
                            Awaiting client review
                          </p>
                          {project && (
                            <p className="text-[11px] text-on-surface-variant/50 mt-0.5 flex items-center gap-1">
                              <FolderOpen className="size-3" />
                              {project.title} {client ? `· ${client.name}` : ''}
                            </p>
                          )}
                        </div>
                        <span className="text-[10px] text-on-surface-variant/40 shrink-0 mt-1">
                          {formatRelativeTime(file.created_at)}
                        </span>
                      </Link>
                    )
                  })}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {total > 0 && (
          <div className="px-5 py-3 border-t border-outline-variant/15 shrink-0">
            <Link
              href="/dashboard/chats"
              onClick={() => setOpen(false)}
              className="text-[12px] font-semibold text-ds-secondary hover:underline"
            >
              View all messages →
            </Link>
          </div>
        )}

        {/* Push notifications toggle */}
        {pushStatus !== 'unsupported' && pushStatus !== 'unknown' && (
          <div className="border-t border-outline-variant/15 shrink-0">
            <div className="px-5 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <BellRing className={cn('size-3.5 shrink-0', pushStatus === 'subscribed' ? 'text-ds-secondary' : 'text-on-surface-variant/50')} />
                <span className="text-[12px] text-on-surface-variant truncate">
                  {pushStatus === 'subscribed' ? 'Push notifications on' : 'Push notifications'}
                </span>
              </div>
              <div className="shrink-0">
                {pushStatus === 'denied' ? (
                  <span className="text-[11px] text-on-surface-variant/40">Blocked in browser</span>
                ) : pushStatus === 'no-vapid' ? (
                  <span className="text-[11px] text-amber-600 font-medium">Setup required</span>
                ) : pushStatus === 'subscribed' ? (
                  <button
                    onClick={handleDisablePush}
                    disabled={pushLoading}
                    className="text-[11px] font-semibold text-on-surface-variant/60 hover:text-red-500 transition-colors disabled:opacity-40"
                  >
                    {pushLoading ? 'Disabling…' : 'Disable'}
                  </button>
                ) : (
                  <button
                    onClick={handleEnablePush}
                    disabled={pushLoading}
                    className="text-[11px] font-semibold text-ds-secondary hover:underline disabled:opacity-40"
                  >
                    {pushLoading ? 'Enabling…' : 'Enable'}
                  </button>
                )}
              </div>
            </div>

            {/* Error message */}
            {pushError && (
              <p className="px-5 pb-3 text-[11px] text-red-500 leading-snug">{pushError}</p>
            )}

            {/* VAPID setup instructions */}
            {pushStatus === 'no-vapid' && (
              <div className="mx-5 mb-3 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-[11px] text-amber-800 font-semibold mb-1">VAPID keys not configured</p>
                <p className="text-[11px] text-amber-700 leading-snug">
                  Run <code className="font-mono bg-amber-100 px-1 rounded">npx web-push generate-vapid-keys</code> then add{' '}
                  <code className="font-mono bg-amber-100 px-1 rounded">NEXT_PUBLIC_VAPID_PUBLIC_KEY</code>,{' '}
                  <code className="font-mono bg-amber-100 px-1 rounded">VAPID_PRIVATE_KEY</code> and{' '}
                  <code className="font-mono bg-amber-100 px-1 rounded">VAPID_SUBJECT</code> to{' '}
                  <code className="font-mono bg-amber-100 px-1 rounded">.env.local</code>.
                </p>
              </div>
            )}

            {/* Blocked — guide to browser settings */}
            {pushStatus === 'denied' && (
              <p className="px-5 pb-3 text-[11px] text-on-surface-variant/50 leading-snug">
                To re-enable, click the lock icon in your browser address bar and allow notifications for this site.
              </p>
            )}
          </div>
        )}
      </div>
    </>
  )
}

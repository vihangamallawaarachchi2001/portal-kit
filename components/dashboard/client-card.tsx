'use client'

import { Client, Project } from '@/types/database'
import { formatCurrency, formatRelativeTime, getInitials } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  Clock, MessageSquare, DollarSign,
  Copy, Send, Archive, MoreHorizontal, ExternalLink,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

const STATUS_CONFIG: Record<Project['status'], {
  label: string; bar: string; dot: string; badge: string; text: string
}> = {
  briefing:    { label: 'Briefing',    bar: 'bg-slate-400',  dot: 'bg-slate-400',  badge: 'bg-slate-100 text-slate-600',   text: 'text-slate-600' },
  in_progress: { label: 'In Progress', bar: 'bg-blue-500',   dot: 'bg-blue-500',   badge: 'bg-blue-50 text-blue-700',      text: 'text-blue-700' },
  review:      { label: 'In Review',   bar: 'bg-amber-500',  dot: 'bg-amber-500',  badge: 'bg-amber-50 text-amber-700',    text: 'text-amber-700' },
  done:        { label: 'Done',        bar: 'bg-green-500',  dot: 'bg-green-500',  badge: 'bg-green-50 text-green-700',    text: 'text-green-700' },
}

// Deterministic accent color per client (based on name hash)
const ACCENT_COLORS = [
  '#0051d5', '#7c3aed', '#059669', '#d97706',
  '#dc2626', '#0891b2', '#9333ea', '#16a34a',
]
function clientAccent(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0
  return ACCENT_COLORS[Math.abs(h) % ACCENT_COLORS.length]
}

interface ClientCardProps {
  client: Client & {
    projects: (Project & { pending_files: number; unread_messages: number })[]
    outstanding: number
    pending_files_total: number
    unread_messages_total: number
  }
  onSendMagicLink?: (clientId: string) => void
  onArchive?: (clientId: string) => void
}

export function ClientCard({ client, onSendMagicLink, onArchive }: ClientCardProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const portalUrl = `${appUrl}/p/${client.portal_slug}`
  const accent = clientAccent(client.name)

  const activeProjects = client.projects.filter(p => p.status !== 'done')
  const latestProject = activeProjects[0] ?? client.projects[0]
  const statusConfig = latestProject ? STATUS_CONFIG[latestProject.status] : null

  function copyLink() {
    navigator.clipboard.writeText(portalUrl)
    toast.success('Portal link copied')
  }

  const hasAlert = client.outstanding > 0 || client.pending_files_total > 0 || client.unread_messages_total > 0

  return (
    <div className="group bg-white rounded-2xl border border-outline-variant hover:border-transparent hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* ── Colored top accent bar ─────────────────── */}
      <div className="h-1.5 w-full shrink-0" style={{ background: accent }} />

      {/* ── Card header ──────────────────────────────── */}
      <div className="flex items-start gap-3 p-5 pb-4">
        {/* Avatar */}
        <div
          className="size-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm"
          style={{ background: accent }}
        >
          {getInitials(client.name)}
        </div>

        {/* Name + email */}
        <div className="flex-1 min-w-0">
          <Link href={`/dashboard/clients/${client.id}`}>
            <h3 className="font-semibold text-[15px] text-on-surface leading-tight truncate hover:text-ds-secondary transition-colors">
              {client.name}
            </h3>
          </Link>
          <p className="text-xs text-on-surface-variant truncate mt-0.5">{client.email}</p>
        </div>

        {/* Actions menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 -mt-0.5 -mr-0.5">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={copyLink}>
              <Copy className="size-3.5 mr-2" />Copy portal link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSendMagicLink?.(client.id)}>
              <Send className="size-3.5 mr-2" />Send magic link
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onArchive?.(client.id)} className="text-on-surface-variant">
              <Archive className="size-3.5 mr-2" />Archive client
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Active project badge ──────────────────────── */}
      {latestProject && statusConfig ? (
        <div className="px-5 pb-3">
          <div className={cn('inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full', statusConfig.badge)}>
            <span className={cn('size-1.5 rounded-full', statusConfig.dot)} />
            <span>{statusConfig.label}</span>
            <span className="text-inherit/70 truncate max-w-32">· {latestProject.title}</span>
          </div>
        </div>
      ) : (
        <div className="px-5 pb-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant">
            No active projects
          </span>
        </div>
      )}

      {/* ── Stats grid ───────────────────────────────── */}
      <div className="px-5 pb-5 grid grid-cols-3 gap-2 mt-auto">
        <StatItem
          icon={DollarSign}
          label="Outstanding"
          value={client.outstanding > 0 ? formatCurrency(client.outstanding) : '—'}
          highlight={client.outstanding > 0}
          color="text-ds-secondary"
        />
        <StatItem
          icon={Clock}
          label="Pending"
          value={client.pending_files_total > 0 ? `${client.pending_files_total} file${client.pending_files_total > 1 ? 's' : ''}` : '—'}
          highlight={client.pending_files_total > 0}
          color="text-amber-600"
        />
        <StatItem
          icon={MessageSquare}
          label="Messages"
          value={client.unread_messages_total > 0 ? `${client.unread_messages_total} new` : '—'}
          highlight={client.unread_messages_total > 0}
          color="text-ds-secondary"
        />
      </div>

      {/* ── Footer ───────────────────────────────────── */}
      <div className="border-t border-outline-variant/60 px-5 py-3 flex items-center justify-between bg-surface-container/30">
        <p className="text-[11px] text-on-surface-variant">
          {client.projects.length} project{client.projects.length !== 1 ? 's' : ''}&ensp;·&ensp;{formatRelativeTime(client.updated_at)}
        </p>
        <Link
          href={`/dashboard/clients/${client.id}`}
          className="flex items-center gap-1 text-[11px] font-semibold text-ds-secondary hover:text-ds-secondary-container transition-colors"
        >
          Open <ExternalLink className="size-3" />
        </Link>
      </div>
    </div>
  )
}

function StatItem({
  icon: Icon, label, value, highlight, color,
}: {
  icon: React.ElementType
  label: string
  value: string
  highlight: boolean
  color: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <Icon className="size-3 text-on-surface-variant/60" />
        <span className="text-[10px] text-on-surface-variant">{label}</span>
      </div>
      <span className={cn('text-xs font-bold', highlight ? color : 'text-on-surface-variant/50')}>
        {value}
      </span>
    </div>
  )
}

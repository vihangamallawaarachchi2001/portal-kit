'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { formatFileSize, formatRelativeTime } from '@/lib/format'
import {
  Paperclip, Search, Check, SlidersHorizontal,
  FileText, ImageIcon, Video, Archive, Clock,
  CheckCircle, XCircle, User, FolderOpen, ArrowRight, Download, Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

/* ── Types ───────────────────────────────────────── */
type RawClient  = { id: string; name: string }
type RawProject = { id: string; title: string; status: string; clients: RawClient | RawClient[] | null }

export type GlobalFile = {
  id: string; filename: string; file_size: number; mime_type: string
  status: string; version: number; storage_path: string
  created_at: string; client_comment: string | null; parent_file_id: string | null
  projects: RawProject | null
}

interface Props { rawFiles: GlobalFile[] }

/* ── Status config ───────────────────────────────── */
const FILE_STATUS: Record<string, { label: string; cls: string; dot: string }> = {
  pending:           { label: 'Pending',  cls: 'bg-amber-50 text-amber-700',    dot: 'bg-amber-400'   },
  approved:          { label: 'Approved', cls: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  changes_requested: { label: 'Changes',  cls: 'bg-orange-50 text-orange-700',  dot: 'bg-orange-500'  },
}

function fileIconCfg(mime: string) {
  if (mime.startsWith('image/'))                        return { Icon: ImageIcon, bg: 'bg-sky-50',         color: 'text-sky-500'      }
  if (mime.startsWith('video/'))                        return { Icon: Video,     bg: 'bg-purple-50',      color: 'text-purple-500'   }
  if (mime.includes('zip') || mime.includes('archive')) return { Icon: Archive,   bg: 'bg-slate-100',      color: 'text-slate-500'    }
  if (mime.includes('pdf'))                             return { Icon: FileText,  bg: 'bg-red-50',         color: 'text-red-500'      }
  return                                                       { Icon: FileText,  bg: 'bg-ds-secondary/8', color: 'text-ds-secondary' }
}

function getClient(f: GlobalFile): RawClient | null {
  if (!f.projects) return null
  const c = f.projects.clients
  return Array.isArray(c) ? (c[0] ?? null) : c
}

const COL_STYLE = 'minmax(0,1fr) 160px 160px 96px 72px 104px 64px'

/* ── Main component ──────────────────────────────── */
export function GlobalFilesView({ rawFiles }: Props) {
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [clientFilter, setClientFilter] = useState('all')
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())

  // Build attachment map: parent_file_id → child files
  const attachmentMap = useMemo(() => {
    const map = new Map<string, GlobalFile[]>()
    for (const f of rawFiles) {
      if (f.parent_file_id) {
        const arr = map.get(f.parent_file_id) ?? []
        arr.push(f)
        map.set(f.parent_file_id, arr)
      }
    }
    return map
  }, [rawFiles])

  // Only show root files (no parent) in the main list
  const rootFiles = useMemo(() => rawFiles.filter(f => !f.parent_file_id), [rawFiles])

  async function handleDownload(fileId: string, filename: string) {
    setDownloadingId(fileId)
    try {
      const res = await fetch(`/api/files/${fileId}`)
      if (!res.ok) throw new Error('Failed to get download link')
      const { download_url } = await res.json()
      const a = document.createElement('a')
      a.href = download_url
      a.download = filename
      a.target = '_blank'
      a.click()
    } catch {
      toast.error('Could not download file')
    } finally {
      setDownloadingId(null)
    }
  }

  const clients = useMemo(() => {
    const map = new Map<string, string>()
    for (const f of rootFiles) {
      const c = getClient(f)
      if (c) map.set(c.id, c.name)
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [rootFiles])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return rootFiles.filter(f => {
      const c = getClient(f)
      const matchSearch = !q
        || f.filename.toLowerCase().includes(q)
        || (f.projects?.title ?? '').toLowerCase().includes(q)
        || (c?.name ?? '').toLowerCase().includes(q)
      const matchStatus = statusFilter === 'all' || f.status === statusFilter
      const matchClient = clientFilter === 'all' || c?.id === clientFilter
      return matchSearch && matchStatus && matchClient
    })
  }, [rootFiles, search, statusFilter, clientFilter])

  const isFiltering  = search !== '' || statusFilter !== 'all' || clientFilter !== 'all'
  const pendingCount = rootFiles.filter(f => f.status === 'pending').length

  /* ── Empty state ─────────────────────────────── */
  if (rootFiles.length === 0) {
    return (
      <div className="w-full min-h-screen" style={{ background: '#f4f6fa' }}>
        <PageHeader count={0} pendingCount={0} />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <div className="relative mb-8">
            <div className="size-24 rounded-3xl bg-ds-secondary/8 flex items-center justify-center shadow-sm">
              <Paperclip className="size-11 text-ds-secondary/35" strokeWidth={1.5} />
            </div>
            <div className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="size-3 text-amber-500" />
            </div>
            <div className="absolute -bottom-1 -left-3 size-4 rounded-full bg-ds-secondary/15" />
            <div className="absolute top-2 -left-4 size-2.5 rounded-full bg-emerald-200" />
          </div>
          <h2 className="text-[22px] font-bold text-on-surface tracking-tight">No files yet</h2>
          <p className="text-sm text-on-surface-variant mt-2.5 max-w-sm leading-relaxed">
            Files you upload to client projects will appear here. Upload deliverables and your clients can review and approve them from their portals.
          </p>
          <Link
            href="/dashboard/clients"
            className="mt-7 inline-flex items-center gap-1.5 h-10 px-6 rounded-lg bg-ds-secondary text-white text-sm font-semibold hover:bg-ds-secondary-container transition-colors shadow-sm"
          >
            Go to Clients <ArrowRight className="size-4" />
          </Link>
          <p className="mt-6 text-[11px] text-on-surface-variant/45 max-w-xs">
            Open a client portal, select a project, then go to the Files tab to upload deliverables.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen" style={{ background: '#f4f6fa' }}>
      <PageHeader count={rootFiles.length} pendingCount={pendingCount} />

      <div className="px-4 sm:px-8 py-6 flex flex-col gap-5">

        {/* ── Stat chips ──────────────────────────── */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {[
            { label: 'Total',    value: rootFiles.length,                        cls: 'bg-white border-outline-variant/20 text-on-surface'  },
            { label: 'Pending',  value: pendingCount,                            cls: pendingCount > 0  ? 'bg-amber-50 border-amber-200/60 text-amber-700' : 'bg-white border-outline-variant/20 text-on-surface-variant' },
            { label: 'Approved', value: rootFiles.filter(f => f.status === 'approved').length,
                                                                                 cls: 'bg-emerald-50 border-emerald-200/60 text-emerald-700' },
          ].filter((c, i) => i === 0 || c.value > 0).map(chip => (
            <div key={chip.label} className={cn('flex items-center gap-2 px-3.5 py-2 rounded-lg border shadow-sm text-xs font-semibold', chip.cls)}>
              <span className="text-sm font-bold">{chip.value}</span>
              <span className="opacity-70">{chip.label}</span>
            </div>
          ))}
        </div>

        {/* ── Search + filter ──────────────────────── */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-on-surface-variant/40 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by filename, client or project…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-9 w-full pl-9 pr-8 rounded-lg border border-outline-variant/60 text-sm bg-white focus:border-ds-secondary focus:ring-2 focus:ring-ds-secondary/20 focus:outline-none transition-all placeholder:text-on-surface-variant/40"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 rounded-full bg-on-surface-variant/15 hover:bg-on-surface-variant/30 flex items-center justify-center transition-colors"
              >
                <span className="text-[9px] font-bold text-on-surface-variant leading-none">✕</span>
              </button>
            )}
          </div>
          <FilesFilterButton
            statusFilter={statusFilter} onStatusChange={setStatusFilter}
            clientFilter={clientFilter} onClientChange={setClientFilter}
            clients={clients}
          />
          {isFiltering && (
            <button
              onClick={() => { setSearch(''); setStatusFilter('all'); setClientFilter('all') }}
              className="text-[12px] font-medium text-ds-secondary hover:underline whitespace-nowrap"
            >
              Clear
            </button>
          )}
        </div>

        {/* ── Table or no-match state ──────────────── */}
        {filtered.length === 0 ? (
          <NoMatchState onClear={() => { setSearch(''); setStatusFilter('all'); setClientFilter('all') }} />
        ) : (
          <div className="overflow-x-auto pb-6">
            <div
              className="rounded-xl border border-outline-variant/20 overflow-hidden bg-white shadow-sm"
              style={{ minWidth: 820 }}
            >
              {/* Header row */}
              <div
                className="grid items-center px-5 py-2.5 bg-surface-container/50 border-b border-outline-variant/15"
                style={{ gridTemplateColumns: COL_STYLE }}
              >
                {['File', 'Client', 'Project', 'Status', 'Size', 'Uploaded', ''].map((h, i) => (
                  <p key={i} className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{h}</p>
                ))}
              </div>

              {/* File rows */}
              <div>
                {filtered.map(f => {
                  const { Icon: FIcon, bg, color } = fileIconCfg(f.mime_type)
                  const scfg    = FILE_STATUS[f.status] ?? FILE_STATUS.pending
                  const project = f.projects
                  const client  = getClient(f)

                  const childFiles = attachmentMap.get(f.id) ?? []
                  const commentExpanded = expandedComments.has(f.id)

                  return (
                    <div key={f.id} className="border-b border-outline-variant/8 last:border-0">
                    <div
                      className="group grid items-center px-5 py-3 hover:bg-surface-container/15 transition-colors"
                      style={{ gridTemplateColumns: COL_STYLE }}
                    >
                      {/* File */}
                      <div className="flex items-center gap-3 min-w-0 pr-3">
                        <div className={cn('size-8 rounded-lg flex items-center justify-center shrink-0', bg)}>
                          <FIcon className={cn('size-3.5', color)} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-on-surface truncate leading-tight">{f.filename}</p>
                          {f.client_comment && (
                            <p className="text-[10px] text-amber-600 truncate mt-0.5">
                              &ldquo;{f.client_comment.slice(0, 42)}{f.client_comment.length > 42 ? '…' : ''}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Client */}
                      <div className="pr-3 min-w-0">
                        {client ? (
                          <Link
                            href={`/dashboard/clients/${client.id}`}
                            className="flex items-center gap-1.5 text-xs font-medium text-on-surface hover:text-ds-secondary transition-colors min-w-0"
                          >
                            <User className="size-3 shrink-0 text-on-surface-variant/40" />
                            <span className="truncate">{client.name}</span>
                          </Link>
                        ) : (
                          <span className="text-xs text-on-surface-variant/30">—</span>
                        )}
                      </div>

                      {/* Project */}
                      <div className="pr-3 min-w-0">
                        {project ? (
                          <Link
                            href={client ? `/dashboard/clients/${client.id}` : '#'}
                            className="flex items-center gap-1.5 text-xs font-medium text-on-surface hover:text-ds-secondary transition-colors min-w-0"
                          >
                            <FolderOpen className="size-3 shrink-0 text-on-surface-variant/40" />
                            <span className="truncate">{project.title}</span>
                          </Link>
                        ) : (
                          <span className="text-xs text-on-surface-variant/30">—</span>
                        )}
                      </div>

                      {/* Status */}
                      <span className={cn('w-fit inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full', scfg.cls)}>
                        <span className={cn('size-1 rounded-full shrink-0', scfg.dot)} />
                        {scfg.label}
                      </span>

                      {/* Size */}
                      <span className="text-xs text-on-surface-variant/60 tabular-nums">
                        {formatFileSize(f.file_size)}
                      </span>

                      {/* Uploaded */}
                      <span className="text-[11px] text-on-surface-variant/45">
                        {formatRelativeTime(f.created_at)}
                      </span>

                      {/* Download action */}
                      <div className="flex items-center justify-end gap-1">
                        {(f.client_comment || childFiles.length > 0) && (
                          <button
                            onClick={() => setExpandedComments(prev => {
                              const next = new Set(prev)
                              next.has(f.id) ? next.delete(f.id) : next.add(f.id)
                              return next
                            })}
                            className={cn(
                              'size-7 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center',
                              commentExpanded ? 'bg-amber-50 text-amber-600' : 'hover:bg-amber-50 text-on-surface-variant',
                            )}
                            title="Show feedback"
                          >
                            <span className="text-[10px]">💬</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDownload(f.id, f.filename)}
                          disabled={downloadingId === f.id}
                          className="size-7 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-ds-secondary/8 flex items-center justify-center text-ds-secondary disabled:opacity-50"
                          title="Download"
                        >
                          {downloadingId === f.id
                            ? <Loader2 className="size-3.5 animate-spin" />
                            : <Download className="size-3.5" />}
                        </button>
                      </div>
                    </div>
                    {/* Expanded: full comment + attachments */}
                    {commentExpanded && (
                      <div className="px-5 pb-3 flex flex-col gap-2">
                        {f.client_comment && (
                          <div className="px-4 py-2.5 rounded-xl bg-orange-50 border border-orange-100">
                            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider mb-1">Client feedback</p>
                            <p className="text-xs text-orange-900 whitespace-pre-wrap leading-relaxed">{f.client_comment}</p>
                          </div>
                        )}
                        {childFiles.length > 0 && (
                          <div className="flex flex-col gap-1.5">
                            <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-wider px-1">Reference files attached by client</p>
                            {childFiles.map(att => {
                              const { Icon: AttIcon, bg: attBg, color: attColor } = fileIconCfg(att.mime_type)
                              return (
                                <div key={att.id} className="flex items-center gap-3 px-3 py-2 rounded-xl border border-slate-200 bg-white">
                                  <div className={cn('size-7 rounded-lg flex items-center justify-center shrink-0', attBg)}>
                                    <AttIcon className={cn('size-3', attColor)} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-on-surface truncate">{att.filename}</p>
                                    <p className="text-[10px] text-on-surface-variant">{formatFileSize(att.file_size)}</p>
                                  </div>
                                  <button
                                    onClick={() => handleDownload(att.id, att.filename)}
                                    disabled={downloadingId === att.id}
                                    className="size-7 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-ds-secondary hover:bg-ds-secondary/8 transition-colors disabled:opacity-50"
                                    title="Download"
                                  >
                                    {downloadingId === att.id ? <Loader2 className="size-3 animate-spin" /> : <Download className="size-3" />}
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Page header ─────────────────────────────────── */
function PageHeader({ count, pendingCount }: { count: number; pendingCount: number }) {
  return (
    <div className="bg-white border-b border-outline-variant/30 px-4 sm:px-8 pt-7 pb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-on-surface tracking-tight">Files</h1>
          {count > 0 && (
            <p className="text-sm text-on-surface-variant mt-0.5">
              {count} file{count !== 1 ? 's' : ''}
              {pendingCount > 0 && (
                <span className="ml-2 text-amber-600 font-semibold">
                  · {pendingCount} awaiting review
                </span>
              )}
            </p>
          )}
        </div>
        <Link
          href="/dashboard/clients"
          className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-ds-secondary/8 text-ds-secondary text-xs font-semibold hover:bg-ds-secondary/15 transition-colors shrink-0"
        >
          Upload via clients <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  )
}

/* ── No-match empty state ────────────────────────── */
function NoMatchState({ onClear }: { onClear: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-outline-variant/20 shadow-sm py-16 px-6 flex flex-col items-center text-center gap-3">
      <div className="size-12 rounded-xl bg-surface-container/80 flex items-center justify-center">
        <Search className="size-5 text-on-surface-variant/35" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-sm font-semibold text-on-surface">No files match your search</p>
        <p className="text-xs text-on-surface-variant/60 mt-1">Try a different keyword or clear your filters.</p>
      </div>
      <button
        onClick={onClear}
        className="text-xs font-semibold text-ds-secondary hover:underline"
      >
        Clear all filters
      </button>
    </div>
  )
}

/* ── Filter button ───────────────────────────────── */
function FilesFilterButton({
  statusFilter, onStatusChange, clientFilter, onClientChange, clients,
}: {
  statusFilter: string; onStatusChange: (s: string) => void
  clientFilter: string; onClientChange: (c: string) => void
  clients: { id: string; name: string }[]
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isFiltered = statusFilter !== 'all' || clientFilter !== 'all'

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const STATUS_OPTS = [
    { value: 'all',               label: 'All statuses', dot: null         },
    { value: 'pending',           label: 'Pending',      dot: '#f59e0b'    },
    { value: 'approved',          label: 'Approved',     dot: '#10b981'    },
    { value: 'changes_requested', label: 'Changes',      dot: '#f97316'    },
  ]

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen(p => !p)}
        className={cn(
          'h-9 px-2.5 rounded-lg border transition-all flex items-center gap-1.5',
          isFiltered || open
            ? 'border-ds-secondary bg-ds-secondary/8 text-ds-secondary'
            : 'border-outline-variant/60 bg-white text-on-surface-variant hover:border-outline-variant hover:text-on-surface',
        )}
      >
        <SlidersHorizontal className="size-3.5" />
        {isFiltered && <span className="size-1.5 rounded-full bg-ds-secondary" />}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-outline-variant/20 shadow-xl z-50 overflow-hidden">
          {/* Status */}
          <div className="px-4 pt-3.5 pb-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Status</p>
          </div>
          <div className="px-2 pb-2">
            {STATUS_OPTS.map(opt => (
              <button
                key={opt.value}
                onClick={() => onStatusChange(opt.value)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-colors',
                  statusFilter === opt.value ? 'bg-ds-secondary text-white font-semibold' : 'text-on-surface hover:bg-surface-container/60',
                )}
              >
                {opt.dot
                  ? <span className="size-2 rounded-full shrink-0" style={{ background: opt.dot }} />
                  : <span className="size-2 rounded-full shrink-0 bg-outline-variant/30" />}
                <span className="flex-1">{opt.label}</span>
                {statusFilter === opt.value && <Check className="size-3.5 shrink-0" />}
              </button>
            ))}
          </div>

          {/* Client */}
          {clients.length > 0 && (
            <>
              <div className="h-px bg-outline-variant/15 mx-4" />
              <div className="px-4 pt-3 pb-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Client</p>
              </div>
              <div className="px-2 pb-3 max-h-48 overflow-y-auto">
                {[{ id: 'all', name: 'All clients' }, ...clients].map(c => (
                  <button
                    key={c.id}
                    onClick={() => onClientChange(c.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-colors',
                      clientFilter === c.id ? 'bg-ds-secondary text-white font-semibold' : 'text-on-surface hover:bg-surface-container/60',
                    )}
                  >
                    {c.id === 'all'
                      ? <span className="size-2 rounded-full shrink-0 bg-outline-variant/30" />
                      : <User className="size-3 shrink-0 opacity-50" />}
                    <span className="flex-1 truncate">{c.name}</span>
                    {clientFilter === c.id && <Check className="size-3.5 shrink-0" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

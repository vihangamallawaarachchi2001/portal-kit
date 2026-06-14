'use client'

import { useState, useRef, useTransition, useCallback } from 'react'
import { File as FileType, Project } from '@/types/database'
import { formatFileSize, formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  Upload, Paperclip, Trash2, CheckCircle, Clock, XCircle,
  FileText, ImageIcon, Video, Archive, Loader2, AlertCircle,
  FolderOpen, Download,
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

/* ─── Status config ──────────────────────────────── */
const STATUS_CONFIG: Record<FileType['status'], {
  label: string; cls: string; dot: string; icon: React.ElementType
}> = {
  pending:           { label: 'Pending',          cls: 'bg-amber-50 text-amber-700',    dot: 'bg-amber-400',    icon: Clock         },
  approved:          { label: 'Approved',          cls: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500', icon: CheckCircle   },
  changes_requested: { label: 'Changes Requested', cls: 'bg-orange-50 text-orange-700',  dot: 'bg-orange-500',  icon: XCircle       },
}

/* ─── File type → icon + color ───────────────────── */
function fileIconCfg(mimeType: string) {
  if (mimeType.startsWith('image/'))                    return { Icon: ImageIcon, bg: 'bg-sky-50',    color: 'text-sky-500'    }
  if (mimeType.startsWith('video/'))                    return { Icon: Video,     bg: 'bg-purple-50', color: 'text-purple-500' }
  if (mimeType.includes('zip') || mimeType.includes('archive'))
                                                        return { Icon: Archive,   bg: 'bg-slate-100', color: 'text-slate-500'  }
  if (mimeType.includes('pdf'))                         return { Icon: FileText,  bg: 'bg-red-50',    color: 'text-red-500'    }
  return                                                       { Icon: FileText,  bg: 'bg-ds-secondary/8', color: 'text-ds-secondary' }
}

/* ─── Project status dots ────────────────────────── */
const STATUS_DOTS: Record<string, string> = {
  briefing:    'bg-slate-400',
  in_progress: 'bg-blue-500',
  review:      'bg-amber-500',
  done:        'bg-green-500',
}

interface ProjectWithFiles extends Project {
  files: FileType[]
}

interface FileManagerProps {
  clientId: string
  projects: ProjectWithFiles[]
  plan: string
  totalFileCount: number
}

export function FileManager({ clientId: _clientId, projects, plan, totalFileCount }: FileManagerProps) {
  const router = useRouter()
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id ?? '')
  const [uploading, setUploading]                 = useState(false)
  const [uploadProgress, setUploadProgress]       = useState(0)
  const [downloadingId, setDownloadingId]         = useState<string | null>(null)
  const [expandedComments, setExpandedComments]   = useState<Set<string>>(new Set())
  const [, startTransition]                       = useTransition()
  const fileInputRef                              = useRef<HTMLInputElement>(null)

  const FREE_LIMIT      = 3
  const atLimit         = plan === 'free' && totalFileCount >= FREE_LIMIT
  const selectedProject = projects.find(p => p.id === selectedProjectId)

  const allProjectFiles = (selectedProject?.files ?? [])
    .filter((f: FileType) => !f.deleted_at)
    .sort((a: FileType, b: FileType) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // Root files only (not review attachments), split by uploader
  const rootFiles = allProjectFiles.filter((f: FileType) => !f.parent_file_id)
  const clientUploads = rootFiles.filter((f: FileType & { uploaded_by_client?: boolean }) => f.uploaded_by_client)
  const files = rootFiles.filter((f: FileType & { uploaded_by_client?: boolean }) => !f.uploaded_by_client)

  // Build attachment map for this project
  const attachmentMap = new Map<string, FileType[]>()
  for (const f of allProjectFiles) {
    if (f.parent_file_id) {
      const arr = attachmentMap.get(f.parent_file_id) ?? []
      arr.push(f)
      attachmentMap.set(f.parent_file_id, arr)
    }
  }

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedProjectId) return

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 50MB.')
      return
    }
    if (atLimit) {
      toast.error('Free tier limit reached. Upgrade to Pro for unlimited uploads.')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: selectedProjectId,
          filename:   file.name,
          file_size:  file.size,
          mime_type:  file.type || 'application/octet-stream',
        }),
      })
      if (!uploadRes.ok) {
        const d = await uploadRes.json()
        throw new Error(d.error ?? 'Failed to get upload URL')
      }
      const { signed_url, storage_path } = await uploadRes.json()

      const xhr = new XMLHttpRequest()
      await new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener('progress', e => {
          if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100))
        })
        xhr.addEventListener('load', () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed: ${xhr.statusText}`)))
        xhr.addEventListener('error', () => reject(new Error('Network error')))
        xhr.open('PUT', signed_url)
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')
        xhr.send(file)
      })

      const registerRes = await fetch(`/api/projects/${selectedProjectId}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename:     file.name,
          storage_path,
          file_size:    file.size,
          mime_type:    file.type || 'application/octet-stream',
        }),
      })
      if (!registerRes.ok) throw new Error('Failed to register file')

      toast.success(`${file.name} uploaded successfully`)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [selectedProjectId, atLimit, router])

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

  function handleDelete(fileId: string, filename: string) {
    startTransition(async () => {
      const res = await fetch(`/api/files/${fileId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success(`${filename} deleted`)
        router.refresh()
      } else {
        toast.error('Failed to delete file')
      }
    })
  }

  /* ── No projects ─────────────────────────────── */
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center gap-4 py-16">
        <div className="size-16 rounded-lg bg-surface-container flex items-center justify-center">
          <FolderOpen className="size-8 text-on-surface-variant" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-base font-semibold text-on-surface">No projects yet</p>
          <p className="text-sm text-on-surface-variant mt-1 max-w-xs">
            Create a project first — files are organised by project.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">

      {/* ── Control bar ──────────────────────────── */}
      <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
        {/* Project selector */}
        <div className="flex items-center gap-3">
          <p className="text-xs font-semibold text-on-surface-variant shrink-0">Project</p>
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="h-9 w-56 rounded-md border-outline-variant">
              {selectedProject ? (
                <span className="flex items-center gap-2 flex-1 min-w-0">
                  <span className={cn('size-2 rounded-full shrink-0', STATUS_DOTS[selectedProject.status] ?? 'bg-slate-400')} />
                  <span className="text-sm font-medium text-on-surface truncate">{selectedProject.title}</span>
                </span>
              ) : (
                <SelectValue placeholder="Select project" />
              )}
            </SelectTrigger>
            <SelectContent>
              {projects.map(p => (
                <SelectItem key={p.id} value={p.id} className="rounded-md py-2">
                  <span className="flex items-center gap-2">
                    <span className={cn('size-2 rounded-full shrink-0', STATUS_DOTS[p.status] ?? 'bg-slate-400')} />
                    <span className="text-sm font-medium">{p.title}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Right side: usage + upload */}
        <div className="flex items-center gap-3">
          {plan === 'free' && (
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-20 bg-surface-container rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', atLimit ? 'bg-red-500' : 'bg-ds-secondary')}
                  style={{ width: `${Math.min((totalFileCount / FREE_LIMIT) * 100, 100)}%` }}
                />
              </div>
              <span className="text-xs text-on-surface-variant whitespace-nowrap">
                {totalFileCount}/{FREE_LIMIT} files
              </span>
            </div>
          )}

          {atLimit ? (
            <a
              href="/dashboard/settings/billing"
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors"
            >
              <AlertCircle className="size-4" />
              Upgrade to upload
            </a>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || !selectedProjectId}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-ds-secondary text-white text-sm font-semibold hover:bg-ds-secondary-container transition-colors disabled:opacity-50 shadow-sm shadow-ds-secondary/20"
            >
              {uploading ? (
                <><Loader2 className="size-4 animate-spin" />{uploadProgress}%</>
              ) : (
                <><Upload className="size-4" />Upload file</>
              )}
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept=".pdf,.png,.jpg,.jpeg,.gif,.mp4,.mov,.zip,.docx,.pptx,.svg,.fig,.ai,.psd"
          />
        </div>
      </div>

      {/* ── Upload progress ───────────────────────── */}
      {uploading && (
        <div className="w-full bg-surface-container rounded-full h-1">
          <div
            className="bg-ds-secondary h-1 rounded-full transition-all duration-200"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* ── File list ────────────────────────────── */}
      {files.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm flex flex-col items-center justify-center py-16 px-6 text-center gap-5">
          <div className="relative">
            <div className="size-20 rounded-2xl bg-ds-secondary/8 flex items-center justify-center">
              <Paperclip className="size-10 text-ds-secondary/50" strokeWidth={1.5} />
            </div>
            <div className="absolute -top-1 -right-1 size-6 rounded-full bg-amber-100 flex items-center justify-center">
              <Upload className="size-3 text-amber-600" />
            </div>
          </div>
          <div>
            <p className="text-base font-bold text-on-surface">No files yet</p>
            <p className="text-sm text-on-surface-variant mt-1.5 max-w-xs leading-relaxed">
              Upload deliverables for <span className="font-semibold">{selectedProject?.title}</span> — your client can review and approve them from their portal.
            </p>
          </div>
          {!atLimit && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 h-10 px-5 rounded-lg bg-ds-secondary text-white text-sm font-semibold hover:bg-ds-secondary-container transition-colors shadow-sm shadow-ds-secondary/20"
            >
              <Upload className="size-4" />
              Upload first file
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="flex items-center gap-4 px-5 py-3 bg-surface-container/50 border-b border-outline-variant/30">
            <span className="flex-1 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">File</span>
            <span className="w-16 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider hidden sm:block">Size</span>
            <span className="w-32 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Status</span>
            <span className="w-16" />
          </div>

          <div className="divide-y divide-outline-variant/20">
            {files.map((file: FileType) => {
              const { Icon, bg, color } = fileIconCfg(file.mime_type)
              const statusCfg = STATUS_CONFIG[file.status]
              const childFiles = attachmentMap.get(file.id) ?? []
              const commentExpanded = expandedComments.has(file.id)

              return (
                <div key={file.id}>
                <div
                  className="group/file flex items-center gap-4 px-5 py-4 hover:bg-surface-container/30 transition-colors"
                >
                  {/* File type icon */}
                  <div className={cn('size-10 rounded-md flex items-center justify-center shrink-0', bg)}>
                    <Icon className={cn('size-5', color)} />
                  </div>

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-on-surface truncate leading-tight">{file.filename}</p>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      v{file.version}
                      <span className="mx-1 opacity-40">·</span>
                      {formatRelativeTime(file.created_at)}
                      {file.client_comment && (
                        <span className="text-amber-600 font-medium">
                          {' '}· &ldquo;{file.client_comment.slice(0, 50)}{file.client_comment.length > 50 ? '…' : ''}&rdquo;
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Size */}
                  <span className="w-16 text-xs text-on-surface-variant whitespace-nowrap hidden sm:block">
                    {formatFileSize(file.file_size)}
                  </span>

                  {/* Status badge */}
                  <span className={cn(
                    'w-32 inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap',
                    statusCfg.cls
                  )}>
                    <span className={cn('size-1.5 rounded-full shrink-0', statusCfg.dot)} />
                    {statusCfg.label}
                  </span>

                  {/* Actions — hover only */}
                  <div className="flex items-center gap-1 w-20 justify-end opacity-0 group-hover/file:opacity-100 transition-all shrink-0">
                    {(file.client_comment || childFiles.length > 0) && (
                      <button
                        onClick={() => setExpandedComments(prev => {
                          const next = new Set(prev)
                          next.has(file.id) ? next.delete(file.id) : next.add(file.id)
                          return next
                        })}
                        className={cn(
                          'size-7 rounded-md flex items-center justify-center transition-colors',
                          commentExpanded ? 'bg-amber-50 text-amber-600' : 'text-on-surface-variant hover:bg-amber-50',
                        )}
                        title="View feedback"
                      >
                        <span className="text-[10px]">💬</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDownload(file.id, file.filename)}
                      disabled={downloadingId === file.id}
                      className="size-7 rounded-md flex items-center justify-center text-on-surface-variant hover:text-ds-secondary hover:bg-ds-secondary/8 transition-colors disabled:opacity-50"
                      title="Download"
                    >
                      {downloadingId === file.id
                        ? <Loader2 className="size-3.5 animate-spin" />
                        : <Download className="size-3.5" />}
                    </button>
                    <button
                      onClick={() => handleDelete(file.id, file.filename)}
                      className="size-7 rounded-md flex items-center justify-center text-on-surface-variant hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete file"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
                {/* Expanded comment + attachments */}
                {commentExpanded && (
                  <div className="px-5 pb-3 flex flex-col gap-2">
                    {file.client_comment && (
                      <div className="px-4 py-2.5 rounded-xl bg-orange-50 border border-orange-100">
                        <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider mb-1">Client feedback</p>
                        <p className="text-xs text-orange-900 whitespace-pre-wrap leading-relaxed">{file.client_comment}</p>
                      </div>
                    )}
                    {childFiles.length > 0 && (
                      <div className="flex flex-col gap-1.5 pl-2">
                        <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-wider">Reference files from client</p>
                        {childFiles.map(att => {
                          const { Icon: AttIcon, bg: attBg, color: attColor } = fileIconCfg(att.mime_type)
                          return (
                            <div key={att.id} className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50">
                              <div className={cn('size-7 rounded-md flex items-center justify-center shrink-0', attBg)}>
                                <AttIcon className={cn('size-3.5', attColor)} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-on-surface truncate">{att.filename}</p>
                                <p className="text-[10px] text-on-surface-variant">{formatFileSize(att.file_size)}</p>
                              </div>
                              <button
                                onClick={() => handleDownload(att.id, att.filename)}
                                disabled={downloadingId === att.id}
                                className="size-7 rounded-md flex items-center justify-center text-on-surface-variant hover:text-ds-secondary hover:bg-ds-secondary/8 transition-colors disabled:opacity-50"
                                title="Download"
                              >
                                {downloadingId === att.id ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
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
      )}

      {/* ── Client uploads ───────────────────────── */}
      {clientUploads.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Client uploads</p>
            <span className="text-[11px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full font-semibold">
              {clientUploads.length}
            </span>
          </div>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="divide-y divide-outline-variant/20">
              {clientUploads.map((file: FileType) => {
                const { Icon, bg, color } = fileIconCfg(file.mime_type)
                return (
                  <div key={file.id} className="group/file flex items-center gap-4 px-5 py-4 hover:bg-surface-container/30 transition-colors">
                    <div className={cn('size-10 rounded-md flex items-center justify-center shrink-0', bg)}>
                      <Icon className={cn('size-5', color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-on-surface truncate leading-tight">{file.filename}</p>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">{formatFileSize(file.file_size)} · {formatRelativeTime(file.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover/file:opacity-100 transition-all shrink-0">
                      <button
                        onClick={() => handleDownload(file.id, file.filename)}
                        disabled={downloadingId === file.id}
                        className="size-7 rounded-md flex items-center justify-center text-on-surface-variant hover:text-ds-secondary hover:bg-ds-secondary/8 transition-colors disabled:opacity-50"
                        title="Download"
                      >
                        {downloadingId === file.id ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

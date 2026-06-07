'use client'

import { useState, useTransition, useRef, useCallback } from 'react'
import { File as FileType, Project } from '@/types/database'
import { formatFileSize, formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  CheckCircle, XCircle, Clock, FileText, Image, Video, Archive,
  Loader2, Download, FolderOpen, Upload, Paperclip, X, ArrowRight,
} from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

const STATUS_CONFIG: Record<FileType['status'], { label: string; className: string; icon: React.ElementType; accent: string }> = {
  pending:           { label: 'Awaiting Review',  className: 'bg-amber-50 text-amber-700 border-amber-200',   icon: Clock,         accent: '#f59e0b' },
  approved:          { label: 'Approved',          className: 'bg-green-50 text-green-700 border-green-200',   icon: CheckCircle,   accent: '#22c55e' },
  changes_requested: { label: 'Changes Requested', className: 'bg-orange-50 text-orange-700 border-orange-200', icon: XCircle,      accent: '#f97316' },
}

function fileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return Image
  if (mimeType.startsWith('video/')) return Video
  if (mimeType.includes('zip') || mimeType.includes('archive')) return Archive
  return FileText
}

function fileAccent(mimeType: string) {
  if (mimeType.startsWith('image/')) return '#8b5cf6'
  if (mimeType.startsWith('video/')) return '#ec4899'
  if (mimeType.includes('zip')) return '#f59e0b'
  return '#0051d5'
}

interface ProjectWithFiles extends Omit<Project, 'files'> {
  files: FileType[]
}

interface ReviewModal {
  fileId: string
  filename: string
  projectId: string
  mimeType: string
}

export function PortalFileReview({ projects }: { projects: ProjectWithFiles[] }) {
  const [isPending, startTransition] = useTransition()
  const [reviewModal, setReviewModal] = useState<ReviewModal | null>(null)
  const [comment, setComment] = useState('')
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [stagedFile, setStagedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [standaloneUploading, setStandaloneUploading] = useState(false)
  const [standaloneProgress, setStandaloneProgress] = useState(0)
  const [uploadProjectId, setUploadProjectId] = useState(projects[0]?.id ?? '')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const standaloneFileInputRef = useRef<HTMLInputElement>(null)

  const allFiles = projects.flatMap(p =>
    (p.files ?? [])
      .filter((f: FileType) => !f.deleted_at)
      .map((f: FileType) => ({ ...f, projectTitle: p.title }))
  ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // Separate root files from review attachments (child files linked to a parent)
  const rootFiles = allFiles.filter(f => !f.parent_file_id)
  const attachmentMap = new Map<string, typeof allFiles>()
  for (const f of allFiles) {
    if (f.parent_file_id) {
      const arr = attachmentMap.get(f.parent_file_id) ?? []
      arr.push(f)
      attachmentMap.set(f.parent_file_id, arr)
    }
  }

  const pending = rootFiles.filter(f => f.status === 'pending')
  const reviewed = rootFiles.filter(f => f.status !== 'pending')

  async function handleDownload(fileId: string, filename: string) {
    setDownloadingId(fileId)
    try {
      const res = await fetch(`/api/portal/files/${fileId}/download`)
      if (!res.ok) throw new Error('Failed')
      const { url } = await res.json()
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch {
      toast.error('Could not download file. Please try again.')
    } finally {
      setDownloadingId(null)
    }
  }

  function handleApprove(fileId: string, filename: string) {
    startTransition(async () => {
      const res = await fetch(`/api/files/${fileId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      })
      if (res.ok) {
        toast.success(`${filename} approved!`)
        window.location.reload()
      } else {
        toast.error('Failed to submit review')
      }
    })
  }

  function openRequestChanges(file: typeof allFiles[0]) {
    setComment('')
    setStagedFile(null)
    setReviewModal({ fileId: file.id, filename: file.filename, projectId: file.project_id, mimeType: file.mime_type })
  }

  const handleRequestChanges = useCallback(async () => {
    if (!reviewModal) return

    startTransition(async () => {
      let finalComment = comment.trim()

      // Upload the staged file first, if any
      if (stagedFile) {
        setUploading(true)
        setUploadProgress(0)
        try {
          const uploadRes = await fetch(`/api/portal/projects/${reviewModal.projectId}/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: stagedFile.name,
              file_size: stagedFile.size,
              mime_type: stagedFile.type || 'application/octet-stream',
            }),
          })
          if (!uploadRes.ok) throw new Error('Could not get upload URL')
          const { signed_url, storage_path } = await uploadRes.json()

          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhr.upload.addEventListener('progress', e => {
              if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100))
            })
            xhr.addEventListener('load', () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject())
            xhr.addEventListener('error', reject)
            xhr.open('PUT', signed_url)
            xhr.setRequestHeader('Content-Type', stagedFile.type || 'application/octet-stream')
            xhr.send(stagedFile)
          })

          await fetch(`/api/portal/projects/${reviewModal.projectId}/files`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: stagedFile.name,
              storage_path,
              file_size: stagedFile.size,
              mime_type: stagedFile.type || 'application/octet-stream',
              parent_file_id: reviewModal.fileId,
            }),
          })

          if (finalComment) {
            finalComment += `\n\nAttached reference: ${stagedFile.name}`
          } else {
            finalComment = `Attached reference: ${stagedFile.name}`
          }
        } catch {
          toast.error('File upload failed — feedback not submitted')
          setUploading(false)
          return
        }
        setUploading(false)
      }

      const res = await fetch(`/api/files/${reviewModal.fileId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'changes_requested', client_comment: finalComment || null }),
      })
      if (res.ok) {
        toast.success('Feedback submitted successfully')
        setReviewModal(null)
        window.location.reload()
      } else {
        toast.error('Failed to submit feedback')
      }
    })
  }, [reviewModal, comment, stagedFile])

  async function handleStandaloneUpload(file: File) {
    if (!uploadProjectId) { toast.error('Select a project first'); return }
    setStandaloneUploading(true)
    setStandaloneProgress(0)
    try {
      const res = await fetch(`/api/portal/projects/${uploadProjectId}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, file_size: file.size, mime_type: file.type || 'application/octet-stream' }),
      })
      if (!res.ok) throw new Error('Could not get upload URL')
      const { signed_url, storage_path } = await res.json()

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.addEventListener('progress', e => { if (e.lengthComputable) setStandaloneProgress(Math.round((e.loaded / e.total) * 100)) })
        xhr.addEventListener('load', () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject())
        xhr.addEventListener('error', reject)
        xhr.open('PUT', signed_url)
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')
        xhr.send(file)
      })

      const regRes = await fetch(`/api/portal/projects/${uploadProjectId}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, storage_path, file_size: file.size, mime_type: file.type || 'application/octet-stream' }),
      })
      if (!regRes.ok) throw new Error('Failed to register file')

      toast.success(`${file.name} uploaded successfully`)
      window.location.reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setStandaloneUploading(false)
      setStandaloneProgress(0)
      if (standaloneFileInputRef.current) standaloneFileInputRef.current.value = ''
    }
  }

  const pageHeader = (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Files</h1>
        <p className="text-sm text-on-surface-variant mt-1">Review deliverables and share your own files with your team.</p>
      </div>
      <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
        {pending.length > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
            <Clock className="size-3.5" />
            {pending.length} awaiting review
          </span>
        )}
        {/* Project selector for upload (only when multiple projects) */}
        {projects.length > 1 && (
          <select
            value={uploadProjectId}
            onChange={e => setUploadProjectId(e.target.value)}
            className="h-9 pl-3 pr-8 rounded-lg border border-slate-200 bg-white text-xs font-medium text-on-surface focus:outline-none cursor-pointer"
          >
            {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        )}
        {/* Upload progress inline */}
        {standaloneUploading ? (
          <div className="flex items-center gap-2 h-9 px-3 rounded-lg bg-ds-secondary/10 border border-ds-secondary/20">
            <Loader2 className="size-3.5 text-ds-secondary animate-spin" />
            <span className="text-xs font-semibold text-ds-secondary">{standaloneProgress}%</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => standaloneFileInputRef.current?.click()}
            className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-ds-secondary text-white text-xs font-semibold hover:bg-ds-secondary/90 transition-colors shadow-sm"
          >
            <Upload className="size-3.5" />
            Upload file
          </button>
        )}
        <input
          ref={standaloneFileInputRef}
          type="file"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleStandaloneUpload(f) }}
        />
      </div>
    </div>
  )

  if (allFiles.length === 0) {
    return (
      <div className="flex flex-col gap-6 pb-12">
        {pageHeader}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 flex flex-col items-center text-center gap-4">
          <div className="size-16 rounded-2xl bg-slate-100 flex items-center justify-center">
            <FolderOpen className="size-8 text-slate-400" />
          </div>
          <div>
            <p className="font-semibold text-on-surface">No files yet</p>
            <p className="text-sm text-on-surface-variant mt-1">Your team will upload deliverables here. You can also upload your own files above.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      {pageHeader}

      {/* Pending review */}
      {pending.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
            <span className="size-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">{pending.length}</span>
            Awaiting your review
          </h2>
          <div className="flex flex-col gap-3">
            {pending.map(file => {
              const Icon = fileIcon(file.mime_type)
              const accent = fileAccent(file.mime_type)
              const isDownloading = downloadingId === file.id

              return (
                <div key={file.id} className="relative bg-white rounded-2xl border-2 border-amber-200 shadow-sm overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400" />
                  <div className="ml-1 p-5 flex flex-col gap-4">
                    <div className="flex items-start gap-4">
                      <div className="size-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: accent + '18' }}>
                        <Icon className="size-6" style={{ color: accent }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-on-surface truncate text-base">{file.filename}</p>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          Version {file.version} · {formatFileSize(file.file_size)} · {file.projectTitle} · {formatRelativeTime(file.created_at)}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg border bg-amber-50 text-amber-700 border-amber-200 shrink-0">
                        <Clock className="size-3" />Awaiting Review
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-100">
                      <button
                        onClick={() => handleDownload(file.id, file.filename)}
                        disabled={isDownloading}
                        className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-sm font-semibold hover:bg-slate-100 transition-colors disabled:opacity-50"
                      >
                        {isDownloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                        {isDownloading ? 'Downloading…' : 'Download'}
                      </button>
                      <div className="flex-1" />
                      <button
                        onClick={() => openRequestChanges(file)}
                        disabled={isPending}
                        className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-orange-200 text-orange-700 bg-orange-50 text-sm font-semibold hover:bg-orange-100 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="size-4" />
                        Request changes
                      </button>
                      <button
                        onClick={() => handleApprove(file.id, file.filename)}
                        disabled={isPending}
                        className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle className="size-4" />}
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Reviewed files */}
      {reviewed.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-bold text-on-surface-variant">
            Previously reviewed ({reviewed.length})
          </h2>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
            {reviewed.map(file => {
              const Icon = fileIcon(file.mime_type)
              const accent = fileAccent(file.mime_type)
              const statusCfg = STATUS_CONFIG[file.status]
              const StatusIcon = statusCfg.icon
              const isDownloading = downloadingId === file.id
              const childFiles = attachmentMap.get(file.id) ?? []

              return (
                <div key={file.id} className="relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ background: statusCfg.accent }} />
                  <div className="ml-2 px-5 py-4 flex items-center gap-4">
                    <div className="size-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: accent + '12' }}>
                      <Icon className="size-4" style={{ color: accent }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-on-surface truncate">{file.filename}</p>
                      <p className="text-xs text-on-surface-variant">
                        {file.projectTitle} · {formatRelativeTime(file.reviewed_at ?? file.created_at)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownload(file.id, file.filename)}
                      disabled={isDownloading}
                      className="flex items-center gap-1 h-8 px-3 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 shrink-0"
                    >
                      {isDownloading ? <Loader2 className="size-3 animate-spin" /> : <Download className="size-3" />}
                      <span className="hidden sm:inline ml-1">{isDownloading ? 'Downloading…' : 'Download'}</span>
                    </button>
                    <span className={cn('flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg border shrink-0', statusCfg.className)}>
                      <StatusIcon className="size-3" />
                      <span className="hidden sm:inline">{statusCfg.label}</span>
                    </span>
                  </div>
                  {/* Full comment + linked attachments */}
                  {(file.client_comment || childFiles.length > 0) && (
                    <div className="ml-2 px-5 pb-4 flex flex-col gap-2.5">
                      {file.client_comment && (
                        <div className="px-4 py-3 rounded-xl bg-orange-50 border border-orange-100">
                          <p className="text-[11px] font-bold text-orange-500 uppercase tracking-wider mb-1.5">Your feedback</p>
                          <p className="text-sm text-orange-900 whitespace-pre-wrap leading-relaxed">{file.client_comment}</p>
                        </div>
                      )}
                      {childFiles.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                          <p className="text-[11px] font-bold text-on-surface-variant/60 uppercase tracking-wider">Reference files you attached</p>
                          {childFiles.map(att => {
                            const AttIcon = fileIcon(att.mime_type)
                            const attAccent = fileAccent(att.mime_type)
                            const isAttDownloading = downloadingId === att.id
                            return (
                              <div key={att.id} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50">
                                <div className="size-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: attAccent + '18' }}>
                                  <AttIcon className="size-3.5" style={{ color: attAccent }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-on-surface truncate">{att.filename}</p>
                                  <p className="text-[10px] text-on-surface-variant">{formatFileSize(att.file_size)} · {formatRelativeTime(att.created_at)}</p>
                                </div>
                                <button
                                  onClick={() => handleDownload(att.id, att.filename)}
                                  disabled={isAttDownloading}
                                  className="size-7 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-slate-200 transition-colors disabled:opacity-50"
                                >
                                  {isAttDownloading ? <Loader2 className="size-3 animate-spin" /> : <Download className="size-3" />}
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

      {/* ── Request changes modal ──────────────────────── */}
      <Dialog open={!!reviewModal} onOpenChange={() => { setReviewModal(null); setStagedFile(null) }}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden" showCloseButton={false}>
          {/* Visually hidden title required by Radix Dialog for accessibility */}
          <DialogTitle className="sr-only">Request Changes</DialogTitle>
          {reviewModal && (
            <RequestChangesBody
              modal={reviewModal}
              comment={comment}
              onCommentChange={setComment}
              stagedFile={stagedFile}
              onStagedFileChange={setStagedFile}
              uploading={uploading}
              uploadProgress={uploadProgress}
              isPending={isPending}
              fileInputRef={fileInputRef}
              onCancel={() => { setReviewModal(null); setStagedFile(null) }}
              onSubmit={handleRequestChanges}
            />
          )}
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={e => {
              const f = e.target.files?.[0]
              if (f) setStagedFile(f)
              if (fileInputRef.current) fileInputRef.current.value = ''
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ── Request changes body ──────────────────────────────── */
function RequestChangesBody({
  modal, comment, onCommentChange, stagedFile, onStagedFileChange,
  uploading, uploadProgress, isPending, fileInputRef, onCancel, onSubmit,
}: {
  modal: ReviewModal
  comment: string
  onCommentChange: (v: string) => void
  stagedFile: File | null
  onStagedFileChange: (f: File | null) => void
  uploading: boolean
  uploadProgress: number
  isPending: boolean
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onCancel: () => void
  onSubmit: () => void
}) {
  const Icon = fileIcon(modal.mimeType)
  const accent = fileAccent(modal.mimeType)
  const canSubmit = (comment.trim().length > 0 || stagedFile !== null) && !isPending && !uploading

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) onStagedFileChange(file)
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="relative px-6 pt-6 pb-5 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-40 opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 80% 50%, #f97316 0%, transparent 70%)' }} />
        <div className="relative flex items-start gap-4">
          <div className="size-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: accent + '20' }}>
            <Icon className="size-5" style={{ color: accent }} />
          </div>
          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 uppercase tracking-wider">
                <XCircle className="size-3" />
                Request Changes
              </span>
            </div>
            <p className="font-bold text-on-surface text-base leading-tight truncate">{modal.filename}</p>
            <p className="text-xs text-orange-700/70 mt-0.5">Let your team know exactly what needs to change</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="absolute top-0 right-0 size-7 rounded-lg flex items-center justify-center text-on-surface-variant/50 hover:text-on-surface hover:bg-black/5 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-5 flex flex-col gap-5">
        {/* Comment */}
        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-semibold text-on-surface">
            Describe the changes needed
          </label>
          <textarea
            value={comment}
            onChange={e => onCommentChange(e.target.value)}
            placeholder="e.g. Please update the logo on page 3, change the font to match our brand guide, and adjust the color palette to our primary blue…"
            rows={4}
            maxLength={2000}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-300 transition-colors leading-relaxed"
          />
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-on-surface-variant/50">Be as specific as possible to get the best results</p>
            {comment.length > 1600 && (
              <p className={cn('text-[11px] font-medium', comment.length > 1900 ? 'text-red-500' : 'text-amber-500')}>
                {comment.length}/2000
              </p>
            )}
          </div>
        </div>

        {/* File upload */}
        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-semibold text-on-surface">
            Attach a reference file
            <span className="ml-1.5 text-[11px] font-normal text-on-surface-variant">(optional)</span>
          </label>

          {stagedFile ? (
            // Staged file preview
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-ds-secondary/30 bg-ds-secondary/5">
              <div className="size-9 rounded-lg bg-ds-secondary/15 flex items-center justify-center shrink-0">
                <Paperclip className="size-4 text-ds-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-on-surface truncate">{stagedFile.name}</p>
                <p className="text-xs text-on-surface-variant">{(stagedFile.size / 1024).toFixed(0)} KB · Ready to upload</p>
              </div>
              <button
                type="button"
                onClick={() => onStagedFileChange(null)}
                className="size-7 rounded-lg flex items-center justify-center text-on-surface-variant/50 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            // Drop zone
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              className="flex flex-col items-center justify-center gap-2 w-full px-4 py-6 rounded-xl border-2 border-dashed border-slate-200 hover:border-ds-secondary/40 hover:bg-slate-50 transition-colors text-center group"
            >
              <div className="size-10 rounded-xl bg-slate-100 group-hover:bg-ds-secondary/10 flex items-center justify-center transition-colors">
                <Upload className="size-5 text-slate-400 group-hover:text-ds-secondary transition-colors" />
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface-variant group-hover:text-on-surface transition-colors">
                  Click to upload or drag & drop
                </p>
                <p className="text-xs text-on-surface-variant/55 mt-0.5">
                  Annotated PDFs, mockups, screenshots, references — up to 50MB
                </p>
              </div>
            </button>
          )}

          {/* Upload progress */}
          {uploading && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-ds-secondary/5">
              <Loader2 className="size-4 text-ds-secondary animate-spin shrink-0" />
              <div className="flex-1">
                <div className="h-1.5 bg-ds-secondary/20 rounded-full overflow-hidden">
                  <div className="h-full bg-ds-secondary transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
              <span className="text-[11px] text-ds-secondary font-semibold">{uploadProgress}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-6 pt-1 flex items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending || uploading}
          className="h-9 px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-on-surface-variant hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className="h-9 px-5 rounded-xl bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition-colors disabled:opacity-40 flex items-center gap-2"
        >
          {(isPending || uploading)
            ? <><Loader2 className="size-4 animate-spin" />Submitting…</>
            : <>Submit feedback <ArrowRight className="size-4" /></>}
        </button>
      </div>
    </div>
  )
}

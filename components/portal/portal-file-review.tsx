'use client'

import { useState, useTransition } from 'react'
import { File as FileType, Project } from '@/types/database'
import { formatFileSize, formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  CheckCircle, XCircle, Clock, FileText, Image, Video, Archive,
  Loader2, Download, ChevronDown,
} from 'lucide-react'
import { EmptyState } from '@/components/dashboard/empty-state'
import { Paperclip } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

const STATUS_CONFIG: Record<FileType['status'], { label: string; className: string; icon: React.ElementType }> = {
  pending:           { label: 'Awaiting Review',   className: 'bg-amber-50 text-amber-700 border-amber-200',   icon: Clock },
  approved:          { label: 'Approved',           className: 'bg-green-50 text-green-700 border-green-200',   icon: CheckCircle },
  changes_requested: { label: 'Changes Requested',  className: 'bg-orange-50 text-orange-700 border-orange-200', icon: XCircle },
}

function fileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return Image
  if (mimeType.startsWith('video/')) return Video
  if (mimeType.includes('zip')) return Archive
  return FileText
}

interface ProjectWithFiles extends Omit<Project, 'files'> {
  files: FileType[]
}

export function PortalFileReview({ projects }: { projects: ProjectWithFiles[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [reviewModal, setReviewModal] = useState<{ fileId: string; filename: string; action: 'approve' | 'request' } | null>(null)
  const [comment, setComment] = useState('')

  const allFiles = projects.flatMap(p =>
    (p.files ?? [])
      .filter((f: FileType) => !f.deleted_at)
      .map((f: FileType) => ({ ...f, projectTitle: p.title }))
  ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const pending = allFiles.filter(f => f.status === 'pending')
  const reviewed = allFiles.filter(f => f.status !== 'pending')

  function handleApprove(fileId: string, filename: string) {
    startTransition(async () => {
      const res = await fetch(`/api/files/${fileId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      })
      if (res.ok) {
        toast.success(`${filename} approved!`)
        router.refresh()
      } else {
        toast.error('Failed to submit review')
      }
    })
  }

  function openRequestChanges(fileId: string, filename: string) {
    setComment('')
    setReviewModal({ fileId, filename, action: 'request' })
  }

  function handleRequestChanges() {
    if (!reviewModal) return
    startTransition(async () => {
      const res = await fetch(`/api/files/${reviewModal.fileId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'changes_requested', client_comment: comment }),
      })
      if (res.ok) {
        toast.success('Feedback submitted')
        setReviewModal(null)
        router.refresh()
      } else {
        toast.error('Failed to submit feedback')
      }
    })
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold text-on-surface">Files</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">Review and approve deliverables from your team.</p>
      </div>

      {allFiles.length === 0 ? (
        <EmptyState icon={Paperclip} title="No files yet" description="Your freelancer hasn't uploaded any files yet. Check back soon." />
      ) : (
        <>
          {/* Pending review */}
          {pending.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-on-surface flex items-center gap-2">
                Awaiting your review
                <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pending.length}</span>
              </h2>
              <div className="flex flex-col gap-3">
                {pending.map(file => {
                  const Icon = fileIcon(file.mime_type)
                  return (
                    <div key={file.id} className="bg-white rounded-xl border-2 border-amber-200 p-5 flex flex-col gap-4">
                      <div className="flex items-start gap-3">
                        <div className="size-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                          <Icon className="size-5 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-on-surface truncate">{file.filename}</p>
                          <p className="text-xs text-on-surface-variant mt-0.5">
                            v{file.version} · {formatFileSize(file.file_size)} · {file.projectTitle} · {formatRelativeTime(file.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => handleApprove(file.id, file.filename)}
                          disabled={isPending}
                          className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          {isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle className="size-4" />}
                          Approve
                        </button>
                        <button
                          onClick={() => openRequestChanges(file.id, file.filename)}
                          disabled={isPending}
                          className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-orange-300 text-orange-700 bg-orange-50 text-sm font-semibold hover:bg-orange-100 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="size-4" />
                          Request changes
                        </button>
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
              <h2 className="text-sm font-semibold text-on-surface text-on-surface-variant">Previously reviewed</h2>
              <div className="bg-white rounded-xl border border-outline-variant divide-y divide-outline-variant overflow-hidden">
                {reviewed.map(file => {
                  const Icon = fileIcon(file.mime_type)
                  const statusCfg = STATUS_CONFIG[file.status]
                  const StatusIcon = statusCfg.icon

                  return (
                    <div key={file.id} className="flex items-center gap-3 px-5 py-4">
                      <div className="size-8 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                        <Icon className="size-4 text-on-surface-variant" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-on-surface truncate">{file.filename}</p>
                        <p className="text-xs text-on-surface-variant">
                          {file.projectTitle} · {formatRelativeTime(file.reviewed_at ?? file.created_at)}
                          {file.client_comment && (
                            <span className="text-orange-600"> · "{file.client_comment.slice(0, 80)}…"</span>
                          )}
                        </p>
                      </div>
                      <span className={cn('flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md border', statusCfg.className)}>
                        <StatusIcon className="size-3" />
                        {statusCfg.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Changes modal */}
      <Dialog open={!!reviewModal} onOpenChange={() => setReviewModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request changes</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <p className="text-sm text-on-surface-variant">
              What changes would you like to see on <strong>{reviewModal?.filename}</strong>?
            </p>
            <Textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Please describe the changes needed…"
              rows={4}
              maxLength={2000}
            />
            {comment.length > 1800 && (
              <p className="text-xs text-amber-600">{comment.length}/2000 characters</p>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReviewModal(null)}>Cancel</Button>
            <Button
              onClick={handleRequestChanges}
              disabled={isPending}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
              Submit feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

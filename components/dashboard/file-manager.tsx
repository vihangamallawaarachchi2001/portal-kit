'use client'

import { useState, useRef, useTransition, useCallback } from 'react'
import { File as FileType, Project } from '@/types/database'
import { formatFileSize, formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  Upload, Paperclip, Trash2, CheckCircle, Clock, XCircle,
  FileText, Image, Video, Archive, Loader2, AlertCircle, ChevronDown,
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from './empty-state'

const STATUS_CONFIG: Record<FileType['status'], { label: string; className: string; icon: React.ElementType }> = {
  pending:           { label: 'Pending',          className: 'bg-amber-50 text-amber-700 border-amber-200',   icon: Clock },
  approved:          { label: 'Approved',          className: 'bg-green-50 text-green-700 border-green-200',   icon: CheckCircle },
  changes_requested: { label: 'Changes Requested', className: 'bg-orange-50 text-orange-700 border-orange-200', icon: XCircle },
}

function fileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return Image
  if (mimeType.startsWith('video/')) return Video
  if (mimeType.includes('zip') || mimeType.includes('archive')) return Archive
  return FileText
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

export function FileManager({ clientId, projects, plan, totalFileCount }: FileManagerProps) {
  const router = useRouter()
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id ?? '')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const FREE_LIMIT = 3
  const atLimit = plan === 'free' && totalFileCount >= FREE_LIMIT

  const selectedProject = projects.find(p => p.id === selectedProjectId)
  const files = (selectedProject?.files ?? [])
    .filter((f: FileType) => !f.deleted_at)
    .sort((a: FileType, b: FileType) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

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
      // 1. Get signed upload URL
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: selectedProjectId,
          filename: file.name,
          file_size: file.size,
          mime_type: file.type || 'application/octet-stream',
        }),
      })

      if (!uploadRes.ok) {
        const d = await uploadRes.json()
        throw new Error(d.error ?? 'Failed to get upload URL')
      }

      const { signed_url, storage_path } = await uploadRes.json()

      // 2. Upload directly to Supabase Storage
      const xhr = new XMLHttpRequest()
      await new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener('progress', e => {
          if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100))
        })
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve()
          else reject(new Error(`Upload failed: ${xhr.statusText}`))
        })
        xhr.addEventListener('error', () => reject(new Error('Network error')))
        xhr.open('PUT', signed_url)
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')
        xhr.send(file)
      })

      // 3. Register file in DB
      const registerRes = await fetch(`/api/projects/${selectedProjectId}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          storage_path,
          file_size: file.size,
          mime_type: file.type || 'application/octet-stream',
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

  return (
    <div className="max-w-4xl flex flex-col gap-6">
      {/* Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium text-on-surface-variant">Project:</p>
          {projects.length === 0 ? (
            <p className="text-sm text-on-surface-variant italic">No projects — create one first</p>
          ) : (
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="w-64 h-9">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex items-center gap-2">
          {plan === 'free' && (
            <span className="text-xs text-on-surface-variant">
              {totalFileCount}/{FREE_LIMIT} files used
            </span>
          )}
          {atLimit ? (
            <a
              href="/dashboard/settings/billing"
              className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors"
            >
              <AlertCircle className="size-4" />
              Upgrade to upload
            </a>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || !selectedProjectId}
              className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-ds-secondary text-white text-sm font-semibold hover:bg-ds-secondary-container transition-colors disabled:opacity-50"
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

      {/* Upload progress bar */}
      {uploading && (
        <div className="w-full bg-surface-container rounded-full h-1.5">
          <div
            className="bg-ds-secondary h-1.5 rounded-full transition-all duration-200"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* File list */}
      {files.length === 0 ? (
        <EmptyState
          icon={Paperclip}
          title="No files yet"
          description="Upload deliverables for your client to review and approve."
        />
      ) : (
        <div className="bg-white rounded-xl border border-outline-variant overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-2.5 bg-surface-container text-[11px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">
            <span>File</span>
            <span>Size</span>
            <span>Status</span>
            <span />
          </div>
          <div className="divide-y divide-outline-variant">
            {files.map((file: FileType) => {
              const Icon = fileIcon(file.mime_type)
              const statusCfg = STATUS_CONFIG[file.status]
              const StatusIcon = statusCfg.icon

              return (
                <div key={file.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-surface-container/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-8 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                      <Icon className="size-4 text-on-surface-variant" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-on-surface truncate">{file.filename}</p>
                      <p className="text-[11px] text-on-surface-variant">
                        v{file.version} · {formatRelativeTime(file.created_at)}
                        {file.client_comment && (
                          <span className="text-amber-600"> · "{file.client_comment.slice(0, 60)}{file.client_comment.length > 60 ? '…' : ''}"</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs text-on-surface-variant whitespace-nowrap">{formatFileSize(file.file_size)}</span>

                  <span className={cn('flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md border whitespace-nowrap', statusCfg.className)}>
                    <StatusIcon className="size-3" />
                    {statusCfg.label}
                  </span>

                  <button
                    onClick={() => handleDelete(file.id, file.filename)}
                    className="size-7 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Delete file"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

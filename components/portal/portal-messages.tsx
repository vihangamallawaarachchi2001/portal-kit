'use client'

import { useState, useEffect, useRef, useTransition, useCallback } from 'react'
import { formatRelativeTime, getInitials } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  MessageSquare, Send, Loader2, ChevronDown, Smile,
  Paperclip, X, Upload, Check, Download,
} from 'lucide-react'
import { toast } from 'sonner'

/* ── Emoji list ─────────────────────────────────────────── */
const EMOJIS = [
  '😀','😄','😊','🙂','😉','😎','🤩','😍','🥳','😂','🤣','😅','😆',
  '👍','👎','👏','🙌','🤝','✌️','💪','🫶','❤️','🧡','💛','💚','💙','💜',
  '✅','❌','⚠️','🔥','⭐','💡','📎','📋','📌','🗓️','🔗','📧','📞',
  '🚀','⏰','💰','🎉','🎊','🏆','✨','👀','🙏','😴','🤔','💭','📝',
]

/* ── Types ──────────────────────────────────────────────── */
interface MessageRecord {
  id: string
  project_id: string
  sender_type: 'freelancer' | 'client'
  sender_id: string | null
  content: string
  read_at: string | null
  created_at: string
}

interface FileRef {
  id: string
  name: string
  status: string
}

interface ProjectFile {
  id: string
  filename: string
  status: string
}

interface Project {
  id: string
  title: string
  messages: MessageRecord[]
  files: ProjectFile[]
}

interface PortalMessagesProps {
  clientId: string
  clientName: string
  projects: Project[]
  freelancerName: string
  freelancerAvatar: string | null
}

/* ── Content parsing ────────────────────────────────────── */
function parseContent(raw: string): { text: string; files: FileRef[] } {
  try {
    const p = JSON.parse(raw)
    if (p && typeof p === 'object' && ('text' in p || 'files' in p)) {
      return { text: p.text ?? '', files: Array.isArray(p.files) ? p.files : [] }
    }
  } catch {}
  return { text: raw, files: [] }
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Awaiting review',
  approved: 'Approved',
  changes_requested: 'Changes requested',
}

/* ── Portal file download helper ───────────────────────── */
async function downloadPortalFile(fileId: string, filename: string) {
  const res = await fetch(`/api/portal/files/${fileId}/download`)
  if (!res.ok) { toast.error('Download failed'); return }
  const { url } = await res.json()
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.target = '_blank'
  a.click()
}

export function PortalMessages({
  clientId: _clientId,
  clientName,
  projects,
  freelancerName,
  freelancerAvatar,
}: PortalMessagesProps) {
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id ?? '')
  const [messages, setMessages] = useState<MessageRecord[]>(() =>
    (projects[0]?.messages ?? []).sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
  )
  // Extra files uploaded during this session (merged with SSR files)
  const [sessionFiles, setSessionFiles] = useState<ProjectFile[]>([])
  const [content, setContent] = useState('')
  const [attachedFiles, setAttachedFiles] = useState<FileRef[]>([])
  const [isSending, startTransition] = useTransition()
  const [showEmoji, setShowEmoji] = useState(false)
  const [showFilePicker, setShowFilePicker] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const bottomRef    = useRef<HTMLDivElement>(null)
  const textareaRef  = useRef<HTMLTextAreaElement>(null)
  const emojiRef     = useRef<HTMLDivElement>(null)
  const filePickerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const lastTimestampRef = useRef<string | null>(null)

  // Update last timestamp ref when messages change
  useEffect(() => {
    const last = messages.at(-1)
    if (last) lastTimestampRef.current = last.created_at
  }, [messages])

  // Switch messages when project changes
  useEffect(() => {
    const proj = projects.find(p => p.id === selectedProjectId)
    const sorted = (proj?.messages ?? []).sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    setMessages(sorted)
    setAttachedFiles([])
    setSessionFiles([])
    lastTimestampRef.current = sorted.at(-1)?.created_at ?? null
  }, [selectedProjectId, projects])

  // Mark messages as read on project switch
  useEffect(() => {
    if (!selectedProjectId) return
    fetch(`/api/portal/projects/${selectedProjectId}/messages`, { method: 'PATCH' }).catch(() => {})
  }, [selectedProjectId])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Close pickers on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) setShowEmoji(false)
      if (filePickerRef.current && !filePickerRef.current.contains(e.target as Node)) setShowFilePicker(false)
    }
    if (showEmoji || showFilePicker) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showEmoji, showFilePicker])

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (!selectedProjectId) return
    const poll = async () => {
      const since = lastTimestampRef.current
      const url = since
        ? `/api/portal/projects/${selectedProjectId}/messages?since=${encodeURIComponent(since)}`
        : `/api/portal/projects/${selectedProjectId}/messages`
      try {
        const res = await fetch(url)
        if (!res.ok) return
        const fresh: MessageRecord[] = await res.json()
        if (fresh.length > 0) {
          setMessages(prev => {
            const ids = new Set(prev.map(m => m.id))
            const newOnes = fresh.filter(m => !ids.has(m.id))
            if (!newOnes.length) return prev
            return [...prev, ...newOnes]
          })
          // Mark newly received freelancer messages as read
          fetch(`/api/portal/projects/${selectedProjectId}/messages`, { method: 'PATCH' }).catch(() => {})
        }
      } catch {}
    }
    const timer = setInterval(poll, 5000)
    return () => clearInterval(timer)
  }, [selectedProjectId])

  function insertEmoji(emoji: string) {
    const ta = textareaRef.current
    if (!ta) { setContent(c => c + emoji); return }
    const start = ta.selectionStart ?? content.length
    const end = ta.selectionEnd ?? content.length
    const next = content.slice(0, start) + emoji + content.slice(end)
    setContent(next)
    setShowEmoji(false)
    setTimeout(() => {
      ta.focus()
      const pos = start + emoji.length
      ta.setSelectionRange(pos, pos)
      ta.style.height = 'auto'
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
    }, 0)
  }

  function toggleFile(file: FileRef) {
    setAttachedFiles(prev => {
      const already = prev.some(f => f.id === file.id)
      return already ? prev.filter(f => f.id !== file.id) : [...prev, file]
    })
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const text = content.trim()
    if (!text && attachedFiles.length === 0) return
    if (!selectedProjectId) return

    const msgContent = attachedFiles.length > 0
      ? JSON.stringify({ text, files: attachedFiles })
      : text

    setContent('')
    setAttachedFiles([])
    if (textareaRef.current) textareaRef.current.style.height = '42px'

    // Optimistic update
    const tempId = `temp-${Date.now()}`
    const optimistic: MessageRecord = {
      id: tempId,
      project_id: selectedProjectId,
      sender_type: 'client',
      sender_id: null,
      content: msgContent,
      read_at: null,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])

    startTransition(async () => {
      const res = await fetch(`/api/portal/projects/${selectedProjectId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: msgContent }),
      })
      if (!res.ok) {
        setMessages(prev => prev.filter(m => m.id !== tempId))
        setContent(text)
        setAttachedFiles(attachedFiles)
        toast.error('Failed to send message')
        return
      }
      const saved: MessageRecord = await res.json()
      setMessages(prev => {
        // Remove the temp optimistic entry regardless
        const withoutTemp = prev.filter(m => m.id !== tempId)
        // The poller may have already inserted the real message; avoid duplicates
        if (withoutTemp.some(m => m.id === saved.id)) return withoutTemp
        return [...withoutTemp, saved]
      })
    })
  }

  const handleFileUpload = useCallback(async (file: File) => {
    if (!selectedProjectId) return
    setUploading(true)
    setUploadProgress(0)
    try {
      // Step 1: get signed URL
      const uploadRes = await fetch(`/api/portal/projects/${selectedProjectId}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, file_size: file.size, mime_type: file.type || 'application/octet-stream' }),
      })
      if (!uploadRes.ok) {
        const d = await uploadRes.json()
        throw new Error(d.error ?? 'Failed to get upload URL')
      }
      const { signed_url, storage_path } = await uploadRes.json()

      // Step 2: upload via XHR for progress
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

      // Step 3: register file in DB
      const registerRes = await fetch(`/api/portal/projects/${selectedProjectId}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, storage_path, file_size: file.size, mime_type: file.type || 'application/octet-stream' }),
      })
      if (!registerRes.ok) throw new Error('Failed to register file')
      const newFile: ProjectFile = await registerRes.json()

      setSessionFiles(prev => [...prev, newFile])
      // Auto-attach the just-uploaded file
      setAttachedFiles(prev => [...prev, { id: newFile.id, name: newFile.filename, status: newFile.status }])
      toast.success(`${file.name} uploaded`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [selectedProjectId])

  if (projects.length === 0) {
    return (
      <div className="flex flex-col gap-6 pb-12">
        <PageHeader freelancerName={freelancerName} />
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 flex flex-col items-center text-center gap-4">
          <div className="size-16 rounded-2xl bg-slate-100 flex items-center justify-center">
            <MessageSquare className="size-8 text-slate-400" />
          </div>
          <p className="font-semibold text-on-surface">No projects yet</p>
          <p className="text-sm text-on-surface-variant">Messages will appear here once your team adds a project.</p>
        </div>
      </div>
    )
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId)
  const allProjectFiles: FileRef[] = [
    ...(selectedProject?.files ?? []).map(f => ({ id: f.id, name: f.filename, status: f.status })),
    ...sessionFiles.map(f => ({ id: f.id, name: f.filename, status: f.status })),
  ]
  // Dedupe by id
  const projectFiles = allProjectFiles.filter((f, i, arr) => arr.findIndex(x => x.id === f.id) === i)

  return (
    <div className="flex flex-col gap-6 pb-4">
      {/* Page header + project selector */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <PageHeader freelancerName={freelancerName} />
        {projects.length > 1 && (
          <div className="relative shrink-0">
            <select
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              className="appearance-none h-9 pl-3 pr-8 rounded-lg border border-slate-200 bg-white text-sm font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-ds-secondary/30 cursor-pointer"
            >
              {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant pointer-events-none" />
          </div>
        )}
      </div>

      {/* Chat card */}
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden"
        style={{ height: 'calc(100dvh - 300px)', minHeight: 500 }}
      >
        {/* Chat header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60 shrink-0">
          <Avatar className="size-9 shrink-0">
            <AvatarImage src={freelancerAvatar ?? undefined} alt="" className="object-cover" />
            <AvatarFallback className="text-xs font-bold bg-ds-secondary text-white">
              {getInitials(freelancerName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-on-surface leading-tight">{freelancerName}</p>
            {selectedProject && <p className="text-xs text-on-surface-variant">{selectedProject.title}</p>}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-green-400" />
            <span className="text-xs text-on-surface-variant">Active</span>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-3" style={{ background: '#efeae2' }}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 h-full py-12 text-center">
              <div className="size-12 rounded-2xl bg-ds-secondary/10 flex items-center justify-center">
                <MessageSquare className="size-6 text-ds-secondary" />
              </div>
              <p className="text-sm font-semibold text-on-surface">No messages yet</p>
              <p className="text-xs text-on-surface-variant">Say hello to kick things off 👋</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isClient = msg.sender_type === 'client'
              const prevMsg = i > 0 ? messages[i - 1] : null
              const showAvatar = !prevMsg || (prevMsg.sender_type === 'client') !== isClient
              const { text, files } = parseContent(msg.content)
              const isTemp = msg.id.startsWith('temp-')

              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex gap-2.5',
                    isClient ? 'flex-row-reverse self-end' : 'self-start',
                    'max-w-[75%]',
                    isTemp && 'opacity-70',
                  )}
                >
                  {/* Avatar */}
                  {showAvatar ? (
                    <div className={cn(
                      'size-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5',
                      isClient ? 'bg-ds-secondary/20 text-ds-secondary' : 'bg-slate-200 text-slate-600'
                    )}>
                      {isClient
                        ? getInitials(clientName)
                        : freelancerAvatar
                          ? <img src={freelancerAvatar} alt="" className="size-7 rounded-full object-cover" />
                          : getInitials(freelancerName)
                      }
                    </div>
                  ) : (
                    <div className="size-7 shrink-0" />
                  )}

                  {/* Bubble */}
                  <div className={cn('flex flex-col gap-0.5', isClient ? 'items-end' : 'items-start')}>
                    {showAvatar && (
                      <span className="text-[11px] font-semibold text-on-surface-variant px-1">
                        {isClient ? 'You' : freelancerName}
                      </span>
                    )}
                    <div className={cn(
                      'px-4 py-2.5 text-sm leading-relaxed',
                      isClient
                        ? 'bg-ds-secondary text-white rounded-2xl rounded-tr-sm'
                        : 'bg-white text-on-surface rounded-2xl rounded-tl-sm shadow-sm'
                    )}>
                      {text && (
                        <p className="whitespace-pre-wrap wrap-break-word">{text}</p>
                      )}
                      {files.length > 0 && (
                        <div className={cn('flex flex-wrap gap-1', text ? 'mt-2' : '')}>
                          {files.map(f => (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => downloadPortalFile(f.id, f.name)}
                              className={cn(
                                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-opacity hover:opacity-80',
                                isClient ? 'bg-white/20' : 'bg-black/5',
                              )}
                            >
                              <Paperclip className="size-3 shrink-0" />
                              <span className="truncate max-w-30">{f.name}</span>
                              <span className="shrink-0 opacity-60">· {STATUS_LABELS[f.status] ?? f.status}</span>
                              <Download className="size-3 shrink-0 opacity-60" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-on-surface-variant px-1">
                      {formatRelativeTime(msg.created_at)}
                    </span>
                  </div>
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Upload progress bar */}
        {uploading && (
          <div className="shrink-0 px-4 py-2 bg-ds-secondary/5 border-t border-ds-secondary/10">
            <div className="flex items-center gap-3">
              <Loader2 className="size-4 text-ds-secondary animate-spin shrink-0" />
              <div className="flex-1">
                <div className="h-1.5 bg-ds-secondary/20 rounded-full overflow-hidden">
                  <div className="h-full bg-ds-secondary transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
              <span className="text-[11px] text-ds-secondary font-semibold shrink-0">{uploadProgress}%</span>
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="border-t border-slate-100 px-4 pt-3 pb-3 shrink-0 bg-slate-50/50">
          {/* Attached file chips */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {attachedFiles.map(f => (
                <span
                  key={f.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ds-secondary/10 text-ds-secondary text-[12px] font-medium"
                >
                  <Paperclip className="size-3" />
                  <span className="truncate max-w-30">{f.name}</span>
                  <button type="button" onClick={() => toggleFile(f)} className="ml-0.5 hover:text-red-500 transition-colors">
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <form onSubmit={handleSend} className="flex gap-2 items-end">
            {/* Emoji button + picker */}
            <div ref={emojiRef} className="relative shrink-0 self-end mb-0.5">
              <button
                type="button"
                onClick={() => { setShowEmoji(v => !v); setShowFilePicker(false) }}
                className={cn(
                  'size-9 flex items-center justify-center rounded-xl border transition-colors',
                  showEmoji
                    ? 'bg-ds-secondary/10 border-ds-secondary/30 text-ds-secondary'
                    : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                )}
              >
                <Smile className="size-4.5" />
              </button>

              {showEmoji && (
                <div className="absolute bottom-full mb-2 left-0 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50">
                  <div className="grid grid-cols-8 gap-0.5">
                    {EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => insertEmoji(emoji)}
                        className="size-8 flex items-center justify-center text-lg rounded-lg hover:bg-slate-100 transition-colors leading-none"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* File attachment / upload button */}
            <div ref={filePickerRef} className="relative shrink-0 self-end mb-0.5">
              <button
                type="button"
                onClick={() => { setShowFilePicker(v => !v); setShowEmoji(false) }}
                className={cn(
                  'size-9 flex items-center justify-center rounded-xl border transition-colors',
                  showFilePicker || attachedFiles.length > 0
                    ? 'bg-ds-secondary/10 border-ds-secondary/30 text-ds-secondary'
                    : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                )}
              >
                <Paperclip className="size-4.5" />
              </button>

              {showFilePicker && (
                <div className="absolute bottom-full mb-2 left-0 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <p className="text-[12px] font-bold text-on-surface-variant">Attach or upload files</p>
                  </div>

                  {/* Existing project files */}
                  {projectFiles.length > 0 && (
                    <div className="max-h-52 overflow-y-auto">
                      {projectFiles.map(f => {
                        const selected = attachedFiles.some(a => a.id === f.id)
                        return (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => toggleFile(f)}
                            className={cn(
                              'w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0',
                              selected && 'bg-ds-secondary/5',
                            )}
                          >
                            <div className={cn(
                              'size-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
                              selected ? 'bg-ds-secondary border-ds-secondary' : 'border-slate-300',
                            )}>
                              {selected && <Check className="size-3 text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-medium text-on-surface truncate">{f.name}</p>
                              <p className="text-[11px] text-on-surface-variant">{STATUS_LABELS[f.status] ?? f.status}</p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* Upload new file */}
                  <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) { handleFileUpload(file); setShowFilePicker(false) }
                      }}
                    />
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 h-9 rounded-lg bg-white border border-slate-200 text-[13px] font-medium text-on-surface hover:bg-slate-100 transition-colors disabled:opacity-50"
                    >
                      <Upload className="size-3.5" />
                      Upload new file
                    </button>
                  </div>

                  {attachedFiles.length > 0 && (
                    <div className="px-4 py-2 bg-ds-secondary/5 border-t border-ds-secondary/10">
                      <p className="text-[12px] text-ds-secondary font-semibold">
                        {attachedFiles.length} file{attachedFiles.length > 1 ? 's' : ''} selected
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={e => {
                setContent(e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend(e as unknown as React.FormEvent)
                }
              }}
              placeholder={attachedFiles.length > 0 ? 'Add a message (optional)…' : 'Type a message…'}
              rows={1}
              maxLength={4000}
              className="flex-1 resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-ds-secondary/30 focus:border-ds-secondary overflow-hidden"
              style={{ minHeight: 42, maxHeight: 120 }}
            />

            {/* Send */}
            <button
              type="submit"
              disabled={(!content.trim() && attachedFiles.length === 0) || isSending}
              className="size-9 rounded-xl bg-ds-secondary text-white flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40 shrink-0 self-end mb-0.5"
            >
              {isSending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </button>
          </form>
          <p className="text-[10px] text-on-surface-variant mt-1.5 pl-1">Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  )
}

function PageHeader({ freelancerName }: { freelancerName: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-on-surface">Messages</h1>
      <p className="text-sm text-on-surface-variant mt-1">Communicate directly with {freelancerName}.</p>
    </div>
  )
}

'use client'

import { useState, useMemo, useEffect, useRef, useCallback, memo } from 'react'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/format'
import {
  Search, Send, MessageSquare, ArrowRight, ArrowLeft,
  SmilePlus, Check, CheckCheck, Paperclip, X, Download,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { clientAccent } from './client-card'
import { createClient } from '@/lib/supabase/client'

/* ── Types ──────────────────────────────────────────────── */
type RawMessage = {
  id: string
  content: string
  sender_type: string
  read_at: string | null
  created_at: string
}

type FileRef = {
  id: string
  name: string
  status: string
}

type RawFile = {
  id: string
  filename: string
  status: string
}

type RawProject = {
  id: string
  title: string
  status: string
  messages: RawMessage[]
  files: RawFile[]
}

type RawClient = {
  id: string
  name: string
  email: string | null
  portal_slug: string
  projects: RawProject[]
}

type MessageRow = RawMessage & { project_id: string }

type Conversation = {
  client: { id: string; name: string; email: string | null; portal_slug: string }
  messages: MessageRow[]
  unreadCount: number
  latestProjectId: string | null
  projectFiles: FileRef[]
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

function previewText(raw: string): string {
  const { text, files } = parseContent(raw)
  if (text) return text
  if (files.length) return `📎 ${files.length} file${files.length > 1 ? 's' : ''}`
  return ''
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Awaiting review',
  approved: 'Approved',
  changes_requested: 'Changes requested',
}

/* ── Emoji picker data ──────────────────────────────────── */
const EMOJI_GROUPS = [
  { label: 'Smileys',  emojis: ['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','😎','🤩','🥳','😏','😒','🙄','😤','😠','😡','🤬','😔','😟','😕','☹️','😣','😖','😫','😩','😢','😭','😤'] },
  { label: 'Gestures', emojis: ['👍','👎','👌','🤌','✌️','🤞','🤟','🤙','👈','👉','👆','👇','☝️','👋','🤚','🖐','✋','🖖','🤜','🤛','👏','🙌','🙏','🤝','💪','🦾','🤲'] },
  { label: 'Objects',  emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','💕','💞','💓','💗','💖','💘','💝','✨','🔥','⭐','🌟','💫','🎉','🎊','👀','💯','✅','❌','⚡','🚀'] },
]

/* ── Utilities ──────────────────────────────────────────── */
function formatConvTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  if (date.toDateString() === now.toDateString())
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const yesterday = new Date(now.getTime() - 86_400_000)
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86_400_000)
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' })
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function formatDateSep(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  if (date.toDateString() === now.toDateString()) return 'Today'
  const yesterday = new Date(now.getTime() - 86_400_000)
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })
}

function buildConversations(rawClients: RawClient[]): Conversation[] {
  return rawClients
    .filter(c => (c.projects ?? []).length > 0)
    .map(c => {
      const messages: MessageRow[] = []
      let latestProject: RawProject | null = null

      for (const p of c.projects ?? []) {
        for (const m of p.messages ?? []) messages.push({ ...m, project_id: p.id })
        if (p.status !== 'done') latestProject = p
      }

      messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

      return {
        client: { id: c.id, name: c.name, email: c.email, portal_slug: c.portal_slug },
        messages,
        unreadCount: messages.filter(m => m.sender_type === 'client' && !m.read_at).length,
        latestProjectId: latestProject?.id ?? null,
        projectFiles: (latestProject?.files ?? []).map(f => ({
          id: f.id,
          name: f.filename,
          status: f.status,
        })),
      }
    })
    .sort((a, b) => {
      const aT = a.messages.at(-1)?.created_at ?? ''
      const bT = b.messages.at(-1)?.created_at ?? ''
      return bT.localeCompare(aT)
    })
}

/* ── Root component ─────────────────────────────────────── */
interface ChatsViewProps {
  rawClients: RawClient[]
  initialClientId?: string | null
}

export function ChatsView({ rawClients, initialClientId }: ChatsViewProps) {
  const [conversations, setConversations] = useState<Conversation[]>(() => buildConversations(rawClients))
  const [activeId, setActiveId]           = useState<string | null>(initialClientId ?? null)
  const [draft, setDraft]                 = useState('')
  const [attachedFiles, setAttachedFiles] = useState<FileRef[]>([])
  const [sending, setSending]             = useState(false)
  const [search, setSearch]               = useState('')

  // Refs to avoid stale closures inside the poller
  const activeIdRef      = useRef<string | null>(activeId)
  const conversationsRef = useRef<Conversation[]>(conversations)
  const lastTsRef        = useRef<string | null>(null)

  useEffect(() => { activeIdRef.current = activeId }, [activeId])
  useEffect(() => { conversationsRef.current = conversations }, [conversations])

  // Reset last-timestamp when switching active conversation
  useEffect(() => {
    const conv = conversations.find(c => c.client.id === activeId)
    const last = conv?.messages.filter(m => !m.id.startsWith('temp-')).at(-1)
    lastTsRef.current = last?.created_at ?? null
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId])

  // Keep last-timestamp up to date as new messages arrive
  useEffect(() => {
    const conv = conversations.find(c => c.client.id === activeId)
    const last = conv?.messages.filter(m => !m.id.startsWith('temp-')).at(-1)
    if (last?.created_at && (!lastTsRef.current || last.created_at > lastTsRef.current)) {
      lastTsRef.current = last.created_at
    }
  }, [conversations, activeId])

  // Poll for new messages every 3 seconds on the active conversation
  useEffect(() => {
    const timer = setInterval(async () => {
      const id = activeIdRef.current
      if (!id) return
      const conv = conversationsRef.current.find(c => c.client.id === id)
      const projectId = conv?.latestProjectId
      if (!projectId) return

      const since = lastTsRef.current
      const url = since
        ? `/api/projects/${projectId}/messages?since=${encodeURIComponent(since)}`
        : `/api/projects/${projectId}/messages`

      try {
        const res = await fetch(url)
        if (!res.ok) return
        const data: (MessageRow & { profiles?: unknown })[] = await res.json()
        if (!Array.isArray(data) || !data.length) return

        setConversations(prev =>
          prev.map(c => {
            if (c.client.id !== id) return c
            const existingIds = new Set(c.messages.map(m => m.id))
            const fresh = data.filter(m => !existingIds.has(m.id) && !m.id.startsWith('temp-'))
            if (!fresh.length) return c
            const now = new Date().toISOString()
            return {
              ...c,
              messages: [
                ...c.messages,
                ...fresh.map(m => ({
                  id: m.id, content: m.content, sender_type: m.sender_type,
                  read_at: m.sender_type === 'client' ? now : m.read_at,
                  created_at: m.created_at, project_id: m.project_id,
                })),
              ],
            }
          })
        )
      } catch {}
    }, 3000)
    return () => clearInterval(timer)
  }, []) // empty — poller uses refs only

  // Mark initial conversation as read on mount
  useEffect(() => {
    if (!initialClientId) return
    const conv = conversations.find(c => c.client.id === initialClientId)
    if (!conv) return
    const unreadIds = conv.messages.filter(m => m.sender_type === 'client' && !m.read_at).map(m => m.id)
    if (!unreadIds.length) return
    const now = new Date().toISOString()
    setConversations(prev =>
      prev.map(c => c.client.id === initialClientId
        ? { ...c, unreadCount: 0, messages: c.messages.map(m => unreadIds.includes(m.id) ? { ...m, read_at: now } : m) }
        : c,
      ),
    )
    const supabase = createClient()
    supabase.from('messages').update({ read_at: now }).in('id', unreadIds).then(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    if (!search) return conversations
    const q = search.toLowerCase()
    return conversations.filter(c =>
      c.client.name.toLowerCase().includes(q) ||
      (c.client.email ?? '').toLowerCase().includes(q),
    )
  }, [conversations, search])

  const activeConv = useMemo(
    () => conversations.find(c => c.client.id === activeId) ?? null,
    [conversations, activeId],
  )

  const openConversation = useCallback((clientId: string) => {
    setActiveId(clientId)
    setAttachedFiles([])
    setConversations(prev => {
      const conv = prev.find(c => c.client.id === clientId)
      if (!conv) return prev
      const unreadIds = conv.messages.filter(m => m.sender_type === 'client' && !m.read_at).map(m => m.id)
      if (!unreadIds.length) return prev
      const now = new Date().toISOString()
      const supabase = createClient()
      supabase.from('messages').update({ read_at: now }).in('id', unreadIds).then(() => {})
      return prev.map(c =>
        c.client.id === clientId
          ? { ...c, unreadCount: 0, messages: c.messages.map(m => unreadIds.includes(m.id) ? { ...m, read_at: now } : m) }
          : c,
      )
    })
  }, [])

  const sendMessage = useCallback(async () => {
    const text = draft.trim()
    if ((!text && attachedFiles.length === 0) || !activeId || !activeConv?.latestProjectId || sending) return

    const content = attachedFiles.length > 0
      ? JSON.stringify({ text, files: attachedFiles })
      : text

    const tempId = `temp-${Date.now()}`
    const newMsg: MessageRow = {
      id: tempId,
      content,
      sender_type: 'freelancer',
      read_at: null,
      created_at: new Date().toISOString(),
      project_id: activeConv.latestProjectId,
    }

    setDraft('')
    setAttachedFiles([])
    setConversations(prev =>
      prev.map(c => c.client.id === activeId ? { ...c, messages: [...c.messages, newMsg] } : c),
    )

    setSending(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('messages')
      .insert({ project_id: activeConv.latestProjectId, sender_type: 'freelancer', content })
      .select()
      .single()
    setSending(false)

    if (error) {
      toast.error('Failed to send message')
      setConversations(prev =>
        prev.map(c => c.client.id === activeId ? { ...c, messages: c.messages.filter(m => m.id !== tempId) } : c),
      )
      setDraft(text)
      return
    }

    setConversations(prev =>
      prev.map(c =>
        c.client.id === activeId
          ? { ...c, messages: c.messages.map(m => m.id === tempId ? { ...data, project_id: data.project_id } : m) }
          : c,
      ),
    )
  }, [draft, attachedFiles, activeId, activeConv?.latestProjectId, sending])

  return (
    <div
      className="flex overflow-hidden border-t border-outline-variant/10"
      style={{ height: 'calc(100dvh - 56px)' }}
    >
      {/* ══ LEFT: Conversation list ══════════════════════ */}
      <div className={cn(
        'shrink-0 flex flex-col border-r border-outline-variant/15 bg-white',
        'w-full md:w-80',
        activeId ? 'hidden md:flex' : 'flex',
      )}>
        <div className="h-14 flex items-center px-5 shrink-0 border-b border-outline-variant/10">
          <h2 className="text-[17px] font-bold text-on-surface tracking-tight flex-1">Messages</h2>
          {conversations.length > 0 && (
            <span className="text-[11px] text-on-surface-variant/45 font-medium">
              {conversations.length} client{conversations.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="px-3 py-2.5 shrink-0" style={{ background: '#f0f2f5' }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-on-surface-variant/40 pointer-events-none" />
            <input
              type="text"
              placeholder="Search conversations"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-8 pl-9 pr-3 rounded-lg bg-white text-sm focus:outline-none focus:ring-1 focus:ring-ds-secondary/30 placeholder:text-on-surface-variant/40"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 && search ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <p className="text-sm font-medium text-on-surface-variant">No results found</p>
              <p className="text-xs text-on-surface-variant/55 mt-1">Try a different name or email</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-3">
              <MessageSquare className="size-10 text-on-surface-variant/20" />
              <div>
                <p className="text-sm font-semibold text-on-surface-variant">No messages yet</p>
                <p className="text-xs text-on-surface-variant/55 mt-1 leading-relaxed">
                  Clients can message you through their portals. Add clients with projects to get started.
                </p>
              </div>
            </div>
          ) : (
            filtered.map(conv => (
              <ConvItem
                key={conv.client.id}
                conv={conv}
                isActive={activeId === conv.client.id}
                onClick={openConversation}
              />
            ))
          )}
        </div>
      </div>

      {/* ══ RIGHT: Chat pane ═════════════════════════════ */}
      <div className={cn('flex-1 min-w-0 overflow-hidden', activeConv ? 'flex flex-col' : 'hidden md:flex')}>
        {activeConv ? (
          <ChatPane
            conv={activeConv}
            draft={draft}
            sending={sending}
            attachedFiles={attachedFiles}
            onDraftChange={setDraft}
            onAttachedFilesChange={setAttachedFiles}
            onSend={sendMessage}
            onBack={() => setActiveId(null)}
          />
        ) : (
          <EmptyPane hasConvs={conversations.length > 0} />
        )}
      </div>
    </div>
  )
}

/* ══ CONVERSATION ITEM ═══════════════════════════════════ */
const ConvItem = memo(function ConvItem({
  conv, isActive, onClick,
}: { conv: Conversation; isActive: boolean; onClick: (id: string) => void }) {
  const accent  = clientAccent(conv.client.name)
  const lastMsg = conv.messages.at(-1)

  return (
    <button
      onClick={() => onClick(conv.client.id)}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3.5 text-left border-b border-outline-variant/8 transition-colors',
        isActive ? 'bg-[#f0f2f5]' : 'hover:bg-[#f5f6f6]',
      )}
    >
      <div
        className="size-11 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 select-none"
        style={{ background: accent }}
      >
        {getInitials(conv.client.name)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <p className={cn('text-[15px] truncate', conv.unreadCount > 0 ? 'font-semibold text-on-surface' : 'font-medium text-on-surface/85')}>
            {conv.client.name}
          </p>
          {lastMsg && (
            <p className={cn('text-[11px] shrink-0', conv.unreadCount > 0 ? 'text-ds-secondary font-semibold' : 'text-on-surface-variant/45')}>
              {formatConvTime(lastMsg.created_at)}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className={cn('text-[13px] truncate', conv.unreadCount > 0 ? 'text-on-surface font-medium' : 'text-on-surface-variant/55')}>
            {lastMsg
              ? (lastMsg.sender_type === 'freelancer' ? 'You: ' : '') + previewText(lastMsg.content)
              : <span className="italic text-[12px] text-on-surface-variant/35">No messages yet</span>}
          </p>
          {conv.unreadCount > 0 && (
            <span className="shrink-0 min-w-5 h-5 rounded-full bg-ds-secondary text-white text-[10px] font-bold flex items-center justify-center px-1">
              {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  )
})

/* ══ CHAT PANE ═══════════════════════════════════════════ */
const ChatPane = memo(function ChatPane({
  conv, draft, sending, attachedFiles, onDraftChange, onAttachedFilesChange, onSend, onBack,
}: {
  conv: Conversation
  draft: string
  sending: boolean
  attachedFiles: FileRef[]
  onDraftChange: (s: string) => void
  onAttachedFilesChange: (files: FileRef[]) => void
  onSend: () => void
  onBack?: () => void
}) {
  const accent = clientAccent(conv.client.name)

  return (
    <div className="flex flex-col overflow-hidden h-full">
      <div className="h-14 flex items-center gap-3 px-4 sm:px-5 bg-white border-b border-outline-variant/10 shrink-0">
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden size-8 rounded-md flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors shrink-0 -ml-1"
          >
            <ArrowLeft className="size-4.5" />
          </button>
        )}
        <div
          className="size-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 select-none"
          style={{ background: accent }}
        >
          {getInitials(conv.client.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-on-surface leading-tight">{conv.client.name}</p>
          <p className="text-[11px] text-on-surface-variant/50">{conv.client.email ?? 'Client'}</p>
        </div>
        <Link
          href={`/dashboard/clients/${conv.client.id}`}
          className="h-8 px-3 rounded-md bg-ds-secondary/8 hover:bg-ds-secondary/15 text-[12px] font-semibold text-ds-secondary flex items-center gap-1.5 transition-colors shrink-0"
        >
          <span className="hidden sm:inline">Open portal</span>
          <ArrowRight className="size-3" />
        </Link>
      </div>

      <MessageArea conv={conv} />

      <InputBar
        draft={draft}
        sending={sending}
        canSend={!!conv.latestProjectId}
        attachedFiles={attachedFiles}
        projectFiles={conv.projectFiles}
        onChange={onDraftChange}
        onAttachedFilesChange={onAttachedFilesChange}
        onSend={onSend}
      />
    </div>
  )
})

/* ══ MESSAGE AREA ════════════════════════════════════════ */
const MessageArea = memo(function MessageArea({ conv }: { conv: Conversation }) {
  const scrollRef   = useRef<HTMLDivElement>(null)
  const clientIdRef = useRef(conv.client.id)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const switched = clientIdRef.current !== conv.client.id
    clientIdRef.current = conv.client.id
    if (switched) {
      el.scrollTop = el.scrollHeight
    } else {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    }
  }, [conv.messages.length, conv.client.id])

  const grouped = useMemo(() => {
    const out: { sep?: string; msg: MessageRow }[] = []
    let lastDay = ''
    for (const msg of conv.messages) {
      const day = new Date(msg.created_at).toDateString()
      if (day !== lastDay) {
        out.push({ sep: formatDateSep(msg.created_at), msg })
        lastDay = day
      } else {
        out.push({ msg })
      }
    }
    return out
  }, [conv.messages])

  if (conv.messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8" style={{ background: '#efeae2' }}>
        <div className="size-20 rounded-full bg-white/60 shadow-sm flex items-center justify-center mb-5">
          <MessageSquare className="size-9 text-on-surface-variant/25" strokeWidth={1.25} />
        </div>
        <p className="text-base font-semibold text-on-surface/60">No messages yet</p>
        <p className="text-sm text-on-surface-variant/50 mt-1.5 max-w-xs leading-relaxed">
          {conv.latestProjectId
            ? 'Send a message below to start the conversation'
            : 'Create a project first to enable messaging with this client'}
        </p>
      </div>
    )
  }

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 sm:px-6 py-5"
      style={{ background: '#efeae2' }}
    >
      <div className="flex flex-col gap-0.5 max-w-4xl mx-auto w-full">
        {grouped.map(({ sep, msg }) => (
          <div key={msg.id}>
            {sep && (
              <div className="flex items-center justify-center my-5">
                <span className="bg-white/70 backdrop-blur-sm text-on-surface-variant/65 text-[11px] font-medium px-3 py-1 rounded-full shadow-sm">
                  {sep}
                </span>
              </div>
            )}
            <Bubble msg={msg} />
          </div>
        ))}
      </div>
    </div>
  )
})

/* ── File chip inside a bubble ────────────────────────── */
function BubbleFileChip({ file, isMe }: { file: FileRef; isMe: boolean }) {
  async function download() {
    const res = await fetch(`/api/files/${file.id}`)
    if (!res.ok) { toast.error('Download failed'); return }
    const { download_url } = await res.json()
    window.open(download_url, '_blank')
  }
  const label = STATUS_LABELS[file.status] ?? file.status

  return (
    <button
      onClick={download}
      title="Download file"
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-opacity hover:opacity-80',
        isMe ? 'bg-black/10' : 'bg-black/5',
      )}
    >
      <Paperclip className="size-3 shrink-0" />
      <span className="truncate max-w-[140px]">{file.name}</span>
      <span className="shrink-0 opacity-60">· {label}</span>
      <Download className="size-3 shrink-0 opacity-60" />
    </button>
  )
}

/* ══ MESSAGE BUBBLE ══════════════════════════════════════ */
const Bubble = memo(function Bubble({ msg }: { msg: MessageRow }) {
  const isMe   = msg.sender_type === 'freelancer'
  const isTemp = msg.id.startsWith('temp-')
  const time   = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const { text, files } = parseContent(msg.content)

  const bubbleContent = (
    <>
      {text && <p className="text-[14px] text-on-surface leading-relaxed whitespace-pre-wrap break-words">{text}</p>}
      {files.length > 0 && (
        <div className={cn('flex flex-wrap gap-1', text ? 'mt-2' : '')}>
          {files.map(f => <BubbleFileChip key={f.id} file={f} isMe={isMe} />)}
        </div>
      )}
    </>
  )

  if (isMe) {
    return (
      <div className="flex justify-end mb-0.5 mt-0.5">
        <div className="max-w-[75%] sm:max-w-[65%]">
          <div className="bg-[#d9fdd3] rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-sm">
            {bubbleContent}
          </div>
          <div className="flex items-center justify-end gap-1 mt-1 pr-1">
            <span className="text-[10px] text-on-surface-variant/50">{time}</span>
            {isTemp
              ? <Check className="size-3 text-on-surface-variant/30" />
              : <CheckCheck className="size-3.5 text-ds-secondary/70" />}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start mb-0.5 mt-0.5">
      <div className="max-w-[75%] sm:max-w-[65%]">
        <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm">
          {bubbleContent}
        </div>
        <div className="flex items-center gap-1 mt-1 pl-1">
          <span className="text-[10px] text-on-surface-variant/50">{time}</span>
        </div>
      </div>
    </div>
  )
})

/* ══ INPUT BAR ═══════════════════════════════════════════ */
function InputBar({
  draft, sending, canSend, attachedFiles, projectFiles, onChange, onAttachedFilesChange, onSend,
}: {
  draft: string
  sending: boolean
  canSend: boolean
  attachedFiles: FileRef[]
  projectFiles: FileRef[]
  onChange: (s: string) => void
  onAttachedFilesChange: (files: FileRef[]) => void
  onSend: () => void
}) {
  const ref          = useRef<HTMLTextAreaElement>(null)
  const pickerRef    = useRef<HTMLDivElement>(null)
  const emojiRef     = useRef<HTMLDivElement>(null)
  const [showEmoji, setShowEmoji]     = useState(false)
  const [showFiles, setShowFiles]     = useState(false)

  // Close pickers on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowEmoji(false)
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) setShowFiles(false)
    }
    if (showEmoji || showFiles) document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [showEmoji, showFiles])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
    onChange(e.target.value)
  }, [onChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
      if (ref.current) ref.current.style.height = 'auto'
    }
  }, [onSend])

  function insertEmoji(emoji: string) {
    const ta = ref.current
    if (!ta) {
      onChange(draft + emoji)
      return
    }
    const start = ta.selectionStart ?? draft.length
    const end   = ta.selectionEnd   ?? draft.length
    const next  = draft.slice(0, start) + emoji + draft.slice(end)
    onChange(next)
    requestAnimationFrame(() => {
      const pos = start + emoji.length
      ta.focus()
      ta.setSelectionRange(pos, pos)
    })
    setShowEmoji(false)
  }

  function toggleFile(file: FileRef) {
    const already = attachedFiles.some(f => f.id === file.id)
    if (already) {
      onAttachedFilesChange(attachedFiles.filter(f => f.id !== file.id))
    } else {
      onAttachedFilesChange([...attachedFiles, file])
    }
  }

  const canSendMsg = (draft.trim() || attachedFiles.length > 0) && canSend

  return (
    <div
      className="px-3 sm:px-4 py-3 flex flex-col gap-2 shrink-0 border-t border-black/5 relative"
      style={{ background: '#f0f2f5' }}
    >
      {/* Attached file chips */}
      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pb-1">
          {attachedFiles.map(f => (
            <span
              key={f.id}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ds-secondary/10 text-ds-secondary text-[12px] font-medium"
            >
              <Paperclip className="size-3" />
              <span className="truncate max-w-[120px]">{f.name}</span>
              <button
                type="button"
                onClick={() => toggleFile(f)}
                className="ml-0.5 hover:text-red-500 transition-colors"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Emoji picker popup */}
      {showEmoji && (
        <div
          ref={pickerRef}
          className="absolute bottom-full left-3 sm:left-4 mb-2 w-72 bg-white rounded-xl shadow-xl border border-outline-variant/20 overflow-hidden z-40"
        >
          {EMOJI_GROUPS.map(group => (
            <div key={group.label} className="px-3 pt-3 pb-2">
              <p className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest mb-2">
                {group.label}
              </p>
              <div className="grid grid-cols-10 gap-0.5">
                {group.emojis.map((e, i) => (
                  <button
                    key={`${group.label}-${i}`}
                    onClick={() => insertEmoji(e)}
                    className="text-[18px] w-7 h-7 flex items-center justify-center rounded-md hover:bg-surface-container transition-colors"
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File picker popup */}
      {showFiles && projectFiles.length > 0 && (
        <div
          ref={emojiRef}
          className="absolute bottom-full left-12 sm:left-14 mb-2 w-80 bg-white rounded-xl shadow-xl border border-outline-variant/20 overflow-hidden z-40"
        >
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-[12px] font-bold text-on-surface-variant">Reference project files</p>
          </div>
          <div className="max-h-56 overflow-y-auto">
            {projectFiles.map(f => {
              const selected = attachedFiles.some(a => a.id === f.id)
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => toggleFile(f)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors border-b border-slate-50',
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
          {attachedFiles.length > 0 && (
            <div className="px-4 py-2.5 bg-ds-secondary/5 border-t border-ds-secondary/10">
              <p className="text-[12px] text-ds-secondary font-semibold">
                {attachedFiles.length} file{attachedFiles.length > 1 ? 's' : ''} selected
              </p>
            </div>
          )}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2 sm:gap-3">
        {/* Emoji toggle */}
        <button
          type="button"
          onClick={() => { setShowEmoji(p => !p); setShowFiles(false) }}
          className={cn(
            'size-9 shrink-0 rounded-full flex items-center justify-center transition-colors mb-px',
            showEmoji ? 'text-ds-secondary bg-ds-secondary/10' : 'text-on-surface-variant/45 hover:text-on-surface-variant hover:bg-black/5',
          )}
        >
          <SmilePlus className="size-[22px]" />
        </button>

        {/* File attachment toggle */}
        {projectFiles.length > 0 && (
          <button
            type="button"
            onClick={() => { setShowFiles(p => !p); setShowEmoji(false) }}
            className={cn(
              'size-9 shrink-0 rounded-full flex items-center justify-center transition-colors mb-px',
              showFiles || attachedFiles.length > 0
                ? 'text-ds-secondary bg-ds-secondary/10'
                : 'text-on-surface-variant/45 hover:text-on-surface-variant hover:bg-black/5',
            )}
          >
            <Paperclip className="size-[20px]" />
          </button>
        )}

        {/* Text area */}
        <div className="flex-1 min-w-0 bg-white rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden">
          {canSend ? (
            <textarea
              ref={ref}
              rows={1}
              value={draft}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={attachedFiles.length > 0 ? 'Add a message (optional)…' : 'Type a message'}
              className="w-full px-4 py-2.5 text-[14px] text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none bg-transparent resize-none overflow-y-auto"
              style={{ minHeight: 40, maxHeight: 120 }}
            />
          ) : (
            <p className="px-4 py-2.5 text-[13px] text-on-surface-variant/50 italic">
              All projects completed — create a new project to continue chatting
            </p>
          )}
        </div>

        {/* Send */}
        <button
          type="button"
          onClick={onSend}
          disabled={!canSendMsg || sending}
          className={cn(
            'size-9 shrink-0 rounded-full flex items-center justify-center transition-all mb-px',
            canSendMsg
              ? 'bg-ds-secondary text-white hover:bg-ds-secondary/90 shadow-sm'
              : 'bg-on-surface-variant/15 text-on-surface-variant/30 cursor-not-allowed',
          )}
        >
          <Send className="size-[18px] translate-x-px" />
        </button>
      </div>
    </div>
  )
}

/* ══ EMPTY PANE ══════════════════════════════════════════ */
function EmptyPane({ hasConvs }: { hasConvs: boolean }) {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center text-center px-8"
      style={{ background: '#efeae2' }}
    >
      <div className="size-32 rounded-full bg-white/50 shadow-sm flex items-center justify-center mb-6">
        <MessageSquare className="size-16 text-on-surface-variant/15" strokeWidth={1} />
      </div>
      <h3 className="text-[20px] font-semibold text-on-surface/50">
        {hasConvs ? 'Select a conversation' : 'No messages yet'}
      </h3>
      <p className="text-[14px] text-on-surface-variant/45 mt-2.5 max-w-72 leading-relaxed">
        {hasConvs
          ? 'Pick a client from the list to read and reply to their messages'
          : 'Conversations appear here once your clients send messages through their portals'}
      </p>
    </div>
  )
}

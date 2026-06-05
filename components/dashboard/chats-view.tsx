'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/format'
import {
  Search, Send, MessageSquare, ArrowRight,
  SmilePlus, Check, CheckCheck,
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

type RawProject = {
  id: string
  title: string
  status: string
  messages: RawMessage[]
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
}

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
      let latestProjectId: string | null = null

      for (const p of c.projects ?? []) {
        for (const m of p.messages ?? []) messages.push({ ...m, project_id: p.id })
        if (p.status !== 'done') latestProjectId = p.id
      }

      messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

      return {
        client: { id: c.id, name: c.name, email: c.email, portal_slug: c.portal_slug },
        messages,
        unreadCount: messages.filter(m => m.sender_type === 'client' && !m.read_at).length,
        latestProjectId,
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
}

export function ChatsView({ rawClients }: ChatsViewProps) {
  const [conversations, setConversations] = useState<Conversation[]>(() => buildConversations(rawClients))
  const [activeId, setActiveId]           = useState<string | null>(null)
  const [draft, setDraft]                 = useState('')
  const [sending, setSending]             = useState(false)
  const [search, setSearch]               = useState('')

  const filtered = useMemo(() => {
    if (!search) return conversations
    const q = search.toLowerCase()
    return conversations.filter(c =>
      c.client.name.toLowerCase().includes(q) ||
      (c.client.email ?? '').toLowerCase().includes(q),
    )
  }, [conversations, search])

  const activeConv = conversations.find(c => c.client.id === activeId) ?? null

  async function openConversation(clientId: string) {
    setActiveId(clientId)
    const conv = conversations.find(c => c.client.id === clientId)
    if (!conv) return

    const unreadIds = conv.messages
      .filter(m => m.sender_type === 'client' && !m.read_at)
      .map(m => m.id)
    if (unreadIds.length === 0) return

    const now = new Date().toISOString()
    setConversations(prev =>
      prev.map(c =>
        c.client.id === clientId
          ? { ...c, unreadCount: 0, messages: c.messages.map(m => unreadIds.includes(m.id) ? { ...m, read_at: now } : m) }
          : c,
      ),
    )
    const supabase = createClient()
    await supabase.from('messages').update({ read_at: now }).in('id', unreadIds)
  }

  async function sendMessage() {
    const text = draft.trim()
    if (!text || !activeId || !activeConv?.latestProjectId || sending) return

    const tempId = `temp-${Date.now()}`
    const newMsg: MessageRow = {
      id: tempId,
      content: text,
      sender_type: 'freelancer',
      read_at: null,
      created_at: new Date().toISOString(),
      project_id: activeConv.latestProjectId,
    }

    setDraft('')
    setConversations(prev =>
      prev.map(c =>
        c.client.id === activeId ? { ...c, messages: [...c.messages, newMsg] } : c,
      ),
    )

    setSending(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('messages')
      .insert({ project_id: activeConv.latestProjectId, sender_type: 'freelancer', content: text })
      .select()
      .single()
    setSending(false)

    if (error) {
      toast.error('Failed to send message')
      setConversations(prev =>
        prev.map(c =>
          c.client.id === activeId ? { ...c, messages: c.messages.filter(m => m.id !== tempId) } : c,
        ),
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
  }

  return (
    <div style={{ height: 'calc(100vh - 56px)' }} className="flex overflow-hidden border-t border-outline-variant/10">

      {/* ══ LEFT: Conversation list ══════════════════════ */}
      <div className="w-[360px] shrink-0 flex flex-col border-r border-outline-variant/15 bg-white">

        {/* Header */}
        <div className="h-14 flex items-center px-5 shrink-0 border-b border-outline-variant/10">
          <h2 className="text-[17px] font-bold text-on-surface tracking-tight flex-1">Chats</h2>
          {conversations.length > 0 && (
            <span className="text-[11px] text-on-surface-variant/45 font-medium">
              {conversations.length} client{conversations.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Search */}
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

        {/* List */}
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
                <p className="text-sm font-semibold text-on-surface-variant">No conversations yet</p>
                <p className="text-xs text-on-surface-variant/55 mt-1 leading-relaxed">
                  Clients can send messages through their portals. Add clients with projects to get started.
                </p>
              </div>
            </div>
          ) : (
            filtered.map(conv => (
              <ConvItem
                key={conv.client.id}
                conv={conv}
                isActive={activeId === conv.client.id}
                onClick={() => openConversation(conv.client.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* ══ RIGHT: Chat pane ═════════════════════════════ */}
      {activeConv ? (
        <ChatPane
          conv={activeConv}
          draft={draft}
          sending={sending}
          onDraftChange={setDraft}
          onSend={sendMessage}
        />
      ) : (
        <EmptyPane hasConvs={conversations.length > 0} />
      )}
    </div>
  )
}

/* ══ CONVERSATION ITEM ═══════════════════════════════════ */
function ConvItem({
  conv, isActive, onClick,
}: { conv: Conversation; isActive: boolean; onClick: () => void }) {
  const accent  = clientAccent(conv.client.name)
  const lastMsg = conv.messages.at(-1)

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3.5 text-left border-b border-outline-variant/8 transition-colors',
        isActive ? 'bg-[#f0f2f5]' : 'hover:bg-[#f5f6f6]',
      )}
    >
      {/* Avatar */}
      <div
        className="size-11 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 select-none"
        style={{ background: accent }}
      >
        {getInitials(conv.client.name)}
      </div>

      {/* Info */}
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
              ? (lastMsg.sender_type === 'freelancer' ? 'You: ' : '') + lastMsg.content
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
}

/* ══ CHAT PANE ═══════════════════════════════════════════ */
function ChatPane({
  conv, draft, sending, onDraftChange, onSend,
}: {
  conv: Conversation
  draft: string
  sending: boolean
  onDraftChange: (s: string) => void
  onSend: () => void
}) {
  const accent = clientAccent(conv.client.name)

  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* Header */}
      <div className="h-14 flex items-center gap-3 px-5 bg-white border-b border-outline-variant/10 shrink-0">
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
          Open portal <ArrowRight className="size-3" />
        </Link>
      </div>

      {/* Messages */}
      <MessageArea conv={conv} />

      {/* Input */}
      <InputBar
        draft={draft}
        sending={sending}
        canSend={!!conv.latestProjectId}
        onChange={onDraftChange}
        onSend={onSend}
      />
    </div>
  )
}

/* ══ MESSAGE AREA ════════════════════════════════════════ */
function MessageArea({ conv }: { conv: Conversation }) {
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
      className="flex-1 overflow-y-auto px-6 py-5"
      style={{ background: '#efeae2' }}
    >
      <div className="flex flex-col gap-0.5 max-w-3xl mx-auto">
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
}

/* ══ MESSAGE BUBBLE ══════════════════════════════════════ */
function Bubble({ msg }: { msg: MessageRow }) {
  const isMe    = msg.sender_type === 'freelancer'
  const isTemp  = msg.id.startsWith('temp-')
  const time    = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  if (isMe) {
    return (
      <div className="flex justify-end mb-0.5 mt-0.5">
        <div className="max-w-[65%]">
          <div className="bg-[#d9fdd3] rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-sm">
            <p className="text-[14px] text-on-surface leading-relaxed whitespace-pre-wrap break-words">
              {msg.content}
            </p>
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
      <div className="max-w-[65%]">
        <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm">
          <p className="text-[14px] text-on-surface leading-relaxed whitespace-pre-wrap break-words">
            {msg.content}
          </p>
        </div>
        <div className="flex items-center gap-1 mt-1 pl-1">
          <span className="text-[10px] text-on-surface-variant/50">{time}</span>
        </div>
      </div>
    </div>
  )
}

/* ══ INPUT BAR ═══════════════════════════════════════════ */
function InputBar({
  draft, sending, canSend, onChange, onSend,
}: {
  draft: string
  sending: boolean
  canSend: boolean
  onChange: (s: string) => void
  onSend: () => void
}) {
  const ref = useRef<HTMLTextAreaElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
    onChange(e.target.value)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
      if (ref.current) ref.current.style.height = 'auto'
    }
  }

  return (
    <div
      className="px-4 py-3 flex items-end gap-3 shrink-0 border-t border-black/5"
      style={{ background: '#f0f2f5' }}
    >
      {/* Emoji (decorative) */}
      <button
        type="button"
        className="size-9 shrink-0 rounded-full flex items-center justify-center text-on-surface-variant/45 hover:text-on-surface-variant hover:bg-black/5 transition-colors mb-px"
      >
        <SmilePlus className="size-[22px]" />
      </button>

      {/* Text area */}
      <div className="flex-1 bg-white rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden">
        {canSend ? (
          <textarea
            ref={ref}
            rows={1}
            value={draft}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message"
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
        disabled={!draft.trim() || !canSend || sending}
        className={cn(
          'size-9 shrink-0 rounded-full flex items-center justify-center transition-all mb-px',
          draft.trim() && canSend
            ? 'bg-ds-secondary text-white hover:bg-ds-secondary/90 shadow-sm'
            : 'bg-on-surface-variant/15 text-on-surface-variant/30 cursor-not-allowed',
        )}
      >
        <Send className="size-[18px] translate-x-px" />
      </button>
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
        {hasConvs ? 'Select a conversation' : 'No chats yet'}
      </h3>
      <p className="text-[14px] text-on-surface-variant/45 mt-2.5 max-w-72 leading-relaxed">
        {hasConvs
          ? 'Pick a client from the list to read and reply to their messages'
          : 'Conversations appear here once your clients send messages through their portals'}
      </p>
    </div>
  )
}

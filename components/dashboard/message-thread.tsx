'use client'

import { useState, useEffect, useRef, useTransition, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeTime, getInitials } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { EmptyState } from './empty-state'
import { MessageSquare, Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface MessageRecord {
  id: string
  project_id: string
  sender_type: string
  sender_id: string | null
  content: string
  read_at: string | null
  created_at: string
  profiles?: { id: string; full_name: string | null; avatar_url: string | null } | null
}

interface Project {
  id: string
  title: string
  messages: MessageRecord[]
}

interface MessageThreadProps {
  clientId: string
  clientName: string
  projects: Project[]
  currentUser: { id: string; name: string; avatar?: string | null }
  senderType: 'freelancer' | 'client'
}

export function MessageThread({ clientId, clientName, projects, currentUser, senderType }: MessageThreadProps) {
  const supabase = useMemo(() => createClient(), [])
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id ?? '')
  const [messages, setMessages] = useState<MessageRecord[]>(() =>
    (projects[0]?.messages ?? []).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  )
  const [content, setContent] = useState('')
  const [isSending, startTransition] = useTransition()
  const bottomRef = useRef<HTMLDivElement>(null)

  // Switch messages when project changes
  useEffect(() => {
    const proj = projects.find(p => p.id === selectedProjectId)
    const sorted = (proj?.messages ?? []).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    setMessages(sorted)
  }, [selectedProjectId, projects])

  // Mark messages as read
  useEffect(() => {
    if (!selectedProjectId) return
    fetch(`/api/projects/${selectedProjectId}/messages`, { method: 'PATCH' }).catch(() => {})
  }, [selectedProjectId])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Supabase Realtime subscription
  useEffect(() => {
    if (!selectedProjectId) return

    const channel = supabase
      .channel(`messages:project:${selectedProjectId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `project_id=eq.${selectedProjectId}`,
      }, (payload) => {
        setMessages(prev => {
          if (prev.some(m => m.id === payload.new.id)) return prev
          return [...prev, payload.new as MessageRecord]
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [selectedProjectId, supabase])

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() || !selectedProjectId) return

    const text = content.trim()
    setContent('')

    startTransition(async () => {
      const res = await fetch(`/api/projects/${selectedProjectId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text, sender_type: senderType }),
      })
      if (!res.ok) {
        setContent(text)
        toast.error('Failed to send message')
      }
    })
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId)

  return (
    <div className="max-w-3xl flex flex-col gap-4 h-[calc(100vh-220px)] min-h-[500px]">
      {/* Project selector */}
      {projects.length > 1 && (
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium text-on-surface-variant shrink-0">Project:</p>
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-72 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {projects.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {projects.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No projects yet"
          description="Create a project first to start messaging."
        />
      ) : (
        <div className="flex-1 bg-white rounded-md border border-outline-variant flex flex-col overflow-hidden">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-on-surface-variant">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map(msg => {
                const isMe = msg.sender_type === senderType
                const senderName = isMe
                  ? currentUser.name
                  : msg.profiles?.full_name ?? clientName
                const avatar = isMe ? currentUser.avatar : msg.profiles?.avatar_url

                return (
                  <div
                    key={msg.id}
                    className={cn('flex gap-2.5 max-w-[80%]', isMe ? 'self-end flex-row-reverse' : 'self-start')}
                  >
                    <Avatar className="size-7 shrink-0 mt-0.5">
                      <AvatarImage src={avatar ?? undefined} />
                      <AvatarFallback className="text-[10px] bg-ds-secondary/10 text-ds-secondary font-bold">
                        {getInitials(senderName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn('flex flex-col gap-1', isMe ? 'items-end' : 'items-start')}>
                      <div className={cn(
                        'px-3.5 py-2.5 rounded-md text-sm leading-relaxed',
                        isMe
                          ? 'bg-ds-secondary text-white rounded-tr-sm'
                          : 'bg-surface-container text-on-surface rounded-tl-sm'
                      )}>
                        {msg.content}
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

          {/* Input area */}
          <div className="border-t border-outline-variant p-4">
            <form onSubmit={handleSend} className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <Textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend(e as unknown as React.FormEvent)
                    }
                  }}
                  placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                  rows={1}
                  maxLength={4000}
                  className="resize-none pr-4"
                />
                {content.length > 3500 && (
                  <span className="absolute bottom-2 right-3 text-[10px] text-amber-600">
                    {content.length}/4000
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={!content.trim() || isSending}
                className="size-10 rounded-md bg-ds-secondary text-white flex items-center justify-center hover:bg-ds-secondary-container transition-colors disabled:opacity-50 shrink-0"
              >
                {isSending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

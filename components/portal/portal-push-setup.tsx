'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, X } from 'lucide-react'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

export function PortalPushSetup() {
  const [show, setShow]         = useState(false)
  const [loading, setLoading]   = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) return

    navigator.serviceWorker.register('/sw.js').catch(() => {})

    if (Notification.permission === 'denied') return

    navigator.serviceWorker.ready
      .then(reg => reg.pushManager.getSubscription())
      .then(sub => {
        if (sub) {
          setSubscribed(true)
        } else if (Notification.permission === 'granted') {
          // Already granted but not subscribed — auto-subscribe silently
          autoSubscribe()
        } else {
          // Default permission — show prompt banner
          setShow(true)
        }
      })
      .catch(() => {})
  }, [])

  async function autoSubscribe() {
    try {
      const reg = await navigator.serviceWorker.ready
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ''
      if (!vapidKey) return
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })
      const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } }
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
      })
      setSubscribed(true)
    } catch {
      // silent
    }
  }

  async function handleEnable() {
    setLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') { setShow(false); return }
      await autoSubscribe()
      setShow(false)
    } catch {
      setShow(false)
    } finally {
      setLoading(false)
    }
  }

  if (!show || subscribed) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-outline-variant/20 p-4 flex items-start gap-3">
        <div className="size-9 rounded-xl bg-ds-secondary/10 flex items-center justify-center shrink-0">
          <Bell className="size-4 text-ds-secondary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-on-surface leading-tight">Get notified of new messages</p>
          <p className="text-[12px] text-on-surface-variant mt-0.5 leading-snug">
            Enable push notifications so you never miss a reply.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleEnable}
              disabled={loading}
              className="h-7 px-3 rounded-lg bg-ds-secondary text-white text-[12px] font-semibold hover:bg-ds-secondary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Enabling…' : 'Enable'}
            </button>
            <button
              onClick={() => setShow(false)}
              className="h-7 px-3 rounded-lg text-[12px] font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          onClick={() => setShow(false)}
          className="size-6 rounded-md flex items-center justify-center text-on-surface-variant/50 hover:bg-surface-container transition-colors shrink-0"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  )
}

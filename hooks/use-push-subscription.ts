'use client'

import { useState, useEffect } from 'react'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

export type PushStatus = 'unknown' | 'unsupported' | 'no-vapid' | 'denied' | 'subscribed' | 'unsubscribed'

// Broadcast push status changes to all hook instances on the same page
// (e.g. notification drawer + settings page open at the same time)
const SYNC_EVENT = 'portalkit:push-status'

function broadcast(status: PushStatus) {
  window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: status }))
}

export function usePushSubscription() {
  const [status, setStatus]   = useState<PushStatus>('unknown')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  // Detect initial state
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
      setStatus('unsupported')
      return
    }
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
      setStatus('no-vapid')
      return
    }
    if (Notification.permission === 'denied') {
      setStatus('denied')
      return
    }
    navigator.serviceWorker.getRegistration('/sw.js')
      .then(reg => reg ? reg.pushManager.getSubscription() : null)
      .then(sub => setStatus(sub ? 'subscribed' : 'unsubscribed'))
      .catch(() => setStatus('unsubscribed'))
  }, [])

  // Stay in sync when another hook instance changes state
  useEffect(() => {
    function onSync(e: Event) {
      setStatus((e as CustomEvent<PushStatus>).detail)
    }
    window.addEventListener(SYNC_EVENT, onSync)
    return () => window.removeEventListener(SYNC_EVENT, onSync)
  }, [])

  function syncStatus(s: PushStatus) {
    setStatus(s)
    broadcast(s)
  }

  async function enable() {
    setLoading(true)
    setError(null)
    try {
      // Request browser permission — shows the native dialog when permission is 'default'.
      // If already 'granted' the browser skips the dialog (this is standard browser behaviour
      // and cannot be changed — the user would need to reset site permissions manually).
      const permission = await Notification.requestPermission()
      if (permission === 'denied') { syncStatus('denied'); return }
      if (permission !== 'granted') return  // dismissed without choosing

      // Register service worker and subscribe
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      let sub: PushSubscription
      try {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Subscription failed — check VAPID configuration.')
        return
      }

      const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } }
      const res = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
      })
      if (!res.ok) {
        await sub.unsubscribe().catch(() => {})
        setError('Could not save subscription — please try again.')
        return
      }
      syncStatus('subscribed')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong — please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function disable() {
    setLoading(true)
    setError(null)
    try {
      const reg = await navigator.serviceWorker.getRegistration('/sw.js')
      const sub = reg ? await reg.pushManager.getSubscription() : null
      if (sub) {
        await fetch('/api/notifications/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
        await sub.unsubscribe()
      }
      syncStatus('unsubscribed')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable — please try again.')
    } finally {
      setLoading(false)
    }
  }

  return { status, loading, error, enable, disable }
}

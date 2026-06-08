// PortalKit Service Worker — handles Web Push notifications

self.addEventListener('push', function (event) {
  if (!event.data) return

  let payload
  try {
    payload = event.data.json()
  } catch {
    payload = { title: 'PortalKit', body: event.data.text() }
  }

  const title   = payload.title ?? 'PortalKit'
  const options = {
    body:    payload.body ?? '',
    icon:    payload.icon ?? '/icon-192.png',
    badge:   payload.badge ?? '/icon-192.png',
    tag:     payload.tag ?? 'portalkit',
    data:    payload.data ?? {},
    actions: payload.actions ?? [],
    requireInteraction: false,
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  const url = event.notification.data?.url ?? '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const c of clientList) {
        if (c.url === url && 'focus' in c) return c.focus()
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})

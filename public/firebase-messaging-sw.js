importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js")

self.addEventListener("notificationclick", function (event) {
  event.notification.close()

  const notificationData = event.notification.data || {}
  const targetUrl = notificationData.actionUrl || notificationData.url || "/"

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (windowClients) {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i]
        if ("focus" in client) {
          if (client.url.includes(targetUrl)) {
            return client.focus()
          }
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})

importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js")

// Dynamically read Firebase config from registration query parameters
// This ensures no hardcoded API keys or secrets exist in this static service worker file
const urlParams = new URLSearchParams(location.search)

const config = {
  apiKey: urlParams.get("apiKey"),
  authDomain: urlParams.get("authDomain"),
  projectId: urlParams.get("projectId"),
  storageBucket: urlParams.get("storageBucket"),
  messagingSenderId: urlParams.get("messagingSenderId"),
  appId: urlParams.get("appId"),
}

if (config.apiKey && config.projectId) {
  firebase.initializeApp(config)
}

const messaging = firebase.messaging()

messaging.onBackgroundMessage(function (payload) {
  // If the payload already contains a standard FCM "notification" object,
  // the Firebase SDK automatically displays the OS notification.
  // Only call showNotification manually for data-only payloads to prevent duplicate notifications.
  if (payload && payload.notification) {
    return
  }

  const notificationTitle =
    (payload && payload.data && payload.data.title) || "Fakebook"
  const notificationOptions = {
    body:
      (payload && payload.data && payload.data.message) ||
      "You have a new notification",
    icon: "/facebook.png",
    data: (payload && payload.data) || {},
  }

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  )
})

function resolveTargetUrl(data) {
  if (!data) return "/"
  if (data.actionUrl && data.actionUrl !== "/friends") {
    return data.actionUrl
  }
  const postId = data.postId || (data.entityType === "post" ? data.entityId : undefined)
  const commentId = data.commentId || (data.entityType === "comment" ? data.entityId : undefined)
  const parentCommentId = data.parentCommentId

  if (postId) {
    const params = new URLSearchParams()
    params.set("postId", postId)
    if (commentId) params.set("commentId", commentId)
    if (parentCommentId) params.set("parentCommentId", parentCommentId)
    return "/?" + params.toString()
  }

  if (data.entityType === "friend_request") {
    return "/friends?tab=received"
  }
  if (data.entityType === "friend_accept" && data.actorId) {
    return "/profile/" + data.actorId
  }

  return data.actionUrl || data.url || "/"
}

self.addEventListener("notificationclick", function (event) {
  event.notification.close()

  const notificationData = event.notification.data || {}
  const targetUrl = resolveTargetUrl(notificationData)

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (windowClients) {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i]
        if ("focus" in client && "navigate" in client) {
          return client.navigate(targetUrl).then(function () {
            return client.focus()
          })
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})

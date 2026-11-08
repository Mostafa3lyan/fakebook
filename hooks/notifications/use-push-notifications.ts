"use client"

import * as React from "react"
import { getToken, onMessage, type MessagePayload } from "firebase/messaging"
import { toast } from "sonner"
import { getClientMessaging, FIREBASE_VAPID_KEY } from "@/lib/firebase/config"
import { notificationService } from "@/services/notification.service"
import { useCurrentUser } from "@/hooks/user/use-current-user"

const FCM_TOKEN_STORAGE_KEY = "fakebook_fcm_token"
const FCM_TOKEN_USER_KEY = "fakebook_fcm_user_id"

// Singleton listener tracker so mounting usePushNotifications in multiple components
// (e.g., NotificationBell + NotificationsView) never registers duplicate foreground toasts
let activeForegroundUnsubscribe: (() => void) | null = null
let foregroundSubscriberCount = 0

function resolvePushTargetUrl(data?: Record<string, string>): string | undefined {
  if (!data) return undefined
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
    return `/?${params.toString()}`
  }

  if (data.entityType === "friend_request") {
    return "/friends?tab=received"
  }
  if (data.entityType === "friend_accept" && data.actorId) {
    return `/profile/${data.actorId}`
  }

  return data.actionUrl
}

const emptySubscribe = () => () => {}

export function usePushNotifications() {
  const { user } = useCurrentUser()
  const userId = user?._id

  const isMounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  const [manualPermission, setManualPermission] = React.useState<NotificationPermission | null>(null)

  const permission: NotificationPermission | "unsupported" = React.useMemo(() => {
    if (!isMounted) return "unsupported"
    if (manualPermission) return manualPermission
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported"
    }
    return Notification.permission
  }, [isMounted, manualPermission])

  const [fcmToken, setFcmToken] = React.useState<string | null>(null)

  const [isRegistering, setIsRegistering] = React.useState(false)

  // Automatically register/sync FCM token whenever an authenticated user loads the app and permission is granted
  React.useEffect(() => {
    if (!userId || permission !== "granted") return
    if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
      return
    }

    let cancelled = false

    getClientMessaging()
      .then(async (messaging) => {
        if (!messaging || cancelled) return

        const swRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
          scope: "/",
        })

        const token = await getToken(messaging, {
          vapidKey: FIREBASE_VAPID_KEY || undefined,
          serviceWorkerRegistration: swRegistration,
        })

        if (token && !cancelled) {
          setFcmToken(token)
          const lastRegisteredUser = localStorage.getItem(FCM_TOKEN_USER_KEY)
          const lastStoredToken = localStorage.getItem(FCM_TOKEN_STORAGE_KEY)

          if (lastRegisteredUser !== userId || lastStoredToken !== token) {
            await notificationService.registerFcmToken(token)
            localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token)
            localStorage.setItem(FCM_TOKEN_USER_KEY, userId)
          }
        }
      })
      .catch((err) => {
        console.warn("[FCM] Auto-sync device token failed:", err)
      })

    return () => {
      cancelled = true
    }
  }, [userId, permission])

  // Listen for foreground push messages while user is active on the site (singleton)
  React.useEffect(() => {
    foregroundSubscriberCount += 1
    let isMounted = true

    if (foregroundSubscriberCount === 1 && !activeForegroundUnsubscribe) {
      getClientMessaging().then((messaging) => {
        if (!messaging || !isMounted || foregroundSubscriberCount === 0) return

        if (!activeForegroundUnsubscribe) {
          activeForegroundUnsubscribe = onMessage(messaging, (payload: MessagePayload) => {
            const title = payload.notification?.title || "Fakebook"
            const body =
              payload.notification?.body ||
              (payload.data?.message as string | undefined) ||
              "You have a new notification"
            const actionUrl = resolvePushTargetUrl(payload.data as Record<string, string> | undefined)

            toast(title, {
              description: body,
              action: actionUrl
                ? {
                    label: "View",
                    onClick: () => {
                      window.location.href = actionUrl
                    },
                  }
                : undefined,
            })
          })
        }
      })
    }

    return () => {
      isMounted = false
      foregroundSubscriberCount = Math.max(0, foregroundSubscriberCount - 1)
      if (foregroundSubscriberCount === 0 && activeForegroundUnsubscribe) {
        activeForegroundUnsubscribe()
        activeForegroundUnsubscribe = null
      }
    }
  }, [])

  const registerDeviceToken = React.useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
      return null
    }

    try {
      setIsRegistering(true)

      const currentPermission = await Notification.requestPermission()
      setManualPermission(currentPermission)

      if (currentPermission !== "granted") {
        return null
      }

      const messaging = await getClientMessaging()
      if (!messaging) {
        return null
      }

      const swRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
        scope: "/",
      })

      const token = await getToken(messaging, {
        vapidKey: FIREBASE_VAPID_KEY || undefined,
        serviceWorkerRegistration: swRegistration,
      })

      if (token) {
        setFcmToken(token)
        localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token)
        if (userId) {
          localStorage.setItem(FCM_TOKEN_USER_KEY, userId)
        }

        // Register token with backend -> Knock channel data
        await notificationService.registerFcmToken(token).catch((err) => {
          console.warn("[FCM] Failed to register token with backend:", err)
        })
      }

      return token
    } catch (err) {
      console.warn("[FCM] Device registration failed or cancelled:", err)
      return null
    } finally {
      setIsRegistering(false)
    }
  }, [userId])

  return {
    fcmToken,
    permission,
    isRegistering,
    registerDeviceToken,
  }
}

"use client"

import * as React from "react"
import { getToken, onMessage, type MessagePayload } from "firebase/messaging"
import { toast } from "sonner"
import { getClientMessaging, FIREBASE_VAPID_KEY } from "@/lib/firebase/config"
import { notificationService } from "@/services/notification.service"

const FCM_TOKEN_STORAGE_KEY = "fakebook_fcm_token"

export function usePushNotifications() {
  const [permission, setPermission] = React.useState<NotificationPermission | "unsupported">(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported"
    }
    return Notification.permission
  })

  const [fcmToken, setFcmToken] = React.useState<string | null>(() => {
    if (typeof window === "undefined") return null
    try {
      return localStorage.getItem(FCM_TOKEN_STORAGE_KEY)
    } catch {
      return null
    }
  })

  const [isRegistering, setIsRegistering] = React.useState(false)

  // Listen for foreground push messages while user is active on the site
  React.useEffect(() => {
    let unsubscribe: (() => void) | undefined

    getClientMessaging().then((messaging) => {
      if (!messaging) return

      unsubscribe = onMessage(messaging, (payload: MessagePayload) => {
        const title = payload.notification?.title || "Fakebook"
        const body = payload.notification?.body || "You have a new notification"
        const actionUrl = payload.data?.actionUrl as string | undefined

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
    })

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  const registerDeviceToken = React.useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
      return null
    }

    try {
      setIsRegistering(true)

      const currentPermission = await Notification.requestPermission()
      setPermission(currentPermission)

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
  }, [])

  return {
    fcmToken,
    permission,
    isRegistering,
    registerDeviceToken,
  }
}

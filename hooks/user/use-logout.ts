"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { authService } from "@/services/auth.service"
import { notificationService } from "@/services/notification.service"
import { ApiError } from "@/lib/api/errors"

const FCM_TOKEN_STORAGE_KEY = "fakebook_fcm_token"
const FCM_TOKEN_USER_KEY = "fakebook_fcm_user_id"

export function useLogout() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const mutation = useMutation<void, ApiError, "current" | "all" | undefined>({
    mutationFn: async (flag = "current") => {
      // 1. Deregister FCM token from Knock channel data for this user
      const fcmToken = typeof window !== "undefined" ? localStorage.getItem(FCM_TOKEN_STORAGE_KEY) : null
      if (fcmToken) {
        await notificationService.unregisterFcmToken(fcmToken).catch(() => undefined)
        localStorage.removeItem(FCM_TOKEN_STORAGE_KEY)
        localStorage.removeItem(FCM_TOKEN_USER_KEY)
      }

      // 2. Perform backend session logout
      await authService.logout(flag)
    },
    onSuccess: (_, flag) => {
      queryClient.clear()
      toast.success(
        flag === "all" ? "Signed out from all devices" : "Signed out successfully"
      )
      router.push("/login")
      router.refresh()
    },
    onError: (err) => {
      // Even if backend fails (e.g. token expired), still redirect to login
      queryClient.clear()
      toast.error(err.message || "Signed out")
      router.push("/login")
      router.refresh()
    },
  })

  return {
    logout: mutation.mutate,
    isLoggingOut: mutation.isPending,
  }
}

"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { authService } from "@/services"
import { safeRedirectTarget } from "@/lib/utils/safe-redirect"

export function useGoogleAuth() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { isPending, error, mutate, mutateAsync, reset } = useMutation({
    mutationFn: (idToken: string) => authService.signupWithGoogle(idToken),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] })
      const isNewAccount =
        res?.status === 201 ||
        res?.message?.toLowerCase().includes("signed up")

      toast.success(
        isNewAccount
          ? "Account created with Google!"
          : "Signed in with Google!"
      )

      const callbackUrl =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("callbackUrl")
          : null
      const destination = safeRedirectTarget(callbackUrl, "/")
      router.push(destination)
      router.refresh()
    },
    onError: (err: Error) => {
      const msg = err.message?.toLowerCase() ?? ""
      if (msg.includes("invalid provider")) {
        toast.error(
          "This email is already registered with a password. Please sign in using your email and password."
        )
      } else {
        toast.error(err.message || "Google authentication failed")
      }
    },
  })

  return {
    isPending,
    error,
    authenticateWithGoogle: mutate,
    authenticateWithGoogleAsync: mutateAsync,
    resetError: reset,
  }
}

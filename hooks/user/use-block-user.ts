"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { userService } from "@/services/user.service"

export function useBlockUser() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async (targetUserId: string) => {
      return await userService.blockUser(targetUserId)
    },
    onSuccess: () => {
      toast.success("User blocked successfully")
      queryClient.invalidateQueries({ queryKey: ["friends"] })
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] })
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      queryClient.invalidateQueries({ queryKey: ["user-posts"] })
      queryClient.invalidateQueries({ queryKey: ["blocked-users"] })
      queryClient.invalidateQueries({ queryKey: ["current-user"] })
      router.push("/")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to block user")
    },
  })
}

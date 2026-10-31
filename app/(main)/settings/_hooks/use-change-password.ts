"use client"

import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { userService } from "@/services/user.service"
import { ApiError } from "@/lib/api/errors"
import { ChangePasswordSchemaType } from "@/lib/schemas/auth.schema"

export function useChangePassword() {
  const mutation = useMutation<
    { access_token: string; refresh_token: string },
    ApiError,
    ChangePasswordSchemaType
  >({
    mutationFn: async (data) => {
      const response = await userService.changePassword(data)
      return response.data
    },
    onSuccess: () => {
      toast.success("Password changed successfully!")
    },
  })

  return {
    changePassword: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  }
}

import { useMutation } from "@tanstack/react-query"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { authService } from "@/services"
import { LoginSchemaType } from "@/lib/schemas/auth.schema"
import { safeRedirectTarget } from "@/lib/utils/safe-redirect"

interface UseLoginOptions {
  onTwoFactorRequired?: (email: string) => void
}

export function useLogin(options?: UseLoginOptions) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl")

  const { isPending, error, mutate, mutateAsync } = useMutation({
    mutationFn: (values: LoginSchemaType) => authService.login(values),
    onSuccess: (res, variables) => {
      if (res?.data?.twoFactorRequired) {
        options?.onTwoFactorRequired?.(variables.email)
        return
      }

      toast.success("Logged in successfully!")
      const destination = safeRedirectTarget(callbackUrl, "/")
      router.push(destination)
      router.refresh()
    },
    onError: (err, variables) => {
      const status = (err as { status?: number })?.status
      const message =
        (err as { message?: string })?.message?.toLowerCase() ?? ""

      if (status === 403 || message.includes("not confirmed")) {
        toast.info("Please verify your email address to continue.")
        router.push(
          `/confirm-signup-email?email=${encodeURIComponent(variables.email)}`
        )
      }
    },
  })

  return {
    isPending,
    error,
    login: mutate,
    loginAsync: mutateAsync,
  }
}

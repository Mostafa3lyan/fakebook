import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { authService } from "@/services"
import { SignupSchemaType } from "@/lib/schemas/auth.schema"

export function useSignup() {
  const router = useRouter()

  const { isPending, error, mutate, mutateAsync } = useMutation({
    mutationFn: async (values: SignupSchemaType) => {
      try {
        await authService.signup(values)
        return { isExistingUnconfirmed: false }
      } catch (err) {
        const status = (err as { status?: number })?.status
        const message =
          (err as { message?: string })?.message?.toLowerCase() ?? ""

        if (status === 409 || message.includes("not confirmed")) {
          if (message.includes("not confirmed")) {
            return { isExistingUnconfirmed: true }
          }

          // Fallback check via resendConfirmEmail in case backend returned generic 409
          try {
            await authService.resendConfirmEmail(values.email)
            return { isExistingUnconfirmed: true }
          } catch (resendErr) {
            const resendStatus = (resendErr as { status?: number })?.status
            if (resendStatus === 409 || resendStatus === 429) {
              return { isExistingUnconfirmed: true }
            }
          }
        }
        throw err
      }
    },
    onSuccess: (result, variables) => {
      if (result.isExistingUnconfirmed) {
        toast.info(
          "This email is already registered but not confirmed. Please enter your verification code."
        )
      } else {
        toast.success(
          "Account created! Please check your email for the verification code."
        )
      }
      router.push(
        `/confirm-signup-email?email=${encodeURIComponent(variables.email)}`
      )
    },
  })

  return {
    isPending,
    error,
    signup: mutate,
    signupAsync: mutateAsync,
  }
}

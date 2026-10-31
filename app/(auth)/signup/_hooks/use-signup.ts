import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { authService } from "@/services"
import { SignupSchemaType } from "@/lib/schemas/auth.schema"

export function useSignup() {
  const router = useRouter()

  const { isPending, error, mutate, mutateAsync } = useMutation({
    mutationFn: (values: SignupSchemaType) => authService.signup(values),
    onSuccess: (_, variables) => {
      toast.success("Account created! Please check your email for the verification code.")
      router.push(`/confirm-signup-email?email=${encodeURIComponent(variables.email)}`)
    },
  })

  return {
    isPending,
    error,
    signup: mutate,
    signupAsync: mutateAsync,
  }
}

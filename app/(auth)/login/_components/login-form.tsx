"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { Loader2, LogIn } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/shared/password-input"
import { AuthCard } from "@/components/shared/auth-card"
import { ErrorComponent } from "@/components/shared/error-component"
import { GoogleAuthButton } from "@/components/shared/google-auth-button"
import { LoginSchema, LoginSchemaType } from "@/lib/schemas/auth.schema"
import { useLogin } from "../_hooks/use-login"
import { TwoFactorDialog } from "./two-factor-dialog"

export function LoginForm() {
  const [twoFactorOpen, setTwoFactorOpen] = React.useState(false)
  const [twoFactorEmail, setTwoFactorEmail] = React.useState("")

  const { isPending, error, login } = useLogin({
    onTwoFactorRequired: (email) => {
      setTwoFactorEmail(email)
      setTwoFactorOpen(true)
    },
  })

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = (values: LoginSchemaType) => {
    login(values)
  }

  return (
    <>
      <AuthCard
        title="Sign In to Fakebook"
        description="Enter your account details to access your feed and messages."
        footer={
          <div className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm p-1 inline-block"
            >
              Sign up
            </Link>
          </div>
        }
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              disabled={isPending}
              className="min-h-11"
              aria-invalid={!!form.formState.errors.email}
              aria-describedby={form.formState.errors.email ? "email-error" : undefined}
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p id="email-error" role="alert" className="text-xs font-medium text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm p-1"
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              disabled={isPending}
              aria-invalid={!!form.formState.errors.password}
              aria-describedby={form.formState.errors.password ? "password-error" : undefined}
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p id="password-error" role="alert" className="text-xs font-medium text-destructive">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {error &&
            (error.message.toLowerCase().includes("deactivated") ? (
              <div
                role="alert"
                className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400 space-y-2"
              >
                <p className="font-medium">{error.message}</p>
                <div>
                  <Link
                    href="/restore-account"
                    className="inline-flex items-center text-xs font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm p-0.5"
                  >
                    Restore your account now &rarr;
                  </Link>
                </div>
              </div>
            ) : (
              <ErrorComponent errorMessage={error.message} />
            ))}

          {/* Submit */}
          <Button
            type="submit"
            className="w-full font-semibold shadow-sm min-h-11 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" aria-hidden="true" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="size-4 mr-2" aria-hidden="true" />
                Sign In
              </>
            )}
          </Button>

          {/* Google OAuth Sign In */}
          <GoogleAuthButton mode="signin" disabled={isPending} />
        </form>
      </AuthCard>

      {/* Two-Factor Authentication Modal */}
      <TwoFactorDialog
        open={twoFactorOpen}
        onOpenChange={setTwoFactorOpen}
        email={twoFactorEmail}
      />
    </>
  )
}

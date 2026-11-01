"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { Loader2, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PasswordInput } from "@/components/shared/password-input"
import { AuthCard } from "@/components/shared/auth-card"
import { ErrorComponent } from "@/components/shared/error-component"
import { GoogleAuthButton } from "@/components/shared/google-auth-button"
import { SignupSchema, SignupSchemaType } from "@/lib/schemas/auth.schema"
import { GenderEnum } from "@/lib/types"
import { useSignup } from "../_hooks/use-signup"

export function SignupForm() {
  const { isPending, error, signup } = useSignup()

  const form = useForm<SignupSchemaType>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: GenderEnum.Male,
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = (values: SignupSchemaType) => {
    signup(values)
  }

  return (
    <AuthCard
      title="Create a New Account"
      description="It's quick and easy. Join Fakebook today."
      className="max-w-lg"
      footer={
        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm p-1 inline-block"
          >
            Sign in
          </Link>
        </div>
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Name Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              placeholder="John"
              autoComplete="given-name"
              disabled={isPending}
              className="min-h-11"
              aria-invalid={!!form.formState.errors.firstName}
              aria-describedby={form.formState.errors.firstName ? "firstName-error" : undefined}
              {...form.register("firstName")}
            />
            {form.formState.errors.firstName && (
              <p id="firstName-error" role="alert" className="text-xs font-medium text-destructive">
                {form.formState.errors.firstName.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              placeholder="Doe"
              autoComplete="family-name"
              disabled={isPending}
              className="min-h-11"
              aria-invalid={!!form.formState.errors.lastName}
              aria-describedby={form.formState.errors.lastName ? "lastName-error" : undefined}
              {...form.register("lastName")}
            />
            {form.formState.errors.lastName && (
              <p id="lastName-error" role="alert" className="text-xs font-medium text-destructive">
                {form.formState.errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="john.doe@example.com"
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

        {/* Phone & Date of Birth Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="01012345678"
              autoComplete="tel"
              disabled={isPending}
              className="min-h-11"
              aria-invalid={!!form.formState.errors.phone}
              aria-describedby={form.formState.errors.phone ? "phone-error" : undefined}
              {...form.register("phone")}
            />
            {form.formState.errors.phone && (
              <p id="phone-error" role="alert" className="text-xs font-medium text-destructive">
                {form.formState.errors.phone.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              disabled={isPending}
              className="min-h-11"
              aria-invalid={!!form.formState.errors.dateOfBirth}
              aria-describedby={form.formState.errors.dateOfBirth ? "dateOfBirth-error" : undefined}
              {...form.register("dateOfBirth")}
            />
            {form.formState.errors.dateOfBirth && (
              <p id="dateOfBirth-error" role="alert" className="text-xs font-medium text-destructive">
                {form.formState.errors.dateOfBirth.message}
              </p>
            )}
          </div>
        </div>

        {/* Gender Selection */}
        <div className="space-y-1.5">
          <Label htmlFor="gender">Gender</Label>
          <Controller
            control={form.control}
            name="gender"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isPending}
              >
                <SelectTrigger
                  id="gender"
                  className="w-full min-h-11"
                  aria-invalid={!!form.formState.errors.gender}
                  aria-describedby={form.formState.errors.gender ? "gender-error" : undefined}
                >
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={GenderEnum.Male}>Male</SelectItem>
                  <SelectItem value={GenderEnum.Female}>Female</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.gender && (
            <p id="gender-error" role="alert" className="text-xs font-medium text-destructive">
              {form.formState.errors.gender.message}
            </p>
          )}
        </div>

        {/* Passwords Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
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

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <PasswordInput
              id="confirmPassword"
              placeholder="••••••••"
              disabled={isPending}
              aria-invalid={!!form.formState.errors.confirmPassword}
              aria-describedby={form.formState.errors.confirmPassword ? "confirmPassword-error" : undefined}
              {...form.register("confirmPassword")}
            />
            {form.formState.errors.confirmPassword && (
              <p id="confirmPassword-error" role="alert" className="text-xs font-medium text-destructive">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        {error && <ErrorComponent errorMessage={error.message} />}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full font-semibold shadow-sm mt-2 min-h-11 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" aria-hidden="true" />
              Creating Account...
            </>
          ) : (
            <>
              <UserPlus className="size-4 mr-2" aria-hidden="true" />
              Sign Up
            </>
          )}
        </Button>

        {/* Google OAuth Sign Up */}
        <GoogleAuthButton mode="signup" disabled={isPending} />
      </form>
    </AuthCard>
  )
}

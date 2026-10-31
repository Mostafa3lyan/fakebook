"use client"

import * as React from "react"
import { Shield, ShieldCheck, ShieldAlert, Loader2, KeyRound, Check, ShieldOff } from "lucide-react"
import { REGEXP_ONLY_DIGITS } from "input-otp"

import { IUser } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { ErrorComponent } from "@/components/shared/error-component"
import { useEnable2fa } from "../_hooks/use-enable-2fa"

interface TwoFactorSettingsProps {
  user: IUser
}

export function TwoFactorSettings({ user }: TwoFactorSettingsProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [mode, setMode] = React.useState<"enable" | "disable">("enable")
  const [otp, setOtp] = React.useState("")
  const {
    request2fa,
    isRequesting,
    requestError,
    enable2fa,
    isEnabling,
    enableError,
    resetEnable,
    disable2fa,
    isDisabling,
    disableError,
    resetDisable,
  } = useEnable2fa()

  const handleStartFlow = (action: "enable" | "disable") => {
    setMode(action)
    setOtp("")
    if (action === "enable") resetEnable()
    else resetDisable()

    request2fa(undefined, {
      onSuccess: () => {
        setIsOpen(true)
      },
    })
  }

  const isEnabled = user.twoFactorVerified
  const isPendingAction = isEnabling || isDisabling
  const actionError = mode === "enable" ? enableError : disableError

  const handleConfirmOtp = (e?: React.FormEvent, completedCode?: string) => {
    if (e) e.preventDefault()
    const codeToVerify = completedCode ?? otp
    if (isPendingAction || codeToVerify.length !== 6) return

    if (mode === "enable") {
      enable2fa(codeToVerify, {
        onSuccess: () => {
          setIsOpen(false)
          setOtp("")
        },
      })
    } else {
      disable2fa(codeToVerify, {
        onSuccess: () => {
          setIsOpen(false)
          setOtp("")
        },
      })
    }
  }

  return (
    <>
      <Card className="border-border shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold font-heading text-foreground">
                Two-Factor Authentication (2FA)
              </CardTitle>
              <CardDescription>
                Add an extra layer of protection to your account with email-based verification codes.
              </CardDescription>
            </div>
            {isEnabled ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                <ShieldCheck className="size-4" aria-hidden="true" />
                Enabled
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 shrink-0">
                <ShieldAlert className="size-4" aria-hidden="true" />
                Disabled
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {isEnabled
              ? "Your account is currently protected. You will be prompted to enter a 6-digit confirmation code whenever logging in from a new device."
              : "Protect your account from unauthorized access. When enabled, signing in will require a one-time verification code sent directly to your registered email address."}
          </p>

          <div className="pt-1">
            {isEnabled ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => handleStartFlow("disable")}
                disabled={isRequesting}
                className="w-full sm:w-auto min-h-11 font-semibold text-destructive hover:bg-destructive/10 border-destructive/30 cursor-pointer"
              >
                {isRequesting ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" aria-hidden="true" />
                    Sending Code...
                  </>
                ) : (
                  <>
                    <ShieldOff className="size-4 mr-2" aria-hidden="true" />
                    Disable Two-Factor Authentication
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => handleStartFlow("enable")}
                disabled={isRequesting}
                className="w-full sm:w-auto min-h-11 font-semibold cursor-pointer"
              >
                {isRequesting ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" aria-hidden="true" />
                    Sending Code...
                  </>
                ) : (
                  <>
                    <Shield className="size-4 mr-2" aria-hidden="true" />
                    Enable Two-Factor Authentication
                  </>
                )}
              </Button>
            )}
          </div>

          {requestError && <ErrorComponent errorMessage={requestError.message} />}
        </CardContent>
      </Card>

      {/* 2FA Confirmation Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
              <KeyRound className="size-6" aria-hidden="true" />
            </div>
            <DialogTitle className="text-center text-xl font-bold font-heading">
              {mode === "enable" ? "Confirm 2FA Activation" : "Confirm 2FA Deactivation"}
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-muted-foreground">
              Enter the 6-digit code sent to <strong className="text-foreground">{user.email}</strong> to {mode === "enable" ? "activate" : "turn off"} two-factor authentication.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmOtp} className="space-y-4 pt-2">
            <div className="flex justify-center py-2">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                onComplete={(code) => handleConfirmOtp(undefined, code)}
                pattern={REGEXP_ONLY_DIGITS}
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                disabled={isPendingAction}
                aria-label="6-digit two-factor verification code"
              >
                {[...Array(6)].map((_, i) => (
                  <InputOTPGroup key={i} className="p-1">
                    <InputOTPSlot index={i} className="size-10 sm:size-11" />
                  </InputOTPGroup>
                ))}
              </InputOTP>
            </div>

            {actionError && <ErrorComponent errorMessage={actionError.message} />}

            <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isPendingAction}
                className="w-full sm:w-auto min-h-11"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={otp.length !== 6 || isPendingAction}
                className="w-full sm:w-auto min-h-11 font-semibold"
              >
                {isPendingAction ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" aria-hidden="true" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Check className="size-4 mr-2" aria-hidden="true" />
                    {mode === "enable" ? "Confirm & Enable" : "Confirm & Disable"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

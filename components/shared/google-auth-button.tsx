"use client"

import * as React from "react"
import Script from "next/script"
import { useTheme } from "next-themes"
import { Loader2 } from "lucide-react"

import { ErrorComponent } from "@/components/shared/error-component"
import { useGoogleAuth } from "@/hooks/auth/use-google-auth"

interface GoogleCredentialResponse {
  credential?: string
  select_by?: string
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string
    callback: (response: GoogleCredentialResponse) => void
    auto_select?: boolean
    cancel_on_tap_outside?: boolean
  }) => void
  renderButton: (
    parent: HTMLElement,
    options: {
      type?: "standard" | "icon"
      theme?: "outline" | "filled_blue" | "filled_black"
      size?: "large" | "medium" | "small"
      text?: "signin_with" | "signup_with" | "continue_with" | "signin"
      shape?: "rectangular" | "pill" | "circle" | "square"
      logo_alignment?: "left" | "center"
      width?: number
    }
  ) => void
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: GoogleAccountsId
      }
    }
  }
}

interface GoogleAuthButtonProps {
  mode?: "signin" | "signup"
  disabled?: boolean
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""

export function GoogleAuthButton({
  mode = "signin",
  disabled = false,
}: GoogleAuthButtonProps) {
  const { resolvedTheme } = useTheme()
  const { isPending, error, authenticateWithGoogle } = useGoogleAuth()

  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const [scriptLoaded, setScriptLoaded] = React.useState(
    () => typeof window !== "undefined" && Boolean(window.google?.accounts?.id)
  )
  const callbackRef = React.useRef(authenticateWithGoogle)

  React.useEffect(() => {
    callbackRef.current = authenticateWithGoogle
  }, [authenticateWithGoogle])

  const renderGoogleButton = React.useCallback(() => {
    if (
      !GOOGLE_CLIENT_ID ||
      !containerRef.current ||
      !window.google?.accounts?.id
    ) {
      return
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: GoogleCredentialResponse) => {
        if (response.credential) {
          callbackRef.current(response.credential)
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    })

    const containerWidth = containerRef.current.offsetWidth || 360
    containerRef.current.innerHTML = ""

    window.google.accounts.id.renderButton(containerRef.current, {
      type: "standard",
      theme: resolvedTheme === "dark" ? "filled_black" : "outline",
      size: "large",
      text: mode === "signup" ? "signup_with" : "continue_with",
      shape: "rectangular",
      logo_alignment: "left",
      width: Math.min(Math.max(containerWidth, 240), 400),
    })
  }, [mode, resolvedTheme])

  React.useEffect(() => {
    if (scriptLoaded) {
      renderGoogleButton()
    }
  }, [scriptLoaded, renderGoogleButton])

  if (!GOOGLE_CLIENT_ID) {
    return null
  }

  const displayError =
    error?.message?.toLowerCase().includes("invalid provider")
      ? "This email is already registered with a password. Please sign in using your email and password."
      : error?.message

  return (
    <div className="space-y-3">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />

      {/* Divider */}
      <div className="relative my-4 flex items-center justify-center">
        <div className="border-border absolute inset-0 flex items-center">
          <div className="border-border w-full border-t" />
        </div>
        <span className="bg-card text-muted-foreground relative px-3 text-xs font-medium uppercase tracking-wider">
          {mode === "signup" ? "Or sign up with" : "Or continue with"}
        </span>
      </div>

      {/* Google Button Wrapper */}
      <div className="relative flex w-full flex-col items-center justify-center min-h-11">
        <div
          ref={containerRef}
          className={`flex w-full justify-center transition-opacity ${
            isPending || disabled ? "pointer-events-none opacity-50" : ""
          }`}
        />

        {isPending && (
          <div
            role="status"
            aria-live="polite"
            className="bg-background/80 absolute inset-0 flex items-center justify-center gap-2 rounded-md text-xs font-medium backdrop-blur-[1px]"
          >
            <Loader2 className="text-primary size-4 animate-spin" aria-hidden="true" />
            <span>Connecting to Google...</span>
          </div>
        )}
      </div>

      {displayError && <ErrorComponent errorMessage={displayError} />}
    </div>
  )
}

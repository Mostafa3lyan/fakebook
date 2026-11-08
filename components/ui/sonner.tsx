"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import {
  CheckCircle2,
  Info,
  AlertTriangle,
  AlertCircle,
  Loader2,
} from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-left"
      closeButton
      duration={3500}
      gap={8}
      icons={{
        success: (
          <div className="size-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
            <CheckCircle2 className="size-4.5 stroke-[2.25]" aria-hidden="true" />
          </div>
        ),
        info: (
          <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs">
            <Info className="size-4.5 stroke-[2.25]" aria-hidden="true" />
          </div>
        ),
        warning: (
          <div className="size-8 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-2xs">
            <AlertTriangle className="size-4.5 stroke-[2.25]" aria-hidden="true" />
          </div>
        ),
        error: (
          <div className="size-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0 shadow-2xs">
            <AlertCircle className="size-4.5 stroke-[2.25]" aria-hidden="true" />
          </div>
        ),
        loading: (
          <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs">
            <Loader2 className="size-4.5 animate-spin text-primary" aria-hidden="true" />
          </div>
        ),
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast flex items-center gap-3 w-full !p-3.5 !rounded-2xl !bg-card/95 !text-card-foreground !border !border-border/80 !shadow-xl !shadow-black/10 dark:!shadow-black/50 !backdrop-blur-md text-sm font-sans transition-all",
          title: "!font-semibold !text-foreground !text-sm !tracking-tight",
          description: "!text-muted-foreground !text-xs !leading-snug !mt-0.5",
          actionButton:
            "!rounded-xl !bg-primary !text-primary-foreground !font-semibold !text-xs !px-3 !py-1.5 hover:!bg-primary/90 !transition-all !shadow-xs cursor-pointer",
          cancelButton:
            "!rounded-xl !bg-muted !text-muted-foreground !font-medium !text-xs !px-3 !py-1.5 hover:!bg-muted/80 !transition-colors cursor-pointer",
          closeButton:
            "!border !border-border/60 !bg-background/80 hover:!bg-muted !text-muted-foreground hover:!text-foreground !transition-colors !size-6 !rounded-full cursor-pointer",
          success: "!border-emerald-500/25 dark:!border-emerald-500/35",
          error: "!border-destructive/25 dark:!border-destructive/35",
          warning: "!border-amber-500/25 dark:!border-amber-500/35",
          info: "!border-primary/25 dark:!border-primary/35",
        },
      }}
      style={
        {
          "--normal-bg": "var(--card)",
          "--normal-text": "var(--card-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "1rem",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }

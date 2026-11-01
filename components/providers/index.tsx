"use client"

import * as React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "./query-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <TooltipProvider delayDuration={200}>
          {children}
          <Toaster richColors position="bottom-right" closeButton />
        </TooltipProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}

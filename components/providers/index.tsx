"use client"

import * as React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "./query-provider"
import { SocketProvider } from "./socket-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <SocketProvider>
          <TooltipProvider delayDuration={200}>
            {children}
            <Toaster position="bottom-right" />
          </TooltipProvider>
        </SocketProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}

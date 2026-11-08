"use client"

import * as React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "./query-provider"
import { SocketProvider } from "./socket-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { ChatProvider } from "@/components/chat/chat-provider"
import { ChatShell } from "@/components/chat/chat-shell"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <SocketProvider>
          <TooltipProvider delayDuration={200}>
            <ChatProvider>
              {children}
              <ChatShell />
              <Toaster position="bottom-right" />
            </ChatProvider>
          </TooltipProvider>
        </SocketProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}

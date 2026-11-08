"use client"

import * as React from "react"
import { MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useConversations } from "@/hooks/chat/use-conversations"
import { MessengerDropdown } from "./messenger-dropdown"

interface MessengerNavButtonProps {
  className?: string
}

export function MessengerNavButton({ className }: MessengerNavButtonProps) {
  const [open, setOpen] = React.useState(false)
  const { totalUnreadCount } = useConversations()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative size-9 rounded-full min-h-11 min-w-11 text-foreground hover:bg-muted hover:text-primary cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
            open && "bg-muted text-primary",
            className
          )}
          aria-label={
            totalUnreadCount > 0
              ? `${totalUnreadCount} unread messages`
              : "Messenger"
          }
        >
          <MessageCircle className="size-5" aria-hidden="true" />
          {totalUnreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 px-1 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center shadow-xs animate-in zoom-in-50"
              aria-hidden="true"
            >
              {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[calc(100vw-1.5rem)] sm:w-96 p-0 rounded-2xl shadow-xl border border-border bg-card overflow-hidden"
      >
        <MessengerDropdown onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  )
}


"use client"

import * as React from "react"
import { IMessage } from "@/lib/types"
import { MessageBubble } from "./message-bubble"
import { useChat } from "./chat-provider"
import { ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MessageListProps {
  conversationId: string
  messages: IMessage[]
  isLoading?: boolean
}

function formatDateDivider(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()

  if (date.toDateString() === now.toDateString()) {
    return "Today"
  }

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday"
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  })
}

function getSenderId(sender: IMessage["sender"]): string {
  if (typeof sender === "object" && sender !== null) {
    return sender._id || ""
  }
  return typeof sender === "string" ? sender : ""
}

export function MessageList({
  conversationId,
  messages,
  isLoading,
}: MessageListProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const bottomAnchorRef = React.useRef<HTMLDivElement>(null)
  const { getTypingUser } = useChat()
  const typingUser = getTypingUser(conversationId)

  const [showScrollBottom, setShowScrollBottom] = React.useState(false)

  // Auto-scroll on new message
  React.useEffect(() => {
    bottomAnchorRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length, typingUser])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 60
    setShowScrollBottom(!isAtBottom)
  }

  const scrollToBottom = () => {
    bottomAnchorRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="size-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-muted-foreground select-none">
        <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
          👋
        </div>
        <p className="font-semibold text-foreground text-sm">No messages yet</p>
        <p className="text-xs mt-1">Send a message to start the conversation!</p>
      </div>
    )
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-3 space-y-3 relative"
    >
      {messages.map((msg, index) => {
        const currentDate = formatDateDivider(msg.createdAt)
        const prevDate =
          index > 0 ? formatDateDivider(messages[index - 1].createdAt) : null
        const isNewDay = currentDate !== prevDate

        const isSameSenderAsNext =
          index < messages.length - 1 &&
          getSenderId(messages[index + 1].sender) === getSenderId(msg.sender)

        return (
          <React.Fragment key={msg._id || msg.clientTempId || index}>
            {isNewDay && (
              <div className="flex items-center justify-center my-3 select-none">
                <span className="text-[11px] font-medium bg-muted/80 text-muted-foreground px-2.5 py-0.5 rounded-full border border-border/40">
                  {currentDate}
                </span>
              </div>
            )}
            <MessageBubble
              message={msg}
              conversationId={conversationId}
              showAvatar={!isSameSenderAsNext}
            />
          </React.Fragment>
        )
      })}

      {/* Typing indicator */}
      {typingUser && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 pl-1">
          <div className="flex items-center gap-1 bg-muted px-3 py-1.5 rounded-full">
            <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
            <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
            <span className="size-1.5 rounded-full bg-primary animate-bounce" />
          </div>
          <span className="text-[11px] font-medium">{typingUser.firstName} is typing...</span>
        </div>
      )}

      <div ref={bottomAnchorRef} />

      {/* Floating scroll to bottom button */}
      {showScrollBottom && (
        <Button
          size="icon"
          variant="secondary"
          onClick={scrollToBottom}
          className="absolute bottom-3 right-3 size-8 rounded-full shadow-md z-10 opacity-90 hover:opacity-100"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="size-4" />
        </Button>
      )}
    </div>
  )
}

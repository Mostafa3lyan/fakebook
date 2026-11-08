"use client"

import * as React from "react"
import { useSocket } from "@/components/providers/socket-provider"
import { useCurrentUser } from "@/hooks/user/use-current-user"
import { useMessages } from "@/hooks/chat/use-messages"
import { useChat } from "./chat-provider"
import { messageService } from "@/services/message.service"
import { conversationService } from "@/services/conversation.service"
import { IConversation, IPublicUser } from "@/lib/types"
import { MessageList } from "./message-list"
import { MessageComposer } from "./message-composer"
import { UserAvatar } from "@/components/shared/user-avatar"
import { Button } from "@/components/ui/button"
import { Minus, Settings, Users, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FloatingChatWindowProps {
  conversationId: string
  cachedConversation?: IConversation
}

export function FloatingChatWindow({
  conversationId,
  cachedConversation,
}: FloatingChatWindowProps) {
  const { socket } = useSocket()
  const { user } = useCurrentUser()
  const { closeChat, minimizeChat, isUserOnline, openGroupSettings } = useChat()

  const [conversation, setConversation] = React.useState<IConversation | undefined>(
    cachedConversation
  )

  const { messages, isLoading } = useMessages(conversationId)

  // Fetch full conversation details if not cached
  React.useEffect(() => {
    if (!conversation) {
      conversationService
        .getConversation(conversationId)
        .then((res) => setConversation(res.data.conversation))
        .catch(() => {})
    }
  }, [conversationId, conversation])

  // Socket room join / leave lifecycle & mark as read
  React.useEffect(() => {
    if (!socket || !conversationId) return

    socket.emit("chat:join_conversation", { conversationId })

    // Mark conversation as read on open
    messageService.markAsRead(conversationId).catch(() => {})

    return () => {
      socket.emit("chat:leave_conversation", { conversationId })
    }
  }, [socket, conversationId])

  // Determine other participant / group header display
  const isGroup = conversation?.type === "group"
  const otherParticipant = React.useMemo(() => {
    if (!conversation || isGroup) return null
    return conversation.participants.find(
      (p) => (p.user as IPublicUser)?._id !== user?._id
    )?.user as IPublicUser | undefined
  }, [conversation, isGroup, user?._id])

  const title = isGroup
    ? conversation?.title || "Group Conversation"
    : otherParticipant
    ? `${otherParticipant.firstName} ${otherParticipant.lastName}`.trim()
    : "Chat"

  const isOnline = isGroup ? false : isUserOnline(otherParticipant?._id)

  return (
    <div
      className={cn(
        "flex flex-col w-[320px] sm:w-[340px] h-[440px] bg-card rounded-t-xl shadow-2xl border border-border overflow-hidden pointer-events-auto transition-all animate-in slide-in-from-bottom-5 duration-200"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-card border-b border-border select-none shadow-2xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative">
            {isGroup ? (
              <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                <Users className="size-4" />
              </div>
            ) : (
              <UserAvatar user={otherParticipant} size="sm" />
            )}
            {isOnline && (
              <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
            )}
          </div>

          <div className="min-w-0 flex flex-col">
            <span className="text-sm font-semibold text-foreground truncate max-w-40">
              {title}
            </span>
            <span className="text-[10px] text-muted-foreground truncate">
              {isGroup
                ? `${conversation?.participants?.length || 0} members`
                : isOnline
                ? "Active now"
                : "Offline"}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 text-muted-foreground">
          {isGroup && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => openGroupSettings(conversationId)}
              className="size-7 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
              aria-label="Group settings"
            >
              <Settings className="size-3.5" />
            </Button>
          )}

          <Button
            size="icon"
            variant="ghost"
            onClick={() => minimizeChat(conversationId)}
            className="size-7 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
            aria-label="Minimize chat"
          >
            <Minus className="size-3.5" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => closeChat(conversationId)}
            className="size-7 rounded-full hover:bg-muted text-muted-foreground hover:text-destructive"
            aria-label="Close chat"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Message List */}
      <MessageList
        conversationId={conversationId}
        messages={messages}
        isLoading={isLoading}
      />

      {/* Message Composer */}
      <MessageComposer conversationId={conversationId} />
    </div>
  )
}


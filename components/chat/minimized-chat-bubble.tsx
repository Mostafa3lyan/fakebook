"use client"

import * as React from "react"
import { useCurrentUser } from "@/hooks/user/use-current-user"
import { useChat } from "./chat-provider"
import { IConversation, IPublicUser } from "@/lib/types"
import { UserAvatar } from "@/components/shared/user-avatar"
import { Users, X } from "lucide-react"
import { conversationService } from "@/services/conversation.service"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface MinimizedChatBubbleProps {
  conversationId: string
  cachedConversation?: IConversation
}

export function MinimizedChatBubble({
  conversationId,
  cachedConversation,
}: MinimizedChatBubbleProps) {
  const { user } = useCurrentUser()
  const { restoreChat, closeChat, isUserOnline } = useChat()

  const [conversation, setConversation] = React.useState<IConversation | undefined>(
    cachedConversation
  )

  React.useEffect(() => {
    if (!conversation) {
      conversationService
        .getConversation(conversationId)
        .then((res) => setConversation(res.data.conversation))
        .catch(() => {})
    }
  }, [conversationId, conversation])

  const isGroup = conversation?.type === "group"
  const otherParticipant = React.useMemo(() => {
    if (!conversation || isGroup) return null
    return conversation.participants.find(
      (p) => (p.user as IPublicUser)?._id !== user?._id
    )?.user as IPublicUser | undefined
  }, [conversation, isGroup, user?._id])

  const title = isGroup
    ? conversation?.title || "Group"
    : otherParticipant
    ? `${otherParticipant.firstName} ${otherParticipant.lastName}`.trim()
    : "Chat"

  const isOnline = isGroup ? false : isUserOnline(otherParticipant?._id)
  const unreadCount = conversation?.unreadCount || 0

  return (
    <div className="group relative pointer-events-auto">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => restoreChat(conversationId)}
            className="relative flex items-center justify-center size-12 rounded-full shadow-lg border-2 border-background bg-card hover:scale-105 active:scale-95 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={`Restore chat with ${title}`}
          >
            {isGroup ? (
              <div className="size-full rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                <Users className="size-5" />
              </div>
            ) : (
              <UserAvatar user={otherParticipant} size="md" />
            )}

            {/* Online presence badge */}
            {isOnline && (
              <span className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-500 ring-2 ring-background" />
            )}

            {/* Unread badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-destructive text-white text-[10px] font-extrabold leading-none shadow-xs">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="left" className="text-xs">
          {title}
        </TooltipContent>
      </Tooltip>

      {/* Close button on bubble hover */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          closeChat(conversationId)
        }}
        className="absolute -top-1 -left-1 size-5 rounded-full bg-muted-foreground/80 hover:bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
        aria-label="Close chat"
      >
        <X className="size-3" />
      </button>
    </div>
  )
}


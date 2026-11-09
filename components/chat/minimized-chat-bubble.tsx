"use client"

import * as React from "react"
import { useCurrentUser } from "@/hooks/user/use-current-user"
import { useChat } from "./chat-provider"
import { IConversation, IPublicUser } from "@/lib/types"
import { UserAvatar } from "@/components/shared/user-avatar"
import { Users, X } from "lucide-react"
import { conversationService } from "@/services/conversation.service"

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

  const [fetchedConversation, setFetchedConversation] = React.useState<IConversation | undefined>()
  const conversation = cachedConversation || fetchedConversation

  React.useEffect(() => {
    if (!cachedConversation && !fetchedConversation) {
      conversationService
        .getConversation(conversationId)
        .then((res) => setFetchedConversation(res.data.conversation))
        .catch(() => {})
    }
  }, [conversationId, cachedConversation, fetchedConversation])

  const isGroup = conversation?.type === "group"
  const otherParticipant = React.useMemo(() => {
    if (!conversation || isGroup) return null
    return conversation.participants?.find(
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
    <div
      onClick={() => restoreChat(conversationId)}
      className="group pointer-events-auto flex items-center gap-2 h-10 pl-2 pr-2.5 bg-card text-foreground rounded-full shadow-lg hover:shadow-xl border border-border transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer select-none max-w-[220px] animate-in fade-in slide-in-from-bottom-2 duration-200"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          restoreChat(conversationId)
        }
      }}
      aria-label={`Restore chat with ${title}`}
      title={`Open chat with ${title}`}
    >
      {/* Avatar with online status */}
      <div className="relative shrink-0">
        {isGroup ? (
          <div className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
            <Users className="size-3.5" />
          </div>
        ) : (
          <UserAvatar user={otherParticipant} size="sm" className="size-7" />
        )}
        {isOnline && (
          <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
        )}
      </div>

      {/* Title */}
      <span className="text-xs font-semibold text-foreground truncate min-w-0 flex-1">
        {title}
      </span>

      {/* Unread count badge */}
      {unreadCount > 0 && (
        <span className="flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-destructive text-white text-[10px] font-extrabold leading-none shadow-xs shrink-0">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}

      {/* Close button with X */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          closeChat(conversationId)
        }}
        className="size-5 rounded-full hover:bg-muted text-muted-foreground hover:text-destructive flex items-center justify-center transition-colors shrink-0 cursor-pointer ml-0.5"
        aria-label={`Close chat with ${title}`}
        title="Close chat"
      >
        <X className="size-3.5 stroke-[2.5]" />
      </button>
    </div>
  )
}


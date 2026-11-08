"use client"

import * as React from "react"
import { useConversations } from "@/hooks/chat/use-conversations"
import { useMessageRequests } from "@/hooks/chat/use-message-requests"
import { useCurrentUser } from "@/hooks/user/use-current-user"
import { useChat } from "./chat-provider"
import { UserAvatar } from "@/components/shared/user-avatar"
import { formatTimeAgo } from "@/lib/utils/date"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  MessageSquare,
  Plus,
  Search,
  Users,
  Volume2,
  VolumeX,
} from "lucide-react"
import { IConversation, IPublicUser } from "@/lib/types"
import { cn } from "@/lib/utils"

interface MessengerDropdownProps {
  onClose: () => void
}

export function MessengerDropdown({ onClose }: MessengerDropdownProps) {
  const { user } = useCurrentUser()
  const [search, setSearch] = React.useState("")
  const { conversations, isLoading } = useConversations({ search })
  const { requests } = useMessageRequests()
  const {
    openChat,
    openNewChatModal,
    openRequestsModal,
    isUserOnline,
    isMuted,
    toggleMute,
  } = useChat()

  const handleSelectConversation = (conv: IConversation) => {
    openChat(conv._id, conv)
    onClose()
  }

  const handleOpenNewMessage = () => {
    openNewChatModal()
    onClose()
  }

  const handleOpenRequests = () => {
    openRequestsModal()
    onClose()
  }

  return (
    <div className="flex flex-col w-[340px] sm:w-[380px] max-h-[520px] bg-card text-foreground rounded-xl shadow-2xl border border-border overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 pb-2 border-b border-border select-none">
        <h2 className="text-lg font-bold tracking-tight">Chats</h2>

        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleMute}
            className="size-8 rounded-full text-muted-foreground hover:text-foreground"
            aria-label={isMuted ? "Unmute message sounds" : "Mute message sounds"}
          >
            {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={handleOpenNewMessage}
            className="size-8 rounded-full text-muted-foreground hover:text-foreground"
            aria-label="New message"
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-3 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search Messenger..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs bg-muted/60"
          />
        </div>
      </div>

      {/* Message Requests Banner if any */}
      {requests.length > 0 && (
        <div className="px-3 pb-2">
          <button
            onClick={handleOpenRequests}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/15 transition-colors text-xs font-semibold text-primary"
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="size-4" />
              <span>Message Requests</span>
            </div>
            <span className="size-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
              {requests.length}
            </span>
          </button>
        </div>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-1.5 pb-2 space-y-0.5">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            Loading conversations...
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground select-none">
            {search ? "No conversations match your search" : "No conversations yet. Say hello to a friend!"}
          </div>
        ) : (
          conversations.map((conv) => {
            const isGroup = conv.type === "group"
            const otherParticipant = !isGroup
              ? conv.participants.find(
                  (p) => (p.user as IPublicUser)?._id !== user?._id
                )?.user as IPublicUser | undefined
              : undefined

            const title = isGroup
              ? conv.title || "Group"
              : otherParticipant
              ? `${otherParticipant.firstName} ${otherParticipant.lastName}`.trim()
              : "Chat"

            const isOnline = isGroup ? false : isUserOnline(otherParticipant?._id)
            const hasUnread = (conv.unreadCount || 0) > 0

            return (
              <button
                key={conv._id}
                onClick={() => handleSelectConversation(conv)}
                className={cn(
                  "w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors hover:bg-muted/60 relative group",
                  hasUnread && "bg-primary/5"
                )}
              >
                {/* Avatar with presence */}
                <div className="relative shrink-0">
                  {isGroup ? (
                    <div className="size-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                      <Users className="size-5" />
                    </div>
                  ) : (
                    <UserAvatar user={otherParticipant} size="md" />
                  )}
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-500 ring-2 ring-card" />
                  )}
                </div>

                {/* Content preview */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span
                      className={cn(
                        "text-sm truncate",
                        hasUnread ? "font-bold text-foreground" : "font-medium text-foreground"
                      )}
                    >
                      {title}
                    </span>
                    {conv.lastMessageAt && (
                      <span
                        className={cn(
                          "text-[10px] shrink-0",
                          hasUnread
                            ? "font-bold text-primary"
                            : "text-muted-foreground"
                        )}
                      >
                        {formatTimeAgo(conv.lastMessageAt)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={cn(
                        "text-xs truncate max-w-[200px]",
                        hasUnread
                          ? "font-semibold text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {conv.lastMessage?.isDeleted
                        ? "Message was deleted"
                        : conv.lastMessage?.content ||
                          (conv.lastMessage?.attachments?.length
                            ? "Sent an attachment"
                            : "Started a conversation")}
                    </p>

                    {hasUnread && (
                      <span className="size-2 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}


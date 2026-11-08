"use client"

import * as React from "react"
import { IMessage } from "@/lib/types"
import { useCurrentUser } from "@/hooks/user/use-current-user"
import { UserAvatar } from "@/components/shared/user-avatar"
import { cn } from "@/lib/utils"
import { formatTime } from "@/lib/utils/date"
import { Check, CheckCheck, Clock, FileText, MoreVertical, Pencil, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useConversationActions } from "@/hooks/chat/use-conversation-actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface MessageBubbleProps {
  message: IMessage
  conversationId: string
  showAvatar?: boolean
}

export function MessageBubble({
  message,
  conversationId,
  showAvatar = true,
}: MessageBubbleProps) {
  const { user } = useCurrentUser()
  const { editMessage, deleteMessage } = useConversationActions()
  const [isEditing, setIsEditing] = React.useState(false)
  const [editContent, setEditContent] = React.useState(message.content)

  const isMe =
    message.sender &&
    (typeof message.sender === "object"
      ? message.sender._id === user?._id
      : message.sender === user?._id)

  const isRead = Boolean(
    message.readBy &&
      message.readBy.some((r) => {
        const id = typeof r.user === "object" ? r.user._id : r.user
        return id && id !== user?._id
      })
  )

  const isDelivered = Boolean(
    message.deliveredTo &&
      message.deliveredTo.some((d) => {
        const id = typeof d.user === "object" ? d.user._id : d.user
        return id && id !== user?._id
      })
  )

  const handleSaveEdit = () => {
    if (!editContent.trim()) return
    editMessage.mutate({
      conversationId,
      messageId: message._id,
      content: editContent.trim(),
    })
    setIsEditing(false)
  }

  const handleDeleteEveryone = () => {
    deleteMessage.mutate({
      conversationId,
      messageId: message._id,
      mode: "everyone",
    })
  }

  const handleDeleteSelf = () => {
    deleteMessage.mutate({
      conversationId,
      messageId: message._id,
      mode: "self",
    })
  }

  return (
    <div
      className={cn(
        "group relative flex items-end gap-2 text-sm max-w-[85%]",
        isMe ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
    >
      {!isMe && showAvatar ? (
        <UserAvatar
          user={typeof message.sender === "object" ? message.sender : undefined}
          size="xs"
          className="shrink-0 mb-1"
        />
      ) : !isMe ? (
        <div className="w-6 shrink-0" />
      ) : null}

      <div className={cn("flex flex-col gap-1", isMe ? "items-end" : "items-start")}>
        {/* Message bubble content */}
        <div
          className={cn(
            "relative rounded-2xl px-3.5 py-2 break-words shadow-xs text-sm transition-colors",
            isMe
              ? "bg-primary text-primary-foreground rounded-br-xs"
              : "bg-muted text-foreground rounded-bl-xs",
            message.isDeleted && "italic opacity-70 bg-muted/60 text-muted-foreground"
          )}
        >
          {isEditing ? (
            <div className="flex items-center gap-1.5 py-1">
              <Input
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="h-8 text-xs bg-background text-foreground"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveEdit()
                  if (e.key === "Escape") setIsEditing(false)
                }}
              />
              <Button size="xs" variant="default" onClick={handleSaveEdit}>
                Save
              </Button>
              <Button size="xs" variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <>
              {/* Attachments if any */}
              {message.attachments && message.attachments.length > 0 && !message.isDeleted && (
                <div className="flex flex-col gap-1.5 mb-1.5">
                  {message.attachments.map((att, idx) => {
                    const isImg = att.mimeType?.startsWith("image/")
                    return isImg ? (
                      <a
                        key={idx}
                        href={`/api/media/${att.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="overflow-hidden rounded-lg border border-border/40 max-h-48 block"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/api/media/${att.url}`}
                          alt={att.name || "Attachment"}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </a>
                    ) : (
                      <a
                        key={idx}
                        href={`/api/media/${att.url}?download=true&fileName=${encodeURIComponent(
                          att.name
                        )}`}
                        className="flex items-center gap-2 p-2 rounded-md bg-background/50 hover:bg-background/80 transition-colors text-xs"
                      >
                        <FileText className="size-4 shrink-0" />
                        <span className="truncate max-w-40">{att.name}</span>
                      </a>
                    )
                  })}
                </div>
              )}

              {/* Text content */}
              <p className="whitespace-pre-wrap leading-relaxed select-text">{message.content}</p>

              {message.isEdited && !message.isDeleted && (
                <span className="text-[10px] opacity-70 ml-1.5 select-none">(edited)</span>
              )}
            </>
          )}
        </div>

        {/* Timestamp & status indicator */}
        <div
          className={cn(
            "flex items-center gap-1 text-[10px] text-muted-foreground px-1 select-none",
            isMe ? "justify-end" : "justify-start"
          )}
        >
          <span>{formatTime(message.createdAt)}</span>
          {isMe && (
            <span className="flex items-center">
              {message.isPending ? (
                <Clock className="size-3 animate-spin text-muted-foreground" />
              ) : isRead ? (
                <CheckCheck className="size-3 text-primary" aria-label="Read" />
              ) : isDelivered ? (
                <CheckCheck className="size-3 text-muted-foreground" aria-label="Delivered" />
              ) : (
                <Check className="size-3 text-muted-foreground" aria-label="Sent" />
              )}
            </span>
          )}
        </div>
      </div>

      {/* Message action menu (hover) */}
      {!message.isDeleted && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-muted text-muted-foreground focus-visible:opacity-100"
              aria-label="Message options"
            >
              <MoreVertical className="size-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isMe ? "end" : "start"} className="w-36 text-xs">
            {isMe && (
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Pencil className="mr-2 size-3.5" />
                <span>Edit</span>
              </DropdownMenuItem>
            )}
            {isMe && (
              <DropdownMenuItem
                onClick={handleDeleteEveryone}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 size-3.5" />
                <span>Unsend for all</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleDeleteSelf}>
              <Trash2 className="mr-2 size-3.5" />
              <span>Remove for you</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}


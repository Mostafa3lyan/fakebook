"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useMessageRequests } from "@/hooks/chat/use-message-requests"
import { useConversationActions } from "@/hooks/chat/use-conversation-actions"
import { useBlockUser } from "@/hooks/user/use-block-user"
import { useChat } from "./chat-provider"
import { UserAvatar } from "@/components/shared/user-avatar"
import { formatTimeAgo } from "@/lib/utils/date"
import { Check, ShieldAlert, Trash2 } from "lucide-react"
import { IPublicUser } from "@/lib/types"

interface MessageRequestsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function MessageRequestsModal({
  isOpen,
  onClose,
}: MessageRequestsModalProps) {
  const { requests, isLoading } = useMessageRequests()
  const { acceptRequest, rejectRequest } = useConversationActions()
  const blockUserMutation = useBlockUser()
  const { openChat } = useChat()

  const handleAccept = async (conversationId: string) => {
    try {
      await acceptRequest.mutateAsync(conversationId)
      openChat(conversationId)
      onClose()
    } catch {
      // Handled
    }
  }

  const handleReject = async (conversationId: string) => {
    try {
      await rejectRequest.mutateAsync(conversationId)
    } catch {
      // Handled
    }
  }

  const handleBlock = async (senderId: string, conversationId: string) => {
    try {
      await blockUserMutation.mutateAsync(senderId)
      await rejectRequest.mutateAsync(conversationId)
    } catch {
      // Handled
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2 border-b border-border">
          <DialogTitle className="text-base font-bold">
            Message Requests
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Messages from people who are not on your friends list. They will not know you have seen them until you accept.
          </p>
        </DialogHeader>

        <div className="p-4 max-h-96 overflow-y-auto space-y-2">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Loading requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground select-none">
              No pending message requests.
            </div>
          ) : (
            requests.map((req) => {
              const requestedById =
                typeof req.requestedBy === "object"
                  ? req.requestedBy?._id
                  : req.requestedBy

              const sender = req.participants.find(
                (p) => (p.user as IPublicUser)?._id === requestedById
              )?.user as IPublicUser | undefined

              return (
                <div
                  key={req._id}
                  className="flex flex-col gap-2 p-3 rounded-lg border border-border/60 bg-muted/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UserAvatar user={sender} size="sm" />
                      <div className="truncate">
                        <p className="text-sm font-semibold truncate leading-none">
                          {sender?.firstName} {sender?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {req.lastMessage?.content || "Sent you a message"}
                        </p>
                      </div>
                    </div>
                    {req.lastMessageAt && (
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {formatTimeAgo(req.lastMessageAt)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-1.5 pt-1">
                    {sender?._id && (
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => handleBlock(sender._id, req._id)}
                        className="text-xs text-muted-foreground hover:text-destructive h-7"
                      >
                        <ShieldAlert className="size-3 mr-1" />
                        <span>Block</span>
                      </Button>
                    )}

                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => handleReject(req._id)}
                      className="text-xs text-muted-foreground hover:text-destructive h-7"
                    >
                      <Trash2 className="size-3 mr-1" />
                      <span>Decline</span>
                    </Button>

                    <Button
                      size="xs"
                      variant="default"
                      onClick={() => handleAccept(req._id)}
                      className="text-xs h-7"
                    >
                      <Check className="size-3 mr-1" />
                      <span>Accept</span>
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

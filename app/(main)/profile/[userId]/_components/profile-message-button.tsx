"use client"

import * as React from "react"
import { Loader2, MessageCircle } from "lucide-react"
import { toast } from "sonner"

import { IPublicUser } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { useCurrentUser } from "@/hooks/user/use-current-user"
import { useChat } from "@/components/chat/chat-provider"
import { useConversationActions } from "@/hooks/chat/use-conversation-actions"
import { cn } from "@/lib/utils"

interface ProfileMessageButtonProps {
  user: IPublicUser
  className?: string
}

export function ProfileMessageButton({ user, className }: ProfileMessageButtonProps) {
  const { user: currentUser } = useCurrentUser()
  const { openChat } = useChat()
  const { createOrGetDirect } = useConversationActions()

  const isSelf = Boolean(currentUser?._id && currentUser._id === user._id)
  const isPending = createOrGetDirect.isPending

  if (isSelf) {
    return null
  }

  const fullName = user.fullName || `${user.firstName} ${user.lastName}`.trim()

  const handleMessageClick = async () => {
    try {
      const res = await createOrGetDirect.mutateAsync(user._id)
      if (res?.data?.conversation) {
        openChat(res.data.conversation._id, res.data.conversation)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to open conversation"
      toast.error(message)
    }
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleMessageClick}
      disabled={isPending}
      className={cn(
        "min-h-11 font-medium w-full sm:w-auto cursor-pointer",
        className
      )}
      aria-label={`Send a message to ${fullName}`}
    >
      {isPending ? (
        <>
          <Loader2 className="size-4 mr-2 animate-spin" aria-hidden="true" />
          <span>Opening...</span>
        </>
      ) : (
        <>
          <MessageCircle className="size-4 mr-2" aria-hidden="true" />
          <span>Message</span>
        </>
      )}
    </Button>
  )
}


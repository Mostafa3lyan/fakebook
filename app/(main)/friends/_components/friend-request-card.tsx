"use client"

import * as React from "react"
import Link from "next/link"
import { Check, X, Clock } from "lucide-react"
import { UserAvatar } from "@/components/shared/user-avatar"
import { Button } from "@/components/ui/button"
import { formatRelativeTime } from "@/lib/utils/date"
import {
  useAcceptFriendRequest,
  useCancelFriendRequest,
  useRejectFriendRequest,
} from "@/hooks/friends/use-friend-mutations"

interface ReceivedRequestProps {
  type: "received"
  requestId: string
  createdAt: string
  user: {
    _id: string
    firstName: string
    lastName: string
    profilePicture?: string
  }
  onAccepted?: () => void
}

interface SentRequestProps {
  type: "sent"
  requestId: string
  createdAt: string
  user: {
    _id: string
    firstName: string
    lastName: string
    profilePicture?: string
  }
}

type FriendRequestCardProps = ReceivedRequestProps | SentRequestProps

export function FriendRequestCard(props: FriendRequestCardProps) {
  const { type, requestId, createdAt, user } = props
  const fullName = `${user.firstName} ${user.lastName}`.trim()
  const relativeTime = formatRelativeTime(createdAt)

  const { mutate: acceptRequest, isPending: isAccepting } = useAcceptFriendRequest()
  const { mutate: rejectRequest, isPending: isRejecting } = useRejectFriendRequest()
  const { mutate: cancelRequest, isPending: isCancelling } = useCancelFriendRequest()

  const isPending = isAccepting || isRejecting || isCancelling

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl border border-border bg-card hover:bg-card/90 transition-shadow shadow-xs gap-3">
      <Link
        href={`/profile/${user._id}`}
        className="flex items-center gap-3 min-w-0 flex-1 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-1"
      >
        <UserAvatar
          user={{
            firstName: user.firstName,
            lastName: user.lastName,
            profilePicture: user.profilePicture,
          }}
          size="md"
        />
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
            {fullName}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="size-3" aria-hidden="true" />
            <span>{relativeTime}</span>
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 w-full sm:w-auto">
        {type === "received" ? (
          <>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                acceptRequest(requestId)
                props.onAccepted?.()
              }}
              disabled={isPending}
              className="flex-1 sm:flex-none min-h-9"
              aria-label={`Confirm friend request from ${fullName}`}
            >
              <Check className="size-4 mr-1.5" aria-hidden="true" />
              <span>{isAccepting ? "Confirming..." : "Confirm"}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => rejectRequest(requestId)}
              disabled={isPending}
              className="flex-1 sm:flex-none text-muted-foreground hover:text-destructive hover:bg-destructive/10 min-h-9"
              aria-label={`Delete friend request from ${fullName}`}
            >
              <X className="size-4 mr-1.5" aria-hidden="true" />
              <span>{isRejecting ? "Deleting..." : "Delete"}</span>
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => cancelRequest(requestId)}
            disabled={isPending}
            className="flex-1 sm:flex-none text-muted-foreground hover:text-foreground min-h-9"
            aria-label={`Cancel friend request to ${fullName}`}
          >
            <X className="size-4 mr-1.5" aria-hidden="true" />
            <span>{isCancelling ? "Cancelling..." : "Cancel Request"}</span>
          </Button>
        )}
      </div>
    </div>
  )
}

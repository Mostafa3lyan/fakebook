"use client"

import * as React from "react"
import Link from "next/link"
import {
  UserPlus,
  UserCheck,
  UserX,
  Check,
  X,
  Edit3,
  Loader2,
} from "lucide-react"

import { IPublicUser } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { useCurrentUser } from "@/hooks/user/use-current-user"
import { useFriendshipStatus } from "@/hooks/friends/use-friendship-status"
import {
  useAcceptFriendRequest,
  useCancelFriendRequest,
  useRejectFriendRequest,
  useSendFriendRequest,
} from "@/hooks/friends/use-friend-mutations"
import { UnfriendDialog } from "@/app/(main)/friends/_components/unfriend-dialog"
interface RelationshipButtonProps {
  targetUser: IPublicUser
}

export function RelationshipButton({ targetUser }: RelationshipButtonProps) {
  const [showUnfriendModal, setShowUnfriendModal] = React.useState(false)
  const { user: currentUser } = useCurrentUser()
  const isSelf = currentUser?._id === targetUser._id

  const {
    relationshipStatus,
    requestId,
    isLoading,
  } = useFriendshipStatus(targetUser._id, {
    enabled: !isSelf,
    initialData: targetUser.friendshipStatus
      ? {
          status: targetUser.friendshipStatus.status,
          requestId: targetUser.friendshipStatus.requestId,
        }
      : undefined,
  })

  const { mutate: sendRequest, isPending: isSending } = useSendFriendRequest()
  const { mutate: acceptRequest, isPending: isAccepting } =
    useAcceptFriendRequest()
  const { mutate: rejectRequest, isPending: isRejecting } =
    useRejectFriendRequest()
  const { mutate: cancelRequest, isPending: isCancelling } =
    useCancelFriendRequest()

  const isPending = isSending || isAccepting || isRejecting || isCancelling

  const fullName =
    targetUser.fullName || `${targetUser.firstName} ${targetUser.lastName}`

  // 1. Viewing own profile
  if (isSelf || relationshipStatus === "self") {
    return (
      <Button asChild size="sm" variant="outline" className="min-h-11 font-medium w-full sm:w-auto">
        <Link href="/settings">
          <Edit3 className="size-4 mr-2" aria-hidden="true" />
          Edit Profile
        </Link>
      </Button>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <Button disabled size="sm" variant="outline" className="min-h-11 w-full sm:w-auto">
        <Loader2 className="size-4 mr-2 animate-spin" aria-hidden="true" />
        Loading...
      </Button>
    )
  }

  // 2. Already friends
  if (relationshipStatus === "friends") {
    return (
      <>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowUnfriendModal(true)}
          disabled={isPending}
          className="min-h-11 font-medium w-full sm:w-auto hover:bg-destructive/10 hover:text-destructive group"
          aria-label={`You are friends with ${fullName}. Click to unfriend.`}
        >
          <UserCheck className="size-4 mr-2 group-hover:hidden text-primary" aria-hidden="true" />
          <UserX className="size-4 mr-2 hidden group-hover:inline text-destructive" aria-hidden="true" />
          <span className="group-hover:hidden">Friends</span>
          <span className="hidden group-hover:inline">Unfriend</span>
        </Button>

        <UnfriendDialog
          friendId={targetUser._id}
          friendName={fullName}
          open={showUnfriendModal}
          onOpenChange={setShowUnfriendModal}
        />
      </>
    )
  }

  // 3. Received request from this user
  if (relationshipStatus === "pending_received") {
    return (
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Button
          variant="default"
          size="sm"
          onClick={() => requestId && acceptRequest(requestId)}
          disabled={isPending || !requestId}
          className="flex-1 sm:flex-none min-h-11 font-medium"
          aria-label={`Confirm friend request from ${fullName}`}
        >
          <Check className="size-4 mr-1.5" aria-hidden="true" />
          <span>{isAccepting ? "Confirming..." : "Confirm"}</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => requestId && rejectRequest(requestId)}
          disabled={isPending || !requestId}
          className="flex-1 sm:flex-none text-muted-foreground hover:text-destructive hover:bg-destructive/10 min-h-11"
          aria-label={`Delete friend request from ${fullName}`}
        >
          <X className="size-4 mr-1.5" aria-hidden="true" />
          <span>{isRejecting ? "Deleting..." : "Delete"}</span>
        </Button>
      </div>
    )
  }

  // 4. Sent request to this user
  if (relationshipStatus === "pending_sent") {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => requestId && cancelRequest(requestId)}
        disabled={isPending || !requestId}
        className="min-h-11 font-medium w-full sm:w-auto text-muted-foreground hover:text-foreground"
        aria-label={`Cancel friend request to ${fullName}`}
      >
        <X className="size-4 mr-2" aria-hidden="true" />
        <span>{isCancelling ? "Cancelling..." : "Request Sent (Cancel)"}</span>
      </Button>
    )
  }

  // 5. No relationship - send friend request
  return (
    <Button
      variant="default"
      size="sm"
      onClick={() => sendRequest(targetUser._id)}
      disabled={isPending}
      className="min-h-11 font-medium w-full sm:w-auto"
      aria-label={`Send friend request to ${fullName}`}
    >
      <UserPlus className="size-4 mr-2" aria-hidden="true" />
      <span>{isSending ? "Sending..." : "Add Friend"}</span>
    </Button>
  )
}

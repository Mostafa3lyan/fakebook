"use client"

import * as React from "react"
import Link from "next/link"
import { UserMinus } from "lucide-react"
import { IFriendUser } from "@/lib/types"
import { UserAvatar } from "@/components/shared/user-avatar"
import { Button } from "@/components/ui/button"
import { UnfriendDialog } from "./unfriend-dialog"

interface FriendCardProps {
  friend: IFriendUser
}

export function FriendCard({ friend }: FriendCardProps) {
  const [showUnfriendModal, setShowUnfriendModal] = React.useState(false)
  const fullName = `${friend.firstName} ${friend.lastName}`.trim()

  return (
    <>
      <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-border bg-card hover:bg-card/90 transition-shadow shadow-xs gap-3">
        <Link
          href={`/profile/${friend._id}`}
          className="flex items-center gap-3 min-w-0 flex-1 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-1"
        >
          <UserAvatar
            user={{
              firstName: friend.firstName,
              lastName: friend.lastName,
              profilePicture: friend.profilePicture,
            }}
            size="md"
          />
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
              {fullName}
            </span>
            {friend.email && (
              <span className="text-xs text-muted-foreground truncate">
                {friend.email}
              </span>
            )}
          </div>
        </Link>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowUnfriendModal(true)}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 min-h-9"
          aria-label={`Unfriend ${fullName}`}
        >
          <UserMinus className="size-4 mr-1.5" aria-hidden="true" />
          <span className="hidden sm:inline">Unfriend</span>
        </Button>
      </div>

      <UnfriendDialog
        friendId={friend._id}
        friendName={fullName}
        open={showUnfriendModal}
        onOpenChange={setShowUnfriendModal}
      />
    </>
  )
}

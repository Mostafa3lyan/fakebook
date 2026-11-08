"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Eye, MoreHorizontal, ShieldBan, Users } from "lucide-react"

import { IPublicUser } from "@/lib/types"
import { UserAvatar } from "@/components/shared/user-avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCurrentUser } from "@/hooks/user/use-current-user"
import { ProfileCoverBanner } from "@/app/(main)/profile/_components/profile-cover-banner"
import { ImageLightbox } from "@/components/shared/image-lightbox"
import { useFriends } from "@/hooks/friends/use-friends"
import { RelationshipButton } from "./relationship-button"
import { BlockUserDialog } from "./block-user-dialog"

interface PublicProfileHeaderProps {
  user: IPublicUser
}

export function PublicProfileHeader({ user }: PublicProfileHeaderProps) {
  const router = useRouter()
  const { user: currentUser } = useCurrentUser()
  const [showBlockDialog, setShowBlockDialog] = React.useState(false)
  const [avatarPreviewOpen, setAvatarPreviewOpen] = React.useState(false)

  const { total: friendsCount } = useFriends(
    { limit: 1, initialTotal: user.friendsCount },
    user._id
  )

  const fullName = user.fullName || `${user.firstName} ${user.lastName}`
  const isSelf = currentUser?._id === user._id

  React.useEffect(() => {
    if (isSelf) {
      router.replace("/profile")
    }
  }, [isSelf, router])

  if (isSelf) {
    return null
  }

  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="text-muted-foreground hover:text-foreground -ml-2 min-h-11 cursor-pointer"
        aria-label="Go back to previous page"
      >
        <ArrowLeft className="size-4 mr-2" aria-hidden="true" />
        Back
      </Button>

      <Card className="border-border shadow-md overflow-hidden">
        {/* Cover photo banner */}
        <ProfileCoverBanner
          coverImage={user.profileCoverPictures?.[0]}
          ownerName={fullName}
        />

        <CardContent className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-14 sm:-mt-16 gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              {user.profilePicture ? (
                <button
                  type="button"
                  onClick={() => setAvatarPreviewOpen(true)}
                  className="group relative block rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-zoom-in"
                  aria-label={`View ${fullName}'s profile picture`}
                >
                  <UserAvatar
                    user={user}
                    size="xl"
                    className="size-28 sm:size-32 border-4 border-card shadow-md transition-opacity group-hover:opacity-90"
                  />
                </button>
              ) : (
                <UserAvatar
                  user={user}
                  size="xl"
                  className="size-28 sm:size-32 border-4 border-card shadow-md"
                />
              )}
              <div className="space-y-1 mb-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight">
                  {fullName}
                </h1>
                <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="size-3.5" aria-hidden="true" />
                    <span>{friendsCount} {friendsCount === 1 ? "friend" : "friends"}</span>
                  </div>
                  {user.profileVisits !== undefined && (
                    <div className="flex items-center gap-1">
                      <Eye className="size-3.5" aria-hidden="true" />
                      <span>{user.profileVisits} views</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions: Dynamic relationship button & options dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
              <RelationshipButton targetUser={user} />

              {!isSelf && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-11 shrink-0 cursor-pointer"
                      aria-label={`More options for ${fullName}`}
                    >
                      <MoreHorizontal className="size-5" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => setShowBlockDialog(true)}
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      <ShieldBan className="size-4 mr-2" aria-hidden="true" />
                      <span>Block {user.firstName}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {!isSelf && (
        <BlockUserDialog
          userId={user._id}
          userName={fullName}
          open={showBlockDialog}
          onOpenChange={setShowBlockDialog}
        />
      )}

      {/* Profile picture lightbox preview */}
      {user.profilePicture && (
        <ImageLightbox
          images={[user.profilePicture]}
          activeIndex={avatarPreviewOpen ? 0 : null}
          onClose={() => setAvatarPreviewOpen(false)}
          onChangeIndex={() => {}}
          title={`${fullName}'s profile picture`}
        />
      )}
    </div>
  )
}

"use client"

import * as React from "react"
import Link from "next/link"
import {
  Settings,
  Share2,
  ShieldCheck,
  Check,
  Calendar,
  Sparkles,
  Info,
  ChevronDown,
  User,
} from "lucide-react"
import { toast } from "sonner"

import { IUser } from "@/lib/types"
import { UserAvatar } from "@/components/shared/user-avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatMonthYear } from "@/lib/utils/date"
import { ImageLightbox } from "@/components/shared/image-lightbox"
import { ProfileInfoCard } from "./profile-info-card"
import { ProfileCoverBanner } from "./profile-cover-banner"
import { AvatarImageEditor, CoverImageEditor } from "./profile-image-editors"

interface ProfileHeaderProps {
  user: IUser
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const [copied, setCopied] = React.useState(false)
  const [aboutOpen, setAboutOpen] = React.useState(false)
  const [avatarPreviewOpen, setAvatarPreviewOpen] = React.useState(false)

  const handleShare = async () => {
    const profileUrl = `${window.location.origin}/profile/${user._id}`
    try {
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      toast.success("Profile link copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy link")
    }
  }

  const formattedJoinDate = React.useMemo(() => {
    return formatMonthYear(user.createdAt)
  }, [user.createdAt])

  const fullName = user.fullName || `${user.firstName} ${user.lastName}`
  const coverImage = user.profileCoverPictures?.[0]

  return (
    <>
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Cover photo banner with owner edit controls */}
        <ProfileCoverBanner coverImage={coverImage} ownerName={fullName}>
          {({ openLightbox }) => (
            <CoverImageEditor
              hasImage={Boolean(coverImage)}
              onPreview={openLightbox}
            />
          )}
        </ProfileCoverBanner>

        {/* Profile info section */}
        <div className="px-4 sm:px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-14 sm:-mt-16 gap-4">
            {/* Avatar & Names */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <div className="relative">
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
                      className="size-28 sm:size-32 border-4 border-card ring-2 ring-primary/20 shadow-md transition-opacity group-hover:opacity-90"
                    />
                  </button>
                ) : (
                  <UserAvatar
                    user={user}
                    size="xl"
                    className="size-28 sm:size-32 border-4 border-card ring-2 ring-primary/20 shadow-md"
                  />
                )}
                <div className="absolute bottom-1 right-1">
                  <AvatarImageEditor
                    hasImage={Boolean(user.profilePicture)}
                    onPreview={user.profilePicture ? () => setAvatarPreviewOpen(true) : undefined}
                  />
                </div>
              </div>

              <div className="space-y-1 mb-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight">
                    {fullName}
                  </h1>
                  {user.role === "admin" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      <Sparkles className="size-3" aria-hidden="true" />
                      Admin
                    </span>
                  )}
                  {user.twoFactorVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="size-3" aria-hidden="true" />
                      2FA Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-1 text-xs text-muted-foreground pt-0.5">
                  <Calendar className="size-3.5" aria-hidden="true" />
                  <span>Joined {formattedJoinDate}</span>
                </div>
              </div>
            </div>

            {/* My Profile Dropdown Menu */}
            <div className="flex items-center justify-center sm:justify-end w-full sm:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    className="w-full sm:w-auto min-h-11 font-medium cursor-pointer"
                    aria-label="My Profile menu"
                  >
                    <User className="size-4 mr-2" aria-hidden="true" />
                    <span>My Profile</span>
                    <ChevronDown className="size-4 ml-2 opacity-80" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => setAboutOpen(true)}
                    className="cursor-pointer"
                  >
                    <Info className="size-4 mr-2 text-primary" aria-hidden="true" />
                    <span>About</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleShare}
                    className="cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="size-4 mr-2 text-emerald-500" aria-hidden="true" />
                        <span>Copied Link</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="size-4 mr-2" aria-hidden="true" />
                        <span>Share Profile</span>
                      </>
                    )}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer flex items-center">
                      <Settings className="size-4 mr-2" aria-hidden="true" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

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

      {/* About & Personal Info Modal */}
      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold font-heading">
              About {fullName}
            </DialogTitle>
            <DialogDescription>
              Personal details and account verification status.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-2">
            <ProfileInfoCard user={user} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

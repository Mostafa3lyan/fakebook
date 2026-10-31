"use client"

import * as React from "react"
import Link from "next/link"
import {
  Globe,
  Users,
  Lock,
  MoreHorizontal,
  Share2,
  Trash2,
  Copy,
  MapPin,
  Tag,
  Check,
  Pencil,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserAvatar } from "@/components/shared/user-avatar"
import { IPost, PostVisibilityEnum } from "@/lib/types"
import { formatRelativeTime } from "@/lib/utils/date"

interface PostCardHeaderProps {
  post: IPost
  isAuthor?: boolean
  onEditClick?: () => void
  onDeleteClick?: () => void
  onShareClick: () => void
}

export function PostCardHeader({
  post,
  isAuthor = false,
  onEditClick,
  onDeleteClick,
  onShareClick,
}: PostCardHeaderProps) {
  const [copied, setCopied] = React.useState(false)

  const authorName =
    post.createdBy.fullName || `${post.createdBy.firstName} ${post.createdBy.lastName}`
  const authorProfileLink = `/user/${post.createdBy._id}`

  const handleCopyLink = () => {
    const url = `${window.location.origin}/#post-${post._id}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success("Post link copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <Link
          href={authorProfileLink}
          className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"
        >
          <UserAvatar user={post.createdBy} size="md" />
        </Link>
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link
              href={authorProfileLink}
              className="font-semibold text-sm text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xs"
            >
              {authorName}
            </Link>

            {/* Location Chip */}
            {post.location?.name && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <span>is at</span>
                <span className="font-medium text-foreground/90 inline-flex items-center gap-0.5">
                  <MapPin className="size-3 text-rose-500" />
                  {post.location.name}
                </span>
              </span>
            )}

            {/* Tagged Friends Chip */}
            {post.tags && post.tags.length > 0 && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <span>with</span>
                <span className="font-medium text-foreground/90 inline-flex items-center gap-0.5">
                  <Tag className="size-3 text-primary" />
                  {post.tags.length === 1
                    ? post.tags[0].fullName || `${post.tags[0].firstName} ${post.tags[0].lastName}`
                    : `${post.tags[0].firstName} and ${post.tags.length - 1} other${post.tags.length > 2 ? "s" : ""}`}
                </span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>{formatRelativeTime(post.createdAt)}</span>
            {post.isEdited && (
              <>
                <span>•</span>
                <span className="text-[11px] italic">Edited</span>
              </>
            )}
            <span>•</span>
            {post.visibility === PostVisibilityEnum.PUBLIC && (
              <span title="Public" className="inline-flex items-center">
                <Globe className="size-3" aria-label="Public" />
              </span>
            )}
            {post.visibility === PostVisibilityEnum.FRIENDS && (
              <span title="Friends" className="inline-flex items-center">
                <Users className="size-3" aria-label="Friends" />
              </span>
            )}
            {post.visibility === PostVisibilityEnum.ONLY_ME && (
              <span title="Only me" className="inline-flex items-center">
                <Lock className="size-3" aria-label="Only me" />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Options Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground cursor-pointer rounded-full"
            aria-label="Post actions"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
            {copied ? (
              <Check className="size-4 mr-2 text-emerald-500" />
            ) : (
              <Copy className="size-4 mr-2" />
            )}
            <span>{copied ? "Link Copied" : "Copy post link"}</span>
          </DropdownMenuItem>

          {post.visibility === PostVisibilityEnum.PUBLIC && (
            <DropdownMenuItem onClick={onShareClick} className="cursor-pointer">
              <Share2 className="size-4 mr-2" />
              <span>Share to Feed</span>
            </DropdownMenuItem>
          )}

          {isAuthor && (onEditClick || onDeleteClick) && (
            <>
              <DropdownMenuSeparator />
              {onEditClick && (
                <DropdownMenuItem onClick={onEditClick} className="cursor-pointer">
                  <Pencil className="size-4 mr-2" />
                  <span>Edit post</span>
                </DropdownMenuItem>
              )}
              {onDeleteClick && (
                <DropdownMenuItem
                  onClick={onDeleteClick}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="size-4 mr-2" />
                  <span>Delete post</span>
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

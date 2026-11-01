"use client"

import Link from "next/link"
import { Share2 } from "lucide-react"

import { IPost, IPublicUser } from "@/lib/types"
import { UserAvatar } from "@/components/shared/user-avatar"
import { PostAttachments } from "./post-attachments"
import { formatRelativeTime } from "@/lib/utils/date"

interface PostSharedPreviewProps {
  sharedFrom: IPost["sharedFrom"]
}

export function PostSharedPreview({ sharedFrom }: PostSharedPreviewProps) {
  if (!sharedFrom) return null

  const originalPost =
    typeof sharedFrom.originalPostId === "object" && sharedFrom.originalPostId
      ? (sharedFrom.originalPostId as IPost)
      : null

  const originalAuthor = (
    typeof sharedFrom.originalAuthorId === "object" && sharedFrom.originalAuthorId
      ? (sharedFrom.originalAuthorId as IPublicUser)
      : originalPost?.createdBy
  ) ?? null

  const origName =
    originalAuthor?.fullName ||
    (originalAuthor?.firstName && originalAuthor?.lastName
      ? `${originalAuthor.firstName} ${originalAuthor.lastName}`
      : originalAuthor?.firstName) ||
    "User"

  const origLink = originalAuthor?._id ? `/profile/${originalAuthor._id}` : "#"

  if (!originalPost) {
    return (
      <div className="overflow-hidden rounded-xl border border-border/80 bg-muted/15 p-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
        <Share2 className="size-4 text-muted-foreground/70" />
        <span>This shared content isn&apos;t available right now.</span>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-muted/15 p-3.5 space-y-3">
      {/* Original Author Header */}
      <div className="flex items-center gap-2.5">
        {originalAuthor && (
          <Link
            href={origLink}
            className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <UserAvatar user={originalAuthor} size="sm" />
          </Link>
        )}
        <div className="space-y-0.5">
          <Link
            href={origLink}
            className="font-semibold text-xs text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xs"
          >
            {origName}
          </Link>
          {originalPost.createdAt && (
            <p className="text-[11px] text-muted-foreground">
              {formatRelativeTime(originalPost.createdAt)}
            </p>
          )}
        </div>
      </div>

      {/* Original Content */}
      {originalPost.content && (
        <div className="text-xs sm:text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap wrap-break-word">
          {originalPost.content}
        </div>
      )}

      {/* Original Attachments */}
      {originalPost.attachments && originalPost.attachments.length > 0 && (
        <PostAttachments
          attachments={originalPost.attachments}
          postTitle={`Attachments shared from ${origName}`}
        />
      )}
    </div>
  )
}

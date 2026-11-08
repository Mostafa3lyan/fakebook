"use client"

import * as React from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { IPost } from "@/lib/types"
import { useCurrentUser } from "@/hooks/user/use-current-user"
import { PostCardHeader } from "./post-card-header"
import { PostAttachments } from "./post-attachments"
import { PostSharedPreview } from "./post-shared-preview"
import { PostCardActions } from "./post-card-actions"
import { CommentSection } from "@/components/comments/comment-section"
import { SharePostDialog } from "./share-post-dialog"

interface PostCommentDialogProps {
  post: IPost
  open: boolean
  onOpenChange: (open: boolean) => void
  highlightCommentId?: string
  highlightParentCommentId?: string
}

export function PostCommentDialog({
  post,
  open,
  onOpenChange,
  highlightCommentId,
  highlightParentCommentId,
}: PostCommentDialogProps) {
  const { user } = useCurrentUser()
  const [shareOpen, setShareOpen] = React.useState(false)

  const currentUserId = user?._id
  const postAuthorId =
    typeof post.createdBy === "string" ? post.createdBy : post.createdBy?._id
  const isAuthor = Boolean(currentUserId && currentUserId === postAuthorId)

  const authorName =
    post.createdBy.fullName ||
    `${post.createdBy.firstName} ${post.createdBy.lastName}`

  const handleFocusCommentComposer = () => {
    const textarea = document.querySelector<HTMLTextAreaElement>(
      '[data-slot="dialog-content"] textarea'
    )
    textarea?.focus()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl md:max-w-2xl w-full p-0 gap-0 overflow-hidden bg-card border-border shadow-2xl rounded-2xl max-h-[85vh] flex flex-col">
          <DialogHeader className="p-3.5 border-b border-border/80 flex flex-row items-center justify-center shrink-0">
            <DialogTitle className="text-base sm:text-lg font-bold font-heading text-center">
              {authorName}&apos;s post
            </DialogTitle>
          </DialogHeader>

          {/* Scrollable Modal Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            <PostCardHeader
              post={post}
              isAuthor={isAuthor}
              onShareClick={() => setShareOpen(true)}
            />

            {/* Post Content */}
            {post.content && (
              <div className="text-sm sm:text-[15px] leading-relaxed text-foreground/95 whitespace-pre-wrap wrap-break-word">
                {post.content}
              </div>
            )}

            {/* Post Attachments */}
            {post.attachments && post.attachments.length > 0 && (
              <PostAttachments
                attachments={post.attachments}
                postTitle={`Photos from ${authorName}`}
              />
            )}

            {/* Shared Post Embedded Preview */}
            <PostSharedPreview sharedFrom={post.sharedFrom} />

            {/* Summary Counters & Interactive Action Bar */}
            <PostCardActions
              post={post}
              onCommentClick={handleFocusCommentComposer}
              onShareClick={() => setShareOpen(true)}
            />

            {/* Full Comments Section with AutoFocus */}
            <CommentSection
              postId={post._id}
              postAuthorId={postAuthorId}
              commentsCount={post.commentsCount}
              autoFocusComposer={!highlightCommentId}
              highlightCommentId={highlightCommentId}
              highlightParentCommentId={highlightParentCommentId}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <SharePostDialog
        post={post}
        open={shareOpen}
        onOpenChange={setShareOpen}
      />
    </>
  )
}

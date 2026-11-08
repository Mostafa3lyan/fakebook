"use client"

import * as React from "react"
import Link from "next/link"
import { MessageSquareReply } from "lucide-react"

import { UserAvatar } from "@/components/shared/user-avatar"
import { REACTION_CONFIG } from "@/components/posts/reaction-picker"
import { IComment, ReactionTypeEnum } from "@/lib/types"
import { useCurrentUser } from "@/hooks/user/use-current-user"
import { CommentComposer } from "./comment-composer"
import { ReplyList } from "./reply-list"
import { CommentAttachments } from "./comment-attachments"
import { CommentEditForm } from "./comment-edit-form"
import { CommentDeleteDialog } from "./comment-delete-dialog"
import { CommentItemActions } from "./comment-item-actions"

interface CommentItemProps {
  comment: IComment
  postId: string
  postAuthorId?: string
  isReply?: boolean
  parentCommentId?: string
  highlightCommentId?: string
  defaultExpandReplies?: boolean
}

export function CommentItem({
  comment,
  postId,
  postAuthorId,
  isReply = false,
  parentCommentId,
  highlightCommentId,
  defaultExpandReplies = false,
}: CommentItemProps) {
  const { user } = useCurrentUser()

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const [userExpandedReplies, setUserExpandedReplies] = React.useState(false)
  const [replyComposerOpen, setReplyComposerOpen] = React.useState(false)

  const showReplies = userExpandedReplies || defaultExpandReplies

  const isHighlighted = highlightCommentId === comment._id
  const itemRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (isHighlighted && itemRef.current) {
      const timer = setTimeout(() => {
        itemRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [isHighlighted])

  const currentUserId = user?._id
  const commentCreatorId =
    typeof comment.createdBy === "string" ? comment.createdBy : comment.createdBy?._id
  const isAuthor = currentUserId === commentCreatorId
  const canDelete = isAuthor || currentUserId === postAuthorId

  const authorName =
    comment.createdBy?.fullName ||
    `${comment.createdBy?.firstName ?? ""} ${comment.createdBy?.lastName ?? ""}`.trim() ||
    "User"
  const authorProfileLink = commentCreatorId ? `/profile/${commentCreatorId}` : "#"

  // Top reaction emojis breakdown calculation
  const topReactions = React.useMemo(() => {
    if (!comment.reactionsBreakdown) return []
    return Object.entries(comment.reactionsBreakdown)
      .filter(([, count]) => (count as number) > 0)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 3)
      .map(([type]) => type as ReactionTypeEnum)
  }, [comment.reactionsBreakdown])

  return (
    <div
      ref={itemRef}
      id={`comment-${comment._id}`}
      className={`group/comment flex items-start gap-2 ${isReply ? "pt-1" : "pt-2"}`}
    >
      <Link
        href={authorProfileLink}
        className="shrink-0 mt-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"
      >
        <UserAvatar
          user={comment.createdBy}
          size={isReply ? "sm" : "md"}
          className={isReply ? "size-7" : "size-8"}
        />
      </Link>

      <div className="flex-1 min-w-0 space-y-1">
        {/* Comment Bubble or Edit Form */}
        {isEditing ? (
          <CommentEditForm
            comment={comment}
            postId={postId}
            parentCommentId={parentCommentId}
            onCancel={() => setIsEditing(false)}
            onSuccess={() => setIsEditing(false)}
          />
        ) : (
          <div className="relative inline-block max-w-full">
            <div
              className={`rounded-2xl px-3 py-2 text-xs sm:text-[13px] border inline-block max-w-full space-y-1 transition-colors ${
                isHighlighted
                  ? "bg-primary/15 border-primary ring-2 ring-primary/30"
                  : "bg-muted/60 dark:bg-muted/40 border-border/40"
              }`}
            >
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link
                  href={authorProfileLink}
                  className="font-semibold text-foreground hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-xs"
                >
                  {authorName}
                </Link>
                {postAuthorId && commentCreatorId === postAuthorId && (
                  <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-full bg-primary/10 text-primary border border-primary/20">
                    Author
                  </span>
                )}
              </div>

              {comment.content && (
                <p className="text-foreground/90 whitespace-pre-wrap wrap-break-word leading-relaxed">
                  {comment.content}
                </p>
              )}

              {comment.attachments && comment.attachments.length > 0 && (
                <CommentAttachments attachments={comment.attachments} />
              )}
            </div>

            {/* Reactions summary badge floating on bottom-right of bubble */}
            {comment.reactionsCount > 0 && (
              <div className="absolute -bottom-2 right-1 flex items-center gap-0.5 rounded-full bg-background border border-border/80 px-1.5 py-0.5 shadow-2xs">
                <div className="flex -space-x-1 items-center">
                  {topReactions.map((reactionKey) => (
                    <span
                      key={reactionKey}
                      className="inline-flex size-3.5 items-center justify-center text-[10px]"
                    >
                      {REACTION_CONFIG[reactionKey].emoji}
                    </span>
                  ))}
                </div>
                <span className="font-semibold text-muted-foreground text-[10px]">
                  {comment.reactionsCount}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action Row: Like, Reply, Timestamp, Options */}
        {!isEditing && (
          <CommentItemActions
            comment={comment}
            postId={postId}
            parentCommentId={parentCommentId}
            isAuthor={isAuthor}
            canDelete={canDelete}
            isReply={isReply}
            onReplyClick={() => {
              setUserExpandedReplies(true)
              setReplyComposerOpen(true)
            }}
            onEditClick={() => setIsEditing(true)}
            onDeleteClick={() => setDeleteDialogOpen(true)}
          />
        )}

        {/* View Replies Toggle Button */}
        {!isReply && comment.repliesCount > 0 && !showReplies && (
          <button
            type="button"
            onClick={() => setUserExpandedReplies(true)}
            className="text-xs font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1.5 pt-1 pl-2 min-h-11"
          >
            <MessageSquareReply className="size-3.5" />
            <span>
              View {comment.repliesCount} {comment.repliesCount === 1 ? "reply" : "replies"}
            </span>
          </button>
        )}

        {/* Replies Thread */}
        {!isReply && showReplies && (
          <div className="pt-2 pl-3 sm:pl-4 border-l-2 border-border/60 space-y-3">
            <ReplyList
              postId={postId}
              commentId={comment._id}
              postAuthorId={postAuthorId}
              highlightCommentId={highlightCommentId}
              renderReply={(reply) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  postId={postId}
                  postAuthorId={postAuthorId}
                  isReply={true}
                  parentCommentId={comment._id}
                  highlightCommentId={highlightCommentId}
                />
              )}
            />

            {replyComposerOpen ? (
              <CommentComposer
                postId={postId}
                parentCommentId={comment._id}
                autoFocus
                placeholder={`Reply to ${authorName}...`}
                initialContent={`@${authorName.split(" ")[0]} `}
                size="sm"
                onCancel={() => setReplyComposerOpen(false)}
                onSuccess={() => setReplyComposerOpen(false)}
              />
            ) : (
              <button
                type="button"
                onClick={() => setReplyComposerOpen(true)}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer min-h-11 flex items-center"
              >
                Write a reply...
              </button>
            )}
          </div>
        )}

        {/* Quick Reply Composer when no replies exist yet but user clicked Reply */}
        {!isReply && comment.repliesCount === 0 && replyComposerOpen && (
          <div className="pt-2 pl-3 sm:pl-4 border-l-2 border-border/60">
            <CommentComposer
              postId={postId}
              parentCommentId={comment._id}
              autoFocus
              placeholder={`Reply to ${authorName}...`}
              initialContent={`@${authorName.split(" ")[0]} `}
              size="sm"
              onCancel={() => setReplyComposerOpen(false)}
              onSuccess={() => setReplyComposerOpen(false)}
            />
          </div>
        )}
      </div>

      {/* Delete Confirmation Alert Dialog */}
      <CommentDeleteDialog
        postId={postId}
        commentId={comment._id}
        parentCommentId={parentCommentId}
        repliesCount={comment.repliesCount}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  )
}

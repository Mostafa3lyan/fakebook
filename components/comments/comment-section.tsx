"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { useComments } from "@/hooks/comments/use-comments"
import { commentService } from "@/services/comment.service"
import { CommentComposer } from "./comment-composer"
import { CommentItem } from "./comment-item"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface CommentSectionProps {
  postId: string
  postAuthorId?: string
  commentsCount?: number
  autoFocusComposer?: boolean
  highlightCommentId?: string
  highlightParentCommentId?: string
  className?: string
}

export function CommentSection({
  postId,
  postAuthorId,
  autoFocusComposer = false,
  highlightCommentId,
  highlightParentCommentId,
  className,
}: CommentSectionProps) {
  const {
    comments,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    totalCount,
  } = useComments({ postId })

  // If a target comment or parent comment is specified via deep link, fetch it if it's not in the loaded page
  const rootTargetId = highlightParentCommentId || highlightCommentId
  const isTargetInLoadedList = React.useMemo(
    () => Boolean(rootTargetId && comments.some((c) => c._id === rootTargetId)),
    [rootTargetId, comments]
  )

  const targetCommentQuery = useQuery({
    queryKey: ["comment-detail", postId, rootTargetId],
    queryFn: async () => {
      if (!rootTargetId) return null
      const res = await commentService.getCommentById(postId, rootTargetId)
      return res.data.comment
    },
    enabled: Boolean(rootTargetId && !isLoading && !isTargetInLoadedList),
    retry: false,
  })

  // If the fetched comment is actually a reply (has commentId) and highlightParentCommentId wasn't passed,
  // fetch its parent comment so we can render the thread and expand replies.
  const discoveredParentId =
    !highlightParentCommentId && targetCommentQuery.data?.commentId
      ? targetCommentQuery.data.commentId
      : undefined

  const isDiscoveredParentInList = React.useMemo(
    () => Boolean(discoveredParentId && comments.some((c) => c._id === discoveredParentId)),
    [discoveredParentId, comments]
  )

  const discoveredParentQuery = useQuery({
    queryKey: ["comment-detail", postId, discoveredParentId],
    queryFn: async () => {
      if (!discoveredParentId) return null
      const res = await commentService.getCommentById(postId, discoveredParentId)
      return res.data.comment
    },
    enabled: Boolean(discoveredParentId && !isDiscoveredParentInList),
    retry: false,
  })

  const effectiveParentId = highlightParentCommentId || discoveredParentId

  const displayComments = React.useMemo(() => {
    const list = [...comments]
    const extraRoot = discoveredParentId
      ? discoveredParentQuery.data
      : targetCommentQuery.data && !targetCommentQuery.data.commentId
        ? targetCommentQuery.data
        : null

    if (extraRoot && !list.some((c) => c._id === extraRoot._id)) {
      list.unshift(extraRoot)
    }
    return list
  }, [comments, discoveredParentId, discoveredParentQuery.data, targetCommentQuery.data])

  return (
    <div className={cn("pt-3 border-t border-border/60 space-y-4", className)}>
      {/* Top Comment Input Composer */}
      <CommentComposer
        postId={postId}
        autoFocus={autoFocusComposer}
      />

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-3 pt-2">
          {[1, 2].map((n) => (
            <div key={n} className="flex items-start gap-2.5">
              <Skeleton className="size-8 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-14 w-3/4 rounded-2xl" />
                <Skeleton className="h-3 w-28 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Previous / More Comments Trigger */}
      {hasNextPage && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="text-xs font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1.5 min-h-11"
          >
            {isFetchingNextPage && <Loader2 className="size-3.5 animate-spin" />}
            <span>
              View more comments ({Math.max(0, totalCount - comments.length)} remaining)
            </span>
          </button>
        </div>
      )}

      {/* Comments List */}
      {!isLoading && displayComments.length > 0 && (
        <div className="space-y-3.5 pt-1">
          {displayComments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              postId={postId}
              postAuthorId={postAuthorId}
              highlightCommentId={highlightCommentId}
              defaultExpandReplies={Boolean(
                (effectiveParentId && comment._id === effectiveParentId) ||
                  (highlightCommentId && comment._id === highlightCommentId && comment.repliesCount > 0)
              )}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && displayComments.length === 0 && (
        <div className="py-2 text-center text-xs text-muted-foreground">
          No comments yet. Be the first to share your thoughts!
        </div>
      )}
    </div>
  )
}

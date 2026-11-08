"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { useReplies } from "@/hooks/comments/use-replies"
import { commentService } from "@/services/comment.service"
import { Skeleton } from "@/components/ui/skeleton"
import { IComment } from "@/lib/types"

interface ReplyListProps {
  postId: string
  commentId: string
  postAuthorId?: string
  highlightCommentId?: string
  renderReply: (reply: IComment) => React.ReactNode
}

export function ReplyList({
  postId,
  commentId,
  highlightCommentId,
  renderReply,
}: ReplyListProps) {
  const {
    replies,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useReplies({ postId, commentId })

  const isHighlightedReplyInList = React.useMemo(
    () => Boolean(highlightCommentId && replies.some((r) => r._id === highlightCommentId)),
    [highlightCommentId, replies]
  )

  const targetReplyQuery = useQuery({
    queryKey: ["comment-detail", postId, highlightCommentId],
    queryFn: async () => {
      if (!highlightCommentId) return null
      const res = await commentService.getCommentById(postId, highlightCommentId)
      return res.data.comment
    },
    enabled: Boolean(
      highlightCommentId &&
        highlightCommentId !== commentId &&
        !isLoading &&
        !isHighlightedReplyInList
    ),
    retry: false,
  })

  const displayReplies = React.useMemo(() => {
    const list = [...replies]
    const extra = targetReplyQuery.data
    if (extra && extra.commentId === commentId && !list.some((r) => r._id === extra._id)) {
      list.push(extra)
    }
    return list
  }, [replies, targetReplyQuery.data, commentId])

  if (isLoading) {
    return (
      <div className="space-y-2 py-1">
        <div className="flex items-start gap-2">
          <Skeleton className="size-6 rounded-full shrink-0" />
          <div className="space-y-1 flex-1">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-8 w-44 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 pt-1">
      {hasNextPage && (
        <button
          type="button"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="text-xs font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1.5 min-h-11"
        >
          {isFetchingNextPage && <Loader2 className="size-3 animate-spin" />}
          <span>View more replies</span>
        </button>
      )}

      {displayReplies.map((reply) => renderReply(reply))}
    </div>
  )
}

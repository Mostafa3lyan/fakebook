"use client"

import { useMutation, useQueryClient, InfiniteData } from "@tanstack/react-query"
import { toast } from "sonner"
import { commentService } from "@/services/comment.service"
import { IComment, PaginatedResult, ReactionTypeEnum } from "@/lib/types"

interface ReactCommentParams {
  postId: string
  commentId: string
  parentCommentId?: string
  reaction: ReactionTypeEnum
  currentReaction?: ReactionTypeEnum | null
}

export function useReactComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ postId, commentId, reaction }: ReactCommentParams) => {
      const response = await commentService.reactAtComment(postId, commentId, reaction)
      return { postId, commentId, updatedComment: response.data.comment }
    },
    onMutate: async ({
      postId,
      commentId,
      parentCommentId,
      reaction,
      currentReaction,
    }) => {
      const targetQueryKey = parentCommentId
        ? ["replies", postId, parentCommentId]
        : ["comments", postId]

      await queryClient.cancelQueries({ queryKey: targetQueryKey })

      const previousData =
        queryClient.getQueryData<InfiniteData<PaginatedResult<IComment>>>(
          targetQueryKey
        )

      queryClient.setQueryData<InfiniteData<PaginatedResult<IComment>>>(
        targetQueryKey,
        (oldData) => {
          if (!oldData) return oldData

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              data: page.data.map((c) => {
                if (c._id !== commentId) return c

                const isToggleOff = currentReaction === reaction
                const isSwap = Boolean(currentReaction && currentReaction !== reaction)

                const newCount = isToggleOff
                  ? Math.max(0, c.reactionsCount - 1)
                  : isSwap
                  ? c.reactionsCount
                  : c.reactionsCount + 1

                const breakdown = { ...(c.reactionsBreakdown || {}) }
                if (currentReaction && breakdown[currentReaction]) {
                  breakdown[currentReaction] = Math.max(
                    0,
                    breakdown[currentReaction] - 1
                  )
                }
                if (!isToggleOff) {
                  breakdown[reaction] = (breakdown[reaction] || 0) + 1
                }

                return {
                  ...c,
                  reactionsCount: newCount,
                  reactionsBreakdown: breakdown,
                }
              }),
            })),
          }
        }
      )

      return { previousData, targetQueryKey }
    },
    onSuccess: ({ commentId, updatedComment }, variables) => {
      const targetQueryKey = variables.parentCommentId
        ? ["replies", variables.postId, variables.parentCommentId]
        : ["comments", variables.postId]

      queryClient.setQueryData<InfiniteData<PaginatedResult<IComment>>>(
        targetQueryKey,
        (oldData) => {
          if (!oldData) return oldData

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              data: page.data.map((c) => {
                if (c._id !== commentId) return c
                return {
                  ...c,
                  reactionsCount: updatedComment.reactionsCount,
                  reactionsBreakdown: updatedComment.reactionsBreakdown,
                }
              }),
            })),
          }
        }
      )
    },
    onError: (err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(context.targetQueryKey, context.previousData)
      }
      toast.error("Failed to react to comment.")
    },
    onSettled: (_data, _error, variables) => {
      const targetQueryKey = variables.parentCommentId
        ? ["replies", variables.postId, variables.parentCommentId]
        : ["comments", variables.postId]
      queryClient.invalidateQueries({ queryKey: targetQueryKey })
    },
  })
}

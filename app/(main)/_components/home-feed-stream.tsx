"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { usePosts } from "@/hooks/posts/use-posts"
import { postGraphQLService } from "@/services/post.graphql"
import { PostFeed } from "@/components/posts"
import { PostCommentDialog } from "@/components/posts/post-comment-dialog"

export function HomeFeedStream() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const targetPostId = searchParams.get("postId") || undefined
  const targetCommentId = searchParams.get("commentId") || undefined
  const targetParentCommentId = searchParams.get("parentCommentId") || undefined

  const {
    posts,
    isLoading: isPostsLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = usePosts()

  const feedMatch = React.useMemo(
    () => (targetPostId ? posts.find((p) => p._id === targetPostId) : undefined),
    [posts, targetPostId]
  )

  const targetPostQuery = useQuery({
    queryKey: ["post-detail", targetPostId],
    queryFn: async () => {
      if (!targetPostId) return null
      const res = await postGraphQLService.getPostById(targetPostId)
      return res.post
    },
    enabled: Boolean(targetPostId && !feedMatch),
    retry: false,
  })

  const activeTargetPost = feedMatch || targetPostQuery.data || null

  const handleCloseTargetDialog = (open: boolean) => {
    if (!open && targetPostId) {
      const nextParams = new URLSearchParams(searchParams.toString())
      nextParams.delete("postId")
      nextParams.delete("commentId")
      nextParams.delete("parentCommentId")
      const qs = nextParams.toString()
      router.replace(qs ? `/?${qs}` : "/", { scroll: false })
    }
  }

  return (
    <div className="pt-2">
      <PostFeed
        posts={posts}
        isLoading={isPostsLoading}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        emptyTitle="Your feed is fresh and quiet"
        emptyDescription="Connect with more friends or be the first to share an update or photo today!"
      />

      {activeTargetPost && Boolean(targetPostId) && (
        <PostCommentDialog
          post={activeTargetPost}
          open={Boolean(targetPostId)}
          onOpenChange={handleCloseTargetDialog}
          highlightCommentId={targetCommentId}
          highlightParentCommentId={targetParentCommentId}
        />
      )}
    </div>
  )
}

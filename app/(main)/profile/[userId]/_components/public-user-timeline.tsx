"use client"

import { useUserPosts } from "@/hooks/posts/use-user-posts"
import { PostFeed } from "@/components/posts"

interface PublicUserTimelineProps {
  userId: string
  userName: string
}

export function PublicUserTimeline({ userId, userName }: PublicUserTimelineProps) {
  const {
    posts,
    isLoading: isPostsLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useUserPosts({ userId })

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold font-heading text-foreground">
        Posts by {userName}
      </h2>
      <PostFeed
        posts={posts}
        isLoading={isPostsLoading}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        emptyTitle={`No posts from ${userName} yet`}
        emptyDescription="When they share public posts or photos with you, they'll appear here."
      />
    </div>
  )
}

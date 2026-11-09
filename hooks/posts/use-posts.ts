"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { postGraphQLService } from "@/services/post.graphql"
import { IPost, PaginatedResult } from "@/lib/types"

interface UsePostsOptions {
  search?: string
  limit?: number
}

export function usePosts({ search, limit = 10 }: UsePostsOptions = {}) {
  const query = useInfiniteQuery<{ posts: PaginatedResult<IPost> }>({
    queryKey: ["posts", { search }],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await postGraphQLService.getPosts({
        page: pageParam as number,
        limit,
        search,
      })
      return response
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { hasNextPage, page } = lastPage.posts
      return hasNextPage && page ? page + 1 : undefined
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  const posts = query.data?.pages.flatMap((page) => page.posts.data) ?? []

  return {
    posts,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
  }
}

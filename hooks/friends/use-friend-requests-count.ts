"use client"

import { useQuery } from "@tanstack/react-query"
import { friendService } from "@/services/friend.service"
import { useCurrentUser } from "@/hooks/user/use-current-user"

export const FRIEND_REQUESTS_COUNT_QUERY_KEY = ["friend-requests", "count"] as const

export function useFriendRequestsCount(enabled = true) {
  const { user } = useCurrentUser()
  const userId = user?._id ?? "anonymous"

  const query = useQuery({
    queryKey: [...FRIEND_REQUESTS_COUNT_QUERY_KEY, userId],
    queryFn: async () => {
      const response = await friendService.getReceivedRequests({ limit: 1 })
      return response.data.requests?.total ?? 0
    },
    enabled: enabled && Boolean(user?._id),
    staleTime: 1000 * 10, // 10 seconds
    refetchInterval: 1000 * 15, // 15 seconds fallback poll
    refetchOnWindowFocus: true,
  })

  return {
    count: user?._id ? (query.data ?? 0) : 0,
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}


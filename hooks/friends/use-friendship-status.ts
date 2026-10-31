"use client"

import { useQuery } from "@tanstack/react-query"
import { friendService } from "@/services/friend.service"

export function useFriendshipStatus(targetUserId: string, enabled = true) {
  const query = useQuery({
    queryKey: ["friendship-status", targetUserId],
    queryFn: async () => {
      const response = await friendService.getRelationshipStatus(targetUserId)
      return response.data.status
    },
    enabled: Boolean(targetUserId) && enabled,
    staleTime: 1000 * 30, // 30 seconds
  })

  return {
    relationshipStatus: query.data?.status ?? "none",
    requestId: query.data?.requestId,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  }
}


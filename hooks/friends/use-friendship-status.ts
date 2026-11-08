"use client"

import { useQuery } from "@tanstack/react-query"
import { friendService } from "@/services/friend.service"
import type { FriendshipStatusType } from "@/lib/types/friend"

interface UseFriendshipStatusOptions {
  enabled?: boolean
  initialData?: {
    status: FriendshipStatusType
    requestId?: string | null
  }
}

export function useFriendshipStatus(
  targetUserId: string,
  optionsOrEnabled: boolean | UseFriendshipStatusOptions = true
) {
  const options =
    typeof optionsOrEnabled === "boolean"
      ? { enabled: optionsOrEnabled }
      : optionsOrEnabled

  const { enabled = true, initialData } = options

  const query = useQuery({
    queryKey: ["friendship-status", targetUserId],
    queryFn: async () => {
      const response = await friendService.getRelationshipStatus(targetUserId)
      return response.data.status
    },
    initialData: initialData
      ? {
          status: initialData.status,
          requestId: initialData.requestId ?? undefined,
        }
      : undefined,
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


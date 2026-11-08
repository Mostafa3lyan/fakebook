"use client"

import { useQuery } from "@tanstack/react-query"
import { conversationService } from "@/services/conversation.service"

export const MESSAGE_REQUESTS_QUERY_KEY = ["message-requests"]

export function useMessageRequests(params?: { page?: number; limit?: number }) {
  const query = useQuery({
    queryKey: [...MESSAGE_REQUESTS_QUERY_KEY, params],
    queryFn: async () => {
      const response = await conversationService.getMessageRequests(params)
      return response.data.requests
    },
    staleTime: 1000 * 30,
  })

  return {
    requests: query.data?.data ?? [],
    pagination: query.data,
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}


"use client"

import { useQuery } from "@tanstack/react-query"
import { messageService } from "@/services/message.service"
import { IMessage } from "@/lib/types"

export const getMessagesQueryKey = (conversationId: string) => [
  "messages",
  conversationId,
]

export function useMessages(conversationId: string | null) {
  const query = useQuery({
    queryKey: conversationId ? getMessagesQueryKey(conversationId) : ["messages"],
    queryFn: async () => {
      if (!conversationId) return { messages: [] as IMessage[], hasMore: false, nextCursor: null }
      const response = await messageService.getMessages(conversationId, { limit: 50 })
      return response.data
    },
    enabled: Boolean(conversationId),
    staleTime: 1000 * 15,
  })

  return {
    messages: query.data?.messages ?? [],
    hasMore: query.data?.hasMore ?? false,
    nextCursor: query.data?.nextCursor ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}


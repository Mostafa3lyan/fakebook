"use client"

import { useQuery } from "@tanstack/react-query"
import { conversationService, ConversationListParams } from "@/services/conversation.service"

export const CONVERSATIONS_QUERY_KEY = ["conversations"]

export function useConversations(params?: ConversationListParams) {
  const query = useQuery({
    queryKey: [...CONVERSATIONS_QUERY_KEY, params],
    queryFn: async () => {
      const response = await conversationService.getConversations(params)
      return response.data.conversations
    },
    staleTime: 1000 * 30, // 30 seconds
  })

  const conversations = query.data?.data ?? []
  const totalUnreadCount = conversations.reduce(
    (acc, curr) => acc + (curr.unreadCount || 0),
    0
  )

  return {
    conversations,
    pagination: query.data,
    total: query.data?.total ?? 0,
    totalUnreadCount,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}


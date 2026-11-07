"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { notificationService } from "@/services/notification.service"
import type { INotification, NotificationsData } from "@/lib/types"

const NOTIFICATIONS_QUERY_KEY = ["notifications"] as const
const UNREAD_COUNT_QUERY_KEY = ["notifications-unread-count"] as const

interface UseNotificationsOptions {
  limit?: number
  enabled?: boolean
}

export function useNotifications({ limit = 20, enabled = true }: UseNotificationsOptions = {}) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, limit],
    queryFn: async () => {
      const response = await notificationService.getNotifications({ limit })
      return response.data
    },
    enabled,
    staleTime: 1000 * 15, // 15 seconds
    refetchInterval: 1000 * 30, // Poll every 30 seconds for background in-app updates
    refetchOnWindowFocus: true,
  })

  // Optimistic single mark-as-read
  const markAsReadMutation = useMutation<void, Error, string, { previousData?: NotificationsData }>({
    mutationFn: async (messageId) => {
      await notificationService.markAsRead(messageId)
    },
    onMutate: async (messageId) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })

      const previousData = queryClient.getQueryData<NotificationsData>([...NOTIFICATIONS_QUERY_KEY, limit])

      if (previousData) {
        let wasUnread = false
        const updatedItems = previousData.items.map((item) => {
          if (item.id === messageId) {
            if (!item.readAt) wasUnread = true
            return { ...item, readAt: new Date().toISOString() }
          }
          return item
        })

        queryClient.setQueryData<NotificationsData>([...NOTIFICATIONS_QUERY_KEY, limit], {
          ...previousData,
          items: updatedItems,
          unreadCount: wasUnread ? Math.max(0, previousData.unreadCount - 1) : previousData.unreadCount,
        })

        if (wasUnread) {
          queryClient.setQueryData<number>(UNREAD_COUNT_QUERY_KEY, (prev) =>
            typeof prev === "number" ? Math.max(0, prev - 1) : 0,
          )
        }
      }

      return { previousData }
    },
    onError: (_err, _messageId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData([...NOTIFICATIONS_QUERY_KEY, limit], context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY })
    },
  })

  // Optimistic mark all as read
  const markAllAsReadMutation = useMutation<void, Error, void, { previousData?: NotificationsData }>({
    mutationFn: async () => {
      await notificationService.markAllAsRead()
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })

      const previousData = queryClient.getQueryData<NotificationsData>([...NOTIFICATIONS_QUERY_KEY, limit])

      if (previousData) {
        const now = new Date().toISOString()
        const updatedItems = previousData.items.map((item) => ({
          ...item,
          readAt: item.readAt || now,
        }))

        queryClient.setQueryData<NotificationsData>([...NOTIFICATIONS_QUERY_KEY, limit], {
          ...previousData,
          items: updatedItems,
          unreadCount: 0,
        })

        queryClient.setQueryData<number>(UNREAD_COUNT_QUERY_KEY, 0)
      }

      return { previousData }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData([...NOTIFICATIONS_QUERY_KEY, limit], context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY })
    },
  })

  const notifications: INotification[] = query.data?.items ?? []
  const unreadCount: number = query.data?.unreadCount ?? 0
  const total: number = query.data?.total ?? 0

  return {
    notifications,
    unreadCount,
    total,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAllRead: markAllAsReadMutation.isPending,
  }
}

export function useUnreadNotificationsCount(enabled = true) {
  const query = useQuery({
    queryKey: UNREAD_COUNT_QUERY_KEY,
    queryFn: async () => {
      const response = await notificationService.getUnreadCount()
      return response.data.unreadCount
    },
    enabled,
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 30,
    refetchOnWindowFocus: true,
  })

  return {
    unreadCount: query.data ?? 0,
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}


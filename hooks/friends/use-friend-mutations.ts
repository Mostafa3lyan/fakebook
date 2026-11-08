"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { friendService } from "@/services/friend.service"
import { FRIEND_REQUESTS_COUNT_QUERY_KEY } from "./use-friend-requests-count"
import type {
  IFriendReceivedRequest,
  IFriendUser,
  IPagination,
} from "@/lib/types"

export function useSendFriendRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (receiverId: string) => {
      return await friendService.sendRequest(receiverId)
    },
    onSuccess: () => {
      toast.success("Friend request sent successfully")
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] })
      queryClient.invalidateQueries({ queryKey: ["friendship-status"] })
      queryClient.invalidateQueries({ queryKey: ["public-profile"] })
      queryClient.invalidateQueries({ queryKey: ["search-users"] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send friend request")
    },
  })
}

export function useAcceptFriendRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (requestId: string) => {
      return await friendService.acceptRequest(requestId)
    },
    onMutate: async (requestId: string) => {
      await queryClient.cancelQueries({ queryKey: ["friend-requests"] })
      await queryClient.cancelQueries({ queryKey: ["friends"] })

      const previousReceivedQueries = queryClient.getQueriesData<
        IPagination<IFriendReceivedRequest>
      >({
        queryKey: ["friend-requests", "received"],
      })
      const previousFriendsQueries = queryClient.getQueriesData<
        IPagination<IFriendUser>
      >({
        queryKey: ["friends"],
      })
      const previousCount = queryClient.getQueryData<number>(
        FRIEND_REQUESTS_COUNT_QUERY_KEY
      )

      // Locate the sender from any cached received-requests page
      let acceptedSender: IFriendUser | null = null
      for (const [, data] of previousReceivedQueries) {
        const match = data?.data?.find((req) => req._id === requestId)
        if (match?.sender) {
          acceptedSender = {
            _id: match.sender._id,
            firstName: match.sender.firstName,
            lastName: match.sender.lastName,
            profilePicture: match.sender.profilePicture,
          }
          break
        }
      }

      // 1. Immediately remove the accepted request from received requests
      queryClient.setQueriesData<IPagination<IFriendReceivedRequest>>(
        { queryKey: ["friend-requests", "received"] },
        (old) => {
          if (!old) return old
          const filtered = old.data.filter((req) => req._id !== requestId)
          if (filtered.length === old.data.length) return old
          return {
            ...old,
            total: Math.max(0, old.total - 1),
            data: filtered,
          }
        }
      )

      // 2. Immediately decrement the red badge count
      queryClient.setQueryData<number>(
        FRIEND_REQUESTS_COUNT_QUERY_KEY,
        (prev) => (typeof prev === "number" ? Math.max(0, prev - 1) : 0)
      )

      // 3. Immediately prepend the user into All Friends cache
      if (acceptedSender) {
        const newFriend = acceptedSender
        queryClient.setQueriesData<IPagination<IFriendUser>>(
          { queryKey: ["friends"] },
          (old) => {
            if (!old) return old
            const exists = old.data.some((f) => f._id === newFriend._id)
            if (exists) return old
            return {
              ...old,
              total: old.total + 1,
              data: [newFriend, ...old.data],
            }
          }
        )
      }

      return {
        previousReceivedQueries,
        previousFriendsQueries,
        previousCount,
      }
    },
    onSuccess: () => {
      toast.success("Friend request accepted")
    },
    onError: (error: Error, _requestId, context) => {
      if (context?.previousReceivedQueries) {
        for (const [key, data] of context.previousReceivedQueries) {
          queryClient.setQueryData(key, data)
        }
      }
      if (context?.previousFriendsQueries) {
        for (const [key, data] of context.previousFriendsQueries) {
          queryClient.setQueryData(key, data)
        }
      }
      if (typeof context?.previousCount === "number") {
        queryClient.setQueryData(
          FRIEND_REQUESTS_COUNT_QUERY_KEY,
          context.previousCount
        )
      }
      toast.error(error.message || "Failed to accept friend request")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] })
      queryClient.invalidateQueries({ queryKey: ["friends"] })
      queryClient.invalidateQueries({ queryKey: ["friendship-status"] })
      queryClient.invalidateQueries({ queryKey: ["current-user"] })
      queryClient.invalidateQueries({ queryKey: ["public-profile"] })
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] })
    },
  })
}

export function useRejectFriendRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (requestId: string) => {
      return await friendService.rejectRequest(requestId)
    },
    onMutate: async (requestId: string) => {
      await queryClient.cancelQueries({ queryKey: ["friend-requests"] })

      const previousReceivedQueries = queryClient.getQueriesData<
        IPagination<IFriendReceivedRequest>
      >({
        queryKey: ["friend-requests", "received"],
      })
      const previousCount = queryClient.getQueryData<number>(
        FRIEND_REQUESTS_COUNT_QUERY_KEY
      )

      queryClient.setQueriesData<IPagination<IFriendReceivedRequest>>(
        { queryKey: ["friend-requests", "received"] },
        (old) => {
          if (!old) return old
          const filtered = old.data.filter((req) => req._id !== requestId)
          if (filtered.length === old.data.length) return old
          return {
            ...old,
            total: Math.max(0, old.total - 1),
            data: filtered,
          }
        }
      )

      queryClient.setQueryData<number>(
        FRIEND_REQUESTS_COUNT_QUERY_KEY,
        (prev) => (typeof prev === "number" ? Math.max(0, prev - 1) : 0)
      )

      return { previousReceivedQueries, previousCount }
    },
    onSuccess: () => {
      toast.success("Friend request removed")
    },
    onError: (error: Error, _requestId, context) => {
      if (context?.previousReceivedQueries) {
        for (const [key, data] of context.previousReceivedQueries) {
          queryClient.setQueryData(key, data)
        }
      }
      if (typeof context?.previousCount === "number") {
        queryClient.setQueryData(
          FRIEND_REQUESTS_COUNT_QUERY_KEY,
          context.previousCount
        )
      }
      toast.error(error.message || "Failed to reject friend request")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] })
      queryClient.invalidateQueries({ queryKey: ["friendship-status"] })
      queryClient.invalidateQueries({ queryKey: ["public-profile"] })
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] })
    },
  })
}

export function useCancelFriendRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (requestId: string) => {
      return await friendService.cancelRequest(requestId)
    },
    onSuccess: () => {
      toast.success("Friend request cancelled")
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] })
      queryClient.invalidateQueries({ queryKey: ["friendship-status"] })
      queryClient.invalidateQueries({ queryKey: ["public-profile"] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel friend request")
    },
  })
}

export function useUnfriend() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (friendId: string) => {
      return await friendService.unfriend(friendId)
    },
    onSuccess: () => {
      toast.success("Removed from friends")
      queryClient.invalidateQueries({ queryKey: ["friends"] })
      queryClient.invalidateQueries({ queryKey: ["friendship-status"] })
      queryClient.invalidateQueries({ queryKey: ["current-user"] })
      queryClient.invalidateQueries({ queryKey: ["public-profile"] })
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove friend")
    },
  })
}

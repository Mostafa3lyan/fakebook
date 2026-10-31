"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { friendService } from "@/services/friend.service"

export function useSendFriendRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (receiverId: string) => {
      return await friendService.sendRequest(receiverId)
    },
    onSuccess: () => {
      toast.success("Friend request sent successfully")
      queryClient.invalidateQueries({ queryKey: ["friend-requests", "sent"] })
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
    onSuccess: () => {
      toast.success("Friend request accepted")
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] })
      queryClient.invalidateQueries({ queryKey: ["friends"] })
      queryClient.invalidateQueries({ queryKey: ["friendship-status"] })
      queryClient.invalidateQueries({ queryKey: ["current-user"] })
      queryClient.invalidateQueries({ queryKey: ["public-profile"] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to accept friend request")
    },
  })
}

export function useRejectFriendRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (requestId: string) => {
      return await friendService.rejectRequest(requestId)
    },
    onSuccess: () => {
      toast.success("Friend request removed")
      queryClient.invalidateQueries({ queryKey: ["friend-requests", "received"] })
      queryClient.invalidateQueries({ queryKey: ["friendship-status"] })
      queryClient.invalidateQueries({ queryKey: ["public-profile"] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reject friend request")
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
      queryClient.invalidateQueries({ queryKey: ["friend-requests", "sent"] })
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
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove friend")
    },
  })
}

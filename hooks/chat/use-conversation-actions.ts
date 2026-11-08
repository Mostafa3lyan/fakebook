"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { conversationService } from "@/services/conversation.service"
import { messageService } from "@/services/message.service"
import { CreateGroupDto, UpdateGroupDto } from "@/lib/types"
import { CONVERSATIONS_QUERY_KEY } from "./use-conversations"
import { MESSAGE_REQUESTS_QUERY_KEY } from "./use-message-requests"
import { getMessagesQueryKey } from "./use-messages"
import { toast } from "sonner"

export function useConversationActions() {
  const queryClient = useQueryClient()

  const createOrGetDirect = useMutation({
    mutationFn: (recipientId: string) =>
      conversationService.createOrGetDirectConversation(recipientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY })
    },
  })

  const createGroup = useMutation({
    mutationFn: (data: CreateGroupDto) =>
      conversationService.createGroupConversation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY })
      toast.success("Group conversation created")
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create group")
    },
  })

  const acceptRequest = useMutation({
    mutationFn: (conversationId: string) =>
      conversationService.acceptMessageRequest(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: MESSAGE_REQUESTS_QUERY_KEY })
      toast.success("Message request accepted")
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to accept message request")
    },
  })

  const rejectRequest = useMutation({
    mutationFn: (conversationId: string) =>
      conversationService.rejectMessageRequest(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MESSAGE_REQUESTS_QUERY_KEY })
      toast.info("Message request removed")
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to reject message request")
    },
  })

  const updateGroup = useMutation({
    mutationFn: ({
      conversationId,
      data,
    }: {
      conversationId: string
      data: UpdateGroupDto
    }) => conversationService.updateGroup(conversationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY })
      toast.success("Group details updated")
    },
  })

  const deleteConversation = useMutation({
    mutationFn: ({
      conversationId,
      disband,
    }: {
      conversationId: string
      disband?: boolean
    }) => conversationService.deleteConversation(conversationId, disband),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY })
      toast.success("Conversation deleted")
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete conversation")
    },
  })

  const editMessage = useMutation({
    mutationFn: ({
      conversationId,
      messageId,
      content,
    }: {
      conversationId: string
      messageId: string
      content: string
    }) => messageService.editMessage(conversationId, messageId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: getMessagesQueryKey(variables.conversationId),
      })
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY })
    },
  })

  const deleteMessage = useMutation({
    mutationFn: ({
      conversationId,
      messageId,
      mode,
    }: {
      conversationId: string
      messageId: string
      mode: "everyone" | "self"
    }) => messageService.deleteMessage(conversationId, messageId, mode),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: getMessagesQueryKey(variables.conversationId),
      })
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY })
    },
  })

  return {
    createOrGetDirect,
    createGroup,
    acceptRequest,
    rejectRequest,
    updateGroup,
    deleteConversation,
    editMessage,
    deleteMessage,
  }
}

"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { messageService } from "@/services/message.service"
import { GetMessagesResponse, IMessage, ProviderEnum, RoleEnum, SendMessageDto } from "@/lib/types"
import { useCurrentUser } from "@/hooks/user/use-current-user"
import { getMessagesQueryKey } from "./use-messages"
import { CONVERSATIONS_QUERY_KEY } from "./use-conversations"

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient()
  const { user } = useCurrentUser()

  return useMutation({
    mutationFn: async (dto: SendMessageDto) => {
      const response = await messageService.sendMessage(conversationId, dto)
      return response.data.message
    },
    onMutate: async (dto: SendMessageDto) => {
      await queryClient.cancelQueries({ queryKey: getMessagesQueryKey(conversationId) })

      const previousData = queryClient.getQueryData<GetMessagesResponse>(
        getMessagesQueryKey(conversationId)
      )

      if (dto.content || (dto.attachments && dto.attachments.length > 0)) {
        const optimisticMessage: IMessage = {
          _id: `temp-${Date.now()}`,
          conversationId,
          sender: user || {
            _id: "temp-user",
            firstName: "You",
            lastName: "",
            fullName: "You",
            email: "",
            provider: ProviderEnum.System,
            role: RoleEnum.User,
            profileCoverPictures: [],
            twoFactorVerified: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          type: dto.attachments && dto.attachments.length > 0 ? "image" : "text",
          content: dto.content || "",
          attachments: (dto.attachments || []).map((file) => ({
            url: URL.createObjectURL(file),
            name: file.name,
            size: file.size,
            mimeType: file.type,
          })),
          isEdited: false,
          isDeleted: false,
          clientTempId: dto.clientTempId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPending: true,
        }

        queryClient.setQueryData<GetMessagesResponse>(
          getMessagesQueryKey(conversationId),
          (old) => {
            if (!old) {
              return {
                messages: [optimisticMessage],
                hasMore: false,
                nextCursor: null,
              }
            }
            return {
              ...old,
              messages: [...old.messages, optimisticMessage],
            }
          }
        )
      }

      return { previousData }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          getMessagesQueryKey(conversationId),
          context.previousData
        )
      }
    },
    onSuccess: (savedMessage, variables) => {
      // Reconcile optimistic message by matching clientTempId
      queryClient.setQueryData<GetMessagesResponse>(
        getMessagesQueryKey(conversationId),
        (old) => {
          if (!old) return { messages: [savedMessage], hasMore: false, nextCursor: null }
          const updatedMessages = old.messages.map((m) =>
            m.clientTempId === variables.clientTempId || m._id === savedMessage._id
              ? savedMessage
              : m
          )
          // If not replaced, append
          if (!updatedMessages.some((m) => m._id === savedMessage._id)) {
            updatedMessages.push(savedMessage)
          }
          return {
            ...old,
            messages: updatedMessages,
          }
        }
      )

      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY })
    },
  })
}

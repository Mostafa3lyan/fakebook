import { api } from "@/lib/api/client"
import { GetMessagesResponse, IMessage, SendMessageDto } from "@/lib/types"

export const messageService = {
  getMessages: (
    conversationId: string,
    params?: { before?: string; limit?: number }
  ) =>
    api<GetMessagesResponse>(`/conversation/${conversationId}/messages`, {
      method: "GET",
      params,
    }),

  sendMessage: (conversationId: string, data: SendMessageDto) => {
    if (data.attachments && data.attachments.length > 0) {
      const formData = new FormData()
      if (data.content) {
        formData.append("content", data.content)
      }
      if (data.clientTempId) {
        formData.append("clientTempId", data.clientTempId)
      }
      data.attachments.forEach((file) => {
        formData.append("attachments", file)
      })

      return api<{ message: IMessage }>(
        `/conversation/${conversationId}/messages`,
        {
          method: "POST",
          body: formData,
        }
      )
    }

    return api<{ message: IMessage }>(
      `/conversation/${conversationId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({
          content: data.content,
          clientTempId: data.clientTempId,
        }),
      }
    )
  },

  editMessage: (conversationId: string, messageId: string, content: string) =>
    api<{ message: IMessage }>(
      `/conversation/${conversationId}/messages/${messageId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ content }),
      }
    ),

  deleteMessage: (
    conversationId: string,
    messageId: string,
    mode: "everyone" | "self" = "everyone"
  ) =>
    api<{ message: string; mode: string }>(
      `/conversation/${conversationId}/messages/${messageId}`,
      {
        method: "DELETE",
        params: { mode },
      }
    ),

  markAsRead: (conversationId: string, lastMessageId?: string) =>
    api<{ message: string; readAt: string }>(
      `/conversation/${conversationId}/read`,
      {
        method: "POST",
        body: JSON.stringify({ lastMessageId }),
      }
    ),
}


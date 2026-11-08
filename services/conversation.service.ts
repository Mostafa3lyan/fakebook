import { api } from "@/lib/api/client"
import {
  CreateGroupDto,
  IConversation,
  IPagination,
  UpdateGroupDto,
} from "@/lib/types"

export interface ConversationListParams {
  page?: number
  limit?: number
  search?: string
}

export const conversationService = {
  getConversations: (params?: ConversationListParams) =>
    api<{ conversations: IPagination<IConversation> }>("/conversation", {
      method: "GET",
      params,
    }),

  getMessageRequests: (params?: { page?: number; limit?: number }) =>
    api<{ requests: IPagination<IConversation> }>("/conversation/requests", {
      method: "GET",
      params,
    }),

  createOrGetDirectConversation: (recipientId: string) =>
    api<{ conversation: IConversation }>(`/conversation/direct/${recipientId}`, {
      method: "POST",
    }),

  createGroupConversation: (data: CreateGroupDto) =>
    api<{ conversation: IConversation }>("/conversation/group", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  acceptMessageRequest: (conversationId: string) =>
    api<{ conversationId: string }>(
      `/conversation/${conversationId}/accept-request`,
      {
        method: "PATCH",
      }
    ),

  rejectMessageRequest: (conversationId: string) =>
    api<{ message: string }>(`/conversation/${conversationId}/reject-request`, {
      method: "PATCH",
    }),

  getConversation: (conversationId: string) =>
    api<{ conversation: IConversation }>(`/conversation/${conversationId}`, {
      method: "GET",
    }),

  updateGroup: (conversationId: string, data: UpdateGroupDto) =>
    api<{ conversation: IConversation }>(`/conversation/${conversationId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  addGroupMembers: (conversationId: string, memberIds: string[]) =>
    api<{ members: unknown }>(`/conversation/${conversationId}/members`, {
      method: "POST",
      body: JSON.stringify({ memberIds }),
    }),

  removeGroupMember: (conversationId: string, memberId: string) =>
    api<{ message: string }>(
      `/conversation/${conversationId}/members/${memberId}`,
      {
        method: "DELETE",
      }
    ),

  deleteConversation: (conversationId: string, disband: boolean = false) =>
    api<{ message: string; disbanded?: boolean }>(
      `/conversation/${conversationId}`,
      {
        method: "DELETE",
        params: disband ? { disband: "true" } : undefined,
      }
    ),
}


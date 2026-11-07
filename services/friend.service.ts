import { api } from "@/lib/api/client"
import {
  FriendListParams,
  FriendListResponseData,
  FriendReceivedRequestsResponseData,
  FriendRelationshipStatusResponseData,
  FriendRequestsParams,
  FriendSentRequestsResponseData,
  SendFriendRequestResponseData,
} from "@/lib/types"

export const friendService = {
  getFriends: (params?: FriendListParams) =>
    api<FriendListResponseData>("/friends", {
      method: "GET",
      params,
    }),

  getUserFriends: (userId: string, params?: FriendListParams) =>
    api<FriendListResponseData>(`/friends/user/${userId}`, {
      method: "GET",
      params,
    }),

  getReceivedRequests: (params?: FriendRequestsParams) =>
    api<FriendReceivedRequestsResponseData>("/friends/requests/received", {
      method: "GET",
      params,
    }),

  getSentRequests: (params?: FriendRequestsParams) =>
    api<FriendSentRequestsResponseData>("/friends/requests/sent", {
      method: "GET",
      params,
    }),

  getRelationshipStatus: (targetUserId: string) =>
    api<FriendRelationshipStatusResponseData>(
      `/friends/status/${targetUserId}`,
      {
        method: "GET",
      }
    ),

  sendRequest: (receiverId: string) =>
    api<SendFriendRequestResponseData>(`/friends/request/${receiverId}`, {
      method: "POST",
    }),

  acceptRequest: (requestId: string) =>
    api<void>(`/friends/accept/${requestId}`, {
      method: "PATCH",
    }),

  rejectRequest: (requestId: string) =>
    api<void>(`/friends/reject/${requestId}`, {
      method: "PATCH",
    }),

  cancelRequest: (requestId: string) =>
    api<void>(`/friends/cancel/${requestId}`, {
      method: "DELETE",
    }),

  unfriend: (friendId: string) =>
    api<void>(`/friends/unfriend/${friendId}`, {
      method: "DELETE",
    }),
}

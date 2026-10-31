import { IPagination } from "./api"

export interface IFriendUser {
  _id: string
  firstName: string
  lastName: string
  email?: string
  profilePicture?: string
}

export interface IFriendRequestBase {
  _id: string
  status?: "pending" | "accepted" | "rejected"
  createdAt: string
  updatedAt?: string
}

export interface IFriendReceivedRequest extends IFriendRequestBase {
  sender: {
    _id: string
    firstName: string
    lastName: string
    profilePicture?: string
  }
}

export interface IFriendSentRequest extends IFriendRequestBase {
  receiver: {
    _id: string
    firstName: string
    lastName: string
    profilePicture?: string
  }
}

export interface FriendListParams {
  page?: number
  limit?: number
  search?: string
}

export interface FriendRequestsParams {
  page?: number
  limit?: number
}

export interface FriendListResponseData {
  friends: IPagination<IFriendUser>
}

export interface FriendReceivedRequestsResponseData {
  requests: IPagination<IFriendReceivedRequest>
}

export interface FriendSentRequestsResponseData {
  requests: IPagination<IFriendSentRequest>
}

export interface SendFriendRequestResponseData {
  request: {
    _id: string
    sender: string
    receiver: string
    status: string
    createdAt: string
  }
}

export type FriendshipStatusType =
  | "self"
  | "friends"
  | "pending_sent"
  | "pending_received"
  | "none"

export interface IFriendshipStatus {
  status: FriendshipStatusType
  requestId?: string
}

export interface FriendRelationshipStatusResponseData {
  status: IFriendshipStatus
}

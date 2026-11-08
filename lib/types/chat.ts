import { IPublicUser, IUser } from "./user"

export type ConversationType = "direct" | "group"
export type ConversationStatus = "accepted" | "request" | "rejected"
export type ParticipantRole = "admin" | "member"
export type MessageType = "text" | "image" | "file" | "system"

export interface IConversationParticipant {
  user: IPublicUser | IUser
  role: ParticipantRole
  joinedAt: string
  lastReadAt?: string
  lastReadMessageId?: string
}

export interface IMessageAttachment {
  url: string
  name: string
  size: number
  mimeType: string
}

export interface IMessageReceipt {
  user: string | IPublicUser
  timestamp: string
}

export interface IMessage {
  _id: string
  conversationId: string
  sender: IPublicUser | IUser
  type: MessageType
  content: string
  attachments: IMessageAttachment[]
  deliveredTo?: IMessageReceipt[]
  readBy?: IMessageReceipt[]
  isEdited: boolean
  editedAt?: string
  isDeleted: boolean
  deletedAt?: string
  clientTempId?: string
  createdAt: string
  updatedAt: string
  isPending?: boolean
  error?: string
}

export interface IConversation {
  _id: string
  type: ConversationType
  status: ConversationStatus
  title?: string
  avatar?: string
  participants: IConversationParticipant[]
  admins: string[]
  requestedBy?: IPublicUser | string
  requestedTo?: IPublicUser | string
  lastMessage?: IMessage | null
  lastMessageAt?: string
  unreadCount?: number
  isDeletedFor?: string[]
  createdAt: string
  updatedAt: string
}

export interface GetMessagesResponse {
  messages: IMessage[]
  hasMore: boolean
  nextCursor: string | null
}

export interface SendMessageDto {
  content?: string
  clientTempId?: string
  attachments?: File[]
}

export interface CreateGroupDto {
  title: string
  participantIds: string[]
}

export interface UpdateGroupDto {
  title?: string
  avatar?: string
}


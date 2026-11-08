export interface NotificationPayloadData {
  message?: string
  entityType?: "friend_request" | "friend_accept" | "post" | "comment" | string
  entityId?: string
  postId?: string
  commentId?: string
  parentCommentId?: string
  actorId?: string
  actorName?: string
  actorAvatar?: string | null
  actionUrl?: string
  [key: string]: unknown
}

export interface INotification {
  id: string
  message: string
  workflow?: string
  status: "delivered" | "sent" | "seen" | "read" | string
  readAt: string | null
  seenAt: string | null
  createdAt: string
  data?: NotificationPayloadData
}

export interface NotificationPageInfo {
  after?: string | null
  before?: string | null
  page_size?: number
  total_count?: number
}

export interface NotificationsData {
  items: INotification[]
  total: number
  unreadCount: number
  unseenCount?: number
  pageInfo?: NotificationPageInfo
}

export interface UnreadCountData {
  unreadCount: number
}

export interface NotificationQueryParams {
  page?: number
  limit?: number
  after?: string
}

export interface FcmTokenDto {
  token: string
}


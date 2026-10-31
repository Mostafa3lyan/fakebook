import { PostVisibilityEnum, ReactionTypeEnum } from "./enums"
import { IPublicUser } from "./user"

export interface IReaction {
  createdBy: IPublicUser | string
  reactionType: ReactionTypeEnum
  createdAt: string
}

export interface IPostLocation {
  name: string
  lat?: number
  lng?: number
}

export interface ISharedPostInfo {
  originalPostId: IPost | string
  originalAuthorId: IPublicUser | string
}

export interface IPost {
  _id: string
  content?: string
  attachments?: string[]
  createdBy: IPublicUser
  updatedBy?: IPublicUser
  visibility: PostVisibilityEnum
  tags?: IPublicUser[]
  location?: IPostLocation
  reactions?: IReaction[]
  reactionsCount: number
  reactionsBreakdown: Record<ReactionTypeEnum, number>
  commentsCount: number
  sharedFrom?: ISharedPostInfo
  shareCount: number
  isEdited: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string
  restoredAt?: string
}

export interface CreatePostPayload {
  content?: string
  visibility: PostVisibilityEnum
  tags?: string[]
  location?: IPostLocation
  files?: File[]
}

export interface UpdatePostPayload {
  content?: string
  visibility?: PostVisibilityEnum
  tags?: string[]
  location?: IPostLocation | null
  removeAttachments?: string[]
  files?: File[]
}

export interface SharePostPayload {
  content?: string
  visibility: PostVisibilityEnum
  tags?: string[]
}

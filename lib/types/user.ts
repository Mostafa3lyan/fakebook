import { GenderEnum, ProviderEnum, RoleEnum } from "./enums"

export interface IUser {
  _id: string
  id?: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone?: string
  dateOfBirth?: string
  gender?: GenderEnum
  provider: ProviderEnum
  role: RoleEnum
  profilePicture?: string
  profileCoverPictures: string[]
  profileVisits?: number
  friends?: IUser[] | string[]
  twoFactorVerified: boolean
  emailConfirmedAt?: string
  createdAt: string
  updatedAt: string
}

export interface IPublicUser {
  _id: string
  firstName: string
  lastName: string
  fullName?: string
  profilePicture?: string
  profileCoverPictures?: string[]
  profileVisits?: number
}

/** Body for requesting an S3 pre-signed image upload URL */
export interface PresignedImageUploadDto {
  contentType: string
  originalname: string
}

/** Response of `PATCH /user/profile-image` and `PATCH /user/profile-cover-image` */
export interface PresignedImageUploadResponse {
  user: IUser
  url: string
  key: string
}

export interface UpdateProfileDto {
  firstName?: string
  lastName?: string
  phone?: string
  dateOfBirth?: string
  gender?: GenderEnum
}

export interface BlockedUser {
  _id: string
  firstName: string
  lastName: string
  profilePicture?: string
}

export type SearchUsersParams = {
  search: string
  page?: number
  limit?: number
}

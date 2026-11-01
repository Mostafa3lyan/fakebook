import { api } from "@/lib/api/client"
import {
  AuthCredentials,
  BlockedUser,
  ChangePasswordDto,
  IPagination,
  IPublicUser,
  IUser,
  PresignedImageUploadDto,
  PresignedImageUploadResponse,
  RestoreAccountDto,
  SearchUsersParams,
  UpdateProfileDto,
} from "@/lib/types"

export const userService = {
  getProfile: () =>
    api<{ profile: IUser }>("/user", {
      method: "GET",
    }),

  updateProfile: (data: UpdateProfileDto) =>
    api<{ profile: IUser }>("/user/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  shareProfile: (userId: string) =>
    api<{ account: IPublicUser }>(`/user/${userId}/share-profile`, {
      method: "GET",
    }),

  requestProfileImageUpload: (data: PresignedImageUploadDto) =>
    api<PresignedImageUploadResponse>("/user/profile-image", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  removeProfileImage: () =>
    api<{ user: IUser }>("/user/remove-profile-image", {
      method: "DELETE",
    }),

  requestCoverImageUpload: (data: PresignedImageUploadDto) =>
    api<PresignedImageUploadResponse>("/user/profile-cover-image", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  removeCoverImage: () =>
    api<{ user: IUser }>("/user/remove-profile-cover-image", {
      method: "DELETE",
    }),

  changePassword: (data: ChangePasswordDto) =>
    api<{ access_token: string; refresh_token: string }>("/user/change-password", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  softDeleteAccount: () =>
    api<void>("/user/soft-delete", {
      method: "DELETE",
    }),

  restoreAccount: (data: RestoreAccountDto) =>
    api<AuthCredentials>("/user/restore-account", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteAccount: () =>
    api<void>("/user/delete-account", {
      method: "DELETE",
    }),

  blockUser: (targetUserId: string) =>
    api<void>(`/user/block/${targetUserId}`, {
      method: "POST",
    }),

  unblockUser: (targetUserId: string) =>
    api<void>(`/user/unblock/${targetUserId}`, {
      method: "DELETE",
    }),

  getBlockedUsers: (params?: { page?: number; limit?: number }) =>
    api<{ blockedUsers: IPagination<BlockedUser> }>("/user/blocked", {
      method: "GET",
      params,
    }),

  searchUsers: (params: SearchUsersParams) =>
    api<{ users: IPagination<IPublicUser> }>("/user/search", {
      method: "GET",
      params,
    }),
}


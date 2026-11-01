"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { userService } from "@/services/user.service"
import type {
  ApiResponse,
  IUser,
  PresignedImageUploadDto,
  PresignedImageUploadResponse,
} from "@/lib/types"

interface PresignedImageConfig {
  /** Requests a pre-signed S3 PUT URL. */
  requestUpload: (data: PresignedImageUploadDto) => Promise<ApiResponse<PresignedImageUploadResponse>>
  /** Deletes the S3 object (which triggers the AWS Lambda to clear the DB field). */
  remove: () => Promise<unknown>
  /** Optimistically applies the newly uploaded S3 key to the cached user while Lambda updates MongoDB. */
  applyUploadedKey: (user: IUser, key: string) => IUser
  /** Optimistically clears the image field on the cached user while Lambda updates MongoDB. */
  clearStoredKey: (user: IUser) => IUser
  labels: {
    uploaded: string
    removed: string
    uploadFailed: string
    removeFailed: string
  }
}

/** Delay before re-fetching from backend so AWS S3 -> Lambda -> MongoDB has settled. */
const LAMBDA_SYNC_DELAY_MS = 2500

/**
 * Shared S3 pre-signed upload/remove flow for profile and cover images:
 * 1. `PATCH` the backend for a pre-signed URL and target S3 `key`.
 * 2. `PUT` the binary directly to S3 with the signed `Content-Type`.
 * 3. AWS S3 triggers the `s3-file-upload` Lambda (`ObjectCreated` / `ObjectRemoved`)
 *    which updates `profilePicture` or `profileCoverPictures` in MongoDB.
 * 4. Optimistically updates the local user cache immediately (since the object is
 *    already in S3) and re-fetches after the Lambda sync window.
 */
function usePresignedImage({
  requestUpload,
  remove,
  applyUploadedKey,
  clearStoredKey,
  labels,
}: PresignedImageConfig) {
  const queryClient = useQueryClient()

  const refreshUserQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["current-user"] })
    queryClient.invalidateQueries({ queryKey: ["public-profile"] })
    queryClient.invalidateQueries({ queryKey: ["posts"] })
    queryClient.invalidateQueries({ queryKey: ["user-posts"] })
  }

  const scheduleLambdaSync = () => {
    window.setTimeout(refreshUserQueries, LAMBDA_SYNC_DELAY_MS)
  }

  const uploadMutation = useMutation<string, Error, File>({
    mutationFn: async (file) => {
      const response = await requestUpload({
        contentType: file.type,
        originalname: file.name,
      })
      const { url, key } = response.data

      let uploaded = false
      let s3ErrorDetail = ""

      try {
        const s3Response = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        })

        if (s3Response.ok) {
          uploaded = true
        } else {
          const errorBody = await s3Response.text().catch(() => "")
          console.error("S3 PUT upload failed with status:", s3Response.status, errorBody)
          s3ErrorDetail = `(S3 ${s3Response.status})`
        }
      } catch (err) {
        console.error("Network or CORS error during S3 PUT upload:", err)
        uploaded = false
      }

      if (!uploaded) {
        throw new Error(s3ErrorDetail ? `${labels.uploadFailed} ${s3ErrorDetail}` : labels.uploadFailed)
      }

      return key
    },
    onSuccess: (key) => {
      queryClient.setQueryData<IUser | undefined>(["current-user"], (current) =>
        current ? applyUploadedKey(current, key) : current,
      )
      toast.success(labels.uploaded)
      scheduleLambdaSync()
    },
    onError: (error) => {
      toast.error(error.message || labels.uploadFailed)
    },
  })

  const removeMutation = useMutation<void, Error>({
    mutationFn: async () => {
      await remove()
    },
    onSuccess: () => {
      queryClient.setQueryData<IUser | undefined>(["current-user"], (current) =>
        current ? clearStoredKey(current) : current,
      )
      toast.success(labels.removed)
      scheduleLambdaSync()
    },
    onError: (error) => {
      toast.error(error.message || labels.removeFailed)
    },
  })

  return {
    upload: uploadMutation.mutate,
    uploadAsync: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    uploadError: uploadMutation.error,

    remove: removeMutation.mutate,
    removeAsync: removeMutation.mutateAsync,
    isRemoving: removeMutation.isPending,
    removeError: removeMutation.error,
  }
}

/** Upload / remove the current user's profile picture. */
export function useProfileImage() {
  return usePresignedImage({
    requestUpload: userService.requestProfileImageUpload,
    remove: userService.removeProfileImage,
    applyUploadedKey: (user, key) => ({ ...user, profilePicture: key }),
    clearStoredKey: (user) => ({ ...user, profilePicture: undefined }),
    labels: {
      uploaded: "Profile picture updated successfully!",
      removed: "Profile picture removed.",
      uploadFailed: "Failed to upload profile picture. Please try again.",
      removeFailed: "Failed to remove profile picture.",
    },
  })
}

/** Upload / remove the current user's cover image. */
export function useCoverImage() {
  return usePresignedImage({
    requestUpload: userService.requestCoverImageUpload,
    remove: userService.removeCoverImage,
    applyUploadedKey: (user, key) => ({ ...user, profileCoverPictures: [key] }),
    clearStoredKey: (user) => ({ ...user, profileCoverPictures: [] }),
    labels: {
      uploaded: "Cover photo updated successfully!",
      removed: "Cover photo removed.",
      uploadFailed: "Failed to upload cover photo. Please try again.",
      removeFailed: "Failed to remove cover photo.",
    },
  })
}


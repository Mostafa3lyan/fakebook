"use client"

import * as React from "react"
import Image from "next/image"
import { Camera, Eye, Loader2, Trash2, UploadCloud } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCoverImage, useProfileImage } from "@/hooks/user/use-profile-images"
import { IMAGE_ACCEPT_ATTRIBUTE, validateImageFile } from "@/lib/utils/image-file"

interface ImageEditMenuProps {
  variant: "avatar" | "cover"
  label: string
  hasImage: boolean
  maxSizeMb: number
  isUploading: boolean
  isRemoving: boolean
  onUpload: (file: File) => void
  onUploadAsync: (file: File) => Promise<unknown>
  onRemove: () => void
  onPreview?: () => void
}

interface PendingImage {
  file: File
  previewUrl: string
}

/** Pre-upload preview modal showing a circular or banner crop preview before saving. */
function ImageUploadPreviewDialog({
  open,
  onClose,
  pending,
  variant,
  isUploading,
  onConfirm,
}: {
  open: boolean
  onClose: () => void
  pending: PendingImage | null
  variant: "avatar" | "cover"
  isUploading: boolean
  onConfirm: () => void
}) {
  if (!pending) return null

  const sizeMb = (pending.file.size / (1024 * 1024)).toFixed(2)
  const isAvatar = variant === "avatar"

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !isUploading && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center font-heading">
            {isAvatar ? "Preview Profile Picture" : "Preview Cover Photo"}
          </DialogTitle>
          <DialogDescription className="text-center">
            Review how your photo will appear on your profile before saving.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 flex flex-col items-center justify-center gap-3">
          {isAvatar ? (
            <div className="relative size-48 sm:size-56 rounded-full border-4 border-card shadow-lg ring-2 ring-primary/20 overflow-hidden bg-muted">
              <Image
                src={pending.previewUrl}
                alt="Profile picture preview"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          ) : (
            <div className="relative w-full aspect-[2.4/1] rounded-xl overflow-hidden border border-border shadow-md bg-muted">
              <Image
                src={pending.previewUrl}
                alt="Cover photo preview"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          )}

          <div className="text-xs text-muted-foreground text-center truncate max-w-xs">
            <span className="font-medium text-foreground">{pending.file.name}</span> ({sizeMb} MB)
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            disabled={isUploading}
            onClick={onClose}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isUploading}
            onClick={onConfirm}
            className="cursor-pointer"
          >
            {isUploading ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" aria-hidden="true" />
                Saving...
              </>
            ) : (
              "Save photo"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** Camera dropdown with "View", "Upload" (previewed), and "Remove" actions. */
function ImageEditMenu({
  variant,
  label,
  hasImage,
  maxSizeMb,
  isUploading,
  isRemoving,
  onUploadAsync,
  onRemove,
  onPreview,
}: ImageEditMenuProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [pending, setPending] = React.useState<PendingImage | null>(null)
  const isBusy = isUploading || isRemoving

  const handleClosePreview = React.useCallback(() => {
    if (pending) {
      URL.revokeObjectURL(pending.previewUrl)
      setPending(null)
    }
  }, [pending])

  // Cleanup object URL on unmount
  React.useEffect(() => {
    return () => {
      if (pending) {
        URL.revokeObjectURL(pending.previewUrl)
      }
    }
  }, [pending])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return

    const validationError = validateImageFile(file, maxSizeMb)
    if (validationError) {
      toast.error(validationError)
      return
    }

    const previewUrl = URL.createObjectURL(file)
    setPending({ file, previewUrl })
  }

  const handleConfirmUpload = async () => {
    if (!pending) return
    try {
      await onUploadAsync(pending.file)
      handleClosePreview()
    } catch {
      // Handled by mutation's onError toast
    }
  }

  const icon = isBusy ? (
    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
  ) : (
    <Camera className="size-4" aria-hidden="true" />
  )

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={IMAGE_ACCEPT_ATTRIBUTE}
        className="hidden"
        aria-label={`${label} file`}
        tabIndex={-1}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {variant === "avatar" ? (
            <Button
              type="button"
              size="icon"
              variant="secondary"
              disabled={isBusy}
              className="size-9 rounded-full border-2 border-card shadow-md cursor-pointer"
              aria-label={label}
            >
              {icon}
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={isBusy}
              className="min-h-9 bg-card/90 hover:bg-card text-foreground shadow-md backdrop-blur-xs cursor-pointer"
              aria-label={label}
            >
              {icon}
              <span className="hidden sm:inline ml-2">
                {isUploading ? "Uploading..." : isRemoving ? "Removing..." : label}
              </span>
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          {hasImage && onPreview && (
            <DropdownMenuItem onClick={onPreview} className="cursor-pointer">
              <Eye className="size-4 mr-2" aria-hidden="true" />
              <span>{variant === "avatar" ? "View profile picture" : "View cover photo"}</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer"
          >
            <UploadCloud className="size-4 mr-2" aria-hidden="true" />
            <span>{hasImage ? "Upload new photo" : "Upload photo"}</span>
          </DropdownMenuItem>
          {hasImage && (
            <DropdownMenuItem
              onClick={onRemove}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash2 className="size-4 mr-2" aria-hidden="true" />
              <span>Remove photo</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ImageUploadPreviewDialog
        open={Boolean(pending)}
        onClose={handleClosePreview}
        pending={pending}
        variant={variant}
        isUploading={isUploading}
        onConfirm={handleConfirmUpload}
      />
    </>
  )
}

/** Owner-only control to preview/upload/remove the profile picture. */
export function AvatarImageEditor({
  hasImage,
  onPreview,
}: {
  hasImage: boolean
  onPreview?: () => void
}) {
  const { upload, uploadAsync, isUploading, remove, isRemoving } = useProfileImage()

  return (
    <ImageEditMenu
      variant="avatar"
      label="Update profile picture"
      hasImage={hasImage}
      maxSizeMb={2}
      isUploading={isUploading}
      isRemoving={isRemoving}
      onUpload={upload}
      onUploadAsync={uploadAsync}
      onRemove={() => remove()}
      onPreview={onPreview}
    />
  )
}

/** Owner-only control to preview/upload/remove the cover image. */
export function CoverImageEditor({
  hasImage,
  onPreview,
}: {
  hasImage: boolean
  onPreview?: () => void
}) {
  const { upload, uploadAsync, isUploading, remove, isRemoving } = useCoverImage()

  return (
    <ImageEditMenu
      variant="cover"
      label="Edit cover photo"
      hasImage={hasImage}
      maxSizeMb={5}
      isUploading={isUploading}
      isRemoving={isRemoving}
      onUpload={upload}
      onUploadAsync={uploadAsync}
      onRemove={() => remove()}
      onPreview={onPreview}
    />
  )
}

"use client"

import * as React from "react"
import Image from "next/image"
import {
  X,
  Image as ImageIcon,
  MapPin,
  Tag,
  Loader2,
  Plus,
  Undo2,
  Share2,
} from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { UserAvatar } from "@/components/shared/user-avatar"
import { useCurrentUser } from "@/hooks/user/use-current-user"
import { useUpdatePost } from "@/hooks/posts/use-update-post"
import {
  IFriendUser,
  IPost,
  IPostLocation,
  IPublicUser,
  PostVisibilityEnum,
} from "@/lib/types"
import { resolveMediaUrl } from "@/lib/utils/media"
import { PostAttachments } from "./post-attachments"
import { PostVisibilitySelect } from "./post-visibility-select"
import { PostLocationPopover } from "./post-location-popover"
import { PostTagFriendsPopover } from "./post-tag-friends-popover"

interface PostEditDialogProps {
  post: IPost
  open: boolean
  onOpenChange: (open: boolean) => void
}

const MAX_IMAGES = 10
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024 // 2MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"]

interface FileAttachmentItem {
  file: File
  previewUrl: string
}

function PostEditForm({
  post,
  onClose,
}: {
  post: IPost
  onClose: () => void
}) {
  const { user } = useCurrentUser()
  const { mutate: updatePost, isPending } = useUpdatePost()

  const [content, setContent] = React.useState(post.content || "")
  const [visibility, setVisibility] = React.useState<PostVisibilityEnum>(
    post.visibility || PostVisibilityEnum.PUBLIC
  )
  const [locationName, setLocationName] = React.useState(
    post.location?.name || ""
  )
  const [taggedFriends, setTaggedFriends] = React.useState<IFriendUser[]>(
    () =>
      (post.tags || []).map((t) => ({
        _id: t._id,
        firstName: t.firstName,
        lastName: t.lastName,
        profilePicture: t.profilePicture,
      }))
  )

  // Attachments tracking
  const [removedKeys, setRemovedKeys] = React.useState<string[]>([])
  const [newAttachmentItems, setNewAttachmentItems] = React.useState<
    FileAttachmentItem[]
  >([])

  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const newItemsRef = React.useRef<FileAttachmentItem[]>([])

  React.useEffect(() => {
    newItemsRef.current = newAttachmentItems
  }, [newAttachmentItems])

  // Clean up object URLs on unmount
  React.useEffect(() => {
    return () => {
      newItemsRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    }
  }, [])

  const existingAttachments = post.attachments || []
  const activeExistingAttachments = existingAttachments.filter(
    (key) => !removedKeys.includes(key)
  )
  const totalAttachmentCount =
    activeExistingAttachments.length + newAttachmentItems.length

  const handleToggleRemoveExisting = (key: string) => {
    setRemovedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const incomingFiles = Array.from(e.target.files)

    const validItems: FileAttachmentItem[] = []
    for (const f of incomingFiles) {
      if (!ALLOWED_IMAGE_TYPES.includes(f.type)) {
        toast.error(`"${f.name}" must be a JPEG, PNG, or WebP image.`)
        continue
      }
      if (f.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`"${f.name}" exceeds the 2 MB limit.`)
        continue
      }
      validItems.push({
        file: f,
        previewUrl: URL.createObjectURL(f),
      })
    }

    const availableSlots = MAX_IMAGES - totalAttachmentCount
    if (validItems.length > availableSlots) {
      toast.error(`You can only have up to ${MAX_IMAGES} attachments in total.`)
      setNewAttachmentItems((prev) => [
        ...prev,
        ...validItems.slice(0, availableSlots),
      ])
    } else {
      setNewAttachmentItems((prev) => [...prev, ...validItems])
    }

    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleRemoveNewFile = (index: number) => {
    const itemToRemove = newAttachmentItems[index]
    if (itemToRemove) {
      URL.revokeObjectURL(itemToRemove.previewUrl)
    }
    setNewAttachmentItems((prev) => prev.filter((_, idx) => idx !== index))
  }


  const isSharedPost = Boolean(post.sharedFrom)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedContent = content.trim()
    if (!isSharedPost && !trimmedContent && totalAttachmentCount === 0) {
      toast.error("Post must have either text content or at least one photo.")
      return
    }

    let locationObj: IPostLocation | null | undefined = undefined
    if (locationName) {
      locationObj = { name: locationName }
    } else if (post.location?.name) {
      locationObj = null
    }

    updatePost(
      {
        postId: post._id,
        payload: {
          content: trimmedContent,
          visibility,
          location: locationObj,
          tags: taggedFriends.map((f) => f._id),
          removeAttachments:
            !isSharedPost && removedKeys.length > 0 ? removedKeys : undefined,
          files:
            !isSharedPost && newAttachmentItems.length > 0
              ? newAttachmentItems.map((item) => item.file)
              : undefined,
        },
      },
      {
        onSuccess: () => {
          onClose()
        },
      }
    )
  }

  const authorName =
    post.createdBy.fullName || `${post.createdBy.firstName} ${post.createdBy.lastName}`
  const canSubmit = isSharedPost
    ? !isPending
    : (content.trim().length > 0 || totalAttachmentCount > 0) && !isPending

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
      {/* User Row with Audience Selector */}
      <div className="flex items-center gap-3">
        <UserAvatar user={user || post.createdBy} size="md" />
        <div className="space-y-1">
          <p className="font-semibold text-sm text-foreground leading-tight">
            {authorName}
          </p>
          <PostVisibilitySelect
            value={visibility}
            onChange={setVisibility}
            disabled={isPending}
          />
        </div>
      </div>

      {/* Location & Tagged Friends Chips */}
      {(locationName || taggedFriends.length > 0) && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {locationName && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 font-medium border border-rose-500/30">
              <MapPin className="size-3 text-rose-500" />
              <span>at {locationName}</span>
              <button
                type="button"
                onClick={() => setLocationName("")}
                className="ml-1 hover:text-destructive cursor-pointer"
                aria-label="Remove location"
              >
                <X className="size-3" />
              </button>
            </span>
          )}

          {taggedFriends.map((friend) => {
            const friendName = `${friend.firstName} ${friend.lastName}`.trim()
            return (
              <span
                key={friend._id}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 font-medium border border-blue-500/30"
              >
                <Tag className="size-3 text-blue-500" />
                <span>with {friendName}</span>
                <button
                  type="button"
                  onClick={() =>
                    setTaggedFriends((prev) =>
                      prev.filter((f) => f._id !== friend._id)
                    )
                  }
                  className="ml-1 hover:text-destructive cursor-pointer"
                  aria-label={`Remove tag for ${friendName}`}
                >
                  <X className="size-3" />
                </button>
              </span>
            )
          })}
        </div>
      )}

      {/* Text Area */}
      <Textarea
        placeholder="Edit your post content..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isPending}
        className="min-h-30 resize-none text-base border-none shadow-none focus-visible:ring-0 p-1 placeholder:text-muted-foreground/70"
      />

      {/* If Shared Post: render original post preview; do NOT allow adding/modifying attachments */}
      {isSharedPost ? (
        <div className="rounded-xl border border-border/80 bg-muted/20 overflow-hidden">
          <div className="p-2.5 px-3 border-b border-border/60 flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Share2 className="size-3.5 text-primary" />
            <span>Shared post preview (attachments cannot be added to a shared post)</span>
          </div>
          {(() => {
            const originalPost =
              typeof post.sharedFrom?.originalPostId === "object" && post.sharedFrom.originalPostId
                ? (post.sharedFrom.originalPostId as IPost)
                : null

            const originalAuthor = (
              typeof post.sharedFrom?.originalAuthorId === "object" && post.sharedFrom.originalAuthorId
                ? (post.sharedFrom.originalAuthorId as IPublicUser)
                : originalPost?.createdBy
            ) ?? null

            const origName =
              originalAuthor?.fullName ||
              (originalAuthor?.firstName && originalAuthor?.lastName
                ? `${originalAuthor.firstName} ${originalAuthor.lastName}`
                : originalAuthor?.firstName) ||
              "Original Author"

            if (!originalPost) {
              return (
                <div className="p-3 text-xs text-muted-foreground italic">
                  Original post is unavailable.
                </div>
              )
            }

            return (
              <div className="p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <UserAvatar user={originalAuthor} size="sm" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">{origName}</p>
                  </div>
                </div>
                {originalPost.content && (
                  <p className="text-xs text-foreground/90 whitespace-pre-wrap">{originalPost.content}</p>
                )}
                {originalPost.attachments && originalPost.attachments.length > 0 && (
                  <PostAttachments
                    attachments={originalPost.attachments}
                    postTitle={`Attachments from ${origName}`}
                  />
                )}
              </div>
            )
          })()}
        </div>
      ) : (
        /* Regular Post Attachments Section */
        <div className="rounded-xl border border-border/80 bg-muted/20 p-3 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-foreground">
            <span>Photos ({totalAttachmentCount} / {MAX_IMAGES})</span>
            {totalAttachmentCount < MAX_IMAGES && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending}
                className="h-7 text-xs text-primary hover:text-primary cursor-pointer px-2"
              >
                <Plus className="size-3.5 mr-1" />
                Add more
              </Button>
            )}
          </div>

          {/* Existing Attachments Grid */}
          {existingAttachments.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-medium text-muted-foreground">Current photos</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {existingAttachments.map((key, idx) => {
                  const isMarkedRemoved = removedKeys.includes(key)
                  const resolvedUrl = resolveMediaUrl(key)

                  return (
                    <div
                      key={key || idx}
                      className={`relative aspect-square rounded-lg overflow-hidden border transition-all ${
                        isMarkedRemoved
                          ? "opacity-40 border-destructive/50 grayscale"
                          : "border-border"
                      }`}
                    >
                      <Image
                        src={resolvedUrl}
                        alt={`Attachment ${idx + 1}`}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleToggleRemoveExisting(key)}
                        disabled={isPending}
                        className={`absolute top-1 right-1 size-6 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                          isMarkedRemoved
                            ? "bg-primary text-primary-foreground"
                            : "bg-black/70 hover:bg-black text-white"
                        }`}
                        aria-label={
                          isMarkedRemoved
                            ? `Restore image ${idx + 1}`
                            : `Remove image ${idx + 1}`
                        }
                        title={isMarkedRemoved ? "Undo remove" : "Remove photo"}
                      >
                        {isMarkedRemoved ? (
                          <Undo2 className="size-3.5" />
                        ) : (
                          <X className="size-3.5" />
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* New Uploaded Attachments Grid */}
          {newAttachmentItems.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] font-medium text-muted-foreground">New photos to add</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {newAttachmentItems.map((item, idx) => (
                  <div
                    key={item.previewUrl}
                    className="relative aspect-square rounded-lg overflow-hidden border border-primary/50 group bg-background"
                  >
                    <Image
                      src={item.previewUrl}
                      alt={`New preview ${idx + 1}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewFile(idx)}
                      disabled={isPending}
                      className="absolute top-1 right-1 size-6 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center cursor-pointer"
                      aria-label={`Remove new image ${idx + 1}`}
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/jpg"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {/* Quick Toolbar (Location / Photo) */}
      <div className="rounded-xl border border-border p-2.5 flex items-center justify-between gap-2 shadow-2xs">
        <span className="text-xs font-semibold text-foreground pl-1">
          Add to your post
        </span>

        <div className="flex items-center gap-1">
          {!isSharedPost && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending || totalAttachmentCount >= MAX_IMAGES}
              className="size-9 rounded-full text-emerald-500 hover:bg-emerald-500/10 cursor-pointer min-h-11 min-w-11"
              aria-label="Add photos"
            >
              <ImageIcon className="size-5" />
            </Button>
          )}

          <PostTagFriendsPopover
            selectedFriends={taggedFriends}
            onChangeSelectedFriends={setTaggedFriends}
            disabled={isPending}
          />

          <PostLocationPopover
            locationName={locationName}
            onApplyLocation={setLocationName}
            disabled={isPending}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isPending}
          className="min-h-11 px-4 text-xs font-semibold cursor-pointer"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!canSubmit}
          className="min-h-11 px-6 font-semibold text-xs shadow-sm cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" aria-hidden="true" />
              Saving...
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </form>
  )
}

export function PostEditDialog({
  post,
  open,
  onOpenChange,
}: PostEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden bg-card border-border shadow-2xl">
        <DialogHeader className="p-4 border-b border-border/80 flex flex-row items-center justify-between">
          <DialogTitle className="text-base sm:text-lg font-bold font-heading text-center flex-1">
            Edit post
          </DialogTitle>
        </DialogHeader>

        {open && (
          <PostEditForm
            post={post}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

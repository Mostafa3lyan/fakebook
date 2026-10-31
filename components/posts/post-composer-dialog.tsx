"use client"

import * as React from "react"
import Image from "next/image"
import {
  X,
  Image as ImageIcon,
  Smile,
  MapPin,
  Tag,
  Loader2,
  Plus,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { UserAvatar } from "@/components/shared/user-avatar"
import { useCurrentUser } from "@/hooks/user/use-current-user"
import { useCreatePost } from "@/hooks/posts/use-create-post"
import { IFriendUser, IPostLocation, PostVisibilityEnum } from "@/lib/types"
import { PostVisibilitySelect } from "./post-visibility-select"
import { PostLocationPopover } from "./post-location-popover"
import { PostTagFriendsPopover } from "./post-tag-friends-popover"

interface PostComposerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialMode?: "photo" | "tag" | "feeling" | "location" | null
}

const FEELINGS = [
  { label: "happy", emoji: "😊" },
  { label: "loved", emoji: "🥰" },
  { label: "excited", emoji: "🤩" },
  { label: "blessed", emoji: "😇" },
  { label: "grateful", emoji: "🙏" },
  { label: "crazy", emoji: "🤪" },
  { label: "cool", emoji: "😎" },
  { label: "relaxed", emoji: "😌" },
  { label: "sad", emoji: "😢" },
  { label: "tired", emoji: "😴" },
  { label: "motivated", emoji: "💪" },
  { label: "festive", emoji: "🥳" },
]

const MAX_IMAGES = 10
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024 // 2MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"]

interface FileAttachmentItem {
  file: File
  previewUrl: string
}

function PostComposerForm({
  onClose,
  initialMode,
}: {
  onClose: () => void
  initialMode?: "photo" | "tag" | "feeling" | "location" | null
}) {
  const { user } = useCurrentUser()
  const { mutate: createPost, isPending } = useCreatePost()

  const [content, setContent] = React.useState("")
  const [visibility, setVisibility] = React.useState<PostVisibilityEnum>(
    PostVisibilityEnum.PUBLIC
  )
  const [attachmentItems, setAttachmentItems] = React.useState<FileAttachmentItem[]>([])
  const [showPhotoDropzone, setShowPhotoDropzone] = React.useState(
    initialMode === "photo"
  )

  // Meta chips
  const [selectedFeeling, setSelectedFeeling] = React.useState<{
    label: string
    emoji: string
  } | null>(null)
  const [locationName, setLocationName] = React.useState("")
  const [taggedFriends, setTaggedFriends] = React.useState<IFriendUser[]>([])

  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const itemsRef = React.useRef<FileAttachmentItem[]>([])

  React.useEffect(() => {
    itemsRef.current = attachmentItems
  }, [attachmentItems])

  // Revoke object URLs on component unmount
  React.useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    }
  }, [])

  // Auto trigger file picker if opened in photo mode
  React.useEffect(() => {
    if (initialMode === "photo") {
      const timer = setTimeout(() => {
        fileInputRef.current?.click()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [initialMode])

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

    if (attachmentItems.length + validItems.length > MAX_IMAGES) {
      toast.error(`You can upload a maximum of ${MAX_IMAGES} images.`)
      const remainingSlots = MAX_IMAGES - attachmentItems.length
      setAttachmentItems((prev) => [...prev, ...validItems.slice(0, remainingSlots)])
    } else {
      setAttachmentItems((prev) => [...prev, ...validItems])
    }

    setShowPhotoDropzone(true)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleRemoveFile = (index: number) => {
    const itemToRemove = attachmentItems[index]
    if (itemToRemove) {
      URL.revokeObjectURL(itemToRemove.previewUrl)
    }
    setAttachmentItems((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedContent = content.trim()
    if (!trimmedContent && attachmentItems.length === 0) {
      toast.error("Please add some text or photos to your post.")
      return
    }

    let locationObj: IPostLocation | undefined = undefined
    if (locationName) {
      locationObj = { name: locationName }
    }

    let finalContent = trimmedContent
    if (selectedFeeling) {
      const feelingSuffix = `— feeling ${selectedFeeling.label} ${selectedFeeling.emoji}`
      finalContent = finalContent ? `${finalContent}\n\n${feelingSuffix}` : feelingSuffix
    }

    createPost(
      {
        content: finalContent || undefined,
        visibility,
        location: locationObj,
        tags:
          taggedFriends.length > 0
            ? taggedFriends.map((f) => f._id)
            : undefined,
        files:
          attachmentItems.length > 0
            ? attachmentItems.map((item) => item.file)
            : undefined,
      },
      {
        onSuccess: () => {
          onClose()
        },
      }
    )
  }

  const authorName = user?.fullName || `${user?.firstName} ${user?.lastName}`
  const firstName = user?.firstName || "Friend"
  const canSubmit =
    (content.trim().length > 0 ||
      attachmentItems.length > 0 ||
      Boolean(selectedFeeling)) &&
    !isPending

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
      {/* User Row with Audience Selector */}
      <div className="flex items-center gap-3">
        <UserAvatar user={user} size="md" />
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

      {/* Active Chips (Feeling / Location / Tagged Friends) */}
      {(selectedFeeling || locationName || taggedFriends.length > 0) && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {selectedFeeling && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-medium border border-amber-500/30">
              <span>
                Feeling {selectedFeeling.label} {selectedFeeling.emoji}
              </span>
              <button
                type="button"
                onClick={() => setSelectedFeeling(null)}
                className="ml-1 hover:text-destructive cursor-pointer"
                aria-label="Remove feeling"
              >
                <X className="size-3" />
              </button>
            </span>
          )}

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
        placeholder={`What's on your mind, ${firstName}?`}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isPending}
        className="min-h-30 resize-none text-base border-none shadow-none focus-visible:ring-0 p-1 placeholder:text-muted-foreground/70"
      />

      {/* Image Upload Area & Previews */}
      {showPhotoDropzone && (
        <div className="rounded-xl border border-border/80 bg-muted/20 p-3 space-y-3">
          {attachmentItems.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {attachmentItems.map((item, idx) => (
                <div
                  key={item.previewUrl}
                  className="relative aspect-square rounded-lg overflow-hidden border border-border group bg-background"
                >
                  <Image
                    src={item.previewUrl}
                    alt={`Selected preview ${idx + 1}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    disabled={isPending}
                    className="absolute top-1 right-1 size-6 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-opacity cursor-pointer"
                    aria-label={`Remove image ${idx + 1}`}
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}

              {attachmentItems.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isPending}
                  className="aspect-square rounded-lg border-2 border-dashed border-border/80 hover:border-primary flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  aria-label="Add more photos"
                >
                  <Plus className="size-5" />
                  <span className="text-[11px] font-medium">Add Photo</span>
                </button>
              )}
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="py-8 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border/80 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                <ImageIcon className="size-5 text-emerald-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold">Add Photos / Videos</p>
                <p className="text-xs text-muted-foreground">or drag and drop up to 10 images (max 2 MB each)</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
            <span>{attachmentItems.length} / {MAX_IMAGES} photos selected</span>
            <button
              type="button"
              onClick={() => {
                attachmentItems.forEach((item) => URL.revokeObjectURL(item.previewUrl))
                setAttachmentItems([])
                setShowPhotoDropzone(false)
              }}
              className="hover:text-destructive cursor-pointer"
            >
              Close photo area
            </button>
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

      {/* "Add to your post" Facebook Toolbar */}
      <div className="rounded-xl border border-border p-2.5 flex items-center justify-between gap-2 shadow-2xs">
        <span className="text-xs font-semibold text-foreground pl-1">
          Add to your post
        </span>

        <div className="flex items-center gap-1">
          {/* Photo Trigger */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              setShowPhotoDropzone(true)
              fileInputRef.current?.click()
            }}
            disabled={isPending}
            className="size-9 rounded-full text-emerald-500 hover:bg-emerald-500/10 cursor-pointer min-h-11 min-w-11"
            aria-label="Add photos or videos"
          >
            <ImageIcon className="size-5" />
          </Button>

          {/* Tag Friends Trigger */}
          <PostTagFriendsPopover
            selectedFriends={taggedFriends}
            onChangeSelectedFriends={setTaggedFriends}
            disabled={isPending}
            defaultOpen={initialMode === "tag"}
          />

          {/* Feeling Trigger */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={isPending}
                className="size-9 rounded-full text-amber-500 hover:bg-amber-500/10 cursor-pointer min-h-11 min-w-11"
                aria-label="Add feeling or activity"
              >
                <Smile className="size-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 p-2">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground px-2 py-1">
                  How are you feeling?
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {FEELINGS.map((f) => (
                    <button
                      key={f.label}
                      type="button"
                      onClick={() => setSelectedFeeling(f)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-muted text-foreground transition-colors cursor-pointer text-left"
                    >
                      <span className="text-base">{f.emoji}</span>
                      <span className="capitalize">{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Location Check-in Trigger */}
          <PostLocationPopover
            locationName={locationName}
            onApplyLocation={setLocationName}
            disabled={isPending}
          />
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!canSubmit}
        className="w-full min-h-11 font-semibold text-sm shadow-sm cursor-pointer"
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 mr-2 animate-spin" aria-hidden="true" />
            Publishing post...
          </>
        ) : (
          "Post"
        )}
      </Button>
    </form>
  )
}

export function PostComposerDialog({
  open,
  onOpenChange,
  initialMode = null,
}: PostComposerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden bg-card border-border shadow-2xl">
        <DialogHeader className="p-4 border-b border-border/80 flex flex-row items-center justify-between">
          <DialogTitle className="text-base sm:text-lg font-bold font-heading text-center flex-1">
            Create post
          </DialogTitle>
        </DialogHeader>

        {open && (
          <PostComposerForm
            initialMode={initialMode}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

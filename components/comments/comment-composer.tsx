"use client"

import * as React from "react"
import Image from "next/image"
import { Image as ImageIcon, Send, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { UserAvatar } from "@/components/shared/user-avatar"
import { useCurrentUser } from "@/hooks/user/use-current-user"
import { useCreateComment } from "@/hooks/comments/use-create-comment"
import { useCreateReply } from "@/hooks/comments/use-create-reply"
import { cn } from "@/lib/utils"

interface CommentComposerProps {
  postId: string
  parentCommentId?: string
  placeholder?: string
  autoFocus?: boolean
  initialContent?: string
  onSuccess?: () => void
  onCancel?: () => void
  className?: string
  size?: "default" | "sm"
}

const MAX_ATTACHMENTS = 2
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024 // 2 MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"]

interface FileItem {
  file: File
  previewUrl: string
}

export function CommentComposer({
  postId,
  parentCommentId,
  placeholder,
  autoFocus = false,
  initialContent = "",
  onSuccess,
  onCancel,
  className,
  size = "default",
}: CommentComposerProps) {
  const { user } = useCurrentUser()
  const { mutate: createComment, isPending: isCreatingComment } = useCreateComment()
  const { mutate: createReply, isPending: isCreatingReply } = useCreateReply()

  const isPending = isCreatingComment || isCreatingReply

  const [content, setContent] = React.useState(initialContent)
  const [attachmentItems, setAttachmentItems] = React.useState<FileItem[]>([])

  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const itemsRef = React.useRef<FileItem[]>([])

  React.useEffect(() => {
    itemsRef.current = attachmentItems
  }, [attachmentItems])

  // Clean up object URLs on unmount
  React.useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    }
  }, [])

  // Focus textarea if requested
  React.useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      )
    }
  }, [autoFocus])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const incomingFiles = Array.from(e.target.files)

    const validItems: FileItem[] = []
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

    if (attachmentItems.length + validItems.length > MAX_ATTACHMENTS) {
      toast.error(`You can attach up to ${MAX_ATTACHMENTS} photos per comment.`)
      const available = MAX_ATTACHMENTS - attachmentItems.length
      setAttachmentItems((prev) => [...prev, ...validItems.slice(0, available)])
    } else {
      setAttachmentItems((prev) => [...prev, ...validItems])
    }

    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleRemoveFile = (index: number) => {
    const item = attachmentItems[index]
    if (item) {
      URL.revokeObjectURL(item.previewUrl)
    }
    setAttachmentItems((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    const trimmed = content.trim()
    if (!trimmed && attachmentItems.length === 0) {
      return
    }

    const payload = {
      content: trimmed || undefined,
      files:
        attachmentItems.length > 0
          ? attachmentItems.map((item) => item.file)
          : undefined,
    }

    if (parentCommentId) {
      createReply(
        { postId, commentId: parentCommentId, payload },
        {
          onSuccess: () => {
            setContent("")
            setAttachmentItems([])
            if (onSuccess) onSuccess()
          },
        }
      )
    } else {
      createComment(
        { postId, payload },
        {
          onSuccess: () => {
            setContent("")
            setAttachmentItems([])
            if (onSuccess) onSuccess()
          },
        }
      )
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const canSubmit = (content.trim().length > 0 || attachmentItems.length > 0) && !isPending
  const avatarSize = size === "sm" ? "xs" : "sm"

  return (
    <div className={cn("flex gap-2.5 items-start w-full", className)}>
      <div className="shrink-0 pt-0.5">
        <UserAvatar user={user} size={avatarSize} />
      </div>

      <div className="flex-1 space-y-2">
        <div className="relative rounded-2xl bg-muted/60 dark:bg-muted/40 border border-border/70 focus-within:border-primary/60 focus-within:bg-background transition-colors p-2 shadow-2xs">
          <Textarea
            ref={textareaRef}
            placeholder={
              placeholder || (parentCommentId ? "Write a reply..." : "Write a comment...")
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isPending}
            rows={1}
            className="min-h-9.5 max-h-32 resize-none border-none shadow-none focus-visible:ring-0 p-1 text-xs sm:text-sm placeholder:text-muted-foreground/70"
          />

          {/* Attachment Previews */}
          {attachmentItems.length > 0 && (
            <div className="flex items-center gap-2 p-1.5 flex-wrap">
              {attachmentItems.map((item, idx) => (
                <div
                  key={item.previewUrl}
                  className="relative size-14 rounded-lg overflow-hidden border border-border group bg-background shrink-0"
                >
                  <Image
                    src={item.previewUrl}
                    alt={`Attachment preview ${idx + 1}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    disabled={isPending}
                    className="absolute top-0.5 right-0.5 size-4 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center cursor-pointer"
                    aria-label="Remove photo"
                  >
                    <X className="size-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Composer Action Toolbar */}
          <div className="flex items-center justify-between pt-1 border-t border-border/40 mt-1">
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending || attachmentItems.length >= MAX_ATTACHMENTS}
                className="size-7 rounded-full text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 cursor-pointer min-h-11 min-w-11"
                aria-label="Attach photo"
              >
                <ImageIcon className="size-4" />
              </Button>
            </div>

            <div className="flex items-center gap-1.5">
              {onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onCancel}
                  disabled={isPending}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer min-h-11"
                >
                  Cancel
                </Button>
              )}

              <Button
                type="button"
                size="icon"
                onClick={() => handleSubmit()}
                disabled={!canSubmit}
                className="size-7 rounded-full cursor-pointer min-h-11 min-w-11"
                aria-label={parentCommentId ? "Post reply" : "Post comment"}
              >
                {isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Send className="size-3.5" />
                )}
              </Button>
            </div>
          </div>
        </div>

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
    </div>
  )
}

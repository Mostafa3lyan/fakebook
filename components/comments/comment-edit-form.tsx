"use client"

import * as React from "react"
import Image from "next/image"
import { ImageIcon, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { IComment } from "@/lib/types"
import { useUpdateComment } from "@/hooks/comments/use-update-comment"
import { resolveMediaUrl } from "@/lib/utils/media"

interface CommentEditFormProps {
  comment: IComment
  postId: string
  parentCommentId?: string
  onCancel: () => void
  onSuccess: () => void
}

interface NewFileItem {
  file: File
  previewUrl: string
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"]

export function CommentEditForm({
  comment,
  postId,
  parentCommentId,
  onCancel,
  onSuccess,
}: CommentEditFormProps) {
  const { mutate: updateComment, isPending: isUpdating } = useUpdateComment()

  const [editContent, setEditContent] = React.useState(comment.content || "")
  const [removedAttachments, setRemovedAttachments] = React.useState<string[]>([])
  const [newFiles, setNewFiles] = React.useState<NewFileItem[]>([])

  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const newFilesRef = React.useRef<NewFileItem[]>([])

  React.useEffect(() => {
    newFilesRef.current = newFiles
  }, [newFiles])

  React.useEffect(() => {
    return () => {
      newFilesRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    }
  }, [])

  const existingAttachments = comment.attachments || []
  const activeExistingCount = existingAttachments.filter(
    (k) => !removedAttachments.includes(k)
  ).length
  const totalEditAttachments = activeExistingCount + newFiles.length

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const incomingFiles = Array.from(e.target.files)

    const validItems: NewFileItem[] = []
    for (const f of incomingFiles) {
      if (!ALLOWED_IMAGE_TYPES.includes(f.type)) {
        toast.error(`"${f.name}" must be a JPEG, PNG, or WebP image.`)
        continue
      }
      if (f.size > 2 * 1024 * 1024) {
        toast.error(`"${f.name}" exceeds the 2 MB limit.`)
        continue
      }
      validItems.push({ file: f, previewUrl: URL.createObjectURL(f) })
    }

    const availableSlots = 2 - totalEditAttachments
    if (validItems.length > availableSlots) {
      toast.error("You can only have up to 2 photos per comment.")
      setNewFiles((prev) => [...prev, ...validItems.slice(0, availableSlots)])
    } else {
      setNewFiles((prev) => [...prev, ...validItems])
    }

    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = editContent.trim()
    if (!trimmed && totalEditAttachments === 0) {
      toast.error("Comment must have either text or a photo.")
      return
    }

    updateComment(
      {
        postId,
        commentId: comment._id,
        parentCommentId,
        payload: {
          content: trimmed,
          removeAttachments:
            removedAttachments.length > 0 ? removedAttachments : undefined,
          files: newFiles.length > 0 ? newFiles.map((n) => n.file) : undefined,
        },
      },
      {
        onSuccess: () => {
          newFiles.forEach((n) => URL.revokeObjectURL(n.previewUrl))
          setNewFiles([])
          onSuccess()
        },
      }
    )
  }

  const handleCancelClick = () => {
    newFiles.forEach((n) => URL.revokeObjectURL(n.previewUrl))
    setNewFiles([])
    onCancel()
  }

  return (
    <form onSubmit={handleSaveEdit} className="space-y-2 pt-1 w-full">
      <Textarea
        value={editContent}
        onChange={(e) => setEditContent(e.target.value)}
        rows={2}
        className="w-full text-xs rounded-xl resize-none"
        placeholder="Edit your comment..."
        autoFocus
        disabled={isUpdating}
      />

      {/* Existing attachments to keep / remove */}
      {existingAttachments.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap pt-1">
          {existingAttachments.map((key) => {
            const isRemoved = removedAttachments.includes(key)
            return (
              <div
                key={key}
                className={`relative size-12 rounded-lg overflow-hidden border ${
                  isRemoved ? "opacity-30 border-destructive" : "border-border"
                }`}
              >
                <Image
                  src={resolveMediaUrl(key)}
                  alt="Existing attachment"
                  fill
                  unoptimized
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (isRemoved) {
                      setRemovedAttachments((prev) => prev.filter((k) => k !== key))
                    } else {
                      setRemovedAttachments((prev) => [...prev, key])
                    }
                  }}
                  className="absolute top-0.5 right-0.5 size-4 rounded-full bg-black/70 text-white flex items-center justify-center cursor-pointer"
                  title={isRemoved ? "Undo remove" : "Remove photo"}
                  aria-label={isRemoved ? "Undo remove photo" : "Remove existing photo"}
                >
                  <X className="size-2.5" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* New files preview */}
      {newFiles.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap pt-1">
          {newFiles.map((item, idx) => (
            <div
              key={idx}
              className="relative size-12 rounded-lg overflow-hidden border border-primary/50"
            >
              <Image
                src={item.previewUrl}
                alt="New attachment"
                fill
                unoptimized
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(item.previewUrl)
                  setNewFiles((prev) => prev.filter((_, i) => i !== idx))
                }}
                className="absolute top-0.5 right-0.5 size-4 rounded-full bg-black/70 text-white flex items-center justify-center cursor-pointer"
                aria-label={`Remove new photo ${idx + 1}`}
              >
                <X className="size-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-center justify-between pt-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUpdating || totalEditAttachments >= 2}
          className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <ImageIcon className="size-3.5 mr-1 text-emerald-500" />
          <span>Add photo</span>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCancelClick}
            disabled={isUpdating}
            className="text-xs h-7 px-2.5"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isUpdating}
            className="text-xs h-7 px-3"
          >
            {isUpdating ? <Loader2 className="size-3 animate-spin mr-1" /> : null}
            <span>Save</span>
          </Button>
        </div>
      </div>
    </form>
  )
}

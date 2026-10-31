"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useDeleteComment } from "@/hooks/comments/use-delete-comment"

interface CommentDeleteDialogProps {
  postId: string
  commentId: string
  parentCommentId?: string
  repliesCount?: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommentDeleteDialog({
  postId,
  commentId,
  parentCommentId,
  repliesCount,
  open,
  onOpenChange,
}: CommentDeleteDialogProps) {
  const { mutate: deleteComment, isPending: isDeleting } = useDeleteComment()

  const handleDeleteConfirm = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    deleteComment(
      {
        postId,
        commentId,
        parentCommentId,
        repliesCount,
      },
      {
        onSuccess: () => onOpenChange(false),
      }
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this comment?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this comment? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

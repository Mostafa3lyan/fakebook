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
import { useUnfriend } from "@/hooks/friends/use-friend-mutations"

interface UnfriendDialogProps {
  friendId: string
  friendName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UnfriendDialog({
  friendId,
  friendName,
  open,
  onOpenChange,
}: UnfriendDialogProps) {
  const { mutate: unfriend, isPending } = useUnfriend()

  const handleConfirm = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    unfriend(friendId, {
      onSuccess: () => onOpenChange(false),
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unfriend {friendName}?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove {friendName} as your friend? You will no longer see their friends-only posts.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "Removing..." : "Unfriend"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

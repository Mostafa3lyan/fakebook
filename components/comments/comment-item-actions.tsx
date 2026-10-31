"use client"

import * as React from "react"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { REACTION_CONFIG, ReactionPicker } from "@/components/posts/reaction-picker"
import { IComment, ReactionTypeEnum } from "@/lib/types"
import { useCurrentUser } from "@/hooks/user/use-current-user"
import { useReactComment } from "@/hooks/comments/use-react-comment"
import { formatRelativeTime } from "@/lib/utils/date"
import { cn } from "@/lib/utils"

interface CommentItemActionsProps {
  comment: IComment
  postId: string
  parentCommentId?: string
  isAuthor: boolean
  canDelete: boolean
  isReply: boolean
  onReplyClick: () => void
  onEditClick: () => void
  onDeleteClick: () => void
}

export function CommentItemActions({
  comment,
  postId,
  parentCommentId,
  isAuthor,
  canDelete,
  isReply,
  onReplyClick,
  onEditClick,
  onDeleteClick,
}: CommentItemActionsProps) {
  const { user } = useCurrentUser()
  const { mutate: reactComment } = useReactComment()

  const [pickerOpen, setPickerOpen] = React.useState(false)
  const openTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const closeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    return () => {
      if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current)
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    }
  }, [])

  const currentUserId = user?._id
  const myReactionEntry = comment.reactions?.find((r) => {
    const creatorId = typeof r.createdBy === "string" ? r.createdBy : r.createdBy._id
    return creatorId === currentUserId
  })

  const [localReaction, setLocalReaction] = React.useState<ReactionTypeEnum | null | undefined>(
    undefined
  )
  const activeReaction =
    localReaction !== undefined ? localReaction : (myReactionEntry?.reactionType ?? null)

  const handleMouseEnterLike = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    openTimeoutRef.current = setTimeout(() => {
      setPickerOpen(true)
    }, 300)
  }

  const handleMouseLeaveLike = () => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current)
      openTimeoutRef.current = null
    }
    closeTimeoutRef.current = setTimeout(() => {
      setPickerOpen(false)
    }, 250)
  }

  const handleSelectReaction = (reaction: ReactionTypeEnum) => {
    if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current)
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)

    const prevReaction = activeReaction
    const isToggleOff = prevReaction === reaction
    setLocalReaction(isToggleOff ? null : reaction)
    setPickerOpen(false)

    reactComment({
      postId,
      commentId: comment._id,
      parentCommentId,
      reaction,
      currentReaction: prevReaction,
    })
  }

  const handleDirectLikeClick = () => {
    if (activeReaction) {
      handleSelectReaction(activeReaction)
    } else {
      handleSelectReaction(ReactionTypeEnum.LIKE)
    }
  }

  return (
    <div className="flex items-center gap-3 text-[11px] font-semibold text-muted-foreground pl-2 pt-0.5">
      {/* Like / Reaction Button Container */}
      <div
        className="relative inline-block"
        onMouseEnter={handleMouseEnterLike}
        onMouseLeave={handleMouseLeaveLike}
      >
        {pickerOpen && (
          <div className="absolute -top-11 left-0 z-50 pb-2 pointer-events-auto">
            <ReactionPicker
              currentReaction={activeReaction}
              onSelect={handleSelectReaction}
              onClose={() => setPickerOpen(false)}
            />
          </div>
        )}

        <button
          type="button"
          onClick={handleDirectLikeClick}
          className={cn(
            "hover:underline cursor-pointer transition-colors min-h-11 flex items-center",
            activeReaction ? REACTION_CONFIG[activeReaction].activeColor : "hover:text-foreground"
          )}
        >
          {activeReaction ? REACTION_CONFIG[activeReaction].label : "Like"}
        </button>
      </div>

      {/* Reply Trigger */}
      {!isReply && (
        <button
          type="button"
          onClick={onReplyClick}
          className="hover:underline cursor-pointer hover:text-foreground min-h-11 flex items-center"
        >
          Reply
        </button>
      )}

      {/* Relative Timestamp */}
      <span className="font-normal text-muted-foreground/80">
        {formatRelativeTime(comment.createdAt)}
      </span>

      {comment.isEdited && (
        <span className="font-normal italic text-muted-foreground/70">
          Edited
        </span>
      )}

      {/* Options Menu (Three dots) */}
      {(isAuthor || canDelete) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 text-muted-foreground opacity-100 sm:opacity-0 sm:group-hover/comment:opacity-100 sm:focus-visible:opacity-100 data-[state=open]:opacity-100 hover:text-foreground cursor-pointer rounded-full min-h-11 min-w-11"
              aria-label="Comment options"
            >
              <MoreHorizontal className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40">
            {isAuthor && (
              <DropdownMenuItem onClick={onEditClick} className="cursor-pointer text-xs">
                <Pencil className="size-3.5 mr-2" />
                <span>Edit comment</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={onDeleteClick}
              className="cursor-pointer text-xs text-destructive focus:text-destructive"
            >
              <Trash2 className="size-3.5 mr-2" />
              <span>Delete comment</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}

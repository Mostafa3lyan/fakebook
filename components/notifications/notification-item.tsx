"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Bell,
  Check,
  Heart,
  MessageCircle,
  Sparkles,
  UserCheck,
  UserPlus,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/lib/utils/date"
import { UserAvatar } from "@/components/shared/user-avatar"
import type { INotification } from "@/lib/types"

interface NotificationItemProps {
  notification: INotification
  onMarkAsRead?: (id: string) => void
  onItemClick?: () => void
  className?: string
}

function buildTargetHref(notification: INotification): string | null {
  const { data } = notification
  if (!data) return null

  if (data.actionUrl && data.actionUrl !== "/friends") {
    return data.actionUrl
  }

  const postId = data.postId || (data.entityType === "post" ? data.entityId : undefined)
  const commentId = data.commentId || (data.entityType === "comment" ? data.entityId : undefined)
  const parentCommentId = data.parentCommentId

  if (postId) {
    const params = new URLSearchParams()
    params.set("postId", postId)
    if (commentId) params.set("commentId", commentId)
    if (parentCommentId) params.set("parentCommentId", parentCommentId)
    return `/?${params.toString()}`
  }

  return data.actionUrl || null
}

function getNotificationMeta(notification: INotification) {
  const { message, data } = notification
  const entityType = data?.entityType
  const lower = message.toLowerCase()
  const resolvedHref = buildTargetHref(notification)

  if (entityType === "friend_request" || lower.includes("friend request")) {
    if (entityType === "friend_accept" || lower.includes("accepted your friend request")) {
      return {
        icon: UserCheck,
        iconColor: "text-emerald-500 bg-emerald-500/10",
        badgeColor: "bg-emerald-600 text-white",
        href: resolvedHref || (data?.actorId ? `/profile/${data.actorId}` : "/friends"),
        label: "Friend request accepted",
      }
    }

    return {
      icon: UserPlus,
      iconColor: "text-blue-500 bg-blue-500/10",
      badgeColor: "bg-blue-600 text-white",
      href: resolvedHref || "/friends?tab=received",
      label: "Friend request",
    }
  }

  if (entityType === "friend_accept" || lower.includes("accepted your friend request")) {
    return {
      icon: UserCheck,
      iconColor: "text-emerald-500 bg-emerald-500/10",
      badgeColor: "bg-emerald-600 text-white",
      href: resolvedHref || (data?.actorId ? `/profile/${data.actorId}` : "/friends"),
      label: "Friend request accepted",
    }
  }

  if (entityType === "comment" || lower.includes("comment") || lower.includes("replied")) {
    return {
      icon: MessageCircle,
      iconColor: "text-emerald-500 bg-emerald-500/10",
      badgeColor: "bg-emerald-600 text-white",
      href: resolvedHref || "/",
      label: "Comment",
    }
  }

  if (lower.includes("like") || lower.includes("react")) {
    return {
      icon: Heart,
      iconColor: "text-rose-500 bg-rose-500/10",
      badgeColor: "bg-rose-600 text-white",
      href: resolvedHref || "/",
      label: "Reaction",
    }
  }

  if (entityType === "post" || lower.includes("tag") || lower.includes("shared") || lower.includes("post")) {
    return {
      icon: Sparkles,
      iconColor: "text-purple-500 bg-purple-500/10",
      badgeColor: "bg-purple-600 text-white",
      href: resolvedHref || "/",
      label: "Post update",
    }
  }

  return {
    icon: Bell,
    iconColor: "text-primary bg-primary/10",
    badgeColor: "bg-primary text-primary-foreground",
    href: resolvedHref || "/",
    label: "Notification",
  }
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onItemClick,
  className,
}: NotificationItemProps) {
  const router = useRouter()
  const isUnread = !notification.readAt
  const meta = getNotificationMeta(notification)
  const Icon = meta.icon

  const hasActor = Boolean(notification.data?.actorName || notification.data?.actorAvatar)

  const handleClick = () => {
    if (isUnread && onMarkAsRead) {
      onMarkAsRead(notification.id)
    }
    if (onItemClick) {
      onItemClick()
    }
    if (meta.href) {
      router.push(meta.href)
    }
  }

  const handleMarkReadOnly = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onMarkAsRead && isUnread) {
      onMarkAsRead(notification.id)
    }
  }

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          handleClick()
        }
      }}
      className={cn(
        "group relative flex items-start gap-3 p-3 rounded-xl transition-colors cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        isUnread
          ? "bg-primary/5 hover:bg-primary/10 border-l-2 border-primary"
          : "hover:bg-muted/70",
        className
      )}
      aria-label={`${notification.message}. ${isUnread ? "Unread" : "Read"}.`}
    >
      {/* Icon or Avatar with Badge */}
      <div className="relative shrink-0 mt-0.5">
        {hasActor ? (
          <div className="relative">
            <UserAvatar
              src={notification.data?.actorAvatar}
              name={notification.data?.actorName}
              size="md"
            />
            <span
              className={cn(
                "absolute -bottom-1 -right-1 size-5 rounded-full flex items-center justify-center ring-2 ring-card shadow-xs",
                meta.badgeColor
              )}
              aria-hidden="true"
            >
              <Icon className="size-3" />
            </span>
          </div>
        ) : (
          <div
            className={cn(
              "size-10 rounded-full flex items-center justify-center shadow-2xs",
              meta.iconColor
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Message and Time */}
      <div className="flex-1 min-w-0 pr-6 space-y-1">
        <p
          className={cn(
            "text-sm leading-snug line-clamp-3 text-foreground",
            isUnread ? "font-semibold" : "font-normal text-muted-foreground"
          )}
        >
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground/80 font-medium">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>

      {/* Trailing indicator & mark-as-read action */}
      <div className="absolute right-3 top-3 flex items-center gap-1.5">
        {isUnread ? (
          <>
            <button
              type="button"
              onClick={handleMarkReadOnly}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-background text-muted-foreground hover:text-foreground cursor-pointer focus-visible:opacity-100"
              aria-label="Mark as read"
              title="Mark as read"
            >
              <Check className="size-3.5" />
            </button>
            <span
              className="size-2.5 rounded-full bg-primary shrink-0 ring-2 ring-card"
              aria-hidden="true"
            />
          </>
        ) : null}
      </div>
    </div>
  )
}


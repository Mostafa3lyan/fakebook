"use client"

import * as React from "react"
import { Bell, CheckCheck, Inbox, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationItem } from "@/components/notifications/notification-item"
import {
  useNotifications,
  useUnreadNotificationsCount,
} from "@/hooks/notifications/use-notifications"
import { usePushNotifications } from "@/hooks/notifications/use-push-notifications"
import { cn } from "@/lib/utils"

export function NotificationsView() {
  const [filter, setFilter] = React.useState<"all" | "unread">("all")
  const {
    notifications,
    isLoading,
    isError,
    markAsRead,
    markAllAsRead,
    isMarkingAllRead: isMarkingAll,
  } = useNotifications({ limit: 50 })
  const { unreadCount } = useUnreadNotificationsCount()
  const { permission, isRegistering, registerDeviceToken } = usePushNotifications()

  const filteredNotifications = React.useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((n) => !n.readAt)
    }
    return notifications
  }, [notifications, filter])

  return (
    <div className="space-y-4">
      {/* Action bar & Filter pills */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border shadow-2xs">
        <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              filter === "all"
                ? "bg-background text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            All
            <span
              className={cn(
                "px-1.5 py-0.5 text-[11px] rounded-full font-bold",
                filter === "all"
                  ? "bg-muted text-foreground"
                  : "bg-muted/70 text-muted-foreground"
              )}
            >
              {notifications.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              filter === "unread"
                ? "bg-background text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Unread
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 text-[11px] rounded-full font-bold bg-primary text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => markAllAsRead()}
          disabled={unreadCount === 0 || isMarkingAll}
          className="rounded-xl gap-2 font-medium self-end sm:self-auto cursor-pointer"
        >
          {isMarkingAll ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <CheckCheck className="size-4" />
          )}
          <span>Mark all as read</span>
        </Button>
      </div>

      {/* Push Notification Opt-in Banner */}
      {permission === "default" && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-primary/10 border border-primary/20 text-foreground">
          <div className="space-y-0.5">
            <h4 className="text-sm font-semibold flex items-center gap-1.5">
              <Bell className="size-4 text-primary" />
              Enable Browser Push Notifications
            </h4>
            <p className="text-xs text-muted-foreground">
              Never miss friend requests, likes, or comments when you are not actively on Fakebook.
            </p>
          </div>
          <Button
            size="sm"
            disabled={isRegistering}
            onClick={() => registerDeviceToken()}
            className="self-start sm:self-auto rounded-xl font-medium cursor-pointer"
          >
            {isRegistering ? (
              <>
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
                Enabling...
              </>
            ) : (
              "Enable Notifications"
            )}
          </Button>
        </div>
      )}

      {/* Notifications container */}
      <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl animate-pulse"
              >
                <div className="size-9 rounded-full bg-muted shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-3">
              <Bell className="size-6" />
            </div>
            <h3 className="font-semibold text-foreground text-base">
              Failed to load notifications
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              We encountered an issue retrieving your notifications. Please check your internet connection or try again later.
            </p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="size-14 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
              <Inbox className="size-7 stroke-[1.5]" />
            </div>
            <h3 className="font-semibold text-foreground text-base">
              {filter === "unread"
                ? "You're all caught up!"
                : "No notifications yet"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              {filter === "unread"
                ? "There are no unread notifications right now."
                : "When someone sends you a friend request, comments, or interacts with your posts, you will see it here."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {filteredNotifications.map((item) => (
              <NotificationItem
                key={item.id}
                notification={item}
                onMarkAsRead={markAsRead}
                className="rounded-none px-4 py-3.5 hover:bg-muted/40 transition-colors"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


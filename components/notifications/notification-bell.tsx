"use client"

import * as React from "react"
import Link from "next/link"
import { Bell, CheckCheck, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import { useNotifications } from "@/hooks/notifications/use-notifications"
import { usePushNotifications } from "@/hooks/notifications/use-push-notifications"
import { NotificationItem } from "./notification-item"

interface NotificationBellProps {
  className?: string
}

export function NotificationBell({ className }: NotificationBellProps) {
  const [open, setOpen] = React.useState(false)
  const [filter, setFilter] = React.useState<"all" | "unread">("all")

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    isMarkingAllRead,
  } = useNotifications({ limit: 20 })

  const {
    permission,
    isRegistering,
    registerDeviceToken,
  } = usePushNotifications()

  const filteredNotifications = React.useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((n) => !n.readAt)
    }
    return notifications
  }, [notifications, filter])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative size-9 rounded-full min-h-11 min-w-11 text-foreground hover:bg-muted cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
            open && "bg-muted text-primary",
            className
          )}
          aria-label={
            unreadCount > 0
              ? `${unreadCount} unread notifications`
              : "Notifications"
          }
        >
          <Bell className="size-5" aria-hidden="true" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center shadow-xs animate-in zoom-in-50"
              aria-hidden="true"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[calc(100vw-1.5rem)] sm:w-96 p-0 rounded-2xl shadow-xl border border-border bg-card overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-border/60">
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-bold text-base text-foreground">
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                {unreadCount} new
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
              disabled={isMarkingAllRead}
              className="h-8 text-xs text-primary hover:text-primary hover:bg-primary/10 cursor-pointer px-2"
              aria-label="Mark all notifications as read"
            >
              {isMarkingAllRead ? (
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
              ) : (
                <CheckCheck className="size-3.5 mr-1.5" />
              )}
              Mark all read
            </Button>
          )}
        </div>

        {/* Optional Push Notification Opt-in */}
        {permission === "default" && (
          <div className="flex items-center justify-between gap-2 px-4 py-2 bg-primary/10 border-b border-primary/20 text-xs text-foreground">
            <span className="text-xs font-medium">Turn on push notifications?</span>
            <Button
              variant="outline"
              size="sm"
              disabled={isRegistering}
              onClick={() => registerDeviceToken()}
              className="h-6 text-[11px] px-2.5 rounded-md font-semibold bg-background hover:bg-accent cursor-pointer"
            >
              {isRegistering ? "Enabling..." : "Enable"}
            </Button>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-border/40 bg-muted/20">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer",
              filter === "all"
                ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer",
              filter === "unread"
                ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* List Content */}
        <div className="max-h-96 overflow-y-auto divide-y divide-border/30 p-1.5 space-y-0.5">
          {isLoading ? (
            <div className="p-3 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="size-9 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-10 px-4 text-center space-y-2">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground/60">
                <Bell className="size-6" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                {filter === "unread" ? "No unread notifications" : "No notifications yet"}
              </p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                {filter === "unread"
                  ? "You are all caught up! Check the All tab to review past notifications."
                  : "When friends interact with you, send requests, or tag you, updates will show up here."}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onItemClick={() => setOpen(false)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-border/60 bg-muted/20 text-center">
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="inline-flex items-center justify-center w-full py-1.5 text-xs font-semibold text-primary hover:text-primary/90 hover:underline transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-md"
          >
            See all notifications
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}


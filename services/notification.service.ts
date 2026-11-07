import { api } from "@/lib/api/client"
import {
  FcmTokenDto,
  NotificationQueryParams,
  NotificationsData,
  UnreadCountData,
} from "@/lib/types"

export const notificationService = {
  getNotifications: (params?: NotificationQueryParams) =>
    api<NotificationsData>("/notifications", {
      method: "GET",
      params,
    }),

  getUnreadCount: () =>
    api<UnreadCountData>("/notifications/unread-count", {
      method: "GET",
    }),

  markAsRead: (messageId: string) =>
    api<void>(`/notifications/${messageId}/read`, {
      method: "PATCH",
    }),

  markAllAsRead: () =>
    api<void>("/notifications/read-all", {
      method: "PATCH",
    }),

  registerFcmToken: (token: string) =>
    api<void>("/notifications/fcm-token", {
      method: "POST",
      body: JSON.stringify({ token } as FcmTokenDto),
    }),

  unregisterFcmToken: (token: string) =>
    api<void>("/notifications/fcm-token", {
      method: "DELETE",
      body: JSON.stringify({ token } as FcmTokenDto),
    }),
}


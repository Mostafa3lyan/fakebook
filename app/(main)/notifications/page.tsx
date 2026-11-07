import type { Metadata } from "next"
import { NotificationsView } from "./_components/notifications-view"

export const metadata: Metadata = {
  title: "Notifications",
  description: "View and manage your in-app notifications on Fakebook.",
}

export default function NotificationsPage() {
  return (
    <div className="max-w-3xl mx-auto py-2 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight">
          Notifications
        </h1>
        <p className="text-sm text-muted-foreground">
          Stay updated with your friends, posts, comments, and connection requests.
        </p>
      </div>

      <NotificationsView />
    </div>
  )
}


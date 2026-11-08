import { Suspense } from "react"
import type { Metadata } from "next"
import { FriendsContainer } from "./_components/friends-container"

export const metadata: Metadata = {
  title: "Friends",
  description: "Manage your friends, sent and received connection requests on Fakebook.",
}

export default function FriendsPage() {
  return (
    <div className="max-w-4xl mx-auto py-2 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight">
          Friends & Connections
        </h1>
        <p className="text-sm text-muted-foreground">
          View your friends list, accept new incoming invitations, and track pending requests.
        </p>
      </div>

      <Suspense fallback={null}>
        <FriendsContainer />
      </Suspense>
    </div>
  )
}

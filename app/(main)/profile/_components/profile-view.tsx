"use client"

import { useCurrentUser } from "@/hooks/user/use-current-user"
import { ProfileHeader } from "./profile-header"
import { ProfileTimeline } from "./profile-timeline"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorComponent } from "@/components/shared/error-component"

export function ProfileView() {
  const { user, isLoading, isError, error } = useCurrentUser()

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto py-2">
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="flex gap-4 items-end -mt-12 pl-4">
            <Skeleton className="size-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (isError || !user) {
    return (
      <div className="max-w-md mx-auto py-12">
        <ErrorComponent
          errorMessage={error instanceof Error ? error.message : "Failed to load profile"}
        />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-2 space-y-6">
      <ProfileHeader user={user} />
      <ProfileTimeline userId={user._id} />
    </div>
  )
}

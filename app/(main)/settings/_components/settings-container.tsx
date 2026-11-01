"use client"

import { ErrorComponent } from "@/components/shared/error-component"
import { Skeleton } from "@/components/ui/skeleton"
import { useCurrentUser } from "@/hooks/user/use-current-user"
import { BlockedUsersList } from "./blocked-users-list"
import { ChangePasswordForm } from "./change-password-form"
import { DangerZone } from "./danger-zone"
import { EditProfileForm } from "./edit-profile-form"
import { TwoFactorSettings } from "./two-factor-settings"

export function SettingsContainer() {
  const { user, isLoading, isError, error } = useCurrentUser()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-44 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    )
  }

  if (isError || !user) {
    return (
      <div className="max-w-md mx-auto py-12">
        <ErrorComponent
          errorMessage={error instanceof Error ? error.message : "Failed to load account settings"}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <EditProfileForm user={user} />
      <ChangePasswordForm />
      <TwoFactorSettings user={user} />
      <BlockedUsersList />
      <DangerZone />
    </div>
  )
}

"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, ShieldAlert } from "lucide-react"

import { userService } from "@/services/user.service"
import { PublicProfileHeader } from "./public-profile-header"
import { PublicUserTimeline } from "./public-user-timeline"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface PublicUserProfileViewProps {
  userId: string
}

export function PublicUserProfileView({ userId }: PublicUserProfileViewProps) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["public-profile", userId],
    queryFn: async () => {
      const response = await userService.shareProfile(userId)
      return response.data.account
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 2,
  })

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-4">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="size-6" aria-hidden="true" />
        </div>
        <h1 className="text-xl font-bold font-heading text-foreground">
          Profile Not Found
        </h1>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "The requested profile does not exist or may have been removed."}
        </p>
        <Button asChild variant="outline" className="min-h-11">
          <Link href="/">
            <ArrowLeft className="size-4 mr-2" aria-hidden="true" />
            Back to Home Feed
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-6">
      <PublicProfileHeader user={data} />
      <PublicUserTimeline userId={userId} userName={data.firstName} />
    </div>
  )
}

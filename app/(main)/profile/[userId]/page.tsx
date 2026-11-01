import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PublicUserProfileView } from "./_components/public-user-profile-view"

interface PageProps {
  params: Promise<{
    userId: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { userId } = await params
  if (!userId) {
    return {
      title: "Profile",
    }
  }

  return {
    title: "User Profile",
    description: "View user profile and posts on Fakebook.",
  }
}

export default async function PublicUserProfilePage({ params }: PageProps) {
  const { userId } = await params

  if (!userId) {
    notFound()
  }

  return <PublicUserProfileView userId={userId} />
}

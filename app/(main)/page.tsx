import type { Metadata } from "next"

import { PostComposerTrigger } from "@/components/posts"
import { HomeFeedStream } from "./_components/home-feed-stream"

export const metadata: Metadata = {
  title: "Feed",
  description: "Explore the latest posts, updates, and news on Fakebook.",
}

export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto py-2 space-y-5">
      <h1 className="sr-only">News Feed</h1>
      <PostComposerTrigger />
      <HomeFeedStream />
    </div>
  )
}

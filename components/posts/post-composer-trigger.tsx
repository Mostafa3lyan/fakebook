"use client"

import * as React from "react"
import { Image as ImageIcon, Smile, MapPin, Tag } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/shared/user-avatar"
import { useCurrentUser } from "@/hooks/user/use-current-user"
import { PostComposerDialog } from "./post-composer-dialog"
import { cn } from "@/lib/utils"

interface PostComposerTriggerProps {
  className?: string
}

export function PostComposerTrigger({ className }: PostComposerTriggerProps) {
  const { user } = useCurrentUser()
  const [open, setOpen] = React.useState(false)
  const [initialMode, setInitialMode] = React.useState<
    "photo" | "tag" | "feeling" | "location" | null
  >(null)

  const handleOpen = (
    mode: "photo" | "tag" | "feeling" | "location" | null = null
  ) => {
    setInitialMode(mode)
    setOpen(true)
  }

  const firstName = user?.firstName || "Friend"

  return (
    <>
      <Card className={cn("border-border shadow-xs bg-card overflow-hidden", className)}>
        <CardContent className="p-4 space-y-3">
          {/* Main prompt trigger row */}
          <div className="flex items-center gap-3">
            <UserAvatar user={user} size="md" />
            <button
              type="button"
              onClick={() => handleOpen(null)}
              className="flex-1 text-left px-4 py-2.5 rounded-full bg-muted/60 hover:bg-muted text-sm text-muted-foreground transition-colors cursor-pointer min-h-11 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
              aria-label={`What's on your mind, ${firstName}?`}
            >
              What&apos;s on your mind, {firstName}?
            </button>
          </div>

          <div className="h-px bg-border/60" />

          {/* Quick Action Buttons */}
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground pt-0.5 gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleOpen("photo")}
              className="flex-1 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 min-h-11 cursor-pointer px-2"
              aria-label="Add photo or video to post"
            >
              <ImageIcon className="size-4.5 mr-2 text-emerald-500 shrink-0" aria-hidden="true" />
              <span>Photo / Video</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleOpen("tag")}
              className="flex-1 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 min-h-11 cursor-pointer px-2"
              aria-label="Tag friends in post"
            >
              <Tag className="size-4.5 mr-2 text-blue-500 shrink-0" aria-hidden="true" />
              <span>Tag Friends</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleOpen("feeling")}
              className="flex-1 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 min-h-11 cursor-pointer px-2"
              aria-label="Add feeling or activity to post"
            >
              <Smile className="size-4.5 mr-2 text-amber-500 shrink-0" aria-hidden="true" />
              <span>Feeling / Activity</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleOpen("location")}
              className="hidden sm:inline-flex flex-1 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 min-h-11 cursor-pointer px-2"
              aria-label="Check in with location"
            >
              <MapPin className="size-4.5 mr-2 text-rose-500 shrink-0" aria-hidden="true" />
              <span>Check in</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <PostComposerDialog
        open={open}
        onOpenChange={setOpen}
        initialMode={initialMode}
      />
    </>
  )
}

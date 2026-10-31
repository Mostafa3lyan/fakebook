"use client"

import * as React from "react"
import { Tag, Search, Check, Loader2, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { UserAvatar } from "@/components/shared/user-avatar"
import { useFriends } from "@/hooks/friends/use-friends"
import { IFriendUser } from "@/lib/types"
import { cn } from "@/lib/utils"

interface PostTagFriendsPopoverProps {
  selectedFriends: IFriendUser[]
  onChangeSelectedFriends: (friends: IFriendUser[]) => void
  disabled?: boolean
  defaultOpen?: boolean
}

export function PostTagFriendsPopover({
  selectedFriends,
  onChangeSelectedFriends,
  disabled,
  defaultOpen = false,
}: PostTagFriendsPopoverProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim())
    }, 300)
    return () => clearTimeout(handler)
  }, [searchTerm])

  const { friends, isLoading, isFetching } = useFriends({
    page: 1,
    limit: 30,
    search: debouncedSearch || undefined,
  })

  const toggleFriend = (friend: IFriendUser) => {
    const exists = selectedFriends.some((f) => f._id === friend._id)
    if (exists) {
      onChangeSelectedFriends(
        selectedFriends.filter((f) => f._id !== friend._id)
      )
    } else {
      onChangeSelectedFriends([...selectedFriends, friend])
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          className={cn(
            "size-9 rounded-full text-blue-500 hover:bg-blue-500/10 cursor-pointer min-h-11 min-w-11 relative",
            selectedFriends.length > 0 && "bg-blue-500/15"
          )}
          aria-label="Tag friends in post"
        >
          <Tag className="size-5" aria-hidden="true" />
          {selectedFriends.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {selectedFriends.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-foreground">Tag friends</p>
          {selectedFriends.length > 0 && (
            <button
              type="button"
              onClick={() => onChangeSelectedFriends([])}
              className="text-[11px] text-muted-foreground hover:text-destructive cursor-pointer"
            >
              Clear ({selectedFriends.length})
            </button>
          )}
        </div>

        <div className="relative">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <Input
            placeholder="Search friends by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 pl-8 text-xs"
            aria-label="Search friends to tag"
          />
          {isFetching && (
            <Loader2
              className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 animate-spin text-primary"
              aria-hidden="true"
            />
          )}
        </div>

        <div className="max-h-52 overflow-y-auto divide-y divide-border/40 -mx-1 px-1">
          {isLoading ? (
            <div className="py-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-primary" aria-hidden="true" />
              <span>Loading friends...</span>
            </div>
          ) : friends.length === 0 ? (
            <div className="py-6 flex flex-col items-center justify-center text-center gap-1 text-muted-foreground">
              <Users className="size-5 opacity-60" aria-hidden="true" />
              <p className="text-xs">
                {debouncedSearch
                  ? `No friends matching "${debouncedSearch}"`
                  : "You have no friends to tag yet."}
              </p>
            </div>
          ) : (
            friends.map((friend) => {
              const isSelected = selectedFriends.some(
                (f) => f._id === friend._id
              )
              const fullName = `${friend.firstName} ${friend.lastName}`.trim()

              return (
                <button
                  key={friend._id}
                  type="button"
                  onClick={() => toggleFriend(friend)}
                  className={cn(
                    "w-full flex items-center justify-between gap-2.5 p-2 rounded-lg text-left transition-colors cursor-pointer",
                    isSelected
                      ? "bg-primary/10 text-foreground"
                      : "hover:bg-muted/70 text-foreground"
                  )}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <UserAvatar user={friend} size="xs" />
                    <span className="text-xs font-medium truncate">
                      {fullName}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "size-4 rounded-sm border flex items-center justify-center shrink-0 transition-colors",
                      isSelected
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-muted-foreground/40"
                    )}
                  >
                    {isSelected && <Check className="size-3" aria-hidden="true" />}
                  </div>
                </button>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}


"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useFriends } from "@/hooks/friends/use-friends"
import { useConversationActions } from "@/hooks/chat/use-conversation-actions"
import { useChat } from "./chat-provider"
import { UserAvatar } from "@/components/shared/user-avatar"
import { Check, Plus, Search, Users } from "lucide-react"
import { IFriendUser } from "@/lib/types"

interface NewConversationModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NewConversationModal({
  isOpen,
  onClose,
}: NewConversationModalProps) {
  const [search, setSearch] = React.useState("")
  const [isGroupMode, setIsGroupMode] = React.useState(false)
  const [groupTitle, setGroupTitle] = React.useState("")
  const [selectedFriendIds, setSelectedFriendIds] = React.useState<string[]>([])

  const { friends, isLoading } = useFriends({ search, limit: 30 })
  const { createOrGetDirect, createGroup } = useConversationActions()
  const { openChat } = useChat()

  const handleSelectFriend = async (friend: IFriendUser) => {
    if (isGroupMode) {
      setSelectedFriendIds((prev) =>
        prev.includes(friend._id)
          ? prev.filter((id) => id !== friend._id)
          : [...prev, friend._id]
      )
      return
    }

    // Direct 1-on-1 mode
    try {
      const res = await createOrGetDirect.mutateAsync(friend._id)
      openChat(res.data.conversation._id, res.data.conversation)
      onClose()
    } catch {
      // Error handled by mutation
    }
  }

  const handleCreateGroup = async () => {
    if (!groupTitle.trim() || selectedFriendIds.length < 2) return

    try {
      const res = await createGroup.mutateAsync({
        title: groupTitle.trim(),
        participantIds: selectedFriendIds,
      })
      openChat(res.data.conversation._id, res.data.conversation)
      onClose()
      setIsGroupMode(false)
      setSelectedFriendIds([])
      setGroupTitle("")
    } catch {
      // Error handled by mutation
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">
              {isGroupMode ? "Create a Group Chat" : "New Message"}
            </DialogTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsGroupMode((prev) => !prev)
                setSelectedFriendIds([])
              }}
              className="text-xs h-7 gap-1.5"
            >
              <Users className="size-3.5" />
              <span>{isGroupMode ? "Direct Message" : "Create Group"}</span>
            </Button>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-3">
          {/* Group Title input if group mode */}
          {isGroupMode && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                Group Name
              </label>
              <Input
                placeholder="Name your group chat..."
                value={groupTitle}
                onChange={(e) => setGroupTitle(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          )}

          {/* Search friends input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search friends..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>

          {/* Friends list */}
          <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
            {isLoading ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                Loading friends...
              </div>
            ) : friends.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No friends found
              </div>
            ) : (
              friends.map((friend) => {
                const isSelected = selectedFriendIds.includes(friend._id)
                return (
                  <button
                    key={friend._id}
                    type="button"
                    onClick={() => handleSelectFriend(friend)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted text-left transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UserAvatar user={friend} size="sm" />
                      <div className="truncate">
                        <p className="text-sm font-medium leading-none truncate">
                          {friend.firstName} {friend.lastName}
                        </p>
                      </div>
                    </div>

                    {isGroupMode ? (
                      <div
                        className={`size-5 rounded-md border flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-muted-foreground/40"
                        }`}
                      >
                        {isSelected && <Check className="size-3.5" />}
                      </div>
                    ) : (
                      <Plus className="size-4 text-muted-foreground" />
                    )}
                  </button>
                )
              })
            )}
          </div>

          {/* Create group CTA */}
          {isGroupMode && (
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {selectedFriendIds.length} friend
                {selectedFriendIds.length === 1 ? "" : "s"} selected (min. 2)
              </span>
              <Button
                size="sm"
                onClick={handleCreateGroup}
                disabled={!groupTitle.trim() || selectedFriendIds.length < 2 || createGroup.isPending}
              >
                Create Group
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}


"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCurrentUser } from "@/hooks/user/use-current-user"
import { useFriends } from "@/hooks/friends/use-friends"
import { useConversationActions } from "@/hooks/chat/use-conversation-actions"
import { conversationService } from "@/services/conversation.service"
import { IConversation, IPublicUser } from "@/lib/types"
import { UserAvatar } from "@/components/shared/user-avatar"
import { LogOut, Plus, ShieldCheck, Trash2, UserMinus } from "lucide-react"

interface GroupSettingsModalProps {
  conversationId: string
  isOpen: boolean
  onClose: () => void
}

export function GroupSettingsModal({
  conversationId,
  isOpen,
  onClose,
}: GroupSettingsModalProps) {
  const { user } = useCurrentUser()
  const { deleteConversation } = useConversationActions()
  const [conversation, setConversation] = React.useState<IConversation | null>(null)
  const [isAddingMembers, setIsAddingMembers] = React.useState(false)
  const [friendSearch, setFriendSearch] = React.useState("")

  const { friends } = useFriends({ search: friendSearch, limit: 20 })

  const loadConversation = React.useCallback(() => {
    if (!conversationId) return
    conversationService
      .getConversation(conversationId)
      .then((res) => setConversation(res.data.conversation))
      .catch(() => {})
  }, [conversationId])

  React.useEffect(() => {
    if (isOpen) {
      loadConversation()
    }
  }, [isOpen, loadConversation])

  const currentUserIdStr = user?._id || ""
  const isAdmin = Boolean(
    conversation?.admins?.some((id) => id === currentUserIdStr)
  )

  const handleAddMember = async (friendId: string) => {
    try {
      await conversationService.addGroupMembers(conversationId, [friendId])
      loadConversation()
      setIsAddingMembers(false)
    } catch {
      // Handled
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      await conversationService.removeGroupMember(conversationId, memberId)
      loadConversation()
    } catch {
      // Handled
    }
  }

  const handleLeaveGroup = async () => {
    if (!user?._id) return
    try {
      await conversationService.removeGroupMember(conversationId, user._id)
      onClose()
    } catch {
      // Handled
    }
  }

  const handleDisbandGroup = async () => {
    try {
      await deleteConversation.mutateAsync({ conversationId, disband: true })
      onClose()
    } catch {
      // Handled
    }
  }

  const existingParticipantIds = (conversation?.participants || []).map((p) =>
    (p.user as IPublicUser)?._id
  )

  const eligibleFriends = friends.filter(
    (f) => !existingParticipantIds.includes(f._id)
  )

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2 border-b border-border">
          <DialogTitle className="text-base font-bold">
            {conversation?.title || "Group Details"}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            {conversation?.participants?.length || 0} participants
          </p>
        </DialogHeader>

        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {/* Members list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Members
              </span>
              {isAdmin && !isAddingMembers && (
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => setIsAddingMembers(true)}
                  className="text-xs text-primary h-6"
                >
                  <Plus className="size-3 mr-1" />
                  Add Member
                </Button>
              )}
            </div>

            {/* Add member inline search */}
            {isAddingMembers && (
              <div className="mb-3 p-2 bg-muted/40 rounded-lg space-y-2 border border-border">
                <Input
                  placeholder="Search friends to add..."
                  value={friendSearch}
                  onChange={(e) => setFriendSearch(e.target.value)}
                  className="h-8 text-xs"
                />
                <div className="max-h-36 overflow-y-auto space-y-1">
                  {eligibleFriends.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground p-2 text-center">
                      No more friends to add
                    </p>
                  ) : (
                    eligibleFriends.map((f) => (
                      <div
                        key={f._id}
                        className="flex items-center justify-between p-1.5 rounded-md hover:bg-muted text-xs"
                      >
                        <span>
                          {f.firstName} {f.lastName}
                        </span>
                        <Button
                          size="xs"
                          variant="secondary"
                          onClick={() => handleAddMember(f._id)}
                          className="h-6"
                        >
                          Add
                        </Button>
                      </div>
                    ))
                  )}
                </div>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => setIsAddingMembers(false)}
                  className="w-full text-xs h-6"
                >
                  Cancel
                </Button>
              </div>
            )}

            {/* Existing members */}
            <div className="space-y-1.5">
              {conversation?.participants.map((part) => {
                const memberUser = part.user as IPublicUser
                const isMemberAdmin = part.role === "admin"
                const isMemberSelf = memberUser?._id === currentUserIdStr

                return (
                  <div
                    key={memberUser?._id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UserAvatar user={memberUser} size="xs" />
                      <div className="truncate">
                        <p className="text-xs font-semibold truncate leading-none">
                          {memberUser?.firstName} {memberUser?.lastName}
                          {isMemberSelf && " (You)"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isMemberAdmin && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="size-3" />
                          Admin
                        </span>
                      )}

                      {isAdmin && !isMemberSelf && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRemoveMember(memberUser._id)}
                          className="size-7 rounded-full text-muted-foreground hover:text-destructive"
                          aria-label={`Remove ${memberUser?.firstName}`}
                        >
                          <UserMinus className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Danger zone actions */}
          <div className="pt-3 border-t border-border flex flex-col gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleLeaveGroup}
              className="text-xs text-destructive hover:text-destructive justify-start h-8"
            >
              <LogOut className="size-3.5 mr-2" />
              <span>Leave Group</span>
            </Button>

            {isAdmin && (
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDisbandGroup}
                className="text-xs justify-start h-8"
              >
                <Trash2 className="size-3.5 mr-2" />
                <span>Disband Group for Everyone</span>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


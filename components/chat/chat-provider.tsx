"use client"

import * as React from "react"
import { useSocket } from "@/components/providers/socket-provider"
import { useCurrentUser } from "@/hooks/user/use-current-user"
import { useQueryClient } from "@tanstack/react-query"
import { GetMessagesResponse, IConversation, IMessage } from "@/lib/types"
import { CONVERSATIONS_QUERY_KEY } from "@/hooks/chat/use-conversations"
import { getMessagesQueryKey } from "@/hooks/chat/use-messages"
import { MESSAGE_REQUESTS_QUERY_KEY } from "@/hooks/chat/use-message-requests"
import { messageService } from "@/services/message.service"

export interface ActiveChat {
  conversationId: string
  isMinimized: boolean
  cachedConversation?: IConversation
}

interface TypingState {
  userId: string
  firstName: string
}

interface ChatContextValue {
  activeChats: ActiveChat[]
  openChat: (conversationId: string, conversation?: IConversation) => void
  closeChat: (conversationId: string) => void
  minimizeChat: (conversationId: string) => void
  restoreChat: (conversationId: string) => void
  isUserOnline: (userId?: string) => boolean
  getTypingUser: (conversationId: string) => TypingState | null
  // Modals
  isNewChatModalOpen: boolean
  openNewChatModal: () => void
  closeNewChatModal: () => void
  isRequestsModalOpen: boolean
  openRequestsModal: () => void
  closeRequestsModal: () => void
  activeGroupSettingsId: string | null
  openGroupSettings: (conversationId: string) => void
  closeGroupSettings: () => void
  // Audio
  isMuted: boolean
  toggleMute: () => void
}

const ChatContext = React.createContext<ChatContextValue | null>(null)

export function useChat() {
  const context = React.useContext(ChatContext)
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}

const MAX_ACTIVE_WINDOWS = 3

/** Synthesize a soft Messenger-style chime using Web Audio API */
function playMessageChime() {
  try {
    const AudioContextClass =
      typeof window !== "undefined"
        ? window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext
        : undefined
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()

    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc1.type = "sine"
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
    osc1.frequency.exponentialRampToValueAtTime(880.0, ctx.currentTime + 0.08) // A5

    osc2.type = "sine"
    osc2.frequency.setValueAtTime(880.0, ctx.currentTime)
    osc2.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.12) // D6

    gainNode.gain.setValueAtTime(0.08, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)

    osc1.connect(gainNode)
    osc2.connect(gainNode)
    gainNode.connect(ctx.destination)

    osc1.start(ctx.currentTime)
    osc2.start(ctx.currentTime + 0.04)
    osc1.stop(ctx.currentTime + 0.25)
    osc2.stop(ctx.currentTime + 0.25)
  } catch {
    // Autoplay or audio not allowed in current context
  }
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { socket } = useSocket()
  const { user } = useCurrentUser()
  const queryClient = useQueryClient()

  const [activeChats, setActiveChats] = React.useState<ActiveChat[]>([])
  const activeChatsRef = React.useRef(activeChats)

  React.useEffect(() => {
    activeChatsRef.current = activeChats
  }, [activeChats])

  const [onlineUserIds, setOnlineUserIds] = React.useState<Set<string>>(new Set())
  const [typingMap, setTypingMap] = React.useState<Record<string, TypingState>>({})
  const [isMuted, setIsMuted] = React.useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("fb_chat_muted") === "true"
      } catch {
        return false
      }
    }
    return false
  })

  // Modals state
  const [isNewChatModalOpen, setIsNewChatModalOpen] = React.useState(false)
  const [isRequestsModalOpen, setIsRequestsModalOpen] = React.useState(false)
  const [activeGroupSettingsId, setActiveGroupSettingsId] = React.useState<string | null>(null)

  const toggleMute = React.useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev
      try {
        localStorage.setItem("fb_chat_muted", String(next))
      } catch {
        // Ignore
      }
      return next
    })
  }, [])

  // Socket event listeners for presence, typing, live messages
  React.useEffect(() => {
    if (!socket) return

    // 1. Presence events
    const handlePresence = (payload: { userId: string; status: "online" | "offline" }) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev)
        if (payload.status === "online") {
          next.add(payload.userId)
        } else {
          next.delete(payload.userId)
        }
        return next
      })
    }

    // 2. Typing events
    const handleTyping = (payload: {
      conversationId: string
      userId: string
      isTyping: boolean
      user: { firstName: string }
    }) => {
      setTypingMap((prev) => {
        if (!payload.isTyping) {
          const copy = { ...prev }
          delete copy[payload.conversationId]
          return copy
        }
        return {
          ...prev,
          [payload.conversationId]: {
            userId: payload.userId,
            firstName: payload.user?.firstName || "Someone",
          },
        }
      })
    }

    // 3. New message received in real-time
    const handleNewMessage = (payload: {
      conversationId: string
      message: IMessage
      clientTempId?: string
    }) => {
      const senderId =
        payload.message.sender &&
        (typeof payload.message.sender === "object"
          ? payload.message.sender._id
          : payload.message.sender)

      const isFromMe = Boolean(user?._id && senderId === user._id)

      if (!isFromMe && !isMuted) {
        playMessageChime()
      }

      // Mark delivered to sender
      if (!isFromMe && socket && payload.message._id) {
        socket.emit("chat:mark_delivered", {
          conversationId: payload.conversationId,
          messageIds: [payload.message._id],
        })
      }

      // If user currently has this window open and unminimized, mark as read
      const isOpen = activeChatsRef.current.some(
        (c) => c.conversationId === payload.conversationId && !c.isMinimized
      )
      if (!isFromMe && isOpen) {
        messageService.markAsRead(payload.conversationId).catch(() => {})
      }

      // Automatically update conversation list and message queries
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY })
      queryClient.setQueryData<GetMessagesResponse>(
        getMessagesQueryKey(payload.conversationId),
        (old) => {
          if (!old) return old
          const exists = old.messages.some(
            (m: IMessage) =>
              m._id === payload.message._id ||
              (payload.clientTempId && m.clientTempId === payload.clientTempId)
          )
          if (exists) {
            return {
              ...old,
              messages: old.messages.map((m: IMessage) =>
                m.clientTempId === payload.clientTempId ? payload.message : m
              ),
            }
          }
          return {
            ...old,
            messages: [...old.messages, payload.message],
          }
        }
      )
    }

    // 4. Message Request Received
    const handleRequestReceived = () => {
      queryClient.invalidateQueries({ queryKey: MESSAGE_REQUESTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY })
    }

    // 5. Message Edited & Deleted
    const handleMessageEdited = (payload: {
      conversationId: string
      messageId: string
      content: string
      isEdited: boolean
      editedAt: string
    }) => {
      queryClient.setQueryData<GetMessagesResponse>(
        getMessagesQueryKey(payload.conversationId),
        (old) => {
          if (!old) return old
          return {
            ...old,
            messages: old.messages.map((m: IMessage) =>
              m._id === payload.messageId
                ? {
                    ...m,
                    content: payload.content,
                    isEdited: true,
                    editedAt: payload.editedAt,
                  }
                : m
            ),
          }
        }
      )
    }

    const handleMessageDeleted = (payload: {
      conversationId: string
      messageId: string
    }) => {
      queryClient.setQueryData<GetMessagesResponse>(
        getMessagesQueryKey(payload.conversationId),
        (old) => {
          if (!old) return old
          return {
            ...old,
            messages: old.messages.map((m: IMessage) =>
              m._id === payload.messageId
                ? {
                    ...m,
                    isDeleted: true,
                    content: "This message was deleted",
                    attachments: [],
                  }
                : m
            ),
          }
        }
      )
    }

    // 6. Delivery receipt
    const handleMessageDelivered = (payload: {
      conversationId: string
      messageIds: string[]
      userId: string
    }) => {
      queryClient.setQueryData<GetMessagesResponse>(
        getMessagesQueryKey(payload.conversationId),
        (old) => {
          if (!old) return old
          return {
            ...old,
            messages: old.messages.map((m: IMessage) => {
              if (payload.messageIds.includes(m._id)) {
                const existing = m.deliveredTo || []
                const already = existing.some(
                  (r) => (typeof r.user === "object" ? r.user._id : r.user) === payload.userId
                )
                if (!already) {
                  return {
                    ...m,
                    deliveredTo: [
                      ...existing,
                      { user: payload.userId, timestamp: new Date().toISOString() },
                    ],
                  }
                }
              }
              return m
            }),
          }
        }
      )
    }

    // 7. Read receipt
    const handleMessageRead = (payload: {
      conversationId: string
      readerId: string
      readAt: string
    }) => {
      queryClient.setQueryData<GetMessagesResponse>(
        getMessagesQueryKey(payload.conversationId),
        (old) => {
          if (!old) return old
          return {
            ...old,
            messages: old.messages.map((m: IMessage) => {
              const existing = m.readBy || []
              const already = existing.some(
                (r) => (typeof r.user === "object" ? r.user._id : r.user) === payload.readerId
              )
              if (!already) {
                return {
                  ...m,
                  readBy: [
                    ...existing,
                    { user: payload.readerId, timestamp: payload.readAt },
                  ],
                }
              }
              return m
            }),
          }
        }
      )
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY })
    }

    // 8. Conversation created / updated / disbanded
    const handleConversationUpdated = () => {
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY })
    }

    const handleConversationDeleted = (payload: { conversationId: string }) => {
      setActiveChats((prev) => prev.filter((c) => c.conversationId !== payload.conversationId))
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY })
    }

    socket.on("user:presence", handlePresence)
    socket.on("chat:typing", handleTyping)
    socket.on("chat:new_message", handleNewMessage)
    socket.on("chat:request_received", handleRequestReceived)
    socket.on("chat:message_edited", handleMessageEdited)
    socket.on("chat:message_deleted", handleMessageDeleted)
    socket.on("chat:message_delivered", handleMessageDelivered)
    socket.on("chat:message_read", handleMessageRead)
    socket.on("chat:conversation_created", handleConversationUpdated)
    socket.on("chat:conversation_updated", handleConversationUpdated)
    socket.on("chat:conversation_deleted", handleConversationDeleted)

    return () => {
      socket.off("user:presence", handlePresence)
      socket.off("chat:typing", handleTyping)
      socket.off("chat:new_message", handleNewMessage)
      socket.off("chat:request_received", handleRequestReceived)
      socket.off("chat:message_edited", handleMessageEdited)
      socket.off("chat:message_deleted", handleMessageDeleted)
      socket.off("chat:message_delivered", handleMessageDelivered)
      socket.off("chat:message_read", handleMessageRead)
      socket.off("chat:conversation_created", handleConversationUpdated)
      socket.off("chat:conversation_updated", handleConversationUpdated)
      socket.off("chat:conversation_deleted", handleConversationDeleted)
    }
  }, [socket, isMuted, queryClient, user?._id])

  // Open or focus a chat window
  const openChat = React.useCallback(
    (conversationId: string, conversation?: IConversation) => {
      setActiveChats((prev) => {
        const existingIndex = prev.findIndex((c) => c.conversationId === conversationId)

        if (existingIndex !== -1) {
          // If already open, restore it to unminimized
          const updated = [...prev]
          const [target] = updated.splice(existingIndex, 1)
          target.isMinimized = false
          if (conversation) target.cachedConversation = conversation
          return [...updated, target]
        }

        // It is a new window: Check how many are currently unminimized
        const unminimized = prev.filter((c) => !c.isMinimized)
        let nextList = [...prev]

        if (unminimized.length >= MAX_ACTIVE_WINDOWS) {
          // Minimize the oldest unminimized window
          const oldestUnminimized = unminimized[0]
          nextList = nextList.map((c) =>
            c.conversationId === oldestUnminimized.conversationId
              ? { ...c, isMinimized: true }
              : c
          )
        }

        return [
          ...nextList,
          {
            conversationId,
            isMinimized: false,
            cachedConversation: conversation,
          },
        ]
      })
    },
    []
  )

  const closeChat = React.useCallback((conversationId: string) => {
    setActiveChats((prev) => prev.filter((c) => c.conversationId !== conversationId))
  }, [])

  const minimizeChat = React.useCallback((conversationId: string) => {
    setActiveChats((prev) =>
      prev.map((c) =>
        c.conversationId === conversationId ? { ...c, isMinimized: true } : c
      )
    )
  }, [])

  const restoreChat = React.useCallback((conversationId: string) => {
    setActiveChats((prev) => {
      const unminimized = prev.filter((c) => !c.isMinimized)
      let nextList = [...prev]

      if (unminimized.length >= MAX_ACTIVE_WINDOWS) {
        // Minimize the oldest unminimized window
        const oldestUnminimized = unminimized[0]
        nextList = nextList.map((c) =>
          c.conversationId === oldestUnminimized.conversationId
            ? { ...c, isMinimized: true }
            : c
        )
      }

      return nextList.map((c) =>
        c.conversationId === conversationId ? { ...c, isMinimized: false } : c
      )
    })
  }, [])

  const isUserOnline = React.useCallback(
    (userId?: string) => (userId ? onlineUserIds.has(userId) : false),
    [onlineUserIds]
  )

  const getTypingUser = React.useCallback(
    (conversationId: string) => typingMap[conversationId] || null,
    [typingMap]
  )

  const value = React.useMemo<ChatContextValue>(
    () => ({
      activeChats,
      openChat,
      closeChat,
      minimizeChat,
      restoreChat,
      isUserOnline,
      getTypingUser,
      isNewChatModalOpen,
      openNewChatModal: () => setIsNewChatModalOpen(true),
      closeNewChatModal: () => setIsNewChatModalOpen(false),
      isRequestsModalOpen,
      openRequestsModal: () => setIsRequestsModalOpen(true),
      closeRequestsModal: () => setIsRequestsModalOpen(false),
      activeGroupSettingsId,
      openGroupSettings: (id: string) => setActiveGroupSettingsId(id),
      closeGroupSettings: () => setActiveGroupSettingsId(null),
      isMuted,
      toggleMute,
    }),
    [
      activeChats,
      openChat,
      closeChat,
      minimizeChat,
      restoreChat,
      isUserOnline,
      getTypingUser,
      isNewChatModalOpen,
      isRequestsModalOpen,
      activeGroupSettingsId,
      isMuted,
      toggleMute,
    ]
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

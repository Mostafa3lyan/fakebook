"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { io, type Socket } from "socket.io-client"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useCurrentUser } from "@/hooks/user/use-current-user"
import type {
  IFriendReceivedRequest,
  IFriendUser,
  IPagination,
} from "@/lib/types"
import { FRIEND_REQUESTS_COUNT_QUERY_KEY } from "@/hooks/friends/use-friend-requests-count"

interface SocketContextValue {
  socket: Socket | null
  isConnected: boolean
}

const SocketContext = React.createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
})

export function useSocket() {
  return React.useContext(SocketContext)
}

interface FriendRequestReceivedPayload {
  requestId: string
  createdAt: string
  sender: {
    _id: string
    firstName: string
    lastName: string
    profilePicture?: string
  } | null
}

interface FriendRequestAcceptedPayload {
  requestId: string
  friend: {
    _id: string
    firstName: string
    lastName: string
    profilePicture?: string
  } | null
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useCurrentUser()
  const queryClient = useQueryClient()
  const router = useRouter()
  const [socket, setSocket] = React.useState<Socket | null>(null)
  const [isConnected, setIsConnected] = React.useState(false)

  const userId = user?._id

  React.useEffect(() => {
    if (!userId) {
      setSocket(null)
      setIsConnected(false)
      return
    }

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "http://localhost:3000"

    const socketInstance = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      auth: async (cb) => {
        try {
          const res = await fetch("/api/auth/socket-token", {
            credentials: "same-origin",
            cache: "no-store",
          })
          if (res.ok) {
            const data = (await res.json()) as { token?: string | null }
            cb({ token: data.token ?? undefined })
          } else {
            cb({})
          }
        } catch {
          cb({})
        }
      },
    })

    setSocket(socketInstance)

    socketInstance.on("connect", () => {
      setIsConnected(true)
    })

    socketInstance.on("disconnect", () => {
      setIsConnected(false)
    })

    // 1. Incoming Friend Request -> Immediate Red Badge + Live Request List + Facebook Toast
    socketInstance.on(
      "friend:request_received",
      (payload: FriendRequestReceivedPayload) => {
        // Optimistically increment the red badge count immediately
        queryClient.setQueryData<number>(
          FRIEND_REQUESTS_COUNT_QUERY_KEY,
          (prev) => (typeof prev === "number" ? prev + 1 : 1)
        )

        // Optimistically prepend to received friend requests cache if present
        if (payload.sender && payload.requestId) {
          const newRequest: IFriendReceivedRequest = {
            _id: payload.requestId,
            status: "pending",
            createdAt: payload.createdAt || new Date().toISOString(),
            sender: payload.sender,
          }

          queryClient.setQueriesData<IPagination<IFriendReceivedRequest>>(
            { queryKey: ["friend-requests", "received"] },
            (old) => {
              if (!old) return old
              const exists = old.data.some((r) => r._id === newRequest._id)
              if (exists) return old
              return {
                ...old,
                total: old.total + 1,
                data: [newRequest, ...old.data],
              }
            }
          )
        }

        // Invalidate related queries so everything stays 100% in sync
        queryClient.invalidateQueries({ queryKey: ["friend-requests"] })
        queryClient.invalidateQueries({ queryKey: ["friendship-status"] })
        queryClient.invalidateQueries({ queryKey: ["public-profile"] })
        queryClient.invalidateQueries({ queryKey: ["notifications"] })
        queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] })

        const senderName = payload.sender
          ? `${payload.sender.firstName} ${payload.sender.lastName}`.trim()
          : "Someone"

        toast.info(`${senderName} sent you a friend request`, {
          action: {
            label: "View",
            onClick: () => router.push("/friends?tab=received"),
          },
        })
      }
    )

    // 2. Friend Request Accepted (Sender receives this when Receiver clicks Confirm)
    socketInstance.on(
      "friend:request_accepted",
      (payload: FriendRequestAcceptedPayload) => {
        if (payload.friend) {
          const newFriend: IFriendUser = {
            _id: payload.friend._id,
            firstName: payload.friend.firstName,
            lastName: payload.friend.lastName,
            profilePicture: payload.friend.profilePicture,
          }

          // Immediately prepend the new friend into All Friends cache
          queryClient.setQueriesData<IPagination<IFriendUser>>(
            { queryKey: ["friends"] },
            (old) => {
              if (!old) return old
              const exists = old.data.some((f) => f._id === newFriend._id)
              if (exists) return old
              return {
                ...old,
                total: old.total + 1,
                data: [newFriend, ...old.data],
              }
            }
          )
        }

        queryClient.invalidateQueries({ queryKey: ["friends"] })
        queryClient.invalidateQueries({ queryKey: ["friend-requests"] })
        queryClient.invalidateQueries({ queryKey: ["friendship-status"] })
        queryClient.invalidateQueries({ queryKey: ["current-user"] })
        queryClient.invalidateQueries({ queryKey: ["public-profile"] })
        queryClient.invalidateQueries({ queryKey: ["posts"] })
        queryClient.invalidateQueries({ queryKey: ["notifications"] })
        queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] })

        const friendName = payload.friend
          ? `${payload.friend.firstName} ${payload.friend.lastName}`.trim()
          : "Your friend request"

        toast.success(`${friendName} accepted your friend request`, {
          action: {
            label: "Friends",
            onClick: () => router.push("/friends?tab=friends"),
          },
        })
      }
    )

    // 3. Other real-time friendship events (multi-tab / remote party sync)
    const syncEvents = [
      "friend:request_accepted_self",
      "friend:request_rejected",
      "friend:request_rejected_self",
      "friend:request_cancelled",
      "friend:request_cancelled_self",
      "friend:removed",
      "friend:removed_self",
    ]

    for (const eventName of syncEvents) {
      socketInstance.on(eventName, () => {
        queryClient.invalidateQueries({ queryKey: ["friends"] })
        queryClient.invalidateQueries({ queryKey: ["friend-requests"] })
        queryClient.invalidateQueries({ queryKey: ["friendship-status"] })
        queryClient.invalidateQueries({ queryKey: ["current-user"] })
        queryClient.invalidateQueries({ queryKey: ["public-profile"] })
        queryClient.invalidateQueries({ queryKey: ["posts"] })
      })
    }

    return () => {
      socketInstance.removeAllListeners()
      socketInstance.disconnect()
      setSocket(null)
      setIsConnected(false)
    }
  }, [userId, queryClient, router])

  const value = React.useMemo(
    () => ({ socket, isConnected }),
    [socket, isConnected]
  )

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  )
}


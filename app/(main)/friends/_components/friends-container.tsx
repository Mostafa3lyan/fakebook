"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { Users, UserCheck, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { useReceivedFriendRequests, useSentFriendRequests } from "@/hooks/friends/use-friend-requests"
import { useFriendRequestsCount } from "@/hooks/friends/use-friend-requests-count"
import { FriendsListTab } from "./friends-list-tab"
import { ReceivedRequestsTab } from "./received-requests-tab"
import { SentRequestsTab } from "./sent-requests-tab"

type ActiveTab = "friends" | "received" | "sent"

export function FriendsContainer() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")

  const [activeTab, setActiveTab] = React.useState<ActiveTab>(() => {
    if (tabParam === "received" || tabParam === "sent" || tabParam === "friends") {
      return tabParam
    }
    return "friends"
  })
  const [prevTabParam, setPrevTabParam] = React.useState(tabParam)

  if (tabParam !== prevTabParam) {
    setPrevTabParam(tabParam)
    if (tabParam === "received" || tabParam === "sent" || tabParam === "friends") {
      setActiveTab(tabParam)
    }
  }

  const { total: receivedQueryTotal } = useReceivedFriendRequests({ limit: 1 })
  const { count: liveReceivedCount } = useFriendRequestsCount()
  const receivedCount = liveReceivedCount || receivedQueryTotal
  const { total: sentCount } = useSentFriendRequests({ limit: 1 })

  const tabs = [
    {
      id: "friends" as const,
      label: "All Friends",
      icon: Users,
    },
    {
      id: "received" as const,
      label: "Friend Requests",
      icon: UserCheck,
      badge: receivedCount,
    },
    {
      id: "sent" as const,
      label: "Sent Requests",
      icon: Send,
      badge: sentCount,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs navigation */}
      <div
        role="tablist"
        aria-label="Friends Navigation Tabs"
        className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto no-scrollbar"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-10 cursor-pointer",
                isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span>{tab.label}</span>
              {typeof tab.badge === "number" && tab.badge > 0 && (
                <span
                  className={cn(
                    "ml-1 min-w-5 h-5 px-1.5 inline-flex items-center justify-center rounded-full text-xs font-bold leading-none",
                    tab.id === "received"
                      ? "bg-destructive text-white shadow-xs"
                      : isActive
                        ? "bg-primary-foreground text-primary"
                        : "bg-primary/10 text-primary"
                  )}
                >
                  {tab.badge > 99 ? "99+" : tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab Panels */}
      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeTab === "friends" && <FriendsListTab />}
        {activeTab === "received" && (
          <ReceivedRequestsTab onAccepted={() => setActiveTab("friends")} />
        )}
        {activeTab === "sent" && <SentRequestsTab />}
      </div>
    </div>
  )
}

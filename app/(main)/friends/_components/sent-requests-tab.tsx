"use client"

import * as React from "react"
import { Send, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSentFriendRequests } from "@/hooks/friends/use-friend-requests"
import { FriendRequestCard } from "./friend-request-card"

export function SentRequestsTab() {
  const [page, setPage] = React.useState(1)

  const {
    requests,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    isLoading,
    isFetching,
  } = useSentFriendRequests({
    page,
    limit: 12,
  })

  return (
    <div className="flex flex-col gap-4">
      {/* Header info */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          Outgoing Requests ({total})
        </span>
        {isFetching && (
          <Loader2 className="size-3.5 animate-spin text-primary" aria-label="Loading" />
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading sent requests">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-20 rounded-xl border border-border bg-card/60 animate-pulse"
            />
          ))}
        </div>
      ) : requests.filter((r) => Boolean(r.receiver)).length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-border bg-card/50">
          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
            <Send className="size-6" aria-hidden="true" />
          </div>
          <h3 className="font-heading font-semibold text-base text-foreground mb-1">
            No outgoing friend requests
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Requests you send to other people that have not yet been accepted will appear here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {requests
            .filter((request) => Boolean(request.receiver))
            .map((request) => (
              <FriendRequestCard
                key={request._id}
                type="sent"
                requestId={request._id}
                createdAt={request.createdAt}
                user={request.receiver}
              />
            ))}
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border mt-2">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!hasPrevPage || isFetching}
              className="min-h-9"
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4 mr-1" aria-hidden="true" />
              <span>Previous</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNextPage || isFetching}
              className="min-h-9"
              aria-label="Next page"
            >
              <span>Next</span>
              <ChevronRight className="size-4 ml-1" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

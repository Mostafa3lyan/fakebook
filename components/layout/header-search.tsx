"use client"

import * as React from "react"
import Link from "next/link"
import { Search, Loader2, X, UserSearch } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { UserAvatar } from "@/components/shared/user-avatar"
import { useUserSearch } from "@/hooks/user/use-user-search"

interface HeaderSearchProps {
  className?: string
  autoFocus?: boolean
  onSelectResult?: () => void
}

export function HeaderSearch({
  className,
  autoFocus = false,
  onSelectResult,
}: HeaderSearchProps) {
  const [query, setQuery] = React.useState("")
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const { users, debouncedQuery, isLoading, isFetching } = useUserSearch(query)

  const showDropdown = isOpen && query.trim().length > 0

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const handleSelect = () => {
    setIsOpen(false)
    setQuery("")
    onSelectResult?.()
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search
          className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search people by name..."
          autoFocus={autoFocus}
          className="pl-8 pr-8 bg-muted/60 border-none h-9 text-sm focus-visible:ring-2 focus-visible:ring-primary [&::-webkit-search-cancel-button]:hidden"
          aria-label="Search users by name on Fakebook"
          aria-expanded={showDropdown}
          aria-controls="header-search-results"
          role="combobox"
          aria-autocomplete="list"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("")
              setIsOpen(false)
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Clear search query"
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          id="header-search-results"
          role="listbox"
          aria-label="Search results"
          className="absolute left-0 right-0 sm:w-80 top-full mt-1.5 rounded-xl border border-border bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/5 z-50 overflow-hidden"
        >
          <div className="px-3 py-2 border-b border-border/60 flex items-center justify-between bg-muted/30">
            <span className="text-xs font-medium text-muted-foreground">
              People
            </span>
            {isFetching && (
              <Loader2
                className="size-3.5 animate-spin text-primary"
                aria-label="Searching"
              />
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
            {isLoading || (query.trim() !== debouncedQuery && users.length === 0) ? (
              <div className="p-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-4 animate-spin text-primary" aria-hidden="true" />
                <span>Searching users...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="p-6 flex flex-col items-center justify-center text-center gap-1.5">
                <UserSearch className="size-6 text-muted-foreground/70" aria-hidden="true" />
                <p className="text-xs font-medium text-foreground">
                  No users found
                </p>
                <p className="text-[11px] text-muted-foreground">
                  No results matching &ldquo;{debouncedQuery}&rdquo;
                </p>
              </div>
            ) : (
              users.map((userItem) => {
                const fullName =
                  userItem.fullName ||
                  `${userItem.firstName} ${userItem.lastName}`.trim()

                return (
                  <Link
                    key={userItem._id}
                    href={`/user/${userItem._id}`}
                    role="option"
                    aria-selected="false"
                    onClick={handleSelect}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/70 transition-colors focus-visible:bg-muted focus-visible:outline-none"
                  >
                    <UserAvatar user={userItem} size="sm" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {fullName}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        View profile
                      </span>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

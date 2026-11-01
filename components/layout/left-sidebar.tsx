"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, User, Users, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { UserAvatar } from "@/components/shared/user-avatar"
import { useCurrentUser } from "@/hooks/user/use-current-user"
import { useLogout } from "@/hooks/user/use-logout"
import { Button } from "@/components/ui/button"

export function LeftSidebar() {
  const pathname = usePathname()
  const { user } = useCurrentUser()
  const { logout, isLoggingOut } = useLogout()

  const links = [
    { label: "News Feed", href: "/", icon: Home },
    { label: "Friends", href: "/friends", icon: Users },
    { label: "My Profile", href: "/profile", icon: User },
    { label: "Settings & Privacy", href: "/settings", icon: Settings },
  ]

  return (
    <aside
      className="hidden lg:flex flex-col w-64 shrink-0 p-4 border-r border-border h-[calc(100vh-3.5rem)] sticky top-14 self-start overflow-y-auto gap-4 bg-card/40 backdrop-blur-xs select-none"
      aria-label="Desktop Sidebar Navigation"
    >
      {/* User profile snippet */}
      <Link
        href="/profile"
        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/80 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
      >
        <UserAvatar user={user} size="md" />
        <div className="flex flex-col overflow-hidden">
          <span className="font-semibold text-sm text-foreground truncate">
            {user?.fullName || "Fakebook User"}
          </span>
          <span className="text-xs text-muted-foreground truncate">
            {user?.email || "View your profile"}
          </span>
        </div>
      </Link>

      <div className="h-px bg-border/60 my-1" />

      {/* Navigation links */}
      <nav className="flex flex-col gap-1 flex-1" aria-label="Sidebar Links">
        {links.map((link) => {
          const Icon = link.icon
          const isActive =
            link.href === "/" || link.href === "/profile"
              ? pathname === link.href
              : pathname.startsWith(link.href)

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none min-h-11",
                isActive
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className={cn("size-5", isActive ? "text-primary" : "text-muted-foreground")} aria-hidden="true" />
              <span>{link.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer shortcut & sign out */}
      <div className="pt-2 border-t border-border/60 flex flex-col gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => logout("current")}
          disabled={isLoggingOut}
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 min-h-11 cursor-pointer"
        >
          <LogOut className="size-4 mr-2" aria-hidden="true" />
          <span>Sign Out</span>
        </Button>
        <p className="text-[11px] text-muted-foreground/80 px-2">
          Fakebook © 2026. Built with Next.js & Express.
        </p>
      </div>
    </aside>
  )
}

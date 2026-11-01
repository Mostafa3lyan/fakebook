"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, User, Users, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { UserAvatar } from "@/components/shared/user-avatar"
import { useCurrentUser } from "@/hooks/user/use-current-user"

export function MobileNav() {
  const pathname = usePathname()
  const { user } = useCurrentUser()

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Friends", href: "/friends", icon: Users },
    { label: "Profile", href: "/profile", icon: User },
    { label: "Settings", href: "/settings", icon: Settings },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-card/95 backdrop-blur-md border-t border-border flex items-center justify-around h-14 px-2 safe-area-pb"
      aria-label="Mobile Navigation"
    >
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive =
          item.href === "/" || item.href === "/profile"
            ? pathname === item.href
            : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full min-h-11 min-w-11 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-md",
              isActive
                ? "text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-current={isActive ? "page" : undefined}
            aria-label={item.label}
          >
            <div className="relative flex items-center justify-center">
              {item.href === "/profile" ? (
                <UserAvatar user={user} size="xs" className={cn(isActive && "ring-2 ring-primary")} />
              ) : (
                <Icon className="size-5" aria-hidden="true" />
              )}
            </div>
            <span className="mt-1 leading-none text-[11px]">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

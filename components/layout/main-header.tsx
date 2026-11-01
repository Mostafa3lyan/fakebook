"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  Home,
  User,
  Users,
  Settings,
  Search,
  LogOut,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { UserAvatar } from "@/components/shared/user-avatar"
import { useCurrentUser } from "@/hooks/user/use-current-user"
import { useLogout } from "@/hooks/user/use-logout"
import { HeaderSearch } from "./header-search"

export function MainHeader() {
  const pathname = usePathname()
  const { user } = useCurrentUser()
  const { logout, isLoggingOut } = useLogout()
  const [isMobileSearchOpen, setIsMobileSearchOpen] = React.useState(false)

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Friends", href: "/friends", icon: Users },
    { label: "Profile", href: "/profile", icon: User },
    { label: "Settings", href: "/settings", icon: Settings },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/85 backdrop-blur-md transition-colors">
      <div className="flex h-14 items-center justify-between px-3 sm:px-4 md:px-6 max-w-7xl mx-auto gap-2">
        {/* Left: Brand & Search */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-md">
          <Link
            href="/"
            className="flex items-center gap-2 font-heading font-extrabold text-xl text-primary tracking-tight shrink-0 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-md p-1"
            aria-label="Fakebook Home"
          >
            <div className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <Image
                src="/facebook.png"
                alt="Fakebook Logo"
                width={36}
                height={36}
                priority
                className="size-9 rounded-full object-contain"
              />
            </div>
            <span className="hidden sm:inline">fakebook</span>
          </Link>

          {/* Desktop Search input */}
          <HeaderSearch className="hidden sm:block flex-1 max-w-xs" />

          {/* Mobile search toggle button */}
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden size-9 min-h-11 min-w-11"
            onClick={() => setIsMobileSearchOpen((prev) => !prev)}
            aria-label={isMobileSearchOpen ? "Close search" : "Open search"}
            aria-expanded={isMobileSearchOpen}
          >
            {isMobileSearchOpen ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Search className="size-5" aria-hidden="true" />
            )}
          </Button>
        </div>

        {/* Center: Desktop Navigation Bar */}
        <nav
          className="hidden md:flex items-center justify-center gap-1 flex-1 max-w-xs"
          aria-label="Main Navigation"
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
                  "relative flex items-center justify-center h-10 px-6 rounded-lg font-medium text-sm transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none min-h-11",
                  isActive
                    ? "text-primary bg-primary/10 font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
                aria-label={item.label}
              >
                <Icon className="size-5" aria-hidden="true" />
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right: Actions, Theme Toggle & User Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-2 rounded-full p-0.5 transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none min-h-11 min-w-11"
                aria-label="Open user menu"
              >
                <UserAvatar user={user} size="sm" />
                <span className="hidden lg:inline text-sm font-medium text-foreground max-w-30 truncate">
                  {user?.firstName || "Account"}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-1">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1 p-1">
                  <p className="text-sm font-semibold leading-none text-foreground truncate">
                    {user?.fullName || "Fakebook User"}
                  </p>
                  <p className="text-xs text-muted-foreground leading-none truncate">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/friends" className="cursor-pointer flex items-center">
                    <Users className="mr-2 size-4" aria-hidden="true" />
                    <span>Friends</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer flex items-center">
                    <User className="mr-2 size-4" aria-hidden="true" />
                    <span>Your Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer flex items-center">
                    <Settings className="mr-2 size-4" aria-hidden="true" />
                    <span>Settings & Privacy</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => logout("current")}
                disabled={isLoggingOut}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="mr-2 size-4" aria-hidden="true" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Expandable Search Bar */}
      {isMobileSearchOpen && (
        <div className="sm:hidden px-4 pb-3 pt-1 border-t border-border/40 bg-card">
          <HeaderSearch
            autoFocus
            onSelectResult={() => setIsMobileSearchOpen(false)}
          />
        </div>
      )}
    </header>
  )
}

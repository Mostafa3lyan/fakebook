import { NextRequest, NextResponse } from "next/server"
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth/session"
import { safeRedirectTarget } from "@/lib/utils/safe-redirect"

// Publicly accessible authentication routes
const publicRoutes = new Set([
  "/login",
  "/signup",
  "/confirm-signup-email",
  "/forgot-password",
  "/verify-otp",
  "/reset-password",
  "/restore-account",
])

// Routes only accessible when logged OUT — redirect to feed if already authenticated
const authOnlyRoutes = publicRoutes

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // Check for active session tokens in cookies
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value
  const isAuthenticated = Boolean(accessToken || refreshToken)

  const isPublic = publicRoutes.has(pathname)

  // Logged-in users shouldn't access login/signup/reset pages
  if (authOnlyRoutes.has(pathname) && isAuthenticated) {
    const callback = request.nextUrl.searchParams.get("callbackUrl")
    const destination = safeRedirectTarget(callback, "/")
    return NextResponse.redirect(new URL(destination, request.url))
  }

  // Protected pages require authentication — fail closed
  if (!isPublic && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url)
    const callbackTarget = `${pathname}${search}`
    if (callbackTarget && callbackTarget !== "/") {
      loginUrl.searchParams.set("callbackUrl", callbackTarget)
    }
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2)$).*)",
  ],
}

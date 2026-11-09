import { NextRequest, NextResponse } from "next/server"
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  getSessionTokens,
  isTokenExpiringSoon,
} from "@/lib/auth/session"
import { rotateTokens } from "@/lib/auth/refresh"

interface RouteContext {
  params: Promise<{
    path: string[]
  }>
}

const ACCESS_TOKEN_MAX_AGE = 30 * 60
const REFRESH_TOKEN_MAX_AGE = 365 * 24 * 60 * 60

async function handleProxyRequest(
  req: NextRequest,
  context: RouteContext,
  method: string
) {
  // Cross-Origin Mutation Guard (VULN-FE-04)
  if (method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE") {
    const origin = req.headers.get("origin")
    const referer = req.headers.get("referer")
    const host = req.headers.get("host") || req.nextUrl.host

    if (origin) {
      try {
        const originHost = new URL(origin).host
        if (originHost !== host) {
          return NextResponse.json(
            { message: "Cross-origin request forbidden" },
            { status: 403 }
          )
        }
      } catch {
        return NextResponse.json(
          { message: "Invalid Origin header" },
          { status: 403 }
        )
      }
    } else if (referer) {
      try {
        const refererHost = new URL(referer).host
        if (refererHost !== host) {
          return NextResponse.json(
            { message: "Cross-origin request forbidden" },
            { status: 403 }
          )
        }
      } catch {
        return NextResponse.json(
          { message: "Invalid Referer header" },
          { status: 403 }
        )
      }
    }
  }

  const { path } = await context.params
  const targetPath = path.join("/")
  const backendBase = process.env.BACKEND_URL || "http://localhost:3000"

  // Preserve query string
  const search = req.nextUrl.search
  const targetUrl = `${backendBase}/${targetPath}${search}`

  let { accessToken, refreshToken } = await getSessionTokens()
  let rotatedCredentials: { access_token: string; refresh_token: string } | null = null
  let rotationFailed = false

  // Proactive refresh if expiring soon (< 30s)
  if (
    accessToken &&
    refreshToken &&
    !targetPath.includes("user/rotate-token") &&
    isTokenExpiringSoon(accessToken, 30)
  ) {
    const refreshed = await rotateTokens(refreshToken, accessToken)
    if (refreshed?.access_token) {
      accessToken = refreshed.access_token
      refreshToken = refreshed.refresh_token
      rotatedCredentials = refreshed
    } else {
      rotationFailed = true
    }
  }

  const buildHeaders = (token: string | null) => {
    const headers = new Headers()
    const contentType = req.headers.get("content-type")
    if (contentType) {
      headers.set("content-type", contentType)
    }
    if (token) {
      headers.set("authorization", `Bearer ${token}`)
    }
    const forwardedFor = req.headers.get("x-forwarded-for")
    if (forwardedFor) {
      headers.set("x-forwarded-for", forwardedFor)
    } else {
      const clientIp = req.headers.get("x-real-ip")
      if (clientIp) {
        headers.set("x-forwarded-for", clientIp)
      }
    }
    return headers
  }

  const forwardBody =
    method === "GET" || method === "HEAD" ? undefined : await req.arrayBuffer()

  let backendRes = await fetch(targetUrl, {
    method,
    headers: buildHeaders(accessToken),
    body: forwardBody,
  })

  // Handle 401 token expiration and retry
  if (
    backendRes.status === 401 &&
    refreshToken &&
    !targetPath.includes("user/rotate-token")
  ) {
    const refreshed = await rotateTokens(refreshToken)
    if (refreshed?.access_token) {
      rotatedCredentials = refreshed
      rotationFailed = false
      backendRes = await fetch(targetUrl, {
        method,
        headers: buildHeaders(refreshed.access_token),
        body: forwardBody,
      })
    } else {
      rotationFailed = true
    }
  }

  const responseContentType =
    backendRes.headers.get("content-type") || "application/json"
  const responseData = await backendRes.arrayBuffer()

  const nextResponse = new NextResponse(responseData, {
    status: backendRes.status,
    headers: {
      "content-type": responseContentType,
    },
  })

  const isProduction = process.env.NODE_ENV === "production"

  // Propagate any rotated credentials onto nextResponse cookies
  if (rotatedCredentials) {
    nextResponse.cookies.set(ACCESS_TOKEN_COOKIE, rotatedCredentials.access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_TOKEN_MAX_AGE,
    })
    nextResponse.cookies.set(REFRESH_TOKEN_COOKIE, rotatedCredentials.refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: REFRESH_TOKEN_MAX_AGE,
    })
  } else if (rotationFailed) {
    nextResponse.cookies.delete(ACCESS_TOKEN_COOKIE)
    nextResponse.cookies.delete(REFRESH_TOKEN_COOKIE)
  }

  // Always clear session cookies on user/logout (even if backend token was already expired/revoked)
  if (targetPath === "user/logout") {
    nextResponse.cookies.delete(ACCESS_TOKEN_COOKIE)
    nextResponse.cookies.delete(REFRESH_TOKEN_COOKIE)
  }

  // Synchronize HttpOnly cookies upon successful auth operations
  if (backendRes.ok && responseContentType.includes("application/json")) {
    try {
      const text = new TextDecoder().decode(responseData)
      const parsed = JSON.parse(text)
      const data = parsed?.data

      // 1. If tokens are issued (login, login-confirm, google auth, rotate, change-password, restore-account)
      if (data?.access_token && data?.refresh_token) {
        nextResponse.cookies.set(ACCESS_TOKEN_COOKIE, data.access_token, {
          httpOnly: true,
          secure: isProduction,
          sameSite: "lax",
          path: "/",
          maxAge: ACCESS_TOKEN_MAX_AGE,
        })
        nextResponse.cookies.set(REFRESH_TOKEN_COOKIE, data.refresh_token, {
          httpOnly: true,
          secure: isProduction,
          sameSite: "lax",
          path: "/",
          maxAge: REFRESH_TOKEN_MAX_AGE,
        })
      }

      // 2. If account is deleted or deactivated
      if (
        targetPath === "user/delete-account" ||
        targetPath === "user/soft-delete"
      ) {
        nextResponse.cookies.delete(ACCESS_TOKEN_COOKIE)
        nextResponse.cookies.delete(REFRESH_TOKEN_COOKIE)
      }
    } catch {
      // Non-JSON or parsing error - leave response untouched
    }
  }

  return nextResponse
}

export async function GET(req: NextRequest, context: RouteContext) {
  return handleProxyRequest(req, context, "GET")
}

export async function POST(req: NextRequest, context: RouteContext) {
  return handleProxyRequest(req, context, "POST")
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  return handleProxyRequest(req, context, "PATCH")
}

export async function PUT(req: NextRequest, context: RouteContext) {
  return handleProxyRequest(req, context, "PUT")
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  return handleProxyRequest(req, context, "DELETE")
}

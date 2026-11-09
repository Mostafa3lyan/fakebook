import { NextRequest, NextResponse } from "next/server"
import { getSessionTokens } from "@/lib/auth/session"
import { rotateTokens } from "@/lib/auth/refresh"

interface MediaRouteContext {
  params: Promise<{
    key: string[]
  }>
}

export async function GET(req: NextRequest, context: MediaRouteContext) {
  const { key } = await context.params
  let assetKey = key.join("/")

  // Strip leading "uploads/" if accidentally duplicated in the route segments
  assetKey = assetKey.replace(/^uploads\//, "")

  // Reject absolute URLs, scheme-relative URLs, or path traversal
  if (
    assetKey.startsWith("http://") ||
    assetKey.startsWith("https://") ||
    assetKey.startsWith("//") ||
    assetKey.includes("..") ||
    assetKey.includes("\\")
  ) {
    return new NextResponse("Invalid asset key", { status: 400 })
  }

  const backendBase = process.env.BACKEND_URL || "http://localhost:3000"
  const search = req.nextUrl.search
  const targetUrl = `${backendBase}/uploads/${assetKey}${search}`

  const authHeader = req.headers.get("authorization")
  const { accessToken: initialAccessToken, refreshToken } = await getSessionTokens()
  let accessToken = authHeader?.replace(/^Bearer\s+/i, "") || initialAccessToken

  const fetchAsset = (token: string | null) => {
    const headers = new Headers()
    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }
    return fetch(targetUrl, {
      method: "GET",
      headers,
    })
  }

  let res = await fetchAsset(accessToken)

  if (res.status === 401 && refreshToken) {
    const refreshed = await rotateTokens(refreshToken)
    if (refreshed?.access_token) {
      accessToken = refreshed.access_token
      res = await fetchAsset(accessToken)
    }
  }

  if (!res.ok) {
    return new NextResponse("Asset not found or unauthorized", {
      status: res.status,
    })
  }

  const contentType = res.headers.get("content-type") || "image/jpeg"
  const contentDisposition = res.headers.get("content-disposition")
  const data = await res.arrayBuffer()

  const responseHeaders = new Headers({
    "content-type": contentType,
    "cache-control": "private, max-age=3600, stale-while-revalidate=86400",
  })

  if (contentDisposition) {
    responseHeaders.set("content-disposition", contentDisposition)
  }

  return new NextResponse(data, {
    status: 200,
    headers: responseHeaders,
  })
}

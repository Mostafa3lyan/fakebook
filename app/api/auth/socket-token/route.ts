import { NextResponse } from "next/server"
import { getSessionTokens, isTokenExpiringSoon } from "@/lib/auth/session"
import { rotateTokens } from "@/lib/auth/refresh"

export async function GET() {
  const { accessToken, refreshToken } = await getSessionTokens()

  if (!accessToken && !refreshToken) {
    return NextResponse.json({ token: null }, { status: 401 })
  }

  let validToken = accessToken

  if ((!validToken || isTokenExpiringSoon(validToken, 30)) && refreshToken) {
    const rotated = await rotateTokens(refreshToken, validToken)
    validToken = rotated?.access_token ?? null
  }

  if (!validToken) {
    return NextResponse.json({ token: null }, { status: 401 })
  }

  return NextResponse.json({ token: validToken })
}


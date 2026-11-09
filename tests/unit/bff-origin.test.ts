import { describe, expect, it } from "vitest"
import { NextRequest } from "next/server"
import { POST } from "@/app/api/backend/[...path]/route"

describe("BFF Cross-Origin Mutation Protection (VULN-FE-04)", () => {
  it("rejects POST request with foreign Origin header with 403", async () => {
    const req = new NextRequest("http://localhost:5173/api/backend/auth/login", {
      method: "POST",
      headers: {
        host: "localhost:5173",
        origin: "https://attacker.evil.com",
      },
    })
    const context = { params: Promise.resolve({ path: ["auth", "login"] }) }
    const res = await POST(req, context)
    expect(res.status).toBe(403)
    const data = await res.json()
    expect(data.message).toBe("Cross-origin request forbidden")
  })

  it("rejects POST request with malformed Origin header with 403", async () => {
    const req = new NextRequest("http://localhost:5173/api/backend/auth/login", {
      method: "POST",
      headers: {
        host: "localhost:5173",
        origin: "not-a-valid-url",
      },
    })
    const context = { params: Promise.resolve({ path: ["auth", "login"] }) }
    const res = await POST(req, context)
    expect(res.status).toBe(403)
  })

  it("rejects POST request with foreign Referer header when Origin is absent with 403", async () => {
    const req = new NextRequest("http://localhost:5173/api/backend/auth/login", {
      method: "POST",
      headers: {
        host: "localhost:5173",
        referer: "https://malicious-site.com/exploit",
      },
    })
    const context = { params: Promise.resolve({ path: ["auth", "login"] }) }
    const res = await POST(req, context)
    expect(res.status).toBe(403)
    const data = await res.json()
    expect(data.message).toBe("Cross-origin request forbidden")
  })
})


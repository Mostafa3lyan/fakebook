import { describe, expect, it } from "vitest"
import { NextRequest } from "next/server"
import { GET } from "@/app/api/media/[...key]/route"

describe("Media Proxy Security (FE-03)", () => {
  it("rejects absolute http URLs with 400", async () => {
    const req = new NextRequest("http://localhost:5173/api/media/http://evil.com")
    const context = { params: Promise.resolve({ key: ["http:", "", "evil.com"] }) }
    const res = await GET(req, context)
    expect(res.status).toBe(400)
    expect(await res.text()).toBe("Invalid asset key")
  })

  it("rejects absolute https URLs with 400", async () => {
    const req = new NextRequest("http://localhost:5173/api/media/https://evil.com")
    const context = { params: Promise.resolve({ key: ["https:", "", "evil.com"] }) }
    const res = await GET(req, context)
    expect(res.status).toBe(400)
    expect(await res.text()).toBe("Invalid asset key")
  })

  it("rejects protocol-relative URLs (//) with 400", async () => {
    const req = new NextRequest("http://localhost:5173/api/media///evil.com")
    const context = { params: Promise.resolve({ key: ["", "", "evil.com"] }) }
    const res = await GET(req, context)
    expect(res.status).toBe(400)
    expect(await res.text()).toBe("Invalid asset key")
  })

  it("rejects directory traversal (..) with 400", async () => {
    const req = new NextRequest("http://localhost:5173/api/media/../secret")
    const context = { params: Promise.resolve({ key: ["..", "secret"] }) }
    const res = await GET(req, context)
    expect(res.status).toBe(400)
    expect(await res.text()).toBe("Invalid asset key")
  })

  it("rejects backslashes with 400", async () => {
    const req = new NextRequest("http://localhost:5173/api/media/foo\\bar")
    const context = { params: Promise.resolve({ key: ["foo\\bar"] }) }
    const res = await GET(req, context)
    expect(res.status).toBe(400)
    expect(await res.text()).toBe("Invalid asset key")
  })
})


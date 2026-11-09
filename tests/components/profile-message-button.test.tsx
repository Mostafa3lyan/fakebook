import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import React from "react"
import { ProfileMessageButton } from "@/app/(main)/profile/[userId]/_components/profile-message-button"
import { IPublicUser } from "@/lib/types"

const mockOpenChat = vi.fn()
const mockMutateAsync = vi.fn()
let mockIsPending = false
let mockCurrentUserId: string | null = "current-user-1"

vi.mock("@/components/chat/chat-provider", () => ({
  useChat: () => ({
    openChat: mockOpenChat,
  }),
}))

vi.mock("@/hooks/chat/use-conversation-actions", () => ({
  useConversationActions: () => ({
    createOrGetDirect: {
      mutateAsync: mockMutateAsync,
      isPending: mockIsPending,
    },
  }),
}))

vi.mock("@/hooks/user/use-current-user", () => ({
  useCurrentUser: () => ({
    user: mockCurrentUserId ? { _id: mockCurrentUserId } : null,
  }),
}))

const mockToastError = vi.fn()
vi.mock("sonner", () => ({
  toast: {
    error: (msg: string) => mockToastError(msg),
    success: vi.fn(),
  },
}))

describe("<ProfileMessageButton />", () => {
  const targetUser: IPublicUser = {
    _id: "target-user-123",
    firstName: "Jane",
    lastName: "Doe",
    fullName: "Jane Doe",
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockIsPending = false
    mockCurrentUserId = "current-user-1"
  })

  it("renders the Message button with accessible name", () => {
    render(<ProfileMessageButton user={targetUser} />)

    const button = screen.getByRole("button", {
      name: "Send a message to Jane Doe",
    })
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent("Message")
    expect(button).not.toBeDisabled()
  })

  it("calls createOrGetDirect and opens chat on click", async () => {
    const mockConversation = {
      _id: "conv-456",
      type: "direct" as const,
      participants: [],
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockMutateAsync.mockResolvedValueOnce({
      data: { conversation: mockConversation },
    })

    render(<ProfileMessageButton user={targetUser} />)

    const button = screen.getByRole("button", {
      name: "Send a message to Jane Doe",
    })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith("target-user-123")
      expect(mockOpenChat).toHaveBeenCalledWith("conv-456", mockConversation)
    })
  })

  it("shows loading state when conversation is being initialized", () => {
    mockIsPending = true
    render(<ProfileMessageButton user={targetUser} />)

    const button = screen.getByRole("button", {
      name: "Send a message to Jane Doe",
    })
    expect(button).toBeDisabled()
    expect(button).toHaveTextContent("Opening...")
  })

  it("shows error toast when mutation fails", async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error("Unable to start conversation"))

    render(<ProfileMessageButton user={targetUser} />)

    const button = screen.getByRole("button", {
      name: "Send a message to Jane Doe",
    })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Unable to start conversation")
    })
  })

  it("does not render when viewing own profile", () => {
    mockCurrentUserId = "target-user-123"
    const { container } = render(<ProfileMessageButton user={targetUser} />)

    expect(container.firstChild).toBeNull()
  })
})

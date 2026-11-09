import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { MessengerNavButton } from "@/components/chat/messenger-nav-button";

let mockUnreadCount = 0;

vi.mock("@/hooks/chat/use-conversations", () => ({
  useConversations: () => ({
    totalUnreadCount: mockUnreadCount,
    conversations: [],
    isLoading: false,
  }),
}));

vi.mock("@/components/chat/messenger-dropdown", () => ({
  MessengerDropdown: () => <div data-testid="messenger-dropdown">Dropdown Content</div>,
}));

describe("<MessengerNavButton />", () => {
  it("renders with default 'Messenger' aria-label and no badge when count is 0", () => {
    mockUnreadCount = 0;
    render(<MessengerNavButton />);
    const button = screen.getByLabelText("Messenger");
    expect(button).toBeInTheDocument();
    expect(screen.queryByText(/^[0-9]/)).not.toBeInTheDocument();
  });

  it("renders unread badge and accessible label when count is greater than 0", () => {
    mockUnreadCount = 5;
    render(<MessengerNavButton />);
    const button = screen.getByLabelText("5 unread messages");
    expect(button).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("caps badge display at 99+ when unread count exceeds 99", () => {
    mockUnreadCount = 150;
    render(<MessengerNavButton />);
    const button = screen.getByLabelText("150 unread messages");
    expect(button).toBeInTheDocument();
    expect(screen.getByText("99+")).toBeInTheDocument();
  });
});


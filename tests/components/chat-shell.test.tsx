import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { ChatShell } from "@/components/chat/chat-shell";
import { ActiveChat } from "@/components/chat/chat-provider";

let mockActiveChats: ActiveChat[] = [];

vi.mock("@/components/chat/chat-provider", () => ({
  useChat: () => ({
    activeChats: mockActiveChats,
    isNewChatModalOpen: false,
    closeNewChatModal: vi.fn(),
    isRequestsModalOpen: false,
    closeRequestsModal: vi.fn(),
    activeGroupSettingsId: null,
    closeGroupSettings: vi.fn(),
  }),
}));

vi.mock("@/components/chat/floating-chat-window", () => ({
  FloatingChatWindow: ({ conversationId }: { conversationId: string }) => (
    <div data-testid={`floating-window-${conversationId}`}>Window {conversationId}</div>
  ),
}));

vi.mock("@/components/chat/minimized-chat-bubble", () => ({
  MinimizedChatBubble: ({ conversationId }: { conversationId: string }) => (
    <div data-testid={`minimized-bubble-${conversationId}`}>Bubble {conversationId}</div>
  ),
}));

vi.mock("@/components/chat/new-conversation-modal", () => ({
  NewConversationModal: () => null,
}));

vi.mock("@/components/chat/message-requests-modal", () => ({
  MessageRequestsModal: () => null,
}));

vi.mock("@/components/chat/group-settings-modal", () => ({
  GroupSettingsModal: () => null,
}));

describe("<ChatShell />", () => {
  it("renders empty dock when activeChats is empty", () => {
    mockActiveChats = [];
    render(<ChatShell />);
    expect(screen.queryByTestId(/floating-window-/)).not.toBeInTheDocument();
    expect(screen.queryByTestId(/minimized-bubble-/)).not.toBeInTheDocument();
  });

  it("renders active floating chat window when a chat is unminimized", () => {
    mockActiveChats = [
      { conversationId: "conv-101", isMinimized: false },
    ];
    render(<ChatShell />);
    expect(screen.getByTestId("floating-window-conv-101")).toBeInTheDocument();
    expect(screen.queryByTestId(/minimized-bubble-/)).not.toBeInTheDocument();
  });

  it("renders minimized chat bubble when chat isMinimized is true", () => {
    mockActiveChats = [
      { conversationId: "conv-202", isMinimized: true },
    ];
    render(<ChatShell />);
    expect(screen.queryByTestId("floating-window-conv-202")).not.toBeInTheDocument();
    expect(screen.getByTestId("minimized-bubble-conv-202")).toBeInTheDocument();
  });

  it("renders both active windows and minimized bubbles simultaneously", () => {
    mockActiveChats = [
      { conversationId: "conv-1", isMinimized: false },
      { conversationId: "conv-2", isMinimized: true },
    ];
    render(<ChatShell />);
    expect(screen.getByTestId("floating-window-conv-1")).toBeInTheDocument();
    expect(screen.getByTestId("minimized-bubble-conv-2")).toBeInTheDocument();
  });
});


import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { MessageBubble } from "@/components/chat/message-bubble";
import { IMessage, ProviderEnum, RoleEnum } from "@/lib/types";

// Mock hooks
vi.mock("@/hooks/user/use-current-user", () => ({
  useCurrentUser: () => ({
    user: { _id: "user-123", firstName: "Current", lastName: "User" },
  }),
}));

vi.mock("@/hooks/chat/use-conversation-actions", () => ({
  useConversationActions: () => ({
    editMessage: { mutate: vi.fn() },
    deleteMessage: { mutate: vi.fn() },
  }),
}));

describe("<MessageBubble />", () => {
  const baseMessage: IMessage = {
    _id: "msg-1",
    conversationId: "conv-1",
    sender: {
      _id: "user-123",
      firstName: "Current",
      lastName: "User",
      fullName: "Current User",
      email: "user@example.com",
      provider: ProviderEnum.System,
      role: RoleEnum.User,
      profileCoverPictures: [],
      twoFactorVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    type: "text",
    content: "Hello from current user!",
    attachments: [],
    isEdited: false,
    isDeleted: false,
    createdAt: "2026-05-15T12:00:00.000Z",
    updatedAt: "2026-05-15T12:00:00.000Z",
  };

  it("renders sent message content correctly", () => {
    render(<MessageBubble message={baseMessage} conversationId="conv-1" />);
    expect(screen.getByText("Hello from current user!")).toBeInTheDocument();
  });

  it("renders (edited) indicator when isEdited is true", () => {
    const editedMessage: IMessage = {
      ...baseMessage,
      isEdited: true,
      editedAt: new Date().toISOString(),
    };
    render(<MessageBubble message={editedMessage} conversationId="conv-1" />);
    expect(screen.getByText("(edited)")).toBeInTheDocument();
  });

  it("renders tombstone text when message isDeleted is true", () => {
    const deletedMessage: IMessage = {
      ...baseMessage,
      isDeleted: true,
      content: "This message was deleted",
    };
    render(<MessageBubble message={deletedMessage} conversationId="conv-1" />);
    expect(screen.getByText("This message was deleted")).toBeInTheDocument();
  });

  it("renders sent status icon (Sent)", () => {
    render(<MessageBubble message={baseMessage} conversationId="conv-1" />);
    expect(screen.getByLabelText("Sent")).toBeInTheDocument();
  });

  it("renders read status icon (Read) when readBy has other recipient", () => {
    const readMessage: IMessage = {
      ...baseMessage,
      readBy: [
        { user: "user-123", timestamp: new Date().toISOString() },
        { user: "recipient-456", timestamp: new Date().toISOString() },
      ],
    };
    render(<MessageBubble message={readMessage} conversationId="conv-1" />);
    expect(screen.getByLabelText("Read")).toBeInTheDocument();
  });

  it("renders received message without self receipt indicators", () => {
    const receivedMessage: IMessage = {
      ...baseMessage,
      sender: {
        _id: "other-user-999",
        firstName: "Other",
        lastName: "Person",
        fullName: "Other Person",
        email: "other@example.com",
        provider: ProviderEnum.System,
        role: RoleEnum.User,
        profileCoverPictures: [],
        twoFactorVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      content: "Hello from a friend!",
    };
    render(<MessageBubble message={receivedMessage} conversationId="conv-1" />);
    expect(screen.getByText("Hello from a friend!")).toBeInTheDocument();
    expect(screen.queryByLabelText("Sent")).not.toBeInTheDocument();
  });
});


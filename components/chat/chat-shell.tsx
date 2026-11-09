"use client"

import * as React from "react"
import { useChat } from "./chat-provider"
import { FloatingChatWindow } from "./floating-chat-window"
import { MinimizedChatBubble } from "./minimized-chat-bubble"
import { NewConversationModal } from "./new-conversation-modal"
import { MessageRequestsModal } from "./message-requests-modal"
import { GroupSettingsModal } from "./group-settings-modal"

export function ChatShell() {
  const {
    activeChats,
    isNewChatModalOpen,
    closeNewChatModal,
    isRequestsModalOpen,
    closeRequestsModal,
    activeGroupSettingsId,
    closeGroupSettings,
  } = useChat()

  const unminimizedChats = activeChats.filter((c) => !c.isMinimized)
  const minimizedChats = activeChats.filter((c) => c.isMinimized)

  return (
    <>
      {/* Floating Messenger dock at bottom-right of viewport */}
      <div
        className="fixed bottom-16 md:bottom-0 right-2 sm:right-6 z-50 flex items-end gap-3 pointer-events-none select-none max-w-full pb-safe"
        aria-label="Messenger floating dock"
      >
        {/* Minimized chats */}
        {minimizedChats.length > 0 && (
          <div className="flex flex-col-reverse gap-2 mb-2 pointer-events-none">
            {minimizedChats.map((chat) => (
              <MinimizedChatBubble
                key={chat.conversationId}
                conversationId={chat.conversationId}
                cachedConversation={chat.cachedConversation}
              />
            ))}
          </div>
        )}

        {/* Active floating chat windows */}
        {unminimizedChats.map((chat) => (
          <FloatingChatWindow
            key={chat.conversationId}
            conversationId={chat.conversationId}
            cachedConversation={chat.cachedConversation}
          />
        ))}
      </div>

      {/* Global Modals */}
      <NewConversationModal
        isOpen={isNewChatModalOpen}
        onClose={closeNewChatModal}
      />

      <MessageRequestsModal
        isOpen={isRequestsModalOpen}
        onClose={closeRequestsModal}
      />

      {activeGroupSettingsId && (
        <GroupSettingsModal
          conversationId={activeGroupSettingsId}
          isOpen={Boolean(activeGroupSettingsId)}
          onClose={closeGroupSettings}
        />
      )}
    </>
  )
}


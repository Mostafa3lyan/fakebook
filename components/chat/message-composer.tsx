"use client"

import * as React from "react"
import { useSocket } from "@/components/providers/socket-provider"
import { useSendMessage } from "@/hooks/chat/use-send-message"
import { Button } from "@/components/ui/button"
import { Paperclip, SendHorizontal, X } from "lucide-react"

interface MessageComposerProps {
  conversationId: string
}

export function MessageComposer({ conversationId }: MessageComposerProps) {
  const { socket } = useSocket()
  const { mutate: sendMessage, isPending } = useSendMessage(conversationId)

  const [content, setContent] = React.useState("")
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  // Emit typing indicator to socket
  const notifyTyping = () => {
    if (!socket) return
    socket.emit("chat:typing_start", { conversationId })

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("chat:typing_stop", { conversationId })
    }, 2500)
  }

  const handleSend = () => {
    const trimmed = content.trim()
    if (!trimmed && selectedFiles.length === 0) return

    // Stop typing indicator immediately on send
    if (socket && typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      socket.emit("chat:typing_stop", { conversationId })
    }

    const clientTempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    sendMessage({
      content: trimmed,
      clientTempId,
      attachments: selectedFiles,
    })

    setContent("")
    setSelectedFiles([])
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    const files = Array.from(e.target.files)
    setSelectedFiles((prev) => [...prev, ...files].slice(0, 5)) // Max 5 attachments
    e.target.value = ""
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // Adjust textarea height dynamically
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    notifyTyping()
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`
    }
  }

  return (
    <div className="border-t border-border/60 bg-card p-2 sm:p-2.5">
      {/* Attachment previews */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 p-1.5 bg-muted/50 rounded-lg max-h-24 overflow-y-auto">
          {selectedFiles.map((file, idx) => (
            <div
              key={idx}
              className="relative flex items-center gap-1.5 text-xs bg-card border border-border px-2 py-1 rounded-md shadow-2xs pr-6"
            >
              <span className="truncate max-w-32 font-medium">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive p-0.5"
                aria-label="Remove attachment"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input controls */}
      <div className="flex items-end gap-1.5">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,application/pdf,.doc,.docx"
          className="hidden"
          onChange={handleFileChange}
        />

        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          className="size-8 rounded-full shrink-0 text-muted-foreground hover:text-foreground"
          aria-label="Attach file"
        >
          <Paperclip className="size-4" />
        </Button>

        <textarea
          ref={textareaRef}
          rows={1}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Aa"
          className="flex-1 min-h-[34px] max-h-[120px] resize-none rounded-xl bg-muted/80 px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
        />

        <Button
          type="button"
          size="icon"
          variant="default"
          onClick={handleSend}
          disabled={isPending || (!content.trim() && selectedFiles.length === 0)}
          className="size-8 rounded-full shrink-0 bg-primary text-primary-foreground shadow-xs"
          aria-label="Send message"
        >
          <SendHorizontal className="size-4" />
        </Button>
      </div>
    </div>
  )
}

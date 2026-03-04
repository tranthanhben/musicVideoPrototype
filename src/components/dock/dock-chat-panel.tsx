'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { X, Bot } from 'lucide-react'
import { useChatStore } from '@/lib/chat/store'
import { addUserMessage } from '@/lib/chat/simulator'
import { ChatContainer } from '@/components/chat/chat-container'
import { ChatInput } from '@/components/chat/chat-input'
import type { ChatSuggestion } from '@/lib/chat/types'

interface DockChatPanelProps {
  open: boolean
  onClose: () => void
  onAction?: (action: string) => void
  suggestions?: ChatSuggestion[]
}

export function DockChatPanel({ open, onClose, onAction, suggestions }: DockChatPanelProps) {
  const messages = useChatStore((s) => s.messages)
  const isStreaming = useChatStore((s) => s.isStreaming)

  function handleSend(text: string) {
    addUserMessage(text)
    // Check for scene regen pattern
    const regenMatch = text.match(/regenerate scene (\d+)/i)
    if (regenMatch) {
      const sceneIndex = parseInt(regenMatch[1], 10) - 1
      onAction?.(`regenerate_scene_${sceneIndex}`)
    } else {
      onAction?.(`user_message:${text}`)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="absolute right-0 top-0 bottom-0 w-80 z-20 flex flex-col border-l border-border bg-card shadow-2xl"
        >
          {/* Header */}
          <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-4">
            <Bot className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium flex-1">AI Producer</span>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <ChatContainer messages={messages} onAction={onAction} className="flex-1" />

          {/* Input */}
          <ChatInput
            onSend={handleSend}
            disabled={isStreaming}
            placeholder="Ask about the pipeline..."
            suggestions={suggestions}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

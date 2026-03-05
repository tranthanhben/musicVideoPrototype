'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { ChatContainer } from '@/components/chat/chat-container'
import { ChatInput } from '@/components/chat/chat-input'
import { useChatStore } from '@/lib/chat/store'
import { addUserMessage } from '@/lib/chat/simulator'
import type { ChatSuggestion } from '@/lib/chat/types'
import { matchIntent } from '@/lib/journey/bay-interactions'
import type { JourneyStateId } from '@/lib/journey/orchestrator'

interface BayChatPanelProps {
  open: boolean
  onClose: () => void
  onAction: (action: string) => void
  suggestions?: ChatSuggestion[]
  journeyState: JourneyStateId
}

export function BayChatPanel({ open, onClose, onAction, suggestions, journeyState }: BayChatPanelProps) {
  const messages = useChatStore((s) => s.messages)
  const isStreaming = useChatStore((s) => s.isStreaming)

  function handleSend(text: string) {
    addUserMessage(text)

    // Try intent matching first
    const matched = matchIntent(text, journeyState)
    if (matched) {
      onAction(matched)
      return
    }

    // Legacy regeneration pattern (fallback for states not in PATTERNS)
    const regenMatch = text.match(/regenerate\s+scene\s+(\d+)/i)
    if (regenMatch) {
      const sceneIdx = parseInt(regenMatch[1]) - 1
      onAction(`regenerate_scene_${sceneIdx}`)
      return
    }

    onAction(`user_message:${text}`)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="absolute top-0 right-0 bottom-0 w-80 flex flex-col bg-background border-l border-border shadow-2xl z-20"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-semibold text-foreground">AI Producer</span>
            </div>
            <button
              onClick={onClose}
              className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <ChatContainer
            messages={messages}
            onAction={onAction}
            className="flex-1"
          />

          {/* Input */}
          <ChatInput
            onSend={handleSend}
            disabled={isStreaming}
            placeholder="Ask the AI producer..."
            suggestions={suggestions}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

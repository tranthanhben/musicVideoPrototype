'use client'

import { Bot } from 'lucide-react'
import { useChatStore } from '@/lib/chat/store'
import { usePipelineStore } from '@/lib/pipeline/store'
import { ChatContainer } from '@/components/chat/chat-container'
import { ChatInput } from '@/components/chat/chat-input'
import { LAYER_ORDER } from '@/lib/pipeline/constants'
import type { ChatSuggestion } from '@/lib/chat/types'

interface MonitorChatPanelProps {
  onSend: (message: string) => void
  onAction: (action: string) => void
  suggestions?: ChatSuggestion[]
}

const LAYER_NAMES: Record<string, string> = {
  L1_INPUT: 'Input & Understanding',
  L2_CREATIVE: 'Creative Direction',
  L3_PREPRODUCTION: 'Pre-Production',
  L4_PRODUCTION: 'Production',
  L5_POSTPRODUCTION: 'Post-Production',
}

export function MonitorChatPanel({ onSend, onAction, suggestions }: MonitorChatPanelProps) {
  const messages = useChatStore((s) => s.messages)
  const isStreaming = useChatStore((s) => s.isStreaming)
  const currentLayerId = usePipelineStore((s) => s.currentLayerId)

  const layerName = currentLayerId ? LAYER_NAMES[currentLayerId] : null

  return (
    <div className="flex h-full flex-col border-r border-border">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Bot className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">AI Director</p>
          {layerName ? (
            <p className="text-xs text-muted-foreground truncate">{layerName}</p>
          ) : (
            <p className="text-xs text-muted-foreground">Ready</p>
          )}
        </div>
        {currentLayerId && (
          <div className="ml-auto flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-muted-foreground font-mono">
              L{LAYER_ORDER.indexOf(currentLayerId) + 1}/5
            </span>
          </div>
        )}
      </div>

      {/* Messages */}
      <ChatContainer
        messages={messages}
        onAction={onAction}
        className="flex-1"
      />

      {/* Input */}
      <ChatInput
        onSend={onSend}
        disabled={isStreaming}
        placeholder="Direct the AI..."
        suggestions={suggestions}
      />
    </div>
  )
}

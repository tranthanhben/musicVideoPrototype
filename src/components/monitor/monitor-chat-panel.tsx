'use client'

import { motion } from 'framer-motion'
import { Bot, Layers } from 'lucide-react'
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

const LAYER_COLORS: Record<string, { from: string; to: string }> = {
  L1_INPUT: { from: '#6366F1', to: '#8B5CF6' },
  L2_CREATIVE: { from: '#EC4899', to: '#F59E0B' },
  L3_PREPRODUCTION: { from: '#22D3EE', to: '#0EA5E9' },
  L4_PRODUCTION: { from: '#F97316', to: '#EF4444' },
  L5_POSTPRODUCTION: { from: '#10B981', to: '#22D3EE' },
}

export function MonitorChatPanel({ onSend, onAction, suggestions }: MonitorChatPanelProps) {
  const messages = useChatStore((s) => s.messages)
  const isStreaming = useChatStore((s) => s.isStreaming)
  const currentLayerId = usePipelineStore((s) => s.currentLayerId)

  const layerName = currentLayerId ? LAYER_NAMES[currentLayerId] : null
  const layerIndex = currentLayerId ? LAYER_ORDER.indexOf(currentLayerId) + 1 : null
  const layerColors = currentLayerId ? LAYER_COLORS[currentLayerId] : null

  return (
    <div className="flex h-full flex-col border-r border-border">
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-card/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 shrink-0">
            <Bot className="h-4 w-4 text-primary" />
            {isStreaming && (
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-foreground leading-tight">AI Director</p>
            {layerName ? (
              <p className="text-[10px] text-muted-foreground truncate">{layerName}</p>
            ) : (
              <p className="text-[10px] text-muted-foreground">Ready to begin</p>
            )}
          </div>

          {/* Layer indicator */}
          {currentLayerId && layerColors && (
            <motion.div
              key={currentLayerId}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="shrink-0 flex items-center gap-1.5 rounded-full px-2.5 py-1 border"
              style={{
                background: `linear-gradient(135deg, ${layerColors.from}18, ${layerColors.to}18)`,
                borderColor: `${layerColors.from}40`,
              }}
            >
              <Layers className="h-3 w-3" style={{ color: layerColors.from }} />
              <span className="text-[10px] font-mono font-bold" style={{ color: layerColors.from }}>
                L{layerIndex}/5
              </span>
              <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: layerColors.from }} />
            </motion.div>
          )}
        </div>

        {/* Layer progress bar */}
        {currentLayerId && layerColors && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2.5 h-0.5 rounded-full overflow-hidden bg-muted"
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(to right, ${layerColors.from}, ${layerColors.to})` }}
              initial={{ width: '0%' }}
              animate={{ width: `${((layerIndex ?? 1) / 5) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </motion.div>
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

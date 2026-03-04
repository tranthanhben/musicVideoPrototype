'use client'

import { useState } from 'react'
import { Send, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { addUserMessage, streamResponse } from '@/lib/chat/simulator'
import { usePipelineStore } from '@/lib/pipeline/store'
import type { PipelineSimulator } from '@/lib/pipeline/simulator'
import { buildFreeformResponse, type JourneyStateId } from '@/lib/journey/orchestrator'
import type { ChatSuggestion } from '@/lib/chat/types'

interface FloatingCommandBarProps {
  simulator: PipelineSimulator | null
  onCommand?: (cmd: string) => void
  journeyState?: JourneyStateId
  suggestions?: ChatSuggestion[]
}

const STATIC_SUGGESTIONS = [
  { label: 'Start pipeline', icon: '▶' },
  { label: 'Zoom to L3', icon: '🔍' },
  { label: 'Show all scenes', icon: '🎬' },
]

const CONTEXTUAL_RESPONSES: Record<string, string> = {
  'zoom to l3': 'Zooming to Pre-Production layer — storyboard and style guide are visible.',
  'show all scenes': 'Displaying all 8 generated scenes across the production layer.',
}

export function FloatingCommandBar({ simulator, onCommand, journeyState, suggestions }: FloatingCommandBarProps) {
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const { isRunning, startPipeline } = usePipelineStore()

  const displaySuggestions = suggestions && suggestions.length > 0
    ? suggestions.map((s) => ({ label: s.text, icon: '💬' }))
    : STATIC_SUGGESTIONS

  function handleSend(text?: string) {
    const cmd = (text ?? input).trim()
    if (!cmd || isStreaming) return
    setInput('')

    addUserMessage(cmd)

    const lower = cmd.toLowerCase()

    if (lower.includes('start pipeline') || lower === 'start') {
      if (!isRunning && simulator) {
        startPipeline()
        simulator.start()
        setIsStreaming(true)
        streamResponse({
          text: 'Pipeline started! Watch the layers light up as each stage processes your music.',
          onComplete: () => setIsStreaming(false),
        })
      } else {
        streamResponse({
          text: isRunning ? 'Pipeline is already running.' : 'No simulator connected.',
          onComplete: () => setIsStreaming(false),
        })
        setIsStreaming(true)
      }
    } else if (lower === 'approve' || lower === 'revise' || lower === 'revision') {
      // These are handled by onCommand in the parent; emit a brief confirmation
      const ackText = lower === 'approve'
        ? 'Approving this quality gate...'
        : 'Requesting revision — re-running this stage...'
      setIsStreaming(true)
      streamResponse({ text: ackText, onComplete: () => setIsStreaming(false) })
      onCommand?.(cmd)
      return
    } else {
      const responseText = CONTEXTUAL_RESPONSES[lower]
        ?? (journeyState ? buildFreeformResponse(journeyState).text : `Got it — executing: "${cmd}".`)
      setIsStreaming(true)
      streamResponse({ text: responseText, onComplete: () => setIsStreaming(false) })
    }

    onCommand?.(cmd)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={cn(
      'fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-4',
    )}>
      {/* Suggestion chips */}
      <div className="flex justify-center gap-2 mb-2 flex-wrap">
        {displaySuggestions.map((s) => (
          <button
            key={s.label}
            onClick={() => handleSend(s.label)}
            disabled={isStreaming}
            className={cn(
              'text-xs px-3 py-1 rounded-full border transition-all',
              'bg-card/70 backdrop-blur-sm border-border text-muted-foreground',
              'hover:bg-card hover:text-foreground hover:border-primary/50',
              'disabled:opacity-50'
            )}
          >
            <span className="mr-1">{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* Pill input */}
      <div className={cn(
        'flex items-center gap-2 rounded-full px-4 py-2.5',
        'bg-card/90 backdrop-blur-md border border-border shadow-2xl',
        'focus-within:border-primary/60 focus-within:shadow-primary/10 transition-all'
      )}>
        <Zap className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isStreaming}
          placeholder="Tell me what to change..."
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
        />
        <button
          onClick={() => handleSend()}
          disabled={isStreaming || !input.trim()}
          className="h-7 w-7 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors shrink-0"
        >
          <Send className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

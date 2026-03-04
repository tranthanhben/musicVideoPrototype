'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { addUserMessage } from '@/lib/chat/simulator'
import type { PipelineArtifact } from '@/lib/pipeline/types'

interface ArtifactChatThreadProps {
  artifact: PipelineArtifact
  onClose: () => void
}

interface LocalMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const ARTIFACT_RESPONSES: Record<string, string> = {
  audio_analysis: 'I detected 128 BPM in A minor. The energy curve peaks at 1:45 — perfect for the climactic visual moment.',
  creative_vision: 'This vision document outlines the cosmic love story arc. The color palette and mood references are locked in.',
  mood_board: 'These references capture the desired aesthetic — deep violets, ethereal lighting, cinematic framing.',
  storyboard: 'All 8 scenes are beat-synced. Scene transitions hit on downbeats for maximum impact.',
  style_guide: 'The style guide ensures consistency across all generated assets. Character anchors are set.',
  production_plan: 'Budget estimate: $4.20. Kling 2.6 for motion-heavy scenes, Runway for character shots.',
  image: 'Generated at 1920x1080. Consistency score: 92%. Prompt locked to style guide.',
  video_clip: 'Motion quality approved. Beat sync verified against timeline markers.',
  lipsync: 'Sync accuracy: 94%. Processed via MuseTalk v1.5. Phoneme alignment is clean.',
  assembled_video: 'Timeline assembled with 8 scenes. Beat-synced transitions. Total runtime: 3:12.',
  final_video: 'Final pass complete. Color graded, film grain added, audio mixed. Export ready.',
}

export function ArtifactChatThread({ artifact, onClose }: ArtifactChatThreadProps) {
  const [messages, setMessages] = useState<LocalMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: ARTIFACT_RESPONSES[artifact.type] ?? `This artifact was generated for layer ${artifact.layerId}.`,
    },
  ])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend() {
    const trimmed = input.trim()
    if (!trimmed || isStreaming) return

    setInput('')
    addUserMessage(`[${artifact.name}] ${trimmed}`)
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', content: trimmed }])

    setIsStreaming(true)
    const responseText = `I understand your question about "${artifact.name}". ${artifact.description} — Let me know if you'd like to adjust anything.`
    const assistantId = `a-${Date.now()}`
    setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: '' }])

    let charIndex = 0
    const interval = setInterval(() => {
      if (charIndex < responseText.length) {
        const chunk = responseText.slice(charIndex, charIndex + 3)
        setMessages((prev) => prev.map((m) =>
          m.id === assistantId ? { ...m, content: m.content + chunk } : m
        ))
        charIndex += 3
      } else {
        clearInterval(interval)
        setIsStreaming(false)
      }
    }, 20)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="absolute left-[170px] top-0 z-30 w-72 bg-card border border-border rounded-xl shadow-2xl flex flex-col"
      style={{ maxHeight: 300 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-xs font-semibold text-foreground truncate pr-2">{artifact.name}</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {messages.map((msg) => (
          <div key={msg.id} className={cn('text-xs leading-relaxed', msg.role === 'user' ? 'text-right' : 'text-left')}>
            <span className={cn(
              'inline-block px-2.5 py-1.5 rounded-lg max-w-[90%]',
              msg.role === 'user'
                ? 'bg-primary/20 text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            )}>
              {msg.content || <span className="opacity-50 animate-pulse">...</span>}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-1.5 p-2 border-t border-border">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isStreaming}
          placeholder="Ask about this artifact..."
          className="flex-1 bg-muted text-xs rounded-lg px-2.5 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={isStreaming || !input.trim()}
          className="h-7 w-7 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 shrink-0"
        >
          <Send className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

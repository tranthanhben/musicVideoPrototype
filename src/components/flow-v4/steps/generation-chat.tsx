'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MockScene } from '@/lib/mock/types'

// ─── Types ──────────────────────────────────────────────────

interface GenerationChatMessage {
  id: number
  role: 'user' | 'agent' | 'system'
  text: string
  timestamp: string
}

type VideoScene = MockScene & { isNew?: boolean; videoStatus?: 'pending' | 'rendering' | 'done' }

interface GenerationChatProps {
  scenes: VideoScene[]
  onEditScene: (sceneId: string, updates: Partial<VideoScene>) => void
  onRegenerateScene: (sceneId: string) => void
  onHighlightScene: (sceneId: string | null) => void
}

// ─── Utils ──────────────────────────────────────────────────

function makeTimestamp() {
  return new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// ─── Suggestion chips ───────────────────────────────────────

const SUGGESTIONS = [
  'Regenerate Scene 5 video',
  'Make Scene 12 more cinematic',
  'Change Scene 3 to slow motion',
  'Upscale all completed scenes',
]

// ─── Mock AI response logic ─────────────────────────────────

function generateResponse(
  input: string,
  scenes: VideoScene[],
  callbacks: {
    onEditScene: GenerationChatProps['onEditScene']
    onRegenerateScene: GenerationChatProps['onRegenerateScene']
    onHighlightScene: GenerationChatProps['onHighlightScene']
  },
): { agentMsg: string; systemMsg?: string } {
  const lower = input.toLowerCase()

  // Regenerate scene video
  const regenMatch = lower.match(/(?:regenerat|regen|redo|retry).*scene\s*(\d+)/)
  if (regenMatch) {
    const sceneNum = parseInt(regenMatch[1])
    const scene = scenes[sceneNum - 1]
    if (scene) {
      callbacks.onRegenerateScene(scene.id)
      callbacks.onHighlightScene(scene.id)
      return {
        agentMsg: `Queuing Scene ${sceneNum} for re-generation with Kling 2.6. The new video will replace the current one. This typically takes 15-30 seconds per scene.`,
        systemMsg: `Scene ${sceneNum} queued for re-generation`,
      }
    }
  }

  // Make scene more cinematic/dramatic/slow/fast
  const styleMatch = lower.match(/scene\s*(\d+).*(?:cinematic|dramatic|slow.?mo|fast|intense|bright|dark|zoom)/)
  if (styleMatch) {
    const sceneNum = parseInt(styleMatch[1])
    const scene = scenes[sceneNum - 1]
    if (scene) {
      const style = lower.includes('slow') ? 'slow-motion' : lower.includes('cinematic') ? 'cinematic' : lower.includes('zoom') ? 'zoom-in' : lower.includes('dramatic') ? 'dramatic' : 'stylized'
      callbacks.onEditScene(scene.id, {
        cameraMovement: `${style} ${scene.cameraMovement}`,
      })
      callbacks.onHighlightScene(scene.id)
      return {
        agentMsg: `Updated Scene ${sceneNum} to use ${style} motion style. The video will be re-rendered with the new parameters.`,
        systemMsg: `Scene ${sceneNum} style → ${style}`,
      }
    }
  }

  // Upscale scenes
  if (lower.match(/upscal|4k|high.?res/)) {
    const sceneMatch = lower.match(/scene\s*(\d+)/)
    if (sceneMatch) {
      const sceneNum = parseInt(sceneMatch[1])
      callbacks.onHighlightScene(scenes[sceneNum - 1]?.id ?? null)
      return {
        agentMsg: `Upscaling Scene ${sceneNum} to 4K using ESRGAN. This will enhance detail and sharpness while maintaining temporal consistency.`,
        systemMsg: `Scene ${sceneNum} upscaling to 4K...`,
      }
    }
    const doneCount = scenes.filter((s) => s.videoStatus === 'done').length
    return {
      agentMsg: `Starting 4K upscale for ${doneCount} completed scenes. Each scene takes ~10 seconds. The upscaled versions will replace the current ones.`,
      systemMsg: `${doneCount} scenes queued for 4K upscale`,
    }
  }

  // Change model
  if (lower.match(/kling|runway|model|switch/)) {
    const sceneMatch = lower.match(/scene\s*(\d+)/)
    if (sceneMatch) {
      const sceneNum = parseInt(sceneMatch[1])
      const scene = scenes[sceneNum - 1]
      if (scene) {
        callbacks.onHighlightScene(scene.id)
        return {
          agentMsg: `Switched Scene ${sceneNum} to use Kling 2.6 for higher motion quality. The scene will be re-rendered with the new model.`,
          systemMsg: `Scene ${sceneNum} model → Kling 2.6`,
        }
      }
    }
  }

  // Music sync
  if (lower.match(/sync|beat|music|rhythm|tempo/)) {
    return {
      agentMsg: `All scenes are currently beat-synced to the audio track. I can adjust individual scene timing — tell me which scene and what beat/section you want it aligned to.`,
    }
  }

  // Generic fallback
  return {
    agentMsg: `I can help you regenerate scene videos, change motion styles (slow-mo, cinematic, dramatic), upscale to 4K, switch rendering models, and adjust music sync. Try "Regenerate Scene 5 video" or "Make Scene 3 slow motion".`,
  }
}

// ─── Styles ─────────────────────────────────────────────────

const ROLE_DOT: Record<GenerationChatMessage['role'], string> = {
  user: 'bg-purple-500',
  agent: 'bg-blue-500',
  system: 'bg-green-500',
}

const ROLE_TEXT: Record<GenerationChatMessage['role'], string> = {
  user: 'text-zinc-200',
  agent: 'text-zinc-300',
  system: 'text-green-400 italic',
}

// ─── Component ──────────────────────────────────────────────

export function GenerationChat({ scenes, onEditScene, onRegenerateScene, onHighlightScene }: GenerationChatProps) {
  const [messages, setMessages] = useState<GenerationChatMessage[]>([
    {
      id: 0,
      role: 'agent',
      text: "I'm monitoring your video generation. I can regenerate scenes, adjust motion styles, upscale to 4K, or switch rendering models. Just tell me what you need.",
      timestamp: makeTimestamp(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const idRef = useRef(1)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = useCallback(
    (text?: string) => {
      const msg = (text ?? inputValue).trim()
      if (!msg) return
      setInputValue('')

      const userMsg: GenerationChatMessage = {
        id: idRef.current++,
        role: 'user',
        text: msg,
        timestamp: makeTimestamp(),
      }
      setMessages((prev) => [...prev, userMsg])
      setIsTyping(true)

      const delay = 800 + Math.random() * 700
      setTimeout(() => {
        const { agentMsg, systemMsg } = generateResponse(msg, scenes, {
          onEditScene,
          onRegenerateScene,
          onHighlightScene,
        })

        const newMessages: GenerationChatMessage[] = [
          {
            id: idRef.current++,
            role: 'agent',
            text: agentMsg,
            timestamp: makeTimestamp(),
          },
        ]

        if (systemMsg) {
          newMessages.push({
            id: idRef.current++,
            role: 'system',
            text: systemMsg,
            timestamp: makeTimestamp(),
          })
        }

        setMessages((prev) => [...prev, ...newMessages])
        setIsTyping(false)
      }, delay)
    },
    [inputValue, scenes, onEditScene, onRegenerateScene, onHighlightScene],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend],
  )

  return (
    <div className="flex h-full flex-col rounded-xl border border-white/8 bg-black/40 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-white/8 px-3 py-2 shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
        </span>
        <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-400">
          Video Agent
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 scrollbar-none">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-start gap-2"
            >
              <span className={cn('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', ROLE_DOT[msg.role])} />
              <div className="min-w-0 flex-1">
                <p className={cn('text-[10px] leading-relaxed font-mono', ROLE_TEXT[msg.role])}>
                  {msg.text}
                </p>
                <span className="text-[9px] font-mono text-zinc-600">{msg.timestamp}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 py-1"
          >
            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1 w-1 rounded-full bg-zinc-500"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggestion chips + Input */}
      <div className="border-t border-white/8 px-3 py-2 space-y-2 shrink-0">
        {/* Chips */}
        <div className="flex flex-wrap gap-1">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] text-zinc-400 hover:bg-white/10 hover:text-zinc-200 transition-colors cursor-pointer truncate"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tell the agent what to change..."
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-white/20 transition-colors"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputValue.trim()}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-lg transition-colors cursor-pointer shrink-0',
              inputValue.trim()
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-white/5 text-zinc-600 cursor-not-allowed',
            )}
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

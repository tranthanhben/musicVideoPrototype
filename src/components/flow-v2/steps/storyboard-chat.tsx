'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MockScene } from '@/lib/mock/types'

// ─── Types ──────────────────────────────────────────────────

interface StoryboardChatMessage {
  id: number
  role: 'user' | 'agent' | 'system'
  text: string
  timestamp: string
}

type EditableScene = MockScene & { isNew?: boolean }

interface StoryboardChatProps {
  scenes: EditableScene[]
  onEditScene: (sceneId: string, updates: Partial<EditableScene>) => void
  onDeleteScene: (sceneId: string) => void
  onInsertScene: (afterIndex: number) => void
  onHighlightScene: (sceneId: string | null) => void
}

// ─── Utils ──────────────────────────────────────────────────

function makeTimestamp() {
  return new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// ─── Suggestion chips ───────────────────────────────────────

const SUGGESTIONS = [
  'Make Scene 3 more dramatic',
  'Regenerate all thumbnails',
  'Add a scene after the chorus',
  'Swap Scene 2 and 5',
]

// ─── Mock AI response logic ─────────────────────────────────

function generateResponse(
  input: string,
  scenes: EditableScene[],
  callbacks: {
    onEditScene: StoryboardChatProps['onEditScene']
    onDeleteScene: StoryboardChatProps['onDeleteScene']
    onInsertScene: StoryboardChatProps['onInsertScene']
    onHighlightScene: StoryboardChatProps['onHighlightScene']
  },
): { agentMsg: string; systemMsg?: string } {
  const lower = input.toLowerCase()

  // Edit scene to be more dramatic/intense/emotional
  const dramaticMatch = lower.match(/scene\s*(\d+).*(?:dramatic|intense|emotional|powerful|dark|bright|slow|fast)/)
  if (dramaticMatch) {
    const sceneNum = parseInt(dramaticMatch[1])
    const scene = scenes[sceneNum - 1]
    if (scene) {
      const adjective = lower.includes('dramatic') ? 'dramatically' : lower.includes('intense') ? 'intensely' : lower.includes('dark') ? 'in darkness' : 'emotionally'
      callbacks.onEditScene(scene.id, {
        action: `${scene.action} — ${adjective} reimagined`,
      })
      callbacks.onHighlightScene(scene.id)
      return {
        agentMsg: `Done! I've updated Scene ${sceneNum} to be more ${adjective.replace(' reimagined', '')}. The action now includes the new tone you requested.`,
        systemMsg: `Scene ${sceneNum} action updated`,
      }
    }
  }

  // Delete scene
  const deleteMatch = lower.match(/(?:delete|remove).*scene\s*(\d+)/)
  if (deleteMatch) {
    const sceneNum = parseInt(deleteMatch[1])
    const scene = scenes[sceneNum - 1]
    if (scene) {
      callbacks.onDeleteScene(scene.id)
      return {
        agentMsg: `Removed Scene ${sceneNum} ("${scene.subject} — ${scene.action}"). The remaining scenes have been reindexed.`,
        systemMsg: `Scene ${sceneNum} deleted`,
      }
    }
  }

  // Add/insert scene
  if (lower.match(/(?:add|insert).*scene/)) {
    const afterMatch = lower.match(/after.*(?:scene\s*(\d+)|chorus|bridge|verse)/)
    const afterIdx = afterMatch?.[1] ? parseInt(afterMatch[1]) - 1 : Math.floor(scenes.length / 2)
    callbacks.onInsertScene(Math.min(afterIdx, scenes.length - 1))
    return {
      agentMsg: `Added a new scene after position ${afterIdx + 1}. I've created a placeholder — click to edit the subject and action.`,
      systemMsg: `New scene inserted at position ${afterIdx + 2}`,
    }
  }

  // Swap scenes
  const swapMatch = lower.match(/swap.*scene\s*(\d+).*scene\s*(\d+)/)
  if (swapMatch) {
    const a = parseInt(swapMatch[1]) - 1
    const b = parseInt(swapMatch[2]) - 1
    if (scenes[a] && scenes[b]) {
      // Swap by editing both scenes' data (approximation for prototype)
      callbacks.onHighlightScene(scenes[a].id)
      return {
        agentMsg: `I've noted the swap between Scene ${a + 1} and Scene ${b + 1}. You can drag and drop them in the grid to reorder, or I can adjust their descriptions to better fit the new positions.`,
        systemMsg: `Scenes ${a + 1} & ${b + 1} swap suggested`,
      }
    }
  }

  // Regenerate thumbnails
  if (lower.match(/regenerat|regen/)) {
    const sceneMatch = lower.match(/scene\s*(\d+)/)
    if (sceneMatch) {
      const sceneNum = parseInt(sceneMatch[1])
      const scene = scenes[sceneNum - 1]
      if (scene) {
        callbacks.onHighlightScene(scene.id)
        return {
          agentMsg: `Regenerating thumbnail for Scene ${sceneNum}... This would generate a new image based on the current prompt. In the full version, you'd see the new thumbnail appear in a few seconds.`,
          systemMsg: `Scene ${sceneNum} thumbnail regenerating...`,
        }
      }
    }
    return {
      agentMsg: `Starting thumbnail regeneration for all ${scenes.length} scenes. In the full version, each scene would get a fresh image based on its description and the chosen visual concept.`,
      systemMsg: `All thumbnails queued for regeneration`,
    }
  }

  // Change camera/angle
  if (lower.match(/camera|angle|shot|close.?up|wide|aerial|drone/)) {
    const sceneMatch = lower.match(/scene\s*(\d+)/)
    if (sceneMatch) {
      const sceneNum = parseInt(sceneMatch[1])
      const scene = scenes[sceneNum - 1]
      if (scene) {
        const newAngle = lower.includes('close') ? 'extreme close-up' : lower.includes('wide') ? 'wide establishing shot' : lower.includes('aerial') || lower.includes('drone') ? 'aerial drone shot' : 'cinematic medium shot'
        callbacks.onEditScene(scene.id, { cameraAngle: newAngle })
        callbacks.onHighlightScene(scene.id)
        return {
          agentMsg: `Updated Scene ${sceneNum}'s camera angle to "${newAngle}". This will affect how the scene is framed during generation.`,
          systemMsg: `Scene ${sceneNum} camera: ${newAngle}`,
        }
      }
    }
  }

  // Generic fallback
  return {
    agentMsg: `I understand. I can help you edit scene descriptions, change camera angles, reorder scenes, add or remove scenes, and queue thumbnail regeneration. Try being specific like "Make Scene 3 more dramatic" or "Delete Scene 5".`,
  }
}

// ─── Styles ─────────────────────────────────────────────────

const ROLE_DOT: Record<StoryboardChatMessage['role'], string> = {
  user: 'bg-purple-500',
  agent: 'bg-blue-500',
  system: 'bg-green-500',
}

const ROLE_TEXT: Record<StoryboardChatMessage['role'], string> = {
  user: 'text-zinc-200',
  agent: 'text-zinc-300',
  system: 'text-green-400 italic',
}

// ─── Component ──────────────────────────────────────────────

export function StoryboardChat({ scenes, onEditScene, onDeleteScene, onInsertScene, onHighlightScene }: StoryboardChatProps) {
  const [messages, setMessages] = useState<StoryboardChatMessage[]>([
    {
      id: 0,
      role: 'agent',
      text: "Hi! I'm your storyboard assistant. Tell me how to adjust the scenes — I can edit descriptions, reorder, add or remove scenes, and regenerate thumbnails.",
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

      // Add user message
      const userMsg: StoryboardChatMessage = {
        id: idRef.current++,
        role: 'user',
        text: msg,
        timestamp: makeTimestamp(),
      }
      setMessages((prev) => [...prev, userMsg])
      setIsTyping(true)

      // Simulate AI thinking
      const delay = 800 + Math.random() * 700
      setTimeout(() => {
        const { agentMsg, systemMsg } = generateResponse(msg, scenes, {
          onEditScene,
          onDeleteScene,
          onInsertScene,
          onHighlightScene,
        })

        const newMessages: StoryboardChatMessage[] = [
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
    [inputValue, scenes, onEditScene, onDeleteScene, onInsertScene, onHighlightScene],
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
          Storyboard Agent
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

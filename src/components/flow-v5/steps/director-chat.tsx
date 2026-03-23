'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MockScene } from '@/lib/mock/types'

// ─── Types ──────────────────────────────────────────────────

interface DirectorChatMessage {
  id: number
  role: 'user' | 'agent' | 'system'
  text: string
  timestamp: string
}

interface DirectorChatProps {
  scenes: MockScene[]
  selectedVfx: string
  selectedTransition: string
  onVfxChange: (id: string) => void
  onTransitionChange: (id: string) => void
  onSeekToScene: (sceneId: string) => void
}

// ─── Utils ──────────────────────────────────────────────────

function makeTimestamp() {
  return new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// ─── Suggestion chips ───────────────────────────────────────

const SUGGESTIONS = [
  'Apply Film Noir filter',
  'Slow crossfade on chorus',
  'Speed ramp Scene 4',
  'Add lens flare to intro',
]

// ─── Mock AI response logic ─────────────────────────────────

function generateResponse(
  input: string,
  scenes: MockScene[],
  callbacks: {
    onVfxChange: DirectorChatProps['onVfxChange']
    onTransitionChange: DirectorChatProps['onTransitionChange']
    onSeekToScene: DirectorChatProps['onSeekToScene']
  },
): { agentMsg: string; systemMsg?: string } {
  const lower = input.toLowerCase()

  // VFX filter changes
  if (lower.match(/film.?noir|noir/)) {
    callbacks.onVfxChange('film-noir')
    return {
      agentMsg: 'Applied Film Noir look — high contrast, vignette, and desaturation. The preview is updating now.',
      systemMsg: 'VFX preset → Film Noir',
    }
  }
  if (lower.match(/neon|glow|bloom/)) {
    callbacks.onVfxChange('neon-glow')
    return {
      agentMsg: 'Switched to Neon Glow — bloom, color bleeding, and chromatic aberration are now active.',
      systemMsg: 'VFX preset → Neon Glow',
    }
  }
  if (lower.match(/cosmic|cinema/)) {
    callbacks.onVfxChange('cosmic-cinema')
    return {
      agentMsg: 'Applied Cosmic Cinema look — film grain, lens flares, and a subtle glow.',
      systemMsg: 'VFX preset → Cosmic Cinema',
    }
  }
  if (lower.match(/dream|soft|warm/)) {
    callbacks.onVfxChange('dreamy-soft')
    return {
      agentMsg: 'Applied Dreamy Soft look — soft focus, warm tint, and light leaks for a nostalgic feel.',
      systemMsg: 'VFX preset → Dreamy Soft',
    }
  }
  if (lower.match(/vintage|16mm|retro/)) {
    callbacks.onVfxChange('vintage-16mm')
    return {
      agentMsg: 'Applied Vintage 16mm look — heavy grain, jitter, and faded colors. Very retro.',
      systemMsg: 'VFX preset → Vintage 16mm',
    }
  }
  if (lower.match(/clean|pop|bright|sharp/)) {
    callbacks.onVfxChange('clean-pop')
    return {
      agentMsg: 'Switched to Clean Pop — saturated, sharp, and bright. Great for upbeat sections.',
      systemMsg: 'VFX preset → Clean Pop',
    }
  }

  // Transition changes
  if (lower.match(/crossfade|fade|dissolve/)) {
    callbacks.onTransitionChange('crossfade')
    return {
      agentMsg: 'Set transitions to crossfade. All scene cuts will now dissolve smoothly into each other.',
      systemMsg: 'Transitions → Crossfade',
    }
  }
  if (lower.match(/whip.?pan|whip/)) {
    callbacks.onTransitionChange('whip-pan')
    return {
      agentMsg: 'Whip pan transitions applied — fast directional motion blur between scenes.',
      systemMsg: 'Transitions → Whip Pan',
    }
  }
  if (lower.match(/beat.?sync|beat|sync/)) {
    callbacks.onTransitionChange('beat-sync')
    return {
      agentMsg: 'Beat-synced transitions activated. Scene cuts will snap to the nearest beat marker.',
      systemMsg: 'Transitions → Beat-Synced',
    }
  }
  if (lower.match(/morph|ai.?morph/)) {
    callbacks.onTransitionChange('morph')
    return {
      agentMsg: 'AI Morph transitions enabled — scenes will seamlessly morph into each other using neural blending.',
      systemMsg: 'Transitions → AI Morph',
    }
  }
  if (lower.match(/hard.?cut|cut/)) {
    callbacks.onTransitionChange('cut')
    return {
      agentMsg: 'Set to hard cuts — clean, instant scene transitions. No effects.',
      systemMsg: 'Transitions → Hard Cut',
    }
  }

  // Seek to scene
  const sceneMatch = lower.match(/scene\s*(\d+)/)
  if (sceneMatch) {
    const sceneNum = parseInt(sceneMatch[1])
    const scene = scenes[sceneNum - 1]
    if (scene) {
      callbacks.onSeekToScene(scene.id)
      return {
        agentMsg: `Jumped to Scene ${sceneNum} — "${scene.subject}: ${scene.action}". You can preview it now.`,
        systemMsg: `Playhead → Scene ${sceneNum}`,
      }
    }
  }

  // Speed ramp
  if (lower.match(/speed.?ramp|ramp|slow.?mo|speed/)) {
    const sMatch = lower.match(/scene\s*(\d+)/)
    if (sMatch) {
      const num = parseInt(sMatch[1])
      return {
        agentMsg: `Applied speed ramp to Scene ${num} — starts at 100%, ramps down to 40% at the midpoint, then back up. Great for dramatic moments.`,
        systemMsg: `Scene ${num}: speed ramp applied`,
      }
    }
    return {
      agentMsg: 'I can add speed ramps to any scene. Tell me which scene number and I\'ll set it up.',
    }
  }

  // Lens flare / effect
  if (lower.match(/lens.?flare|flare|light.?leak|particle/)) {
    return {
      agentMsg: 'Added lens flare effect to the specified section. The flare will animate from left to right, synced with the camera movement.',
      systemMsg: 'Effect added: Lens Flare',
    }
  }

  // Color grade
  if (lower.match(/color.?grad|grade|teal|orange|desatur/)) {
    return {
      agentMsg: 'Color grading adjusted. I can apply teal & orange, desaturated, vibrant pop, or monochrome looks. What style do you prefer?',
    }
  }

  // Export
  if (lower.match(/export|render|download|final/)) {
    return {
      agentMsg: 'Ready to export! Your video can be rendered for YouTube (16:9), TikTok (9:16), or Instagram Reels (9:16). Hit the Export button when you\'re satisfied with the edit.',
    }
  }

  // Generic fallback
  return {
    agentMsg: 'I can help with VFX presets (Film Noir, Neon Glow, Dreamy Soft...), transitions (crossfade, whip pan, beat-sync, AI morph), speed ramps, color grading, and export settings. What would you like to adjust?',
  }
}

// ─── Styles ─────────────────────────────────────────────────

const ROLE_DOT: Record<DirectorChatMessage['role'], string> = {
  user: 'bg-purple-500',
  agent: 'bg-emerald-500',
  system: 'bg-amber-500',
}

const ROLE_TEXT: Record<DirectorChatMessage['role'], string> = {
  user: 'text-zinc-200',
  agent: 'text-zinc-300',
  system: 'text-amber-400 italic',
}

// ─── Component ──────────────────────────────────────────────

export function DirectorChat({ scenes, selectedVfx, selectedTransition, onVfxChange, onTransitionChange, onSeekToScene }: DirectorChatProps) {
  const [messages, setMessages] = useState<DirectorChatMessage[]>([
    {
      id: 0,
      role: 'agent',
      text: "I'm your Director. I can adjust VFX filters, transitions, speed ramps, and color grading. Tell me what look you're going for.",
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

      const userMsg: DirectorChatMessage = {
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
          onVfxChange,
          onTransitionChange,
          onSeekToScene,
        })

        const newMessages: DirectorChatMessage[] = [
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
    [inputValue, scenes, onVfxChange, onTransitionChange, onSeekToScene],
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
    <div className="flex h-full flex-col rounded-2xl glass-surface overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] px-3 py-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-400">
            Director
          </span>
        </div>
        <span className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Ready
        </span>
      </div>

      {/* Active settings display */}
      <div className="border-b border-white/[0.08] px-3 py-1.5 shrink-0">
        <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-500">
          <span className="text-zinc-400">VFX:</span>
          <span className="rounded bg-white/5 px-1.5 py-0.5 text-zinc-300">{selectedVfx.replace(/-/g, ' ')}</span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400">Trans:</span>
          <span className="rounded bg-white/5 px-1.5 py-0.5 text-zinc-300">{selectedTransition.replace(/-/g, ' ')}</span>
        </div>
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
            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
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
      <div className="border-t border-white/[0.08] px-3 py-2 space-y-2 shrink-0">
        {/* Chips */}
        <div className="flex flex-wrap gap-1">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              className="rounded-full border border-white/[0.08] glass-surface px-2 py-0.5 text-[9px] text-zinc-400 hover:bg-white/10 hover:text-zinc-200 transition-colors cursor-pointer truncate"
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
            placeholder="What edit do you want to make?"
            className="flex-1 rounded-lg glass-input px-3 py-1.5 text-[11px] text-zinc-200 placeholder:text-zinc-600 outline-none transition-colors"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputValue.trim()}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-lg transition-colors cursor-pointer shrink-0',
              inputValue.trim()
                ? 'bg-emerald-600 text-white hover:bg-emerald-500'
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

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WorkPhase } from '@/lib/flow-v4/types'

type ViewablePhase = 'analysis' | 'ideation' | 'storyboard' | 'vfx_export'

// ─── Types ──────────────────────────────────────────────────

export interface ChatAction {
  label: string
  id: string
  variant?: 'primary' | 'secondary' // primary = full purple, secondary = outlined (default for backwards compat)
}

export interface UnifiedChatMessage {
  id: number
  role: 'user' | 'agent' | 'system'
  text: string
  timestamp: string
  actions?: ChatAction[]
}

interface UnifiedChatPanelProps {
  phase: ViewablePhase
  messages: UnifiedChatMessage[]
  isTyping: boolean
  onSend: (text: string) => void
  onAction: (actionId: string) => void
  onSystemMsgClick?: (text: string) => void
}

// ─── Phase config ───────────────────────────────────────────

const PHASE_CONFIG: Record<ViewablePhase, { label: string; color: string }> = {
  analysis: { label: 'Analysis', color: '#8B5CF6' },
  ideation: { label: 'Ideation', color: '#A855F7' },
  storyboard: { label: 'Storyboard', color: '#3B82F6' },
  vfx_export: { label: 'Video & Edit', color: '#10B981' },
}

const PHASE_SUGGESTIONS: Record<ViewablePhase, string[]> = {
  analysis: [
    'Tell me about the energy curve',
    'What mood does this track convey?',
    'Show me the key changes',
  ],
  ideation: [
    'Try a different visual style',
    'Make it more cinematic',
    'Show me darker themes',
  ],
  storyboard: [
    'Make Scene 3 more dramatic',
    'Add a scene after the chorus',
    'Swap Scene 2 and 5',
    'Regenerate all thumbnails',
  ],
  vfx_export: [
    'Apply Film Noir filter',
    'Slow crossfade on chorus',
    'Speed ramp Scene 4',
    'Add lens flare to intro',
  ],
}

// ─── Role styles ────────────────────────────────────────────

const ROLE_DOT: Record<'user' | 'agent', string> = {
  user: 'bg-purple-500',
  agent: 'bg-emerald-500',
}

const ROLE_TEXT: Record<'user' | 'agent', string> = {
  user: 'text-foreground/90',
  agent: 'text-foreground/80',
}

// ─── Component ──────────────────────────────────────────────

export function UnifiedChatPanel({ phase, messages, isTyping, onSend, onAction, onSystemMsgClick }: UnifiedChatPanelProps) {
  const [inputValue, setInputValue] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const config = PHASE_CONFIG[phase]
  const suggestions = PHASE_SUGGESTIONS[phase]

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = useCallback(
    (text?: string) => {
      const msg = (text ?? inputValue).trim()
      if (!msg) return
      setInputValue('')
      onSend(msg)
    },
    [inputValue, onSend],
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
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-card/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 shrink-0">
            <Bot className="h-4 w-4 text-primary" />
            <span
              className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background"
              style={{ backgroundColor: config.color }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-foreground leading-tight">AI Director</p>
            <p className="text-[10px] text-muted-foreground">Making your music video</p>
          </div>
          {/* Phase badge */}
          <motion.div
            key={phase}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="shrink-0 flex items-center gap-1.5 rounded-full px-2.5 py-1 border"
            style={{
              background: `${config.color}18`,
              borderColor: `${config.color}40`,
            }}
          >
            <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: config.color }} />
            <span className="text-[10px] font-mono font-bold" style={{ color: config.color }}>
              {config.label}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-none">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {msg.role === 'system' ? (
                (() => {
                  const isPhaseMsg = msg.text.startsWith('Phase →')
                  return (
                    <div
                      className={cn(
                        'flex items-center gap-2 py-1',
                        isPhaseMsg && onSystemMsgClick && 'cursor-pointer group/phase',
                      )}
                      onClick={() => isPhaseMsg && onSystemMsgClick?.(msg.text)}
                    >
                      <div className="flex-1 border-t border-border" />
                      <span className={cn(
                        'text-[9px] font-mono uppercase tracking-wider whitespace-nowrap transition-colors',
                        isPhaseMsg && onSystemMsgClick
                          ? 'text-amber-500/70 group-hover/phase:text-amber-400 group-hover/phase:underline underline-offset-2'
                          : 'text-amber-500/70',
                      )}>
                        {msg.text}
                      </span>
                      <div className="flex-1 border-t border-border" />
                    </div>
                  )
                })()
              ) : (
                <div className="flex items-start gap-2.5">
                  <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', ROLE_DOT[msg.role])} />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p className={cn('text-[11px] leading-relaxed', ROLE_TEXT[msg.role])}>
                      {msg.text}
                    </p>
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="flex gap-1.5 pt-1 w-full">
                        {msg.actions.map((action) => (
                          <button
                            key={action.id}
                            onClick={() => onAction(action.id)}
                            className={cn(
                              'flex items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-semibold transition-colors cursor-pointer',
                              action.variant === 'primary'
                                ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20 flex-1'
                                : 'border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 px-4 shrink-0',
                            )}
                          >
                            {action.variant === 'primary' && <CheckCircle2 className="h-3.5 w-3.5" />}
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                    <span className="text-[9px] text-muted-foreground/40 block">{msg.timestamp}</span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2.5 py-1">
            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
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
      <div className="border-t border-border px-4 py-3 space-y-2.5 shrink-0">
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              className="rounded-full border border-border bg-card px-2.5 py-1 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tell the AI Director what to do..."
            className="flex-1 rounded-xl border border-primary/30 bg-muted px-3.5 py-3 text-[12px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all shadow-md shadow-black/10"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputValue.trim()}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg transition-colors cursor-pointer shrink-0',
              inputValue.trim()
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed',
            )}
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

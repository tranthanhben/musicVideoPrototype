'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ActivityMessage {
  id: number
  text: string
  type: 'info' | 'rendering' | 'complete'
  timestamp: string
}

interface GenerationActivityFeedProps {
  sceneCount: number
  completedCount: number
  isComplete: boolean
  highEnergyIndices: Set<number>
}

function makeTimestamp() {
  return new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function makeMessage(
  id: number,
  sceneCount: number,
  completedCount: number,
  highEnergyIndices: Set<number>
): ActivityMessage {
  const scene = Math.floor(Math.random() * sceneCount) + 1
  const isHigh = highEnergyIndices.has(scene - 1)
  const motionType = isHigh ? 'dynamic' : 'gentle'
  const frame = Math.floor(Math.random() * 100) + 1
  const totalFrames = 120
  const pct = Math.round((frame / totalFrames) * 100)
  const score = Math.floor(Math.random() * 8) + 88

  const templates: Array<{ text: string; type: ActivityMessage['type'] }> = [
    { text: `Scene ${scene}: Kling 2.6 initializing render pipeline...`, type: 'info' },
    { text: `Scene ${scene}: Frame ${frame}/${totalFrames} rendered — ${pct}% complete`, type: 'rendering' },
    { text: `Scene ${scene}: Music-aware motion applied — ${motionType} for ${isHigh ? 'chorus' : 'verse'}`, type: 'info' },
    { text: `Scene ${Math.min(completedCount + 1, sceneCount)}: Complete! Consistency score: ${score}%`, type: 'complete' },
    { text: `Scene ${scene}: Temporal coherence check passed`, type: 'info' },
    { text: `Scene ${scene}: Style transfer blending ${isHigh ? '94' : '91'}% match`, type: 'rendering' },
    { text: `Scene ${scene}: Beat-sync keyframe locked at ${(Math.random() * 4).toFixed(2)}s`, type: 'info' },
    { text: `Scene ${scene}: Upscaling to 4K — ESRGAN pass 1/2`, type: 'rendering' },
  ]

  const pick = templates[id % templates.length]
  return { id, text: pick.text, type: pick.type, timestamp: makeTimestamp() }
}

const TYPE_STYLES: Record<ActivityMessage['type'], string> = {
  info: 'text-zinc-300',
  rendering: 'text-blue-400',
  complete: 'text-green-400',
}

const TYPE_DOT: Record<ActivityMessage['type'], string> = {
  info: 'bg-zinc-500',
  rendering: 'bg-blue-500',
  complete: 'bg-green-500',
}

export function GenerationActivityFeed({
  sceneCount,
  completedCount,
  isComplete,
  highEnergyIndices,
}: GenerationActivityFeedProps) {
  const [messages, setMessages] = useState<ActivityMessage[]>([])
  const idRef = useRef(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isComplete) return
    const delay = 800 + Math.random() * 900
    const t = setTimeout(() => {
      const msg = makeMessage(idRef.current++, sceneCount, completedCount, highEnergyIndices)
      setMessages((prev) => [...prev.slice(-40), msg])
    }, delay)
    return () => clearTimeout(t)
  }, [messages, isComplete, sceneCount, completedCount, highEnergyIndices])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex h-full flex-col rounded-xl border border-white/8 bg-black/40 overflow-hidden">
      <div className="flex items-center gap-2 border-b border-white/8 px-3 py-2 shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
        </span>
        <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-400">
          Agent Activity
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 scrollbar-none">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-start gap-2"
            >
              <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${TYPE_DOT[msg.type]}`} />
              <div className="min-w-0">
                <p className={`text-[10px] leading-snug font-mono ${TYPE_STYLES[msg.type]}`}>
                  {msg.text}
                </p>
                <span className="text-[9px] font-mono text-zinc-600">{msg.timestamp}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

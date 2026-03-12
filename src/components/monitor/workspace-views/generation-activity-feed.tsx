'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const MESSAGES = [
  'Dispatching Kling 2.6 for Scene 1...',
  'Motion synthesis running on Scene 2...',
  'Runway Gen-4 processing Scene 3...',
  'Beat-sync applied to Scene 4 cuts...',
  'Consistency check — style seed verified',
  'Scene 5 render queued: Gentle motion',
  'Energy curve mapped to Scene 6...',
  'Scene 7 complete: 94% quality score',
]

interface GenerationActivityFeedProps {
  completedCount: number
}

export function GenerationActivityFeed({ completedCount }: GenerationActivityFeedProps) {
  const [messages, setMessages] = useState<{ id: number; text: string }[]>([])
  const nextId = useRef(0)
  const prevCount = useRef(0)

  useEffect(() => {
    if (completedCount > prevCount.current) {
      const text = MESSAGES[completedCount % MESSAGES.length]
      setMessages((prev) => [{ id: nextId.current++, text }, ...prev].slice(0, 4))
      prevCount.current = completedCount
    }
  }, [completedCount])

  return (
    <div className="shrink-0 rounded-xl bg-black/40 border border-border/40 px-3 py-2 font-mono" style={{ maxHeight: 80 }}>
      <p className="text-[9px] text-primary/70 uppercase tracking-widest mb-1">Activity Feed</p>
      <div className="space-y-0.5 overflow-hidden">
        <AnimatePresence mode="popLayout">
          {messages.map((m) => (
            <motion.p key={m.id}
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-[10px] text-green-400/80 truncate"
            >
              <span className="text-green-600 mr-1">›</span>{m.text}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

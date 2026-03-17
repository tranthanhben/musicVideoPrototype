'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers, Wand2, Download, GripVertical, User, Plus, RotateCcw, Clock } from 'lucide-react'
import { ShowcaseSection } from './showcase-section-wrapper'
import { cn } from '@/lib/utils'

const history = [
  { id: 1, time: '2 hours ago', action: 'Added 5 new scenes to storyboard', user: 'JD', type: 'creative', icon: Layers, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { id: 2, time: '4 hours ago', action: 'Changed VFX preset to Neon Glow', user: 'JD', type: 'creative', icon: Wand2, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { id: 3, time: 'Yesterday', action: 'Exported final video (1080p)', user: 'JD', type: 'export', icon: Download, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { id: 4, time: 'Yesterday', action: 'Reordered scenes 3–7', user: 'JD', type: 'creative', icon: GripVertical, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { id: 5, time: '2 days ago', action: "Updated character Aria's styling", user: 'AL', type: 'settings', icon: User, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { id: 6, time: '3 days ago', action: 'Initial project creation', user: 'JD', type: 'creative', icon: Plus, color: 'text-purple-400', bg: 'bg-purple-400/10' },
]

export function VersionHistorySection() {
  const [hovered, setHovered] = useState<number | null>(null)
  const [restored, setRestored] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const handleRestore = (id: number) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setRestored(id)
    timerRef.current = setTimeout(() => setRestored(null), 1500)
  }

  return (
    <ShowcaseSection
      id="version-history"
      title="Version History"
      description="Timeline of all project changes with restore capability"
      icon={<Clock className="h-4 w-4 text-primary" />}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/15 px-2.5 py-1 text-[11px] font-medium text-purple-400">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
            Current Version
          </span>
        </div>
        <span className="text-[11px] text-zinc-500">{history.length} changes</span>
      </div>

      <div className="relative">
        <div className="absolute left-[18px] top-3 bottom-3 w-px bg-zinc-800" />
        <div className="space-y-1">
          {history.map((entry, i) => {
            const Icon = entry.icon
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onMouseEnter={() => setHovered(entry.id)}
                onMouseLeave={() => setHovered(null)}
                className="relative flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-zinc-800/50 group"
              >
                <div className={cn('relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-800', entry.bg)}>
                  <Icon className={cn('h-3.5 w-3.5', entry.color)} />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-[12px] text-zinc-200 leading-snug">{entry.action}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-zinc-700 text-[8px] font-semibold text-zinc-300">{entry.user}</span>
                    <span className="text-[10px] text-zinc-500">{entry.time}</span>
                  </div>
                </div>
                <AnimatePresence>
                  {hovered === entry.id && i > 0 && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={() => handleRestore(entry.id)}
                      className={cn(
                        'flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors shrink-0',
                        restored === entry.id
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                      )}
                    >
                      <RotateCcw className="h-2.5 w-2.5" />
                      {restored === entry.id ? 'Restored' : 'Restore'}
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </ShowcaseSection>
  )
}

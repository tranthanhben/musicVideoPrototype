'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { makeSvgThumb } from '@/lib/flow-v4/mock-data'
import type { Storyline } from '@/lib/flow-v4/types'
import { SCENE_DESCRIPTIONS, interpolateHex } from './storyline-data'

// --- Typewriter sub-component ---

interface TypewriterProps {
  text: string
  delay: number
  onDone?: () => void
  className?: string
}

function Typewriter({ text, delay, onDone, className }: TypewriterProps) {
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    let i = 0
    const t = setTimeout(() => {
      const iv = setInterval(() => {
        i++
        setDisplayed(text.slice(0, i))
        if (i >= text.length) { clearInterval(iv); onDone?.() }
      }, 28)
      return () => clearInterval(iv)
    }, delay)
    return () => clearTimeout(t)
  }, [text, delay, onDone])

  return <span className={className}>{displayed}</span>
}

// --- Scene timeline bar ---

function SceneTimeline({ count, from, to, entryDelay }: { count: number; from: string; to: string; entryDelay: number }) {
  return (
    <div className="mt-2.5 space-y-1">
      <div className="flex gap-[2px] items-end h-4">
        {Array.from({ length: count }).map((_, i) => {
          const t = count > 1 ? i / (count - 1) : 0
          const height = 50 + Math.round(Math.sin((i / count) * Math.PI) * 50)
          return (
            <motion.div
              key={i}
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ delay: entryDelay + 0.05 * i, duration: 0.25 }}
              style={{ flex: 1, background: interpolateHex(from, to, t), height: `${height}%`, borderRadius: 2, transformOrigin: 'bottom' }}
              title={`Scene ${i + 1}`}
            />
          )
        })}
      </div>
      <div className="flex justify-between">
        <span className="text-[9px] text-muted-foreground/60">Scene 1</span>
        <span className="text-[9px] text-muted-foreground/60">Scene {count}</span>
      </div>
    </div>
  )
}

// --- Scene breakdown panel ---

function SceneBreakdown({ scenes, from, to }: { scenes: string[]; from: string; to: string }) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className="overflow-hidden border-t border-border/40"
    >
      <div className="px-3 py-2.5 space-y-1.5">
        <p className="text-[10px] font-semibold text-foreground/50 uppercase tracking-wider mb-2">Scene Breakdown</p>
        {scenes.map((desc, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex gap-2 items-start"
          >
            <span
              className="text-[9px] font-bold mt-0.5 shrink-0 rounded px-1 py-0.5"
              style={{ background: interpolateHex(from, to, i / Math.max(scenes.length - 1, 1)), color: '#fff' }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <p className="text-[10px] text-muted-foreground leading-snug">{desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// --- Main card ---

export interface StorylineCardProps {
  storyline: Storyline
  isSelected: boolean
  anySelected: boolean
  onSelect: () => void
  entryDelay: number
  titleReady: boolean
}

export function StorylineCard({ storyline, isSelected, anySelected, onSelect, entryDelay, titleReady }: StorylineCardProps) {
  const [titleDone, setTitleDone] = useState(false)
  const scenes = SCENE_DESCRIPTIONS[storyline.id] ?? []
  const [from, to] = storyline.thumbnailColors
  const thumbSrc = storyline.thumbnailUrl ?? makeSvgThumb(from, to)

  return (
    <motion.div
      layout
      animate={{ scale: isSelected ? 1.02 : anySelected ? 0.98 : 1, opacity: anySelected && !isSelected ? 0.55 : 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
    >
      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: entryDelay, duration: 0.4 }}
        onClick={onSelect}
        className={cn(
          'relative w-full rounded-xl border p-0 text-left cursor-pointer overflow-hidden',
          isSelected ? 'border-primary shadow-lg shadow-primary/20' : 'border-border hover:border-border/70',
        )}
      >
        {/* Gradient header */}
        <div className="relative h-24 overflow-hidden">
          <img src={thumbSrc} alt={storyline.title} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
          <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
            <div>
              <h3 className="text-sm font-bold text-white min-h-[1.2em]">
                {titleReady && <Typewriter text={storyline.title} delay={entryDelay * 1000} onDone={() => setTitleDone(true)} />}
              </h3>
              <span className="text-[10px] text-white/70">{storyline.tone}</span>
            </div>
            <AnimatePresence>
              {isSelected && (
                <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                  <Check className="h-3.5 w-3.5 text-primary-foreground" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Body */}
        <div className="p-3">
          <AnimatePresence>
            {titleDone && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
                className="text-xs text-muted-foreground leading-relaxed">
                {storyline.description}
              </motion.p>
            )}
          </AnimatePresence>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] font-medium text-foreground/70">{storyline.sceneCount} scenes</span>
            <span className="text-[10px] text-muted-foreground">|</span>
            <span className="text-[10px] text-muted-foreground">Mapped to song structure</span>
          </div>
          <SceneTimeline count={storyline.sceneCount} from={from} to={to} entryDelay={entryDelay} />
        </div>

        {/* Scene breakdown */}
        <AnimatePresence>
          {isSelected && <SceneBreakdown scenes={scenes} from={from} to={to} />}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  )
}

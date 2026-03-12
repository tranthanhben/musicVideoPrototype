'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { makeSvgThumb } from '@/lib/flow/mock-data'
import type { Storyline } from '@/lib/flow/types'
import { SCENE_DESCRIPTIONS, interpolateHex } from './storyline-data'

// --- Typewriter ---

interface TypewriterProps {
  text: string
  delay: number
  onDone?: () => void
  className?: string
}

function Typewriter({ text, delay, onDone, className }: TypewriterProps) {
  const [displayed, setDisplayed] = useState('')
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone
  useEffect(() => {
    let i = 0
    let iv: ReturnType<typeof setInterval> | null = null
    const t = setTimeout(() => {
      iv = setInterval(() => {
        i++
        setDisplayed(text.slice(0, i))
        if (i >= text.length) { if (iv) clearInterval(iv); iv = null; onDoneRef.current?.() }
      }, 26)
    }, delay)
    return () => { clearTimeout(t); if (iv) clearInterval(iv) }
  }, [text, delay])
  return <span className={className}>{displayed}</span>
}

// --- Circular match indicator ---

function MatchCircle({ pct, color }: { pct: number; color: string }) {
  const r = 10
  const circ = 2 * Math.PI * r
  return (
    <div className="flex flex-col items-center">
      <svg width="28" height="28" viewBox="0 0 28 28" className="-rotate-90">
        <circle cx="14" cy="14" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" />
        <motion.circle
          cx="14" cy="14" r={r}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct / 100) }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
        />
      </svg>
      <span className="text-[8px] font-bold text-white/80 -mt-0.5">{pct}%</span>
    </div>
  )
}

// --- Scene timeline ---

function SceneTimeline({ count, from, to, entryDelay }: { count: number; from: string; to: string; entryDelay: number }) {
  return (
    <div className="mt-2.5 space-y-1">
      <div className="flex gap-[3px] items-end h-5">
        {Array.from({ length: count }).map((_, i) => {
          const t = count > 1 ? i / (count - 1) : 0
          const height = 40 + Math.round(Math.sin((i / count) * Math.PI) * 60)
          return (
            <motion.div
              key={i}
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ delay: entryDelay + 0.06 * i, duration: 0.3 }}
              style={{
                flex: 1,
                background: interpolateHex(from, to, t),
                height: `${height}%`,
                borderRadius: 2,
                transformOrigin: 'bottom',
              }}
              title={`Scene ${i + 1}`}
            />
          )
        })}
      </div>
      <div className="flex justify-between">
        <span className="text-[9px] text-muted-foreground/50">Scene 1</span>
        <span className="text-[9px] text-muted-foreground/50">Scene {count}</span>
      </div>
    </div>
  )
}

// --- Scene breakdown ---

function SceneBreakdown({ scenes, from, to }: { scenes: string[]; from: string; to: string }) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="overflow-hidden border-t border-border/30"
    >
      <div className="px-3 py-3 space-y-2">
        <p className="text-[10px] font-semibold text-foreground/50 uppercase tracking-wider">Scene Breakdown</p>
        {scenes.map((desc, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex gap-2 items-start"
          >
            <span
              className="text-[9px] font-bold mt-0.5 shrink-0 rounded px-1 py-0.5 text-white"
              style={{ background: interpolateHex(from, to, i / Math.max(scenes.length - 1, 1)) }}
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

const MATCH_PERCENTAGES: Record<string, number> = {
  'celestial-journey': 94,
  'urban-pulse': 87,
  'ocean-memory': 91,
}

export function StorylineCard({ storyline, isSelected, anySelected, onSelect, entryDelay, titleReady }: StorylineCardProps) {
  const [titleDone, setTitleDone] = useState(false)
  const scenes = SCENE_DESCRIPTIONS[storyline.id] ?? []
  const [from, to] = storyline.thumbnailColors
  const matchPct = MATCH_PERCENTAGES[storyline.id] ?? 88

  return (
    <motion.div
      layout
      animate={{
        scale: isSelected ? 1.015 : anySelected ? 0.985 : 1,
        opacity: anySelected && !isSelected ? 0.5 : 1,
      }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
    >
      <motion.button
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: entryDelay, duration: 0.4 }}
        onClick={onSelect}
        className={cn(
          'relative w-full rounded-2xl border p-0 text-left cursor-pointer overflow-hidden transition-shadow duration-300',
          isSelected
            ? 'border-primary shadow-xl shadow-primary/20'
            : 'border-border hover:border-border/60 hover:shadow-lg',
        )}
      >
        {/* Cinematic gradient header */}
        <div className="relative h-28 overflow-hidden">
          <img
            src={storyline.thumbnailUrl ?? makeSvgThumb(from, to)}
            alt={storyline.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Cinematic overlay */}
          <div className="absolute inset-0" style={{
            background: `linear-gradient(135deg, ${from}60, ${to}40), linear-gradient(to bottom, transparent 20%, rgba(0,0,0,0.85) 100%)`,
          }} />
          {/* Film grain texture */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 100 100%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%221%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22 opacity=%221%22/%3E%3C/svg%3E")',
          }} />

          <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white drop-shadow min-h-[1.2em] leading-tight">
                {titleReady && <Typewriter text={storyline.title} delay={entryDelay * 1000} onDone={() => setTitleDone(true)} />}
              </h3>
              <span className="text-[10px] text-white/65 font-medium">{storyline.tone}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isSelected && <MatchCircle pct={matchPct} color="#4ade80" />}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-primary"
                  >
                    <Check className="h-3.5 w-3.5 text-primary-foreground" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-3">
          <AnimatePresence>
            {titleDone && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-xs text-muted-foreground leading-relaxed"
              >
                {storyline.description}
              </motion.p>
            )}
          </AnimatePresence>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] font-semibold text-foreground/70">{storyline.sceneCount} scenes</span>
            <span className="text-[10px] text-muted-foreground/40">·</span>
            <span className="text-[10px] text-muted-foreground">Mapped to song structure</span>
            {!isSelected && (
              <span className="ml-auto text-[10px] font-medium text-primary/70">{matchPct}% match</span>
            )}
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

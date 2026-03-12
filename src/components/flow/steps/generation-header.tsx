'use client'

import { motion } from 'framer-motion'
import { Zap, Trophy } from 'lucide-react'

// --- ETA countdown hook ---

import { useState, useEffect } from 'react'

export function useEtaCountdown(progress: number, isComplete: boolean): string {
  const [secs, setSecs] = useState(() => Math.round((100 - progress) / 1.5 * 0.12 + 90))
  useEffect(() => {
    if (isComplete) return
    const t = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [isComplete])
  if (isComplete) return 'Done'
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `~${m}:${String(s).padStart(2, '0')}`
}

// --- Progress ring ---

export function ProgressRing({ progress, isComplete }: { progress: number; isComplete: boolean }) {
  const r = 22
  const circ = 2 * Math.PI * r
  const color = isComplete ? '#22c55e' : progress > 66 ? '#06B6D4' : '#7C3AED'

  return (
    <div className="relative flex items-center justify-center">
      <svg width="60" height="60" viewBox="0 0 60 60" className="-rotate-90">
        <circle cx="30" cy="30" r={r} fill="none" stroke="var(--border)" strokeWidth="3" />
        <motion.circle
          cx="30" cy="30" r={r}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circ}
          animate={{ strokeDashoffset: circ * (1 - progress / 100) }}
          transition={{ duration: 0.4, ease: 'linear' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        {isComplete
          ? <Trophy className="h-4 w-4 text-green-500" />
          : <span className="text-[11px] font-bold font-mono tabular-nums text-foreground">{Math.round(progress)}%</span>
        }
      </div>
    </div>
  )
}

// --- Generation header ---

interface GenerationHeaderProps {
  isComplete: boolean
  completedCount: number
  sceneCount: number
  consistency: number
  eta: string
  progress: number
}

export function GenerationHeader({ isComplete, completedCount, sceneCount, consistency, eta, progress }: GenerationHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between mb-3 shrink-0 gap-4"
    >
      <div className="flex items-center gap-3 min-w-0">
        <Zap className="h-4 w-4 text-primary shrink-0" />
        <h2 className="text-base font-bold text-foreground truncate">
          {isComplete ? 'Generation Complete!' : 'Generating Videos'}
        </h2>
        <span className="shrink-0 inline-flex items-center rounded-full border border-purple-500/40 bg-purple-500/10 px-2 py-0.5 text-[9px] font-mono font-medium text-purple-400 tracking-wide">
          CREMI-7C3A-FLOW
        </span>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="text-right">
          <span className="text-[9px] text-muted-foreground font-mono uppercase tracking-wide">Consistency</span>
          <motion.div
            key={consistency}
            initial={{ scale: 1.2, color: '#4ade80' }}
            animate={{ scale: 1, color: '#a1a1aa' }}
            transition={{ duration: 0.4 }}
            className="text-sm font-bold font-mono tabular-nums"
          >
            {consistency}%
          </motion.div>
        </div>

        <div className="text-right">
          <span className="text-[9px] text-muted-foreground font-mono uppercase tracking-wide">ETA</span>
          <motion.div
            key={eta}
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 1 }}
            className="text-[11px] font-mono text-foreground tabular-nums"
          >
            {eta}
          </motion.div>
        </div>

        <ProgressRing progress={progress} isComplete={isComplete} />
      </div>
    </motion.div>
  )
}

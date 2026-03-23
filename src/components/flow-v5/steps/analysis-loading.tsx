'use client'

import { motion, AnimatePresence } from 'framer-motion'

const AGENT_MESSAGES = [
  { threshold: 0,  text: 'Reading audio fingerprint...' },
  { threshold: 14, text: 'Extracting BPM... found 128 BPM' },
  { threshold: 28, text: 'Key detected: A minor' },
  { threshold: 42, text: 'Mapping segment boundaries...' },
  { threshold: 56, text: 'Identified 7 structural sections' },
  { threshold: 68, text: 'Building emotion / energy curve...' },
  { threshold: 80, text: 'Detecting emotional peaks...' },
  { threshold: 90, text: 'Flagging cinematic moments...' },
  { threshold: 96, text: 'Generating AI insights...' },
]

const BAR_COUNT = 32

interface AnalysisLoadingProps {
  progress: number
}

export function AnalysisLoading({ progress }: AnalysisLoadingProps) {
  const visibleMessages = AGENT_MESSAGES.filter((m) => m.threshold <= progress).map((m) => m.text)

  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-full max-w-sm space-y-6 px-4">
        {/* Title */}
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">Analyzing Track</p>
          <p className="text-xs text-muted-foreground mt-0.5">{progress}% complete</p>
        </div>

        {/* Animated waveform */}
        <div className="flex items-end justify-center gap-[2px] h-14">
          {Array.from({ length: BAR_COUNT }).map((_, i) => {
            const filled = (i / BAR_COUNT) * 100 <= progress
            const baseHeight = 20 + Math.sin(i * 0.7) * 15 + Math.sin(i * 1.3) * 10
            const targetH = filled ? Math.max(8, baseHeight) : 4
            return (
              <motion.div
                key={i}
                className="w-1.5 rounded-full"
                style={{ backgroundColor: filled ? 'var(--primary, #7C3AED)' : 'var(--border)' }}
                animate={{ height: targetH }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: filled ? i * 0.01 : 0 }}
              />
            )
          })}
        </div>

        {/* Progress bar */}
        <div className="h-1 rounded-full bg-border overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'linear' }}
          />
        </div>

        {/* Streaming agent messages */}
        <div className="space-y-1.5 min-h-[96px]">
          <AnimatePresence initial={false}>
            {visibleMessages.slice(-4).map((msg) => (
              <motion.div
                key={msg}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                {msg}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

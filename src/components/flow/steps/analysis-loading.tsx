'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const AGENT_MESSAGES = [
  { threshold: 0,  text: 'Reading audio fingerprint…' },
  { threshold: 14, text: 'Extracting BPM… found 128 BPM' },
  { threshold: 28, text: 'Key detected: A minor' },
  { threshold: 42, text: 'Mapping segment boundaries…' },
  { threshold: 56, text: 'Identified 7 structural sections' },
  { threshold: 68, text: 'Building emotion / energy curve…' },
  { threshold: 80, text: 'Detecting emotional peaks…' },
  { threshold: 90, text: 'Flagging cinematic moments…' },
  { threshold: 96, text: 'Generating AI insights…' },
]

const BAR_COUNT = 40

interface AnalysisLoadingProps {
  progress: number
}

export function AnalysisLoading({ progress }: AnalysisLoadingProps) {
  const visibleMessages = AGENT_MESSAGES.filter((m) => m.threshold <= progress).map((m) => m.text)

  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-full max-w-sm space-y-6 px-4">
        {/* Spinning ring + title */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative flex items-center justify-center">
            {/* Outer rotating ring */}
            <motion.div
              className="absolute h-16 w-16 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, #7C3AED, #06B6D4, #EC4899, #7C3AED)',
                maskImage: 'radial-gradient(transparent 56%, black 57%)',
                WebkitMaskImage: 'radial-gradient(transparent 56%, black 57%)',
              }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
            />
            {/* Inner pulse */}
            <motion.div
              className="h-10 w-10 rounded-full bg-primary/20 border border-primary/40"
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
            />
          </div>

          <div className="text-center">
            <p className="text-sm font-bold text-foreground">Analyzing Track</p>
            <motion.p
              key={Math.floor(progress / 5)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-primary mt-0.5 font-mono"
            >
              {progress}%
            </motion.p>
          </div>
        </div>

        {/* Dramatic waveform — bars grow from center */}
        <div className="flex items-center justify-center gap-[2px] h-16">
          {Array.from({ length: BAR_COUNT }).map((_, i) => {
            const filled = (i / BAR_COUNT) * 100 <= progress
            const center = BAR_COUNT / 2
            const distFromCenter = Math.abs(i - center) / center
            const baseHeight = 20 + Math.sin(i * 0.55) * 25 + Math.sin(i * 1.1) * 15 + Math.cos(i * 0.3) * 10
            const targetH = filled ? Math.max(8, baseHeight) : 3

            return (
              <motion.div
                key={i}
                className="rounded-full"
                style={{
                  width: 3,
                  background: filled
                    ? `linear-gradient(to top, #7C3AED, #06B6D4)`
                    : 'var(--border)',
                  opacity: filled ? 1 - distFromCenter * 0.3 : 0.3,
                }}
                animate={{ height: targetH }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: filled ? i * 0.008 : 0 }}
              />
            )
          })}
        </div>

        {/* Progress bar with shimmer */}
        <div className="h-1.5 rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full relative overflow-hidden transition-all duration-300"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #7C3AED, #06B6D4, #EC4899)',
            }}
          >
            <motion.div
              className="absolute inset-y-0 w-10 bg-white/40 skew-x-[-20deg]"
              animate={{ x: ['-300%', '400%'] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'linear', repeatDelay: 0.3 }}
            />
          </div>
        </div>

        {/* Streaming agent messages */}
        <div className="min-h-[100px] space-y-1.5">
          <AnimatePresence initial={false}>
            {visibleMessages.slice(-4).map((msg, i) => (
              <motion.div
                key={msg}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: i === visibleMessages.slice(-4).length - 1 ? 1 : 0.45, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2 text-xs"
              >
                <span className={cn(
                  'h-1.5 w-1.5 rounded-full flex-shrink-0',
                  i === visibleMessages.slice(-4).length - 1 ? 'bg-primary' : 'bg-muted-foreground/40',
                )} />
                <span className={i === visibleMessages.slice(-4).length - 1 ? 'text-foreground/80' : 'text-muted-foreground'}>
                  {msg}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}


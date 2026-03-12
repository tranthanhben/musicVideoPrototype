'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { MOCK_STORYLINES } from '@/lib/flow/mock-data'
import { StorylineCard } from './storyline-card'

interface StorylineStepProps {
  selectedId: string | null
  onSelect: (id: string) => void
  onContinue: () => void
}

const LOADING_DURATION = 2400

const CREATIVE_MESSAGES = [
  'Analyzing song structure…',
  'Mapping energy curve…',
  'Crafting narrative arcs…',
  'Matching emotional beats…',
  'Generating storylines…',
]

export function StorylineStep({ selectedId, onSelect, onContinue }: StorylineStepProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [titleReady, setTitleReady] = useState(false)
  const [loadProgress, setLoadProgress] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const raf = requestAnimationFrame(function tick() {
      const p = Math.min((Date.now() - start) / LOADING_DURATION, 1)
      setLoadProgress(p * 100)
      if (p < 1) {
        requestAnimationFrame(tick)
      } else {
        setIsLoading(false)
        setTimeout(() => setTitleReady(true), 200)
      }
    })
    return () => cancelAnimationFrame(raf)
  }, [])

  const anySelected = selectedId !== null

  return (
    <div className="flex h-full justify-center overflow-y-auto p-6">
      <div className="w-full max-w-2xl lg:max-w-4xl space-y-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Choose a Storyline</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            AI-generated storylines based on your track&apos;s structure, mood, and energy curve
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center gap-5 py-14"
            >
              {/* Creative loading animation */}
              <div className="relative flex items-center justify-center">
                {/* Outer ring */}
                <motion.div
                  className="absolute h-20 w-20 rounded-full border-2 border-primary/20"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                />
                {/* Progress arc */}
                <svg className="absolute h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="36" fill="none" stroke="var(--border)" strokeWidth="2" />
                  <motion.circle
                    cx="40" cy="40" r="36"
                    fill="none"
                    stroke="#7C3AED"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    style={{ strokeDashoffset: `${2 * Math.PI * 36 * (1 - loadProgress / 100)}` }}
                  />
                </svg>
                {/* Center sparkle */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                >
                  <Sparkles className="h-6 w-6 text-primary" />
                </motion.div>
              </div>

              <CreativeMessages />
            </motion.div>
          ) : (
            <motion.div
              key="storylines"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
              className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0"
            >
              {MOCK_STORYLINES.map((storyline, index) => (
                <StorylineCard
                  key={storyline.id}
                  storyline={storyline}
                  isSelected={selectedId === storyline.id}
                  anySelected={anySelected}
                  onSelect={() => onSelect(storyline.id)}
                  entryDelay={index * 0.35}
                  titleReady={titleReady}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Continue */}
        <AnimatePresence>
          {selectedId && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <button
                onClick={onContinue}
                className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer"
              >
                Continue to Mood Board
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function CreativeMessages() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const iv = setInterval(() => setIdx((i) => (i + 1) % CREATIVE_MESSAGES.length), 500)
    return () => clearInterval(iv)
  }, [])

  return (
    <div className="flex flex-col items-center gap-1">
      <AnimatePresence mode="wait">
        <motion.p
          key={idx}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.22 }}
          className="text-sm text-foreground/70 font-medium"
        >
          {CREATIVE_MESSAGES[idx]}
        </motion.p>
      </AnimatePresence>
      <p className="text-[11px] text-muted-foreground">Creating cinematic storylines tailored to your track</p>
    </div>
  )
}

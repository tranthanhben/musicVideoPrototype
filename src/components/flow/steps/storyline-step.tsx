'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Loader2 } from 'lucide-react'
import { MOCK_STORYLINES } from '@/lib/flow/mock-data'
import { StorylineCard } from './storyline-card'

interface StorylineStepProps {
  selectedId: string | null
  onSelect: (id: string) => void
  onContinue: () => void
}

const LOADING_DURATION = 2000

export function StorylineStep({ selectedId, onSelect, onContinue }: StorylineStepProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [titleReady, setTitleReady] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      setIsLoading(false)
      // slight extra delay so the fade-out completes before typewriter starts
      setTimeout(() => setTitleReady(true), 200)
    }, LOADING_DURATION)
    return () => clearTimeout(t)
  }, [])

  const anySelected = selectedId !== null

  return (
    <div className="flex h-full justify-center overflow-y-auto p-6">
      <div className="w-full max-w-lg space-y-4">
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

        {/* Loading state */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center gap-3 py-16"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }}
              >
                <Loader2 className="h-7 w-7 text-primary" />
              </motion.div>
              <GeneratingDots />
            </motion.div>
          ) : (
            <motion.div
              key="storylines"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {MOCK_STORYLINES.map((storyline, index) => (
                <StorylineCard
                  key={storyline.id}
                  storyline={storyline}
                  isSelected={selectedId === storyline.id}
                  anySelected={anySelected}
                  onSelect={() => onSelect(storyline.id)}
                  entryDelay={index * 0.4}
                  titleReady={titleReady}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Continue button */}
        <AnimatePresence>
          {selectedId && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
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

const GENERATING_WORDS = ['Analyzing song structure', 'Mapping energy curve', 'Generating storylines']

function GeneratingDots() {
  const [wordIndex, setWordIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((i) => (i + 1) % GENERATING_WORDS.length)
    }, 600)
    return () => clearInterval(interval)
  }, [])

  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={wordIndex}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.25 }}
        className="text-xs text-muted-foreground"
      >
        {GENERATING_WORDS[wordIndex]}…
      </motion.p>
    </AnimatePresence>
  )
}

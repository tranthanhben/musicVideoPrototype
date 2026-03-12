'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { MV_TYPES } from '@/lib/flow/mock-data'
import type { MvType } from '@/lib/flow/types'

interface MvTypeStepProps {
  selected: MvType | null
  onSelect: (type: MvType) => void
}

export function MvTypeStep({ selected, onSelect }: MvTypeStepProps) {
  const [pulsing, setPulsing] = useState<string | null>(null)

  function handleSelect(id: MvType) {
    setPulsing(id)
    setTimeout(() => setPulsing(null), 500)
    onSelect(id)
  }

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-full max-w-xl lg:max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-7 text-center"
        >
          <h2 className="text-xl font-bold text-foreground tracking-tight">What type of music video?</h2>
          <p className="text-sm text-muted-foreground mt-1.5">Choose the style that best fits your creative vision</p>
        </motion.div>

        <motion.div
          className="grid grid-cols-3 gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          {MV_TYPES.map((type, i) => {
            const isSelected = selected === type.id
            const isPulsing = pulsing === type.id

            return (
              <motion.button
                key={type.id}
                onClick={() => handleSelect(type.id)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  scale: isPulsing ? [1, 1.04, 1] : isSelected ? 1.02 : 1,
                }}
                transition={{
                  opacity: { delay: i * 0.07, duration: 0.35 },
                  scale: isPulsing
                    ? { duration: 0.45, times: [0, 0.5, 1] }
                    : { type: 'spring', stiffness: 300, damping: 22 },
                }}
                whileHover={{ scale: isSelected ? 1.02 : 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  'relative rounded-2xl border p-4 text-left cursor-pointer overflow-hidden group transition-shadow duration-300',
                  isSelected
                    ? 'border-primary/60 bg-primary/5 shadow-lg'
                    : 'border-border bg-card hover:border-border/70',
                )}
                style={isSelected ? {
                  boxShadow: `0 0 0 1px ${type.accentColor}40, 0 4px 20px ${type.accentColor}20`,
                } : undefined}
              >
                {/* Gradient header bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 transition-all duration-300"
                  style={{
                    background: `linear-gradient(90deg, ${type.accentColor}, ${type.accentColor}88)`,
                    opacity: isSelected ? 1 : 0.4,
                  }}
                />

                {/* Hover glow layer */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at 30% 30%, ${type.accentColor}12, transparent 70%)` }}
                />

                <div className="flex flex-col gap-2 pt-1.5 relative">
                  {/* Icon with colored background */}
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-xl transition-transform duration-200 group-hover:scale-110"
                    style={{ background: `${type.accentColor}18` }}
                  >
                    {type.icon}
                  </div>

                  <div>
                    <p className="text-sm font-bold text-foreground">{type.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{type.description}</p>
                  </div>
                </div>

                {/* Selected check */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                      className="absolute top-2.5 right-2.5 h-5 w-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: type.accentColor }}
                    >
                      <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}

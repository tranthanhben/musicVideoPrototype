'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Film, Music2, BarChart3, BookOpen, Palette, Layout, Zap, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FLOW_STEPS, type FlowStep } from '@/lib/flow/types'

const STEP_ICONS = [Film, Music2, BarChart3, BookOpen, Palette, Layout, Zap, Download]

interface FlowStepIndicatorProps {
  currentStep: FlowStep
  onStepClick: (step: FlowStep) => void
}

export function FlowStepIndicator({ currentStep, onStepClick }: FlowStepIndicatorProps) {
  const currentIndex = FLOW_STEPS.findIndex((s) => s.key === currentStep)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div className="flex items-center px-4 py-2.5 border-b border-border bg-card/60 backdrop-blur-md overflow-x-auto gap-0.5">
      {FLOW_STEPS.map((step, i) => {
        const isComplete = i < currentIndex
        const isCurrent = i === currentIndex
        const isFuture = i > currentIndex
        const Icon = STEP_ICONS[i]
        const isHovered = hoveredIndex === i

        return (
          <div key={step.key} className="flex items-center">
            {/* Connector line before step */}
            {i > 0 && (
              <div className={cn(
                'h-px w-3 shrink-0 transition-all duration-500',
                i <= currentIndex ? 'bg-gradient-to-r from-green-500/50 to-green-500/30' : 'bg-border/50',
              )} />
            )}

            {/* Step button */}
            <div className="relative">
              {/* Tooltip */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.92 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none"
                  >
                    <div className="whitespace-nowrap rounded-lg bg-popover border border-border px-2.5 py-1.5 text-[11px] font-medium text-foreground shadow-lg">
                      {step.label}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-border" style={{ marginTop: -1 }} />
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-popover" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={() => isComplete && onStepClick(step.key)}
                disabled={isFuture}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={cn(
                  'relative flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-medium transition-all duration-200',
                  isComplete && 'text-green-500 cursor-pointer hover:bg-green-500/10',
                  isCurrent && 'text-primary cursor-default',
                  isFuture && 'text-muted-foreground/40 cursor-not-allowed',
                )}
              >
                {/* Current step glow ring */}
                {isCurrent && (
                  <motion.span
                    layoutId="step-glow"
                    className="absolute inset-0 rounded-full bg-primary/10 border border-primary/30"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}

                {/* Icon / number circle */}
                <span className={cn(
                  'relative flex h-5 w-5 items-center justify-center rounded-full shrink-0 transition-all',
                  isComplete && 'bg-green-500/15',
                  isCurrent && 'bg-primary text-primary-foreground shadow-sm shadow-primary/40',
                  isFuture && 'bg-muted/50',
                )}>
                  {isComplete ? (
                    <Check className="h-2.5 w-2.5" />
                  ) : (
                    <Icon className={cn(
                      'h-2.5 w-2.5',
                      isCurrent ? 'text-primary-foreground' : 'text-muted-foreground/60',
                    )} />
                  )}
                </span>

                {/* Label */}
                <span className="relative hidden sm:inline">{step.shortLabel}</span>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

'use client'

import { type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SwipeWizardProps {
  steps: { title: string; content: ReactNode }[]
  currentStep: number
  onStepChange: (step: number) => void
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
}

export function SwipeWizard({ steps, currentStep, onStepChange }: SwipeWizardProps) {
  const direction = 1 // always slide left when advancing

  function handleNext() {
    if (currentStep < steps.length - 1) {
      onStepChange(currentStep + 1)
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      onStepChange(currentStep - 1)
    }
  }

  const isLast = currentStep === steps.length - 1

  return (
    <div className="flex h-full flex-col">
      {/* Step dots */}
      <div className="flex items-center justify-center gap-2 px-4 pt-4">
        {steps.map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              i <= currentStep
                ? 'w-6 bg-pink-500'
                : 'w-2 bg-slate-200'
            )}
          />
        ))}
      </div>

      {/* Step title */}
      <p className="mt-3 text-center text-xs font-medium uppercase tracking-widest text-slate-400">
        Step {currentStep + 1} of {steps.length}
      </p>
      <h2
        className="mt-1 text-center text-xl font-bold text-slate-900"
        style={{ fontFamily: 'var(--font-plus-jakarta-sans, sans-serif)' }}
      >
        {steps[currentStep].title}
      </h2>

      {/* Content area */}
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            className="absolute inset-0 overflow-y-auto"
          >
            {steps[currentStep].content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      {!isLast && (
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
          <button
            onClick={handleBack}
            className={cn(
              'flex items-center gap-1 text-sm font-medium text-slate-500 transition-opacity',
              currentStep === 0 ? 'pointer-events-none opacity-0' : ''
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          <button
            onClick={handleNext}
            className="rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-transform active:scale-95"
            style={{ background: 'linear-gradient(135deg, #EC4899, #8B5CF6)' }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

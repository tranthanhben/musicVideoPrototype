'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ForgeStepIndicatorProps {
  currentStep: number
  completedSteps: boolean[]
}

const STEP_LABELS = ['Analyze', 'Envision', 'Plan', 'Create', 'Polish']

export function ForgeStepIndicator({ currentStep, completedSteps }: ForgeStepIndicatorProps) {
  return (
    <div className="flex items-center gap-0">
      {STEP_LABELS.map((label, idx) => {
        const isCompleted = completedSteps[idx]
        const isActive = idx === currentStep && !isCompleted
        const isUpcoming = idx > currentStep && !isCompleted

        return (
          <div key={idx} className="flex items-center">
            {/* Circle */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-500',
                  isCompleted && 'bg-green-500 text-white',
                  isActive && 'bg-primary text-primary-foreground ring-2 ring-primary/40 ring-offset-1 ring-offset-background animate-pulse',
                  isUpcoming && 'bg-muted text-muted-foreground',
                )}
              >
                {isCompleted ? <Check className="h-3.5 w-3.5" /> : <span>{idx + 1}</span>}
              </div>
              <span
                className={cn(
                  'text-[9px] font-medium whitespace-nowrap',
                  isCompleted && 'text-green-500',
                  isActive && 'text-primary',
                  isUpcoming && 'text-muted-foreground',
                )}
              >
                {label}
              </span>
            </div>

            {/* Connector line */}
            {idx < STEP_LABELS.length - 1 && (
              <div
                className={cn(
                  'mb-4 h-px w-10 transition-all duration-700',
                  completedSteps[idx] ? 'bg-green-500' : 'bg-border',
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

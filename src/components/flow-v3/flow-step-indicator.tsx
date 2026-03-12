'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FLOW_STEPS, type FlowStep } from '@/lib/flow-v3/types'

interface FlowStepIndicatorProps {
  currentStep: FlowStep
  onStepClick: (step: FlowStep) => void
}

export function FlowStepIndicator({ currentStep, onStepClick }: FlowStepIndicatorProps) {
  const currentIndex = FLOW_STEPS.findIndex((s) => s.key === currentStep)

  return (
    <div className="flex items-center gap-1 px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm overflow-x-auto">
      {FLOW_STEPS.map((step, i) => {
        const isComplete = i < currentIndex
        const isCurrent = i === currentIndex
        const isFuture = i > currentIndex

        return (
          <div key={step.key} className="flex items-center">
            <button
              onClick={() => isComplete && onStepClick(step.key)}
              disabled={isFuture}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition-all',
                isComplete && 'bg-green-500/10 text-green-500 border border-green-500/20 cursor-pointer hover:bg-green-500/15',
                isCurrent && 'bg-primary/15 text-primary border border-primary/30',
                isFuture && 'bg-muted/30 text-muted-foreground/40 border border-transparent cursor-not-allowed',
              )}
            >
              {isComplete ? (
                <Check className="h-3 w-3" />
              ) : (
                <span className={cn(
                  'flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold',
                  isCurrent ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground/60',
                )}>
                  {i + 1}
                </span>
              )}
              <span className="hidden sm:inline">{step.label}</span>
              <span className="sm:hidden">{step.shortLabel}</span>
            </button>
            {i < FLOW_STEPS.length - 1 && (
              <div className={cn(
                'mx-1 h-px w-4 shrink-0',
                i < currentIndex ? 'bg-green-500/30' : 'bg-border',
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}

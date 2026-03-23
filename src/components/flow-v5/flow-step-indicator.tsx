'use client'

import { ArrowLeft, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FLOW_STEPS, type FlowStep } from '@/lib/flow-v5/types'

const SUB_PHASES = [
  { key: 'analysis', label: 'Analysis' },
  { key: 'ideation', label: 'Ideation' },
  { key: 'storyboard', label: 'Storyboard' },
  { key: 'vfx_export', label: 'Video' },
]

interface FlowStepIndicatorProps {
  currentStep: FlowStep
  onStepClick: (step: FlowStep) => void
  workspacePhase?: string | null
  onSubPhaseClick?: (phase: string) => void
}

export function FlowStepIndicator({ currentStep, onStepClick, workspacePhase, onSubPhaseClick }: FlowStepIndicatorProps) {
  const effectiveStep = currentStep === 'storyboard' || currentStep === 'vfx_export' ? 'analysis' : currentStep
  const currentIndex = FLOW_STEPS.findIndex((s) => s.key === effectiveStep)
  const isInWorkspace = currentIndex === 2
  const subPhaseIndex = isInWorkspace && workspacePhase
    ? SUB_PHASES.findIndex((s) => s.key === workspacePhase)
    : -1

  // Tab bar mode when inside Step 3 — Music Video Space
  if (isInWorkspace) {
    return (
      <div className="flex items-center glass-surface border-b border-white/[0.08] px-3 py-2">
        {/* Back button */}
        <button
          onClick={() => onStepClick('setup')}
          className="flex items-center justify-center h-7 w-7 rounded-full glass-surface text-muted-foreground hover:text-foreground transition-all cursor-pointer shrink-0"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>

        {/* Center: Title label + tab pills in one glass container */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-0.5 glass-surface rounded-full px-1.5 py-1">
            {/* MV Space label */}
            <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-muted-foreground/40 px-2.5 shrink-0">MV Space</span>
            {/* Separator */}
            <div className="h-4 w-px bg-white/[0.08] shrink-0 mr-0.5" />
            {/* Sub-phase tabs */}
            {SUB_PHASES.map((sub, si) => {
              const isSubComplete = si < subPhaseIndex
              const isSubCurrent = si === subPhaseIndex
              const isSubFuture = si > subPhaseIndex

              const isClickable = isSubComplete || isSubCurrent
              return (
                <div
                  key={sub.key}
                  onClick={() => isClickable && onSubPhaseClick?.(sub.key)}
                  className={cn(
                    'flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all',
                    isSubCurrent && 'bg-primary text-white shadow-[0_0_12px_rgba(124,58,237,0.3)]',
                    isSubComplete && 'text-green-400 cursor-pointer hover:text-green-300 hover:bg-green-500/10',
                    isSubFuture && 'text-muted-foreground/30',
                  )}
                >
                  {isSubComplete && <Check className="h-3 w-3" />}
                  <span>{sub.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Spacer to balance back button */}
        <div className="w-7 shrink-0" />
      </div>
    )
  }

  // Normal 3-step mode for Steps 1 & 2
  return (
    <div className="flex items-center justify-center gap-1 px-4 py-2.5 border-b border-white/[0.08] glass-surface overflow-x-auto">
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

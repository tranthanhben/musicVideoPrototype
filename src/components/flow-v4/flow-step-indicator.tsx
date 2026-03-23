'use client'

import { useState, useRef } from 'react'
import { Check, ArrowLeft, Cloud, Settings, FolderOpen, Sparkles, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FLOW_STEPS, type FlowStep } from '@/lib/flow-v4/types'
import type { CostBreakdown } from '@/lib/flow-v4/cost-calculator'

interface FlowStepIndicatorProps {
  currentStep: FlowStep
  onStepClick: (step: FlowStep) => void
  onBack?: () => void
  isFirstStep?: boolean
  estimatedCost?: number
  costBreakdown?: CostBreakdown
  projectName?: string
  onProjectNameChange?: (name: string) => void
  onSettingsClick?: () => void
  onAssetsClick?: () => void
  onCreditsClick?: () => void
  onInfoClick?: () => void
  balance?: number
}

export function FlowStepIndicator({
  currentStep, onStepClick, onBack, isFirstStep = true,
  estimatedCost, costBreakdown, projectName, onProjectNameChange,
  onSettingsClick, onAssetsClick, onCreditsClick, onInfoClick,
  balance = 1250,
}: FlowStepIndicatorProps) {
  // Steps 3-4-5 (analysis/storyboard/vfx_export) are unified — all map to the 'analysis' tab
  const effectiveStep = currentStep === 'storyboard' || currentStep === 'vfx_export' ? 'analysis' : currentStep
  const currentIndex = FLOW_STEPS.findIndex((s) => s.key === effectiveStep)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(projectName ?? '')
  const inputRef = useRef<HTMLInputElement>(null)
  const showAssets = ['analysis', 'storyboard', 'vfx_export'].includes(currentStep)

  const cost = costBreakdown?.total ?? estimatedCost ?? 0
  const insufficient = balance - cost < 0

  function startEdit() {
    setDraft(projectName ?? '')
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }
  function commitEdit() {
    const trimmed = draft.trim()
    if (trimmed) onProjectNameChange?.(trimmed)
    setEditing(false)
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card/50 backdrop-blur-sm shrink-0">
      {/* Left: back + project name + info */}
      <div className="flex items-center gap-1.5 shrink-0">
        {!isFirstStep && onBack && (
          <button onClick={onBack} className="flex items-center rounded-lg px-1.5 py-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer">
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
        )}
        {projectName !== undefined && (
          <>
            {editing ? (
              <input
                ref={inputRef} value={draft} onChange={(e) => setDraft(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(false) }}
                className="text-[10px] font-semibold text-foreground bg-primary/10 border border-primary/30 rounded px-1.5 py-0.5 focus:outline-none max-w-[140px]"
                autoFocus
              />
            ) : (
              <button onClick={startEdit} className="text-[10px] font-medium text-foreground/80 hover:text-foreground transition-colors cursor-pointer truncate max-w-[140px]" title="Click to rename">
                {projectName}
              </button>
            )}
            <Cloud className="h-2.5 w-2.5 text-emerald-500 shrink-0" />
            {onInfoClick && (
              <button
                onClick={onInfoClick}
                className="flex items-center justify-center rounded-md p-1 text-muted-foreground/40 hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
                aria-label="Project info"
                title="Project info"
              >
                <Info className="h-3 w-3" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Center: step pills */}
      <div className="flex-1 flex items-center justify-center gap-1 overflow-x-auto">
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
                  'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium transition-all',
                  isComplete && 'bg-green-500/10 text-green-500 border border-green-500/20 cursor-pointer hover:bg-green-500/15',
                  isCurrent && 'bg-primary/15 text-primary border border-primary/30',
                  isFuture && 'bg-muted/30 text-muted-foreground/40 border border-transparent cursor-not-allowed',
                )}
              >
                {isComplete ? <Check className="h-3 w-3" /> : (
                  <span className={cn('flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-bold', isCurrent ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground/60')}>{i + 1}</span>
                )}
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{step.shortLabel}</span>
              </button>
              {i < FLOW_STEPS.length - 1 && (
                <div className={cn('mx-0.5 h-px w-3 shrink-0', i < currentIndex ? 'bg-green-500/30' : 'bg-border')} />
              )}
            </div>
          )
        })}
      </div>

      {/* Right: credits + assets + settings */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Credits button */}
        {onCreditsClick && (
          <button
            onClick={onCreditsClick}
            className={cn(
              'flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors cursor-pointer',
              insufficient
                ? 'border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/15'
                : 'border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/15',
            )}
            aria-label="Credits"
            title="View credits"
          >
            <Sparkles className="h-2.5 w-2.5 shrink-0" />
            <span className="tabular-nums">{balance.toLocaleString()}</span>
          </button>
        )}

        {/* Assets button */}
        {showAssets && onAssetsClick && (
          <button
            onClick={onAssetsClick}
            className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
            aria-label="Project assets"
          >
            <FolderOpen className="h-3 w-3" />
            <span className="hidden md:inline">Assets</span>
          </button>
        )}

        {/* Settings button */}
        {onSettingsClick && (
          <button
            onClick={onSettingsClick}
            className="flex items-center justify-center rounded-md p-1 text-muted-foreground/40 hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
            aria-label="Project settings"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

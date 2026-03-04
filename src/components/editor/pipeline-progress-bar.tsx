'use client'

import { cn } from '@/lib/utils'
import { Check, Loader2, Lock } from 'lucide-react'
import type { PipelineLayer, PipelineLayerId } from '@/lib/pipeline/types'
import { LAYER_ORDER } from '@/lib/pipeline/constants'

interface PipelineProgressBarProps {
  layers: Record<PipelineLayerId, PipelineLayer>
  currentLayerId: PipelineLayerId | null
  className?: string
}

const LAYER_SHORT: Record<PipelineLayerId, string> = {
  L1_INPUT: 'Input',
  L2_CREATIVE: 'Creative',
  L3_PREPRODUCTION: 'Pre-Prod',
  L4_PRODUCTION: 'Production',
  L5_POSTPRODUCTION: 'Post-Prod',
}

export function PipelineProgressBar({ layers, currentLayerId, className }: PipelineProgressBarProps) {
  return (
    <div className={cn('flex items-center gap-1 px-4 py-2 bg-card border-t border-border', className)}>
      {LAYER_ORDER.map((layerId, idx) => {
        const layer = layers[layerId]
        const isActive = layerId === currentLayerId
        const isComplete = layer.status === 'complete'
        const isIdle = layer.status === 'idle'

        return (
          <div key={layerId} className="flex items-center flex-1 min-w-0">
            {/* Step indicator */}
            <div className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors min-w-0',
              isComplete && 'bg-green-500/10 text-green-400',
              isActive && 'bg-primary/10 text-primary',
              isIdle && 'text-muted-foreground',
            )}>
              <div className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                isComplete && 'bg-green-500/20',
                isActive && 'bg-primary/20',
                isIdle && 'bg-muted',
              )}>
                {isComplete ? <Check className="h-3 w-3" /> :
                 isActive ? <Loader2 className="h-3 w-3 animate-spin" /> :
                 <Lock className="h-3 w-3" />}
              </div>
              <span className="truncate">{LAYER_SHORT[layerId]}</span>
              {isActive && layer.progress > 0 && layer.progress < 100 && (
                <span className="text-[10px] font-mono opacity-70">{Math.round(layer.progress)}%</span>
              )}
            </div>

            {/* Connector line */}
            {idx < LAYER_ORDER.length - 1 && (
              <div className={cn(
                'flex-1 h-px mx-1',
                isComplete ? 'bg-green-500/40' : 'bg-border',
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}

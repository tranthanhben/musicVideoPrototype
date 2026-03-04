'use client'

import { Check, Loader2, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePipelineStore } from '@/lib/pipeline/store'
import { LAYER_ORDER } from '@/lib/pipeline/constants'
import type { PipelineLayerId } from '@/lib/pipeline/types'

const LAYER_LABELS: Record<PipelineLayerId, string> = {
  L1_INPUT: 'Input',
  L2_CREATIVE: 'Creative',
  L3_PREPRODUCTION: 'Pre-Prod',
  L4_PRODUCTION: 'Production',
  L5_POSTPRODUCTION: 'Post-Prod',
}

export function DockMiniPipeline() {
  const layers = usePipelineStore((s) => s.layers)
  const currentLayerId = usePipelineStore((s) => s.currentLayerId)

  return (
    <div className="flex flex-col gap-1">
      {LAYER_ORDER.map((layerId) => {
        const layer = layers[layerId]
        const isActive = layerId === currentLayerId
        const isComplete = layer.status === 'complete'

        return (
          <div
            key={layerId}
            className={cn(
              'flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors',
              isActive && 'bg-primary/10',
              isComplete && 'bg-green-500/5',
            )}
          >
            {/* Status icon */}
            <div className={cn(
              'flex h-4 w-4 shrink-0 items-center justify-center rounded-full',
              isComplete && 'text-green-400',
              isActive && 'text-primary',
              !isComplete && !isActive && 'text-muted-foreground',
            )}>
              {isComplete ? (
                <Check className="h-3 w-3" />
              ) : isActive ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Lock className="h-2.5 w-2.5" />
              )}
            </div>

            {/* Name */}
            <span className={cn(
              'text-xs flex-1 truncate',
              isActive && 'text-primary font-medium',
              isComplete && 'text-green-400',
              !isComplete && !isActive && 'text-muted-foreground',
            )}>
              {LAYER_LABELS[layerId]}
            </span>

            {/* Progress bar */}
            {isActive && (
              <div className="w-10 h-1 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${layer.progress}%` }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

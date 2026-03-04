'use client'

import Link from 'next/link'
import { ArrowLeft, MessageSquare, Check, Loader2, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePipelineStore } from '@/lib/pipeline/store'
import { LAYER_ORDER } from '@/lib/pipeline/constants'
import type { PipelineLayerId } from '@/lib/pipeline/types'

const LAYER_SHORT: Record<PipelineLayerId, string> = {
  L1_INPUT: 'L1',
  L2_CREATIVE: 'L2',
  L3_PREPRODUCTION: 'L3',
  L4_PRODUCTION: 'L4',
  L5_POSTPRODUCTION: 'L5',
}

interface DockTopBarProps {
  projectName: string
  chatOpen: boolean
  onChatToggle: () => void
}

export function DockTopBar({ projectName, chatOpen, onChatToggle }: DockTopBarProps) {
  const layers = usePipelineStore((s) => s.layers)
  const currentLayerId = usePipelineStore((s) => s.currentLayerId)

  return (
    <header className="flex h-12 shrink-0 items-center gap-4 border-b border-border bg-card px-4">
      {/* Left: back + brand */}
      <div className="flex items-center gap-2 min-w-0">
        <Link
          href="/"
          className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        </Link>
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">Cremi</span>
      </div>

      {/* Center: project name */}
      <div className="flex-1 flex justify-center">
        <span className="text-sm font-medium text-foreground truncate max-w-xs">{projectName}</span>
      </div>

      {/* Right: layer badges + chat toggle */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {LAYER_ORDER.map((layerId) => {
            const layer = layers[layerId]
            const isActive = layerId === currentLayerId
            const isComplete = layer.status === 'complete'

            return (
              <div
                key={layerId}
                title={layer.name}
                className={cn(
                  'flex h-6 w-8 items-center justify-center rounded text-[10px] font-bold transition-colors',
                  isComplete && 'bg-green-500/20 text-green-400',
                  isActive && 'bg-primary/20 text-primary',
                  !isComplete && !isActive && 'bg-muted text-muted-foreground'
                )}
              >
                {isComplete ? (
                  <Check className="h-3 w-3" />
                ) : isActive ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <span>{LAYER_SHORT[layerId]}</span>
                )}
              </div>
            )
          })}
        </div>

        <button
          onClick={onChatToggle}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
            chatOpen ? 'bg-primary/20 text-primary' : 'hover:bg-muted text-muted-foreground'
          )}
          title="Toggle AI Assistant"
        >
          <MessageSquare className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}

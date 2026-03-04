'use client'

import { useState } from 'react'
import { CheckCircle, Loader2, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PipelineLayer } from '@/lib/pipeline/types'
import type { LayerDefinition } from '@/lib/pipeline/constants'
import { CanvasArtifactNode } from './canvas-artifact-node'

interface PipelineZoneProps {
  layer: PipelineLayer
  layerDef: LayerDefinition
  x: number
  y: number
  colorClass: string
}

export function PipelineZone({ layer, layerDef, x, y, colorClass }: PipelineZoneProps) {
  const [openThreadId, setOpenThreadId] = useState<string | null>(null)

  const isActive = layer.status === 'active'
  const isComplete = layer.status === 'complete'
  const isIdle = layer.status === 'idle'

  const allTags = [
    ...layerDef.agents.map((n) => ({ name: n, type: 'agent' as const })),
    ...layerDef.mcps.map((n) => ({ name: n, type: 'mcp' as const })),
    ...layerDef.skills.map((n) => ({ name: n, type: 'skill' as const })),
  ]

  return (
    <div
      className={cn(
        'absolute rounded-xl border-l-4 bg-card/90 backdrop-blur-sm border border-border shadow-lg transition-all duration-500',
        colorClass,
        isActive && 'shadow-xl ring-1 ring-primary/30',
        isComplete && 'border-r-border border-t-border border-b-border',
        isIdle && 'opacity-60'
      )}
      style={{ left: x, top: y, width: 380 }}
    >
      {/* Pulse overlay when active */}
      {isActive && (
        <div className="absolute inset-0 rounded-xl animate-pulse bg-primary/5 pointer-events-none" />
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-foreground truncate">{layer.name}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Progress bar if active */}
          {isActive && (
            <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${layer.progress}%` }}
              />
            </div>
          )}
          {/* Status badge */}
          {isActive && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
          {isComplete && <CheckCircle className="w-4 h-4 text-emerald-400" />}
          {isIdle && <Clock className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {/* Agent/MCP/Skill tags */}
      <div className="px-4 pb-2 flex flex-wrap gap-1">
        {allTags.slice(0, 4).map((tag) => (
          <span
            key={tag.name}
            className={cn(
              'text-[9px] font-medium px-1.5 py-0.5 rounded-full',
              tag.type === 'agent' && 'bg-blue-500/15 text-blue-400',
              tag.type === 'mcp' && 'bg-violet-500/15 text-violet-400',
              tag.type === 'skill' && 'bg-emerald-500/15 text-emerald-400',
            )}
          >
            {tag.name}
          </span>
        ))}
      </div>

      {/* Artifacts grid */}
      <div className="px-3 pb-3">
        {layer.artifacts.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {layer.artifacts.map((artifact) => (
              <CanvasArtifactNode
                key={artifact.id}
                artifact={artifact}
                isActive={isActive}
                threadOpen={openThreadId === artifact.id}
                onOpenThread={(id) => setOpenThreadId(id)}
              />
            ))}
          </div>
        ) : (
          <div className="h-16 flex items-center justify-center rounded-lg bg-muted/30 border border-dashed border-border">
            <span className="text-[10px] text-muted-foreground">
              {isIdle ? 'Waiting...' : isActive ? 'Generating artifacts...' : 'No artifacts'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

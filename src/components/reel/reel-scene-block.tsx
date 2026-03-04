'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { usePipelineStore } from '@/lib/pipeline/store'
import { LAYER_ORDER } from '@/lib/pipeline/constants'
import type { MockScene } from '@/lib/mock/types'

interface ReelSceneBlockProps {
  scene: MockScene
  selected: boolean
  onSelect: () => void
}

interface DotProps {
  status: 'idle' | 'active' | 'complete'
}

function PipelineDot({ status }: DotProps) {
  if (status === 'complete') {
    return <span className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
  }
  if (status === 'active') {
    return (
      <motion.span
        className="h-2 w-2 rounded-full bg-blue-500 shrink-0"
        animate={{ opacity: [1, 0.4, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
    )
  }
  return <span className="h-2 w-2 rounded-full bg-white/20 shrink-0" />
}

export function ReelSceneBlock({ scene, selected, onSelect }: ReelSceneBlockProps) {
  const layers = usePipelineStore((s) => s.layers)

  return (
    <button
      onClick={onSelect}
      className={cn(
        'flex flex-col gap-1.5 shrink-0 rounded-lg overflow-hidden border transition-all cursor-pointer bg-card',
        selected
          ? 'border-primary ring-2 ring-primary/40 shadow-lg shadow-primary/20'
          : 'border-border hover:border-border/80 hover:shadow-md'
      )}
      style={{ width: 160 }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        <img
          src={scene.thumbnailUrl}
          alt={scene.subject}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Scene label overlay */}
        <div className="absolute top-1.5 left-1.5 rounded px-1.5 py-0.5 bg-black/60 text-white text-xs font-bold">
          S{scene.index + 1}
        </div>
      </div>

      {/* Subject label */}
      <div className="px-2 pb-1">
        <p className="text-xs text-muted-foreground truncate text-left">{scene.subject}</p>

        {/* 5 pipeline dots: L1-L5 */}
        <div className="flex items-center gap-1 mt-1.5 pb-1">
          {LAYER_ORDER.map((layerId) => (
            <PipelineDot key={layerId} status={layers[layerId].status} />
          ))}
        </div>
      </div>
    </button>
  )
}

'use client'

import { cn } from '@/lib/utils'
import type { MockScene } from '@/lib/mock/types'

interface SimpleTimelineProps {
  scenes: MockScene[]
  activeSceneId?: string
  playheadPosition?: number
  onSceneClick?: (sceneId: string) => void
  className?: string
}

const STATUS_COLORS: Record<string, string> = {
  init: 'bg-muted',
  generating: 'bg-yellow-500/30 animate-pulse',
  completed: 'bg-primary/60',
  failed: 'bg-destructive/60',
}

export function SimpleTimeline({
  scenes, activeSceneId, playheadPosition = 0, onSceneClick, className,
}: SimpleTimelineProps) {
  const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0)

  return (
    <div className={cn('relative', className)}>
      {/* Time ruler */}
      <div className="flex justify-between text-[10px] font-mono text-muted-foreground mb-1 px-1">
        <span>0:00</span>
        <span>{Math.floor(totalDuration / 60)}:{String(totalDuration % 60).padStart(2, '0')}</span>
      </div>

      {/* Scene blocks */}
      <div className="relative flex gap-0.5 h-12 rounded-lg overflow-hidden bg-muted/30">
        {scenes.map((scene) => {
          const widthPct = totalDuration > 0 ? (scene.duration / totalDuration) * 100 : 0
          return (
            <button
              key={scene.id}
              onClick={() => onSceneClick?.(scene.id)}
              className={cn(
                'relative h-full overflow-hidden transition-all border-r border-background/30',
                STATUS_COLORS[scene.status] ?? 'bg-muted',
                scene.id === activeSceneId && 'ring-2 ring-primary ring-inset',
              )}
              style={{ width: `${widthPct}%` }}
              title={`Scene ${scene.index + 1}: ${scene.subject}`}
            >
              <img
                src={scene.thumbnailUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-40"
              />
              <span className="relative z-10 text-[10px] font-bold text-white drop-shadow-sm px-1">
                {scene.index + 1}
              </span>
            </button>
          )
        })}

        {/* Playhead */}
        {totalDuration > 0 && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white z-20 pointer-events-none"
            style={{ left: `${(playheadPosition / totalDuration) * 100}%` }}
          />
        )}
      </div>
    </div>
  )
}

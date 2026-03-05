'use client'

import { cn } from '@/lib/utils'
import type { MockScene } from '@/lib/mock/types'

interface TimelineTrackProps {
  scenes: MockScene[]
  totalDuration: number
  activeSceneId: string | null
  onSceneClick: (id: string) => void
  playheadPosition: number
}

const SCENE_COLORS = [
  'rgba(124,58,237,',
  'rgba(109,40,217,',
  'rgba(139,92,246,',
  'rgba(124,58,237,',
  'rgba(109,40,217,',
]

export function TimelineTrack({
  scenes,
  totalDuration,
  activeSceneId,
  onSceneClick,
  playheadPosition,
}: TimelineTrackProps) {
  const width = 1000

  return (
    <div className="relative w-full" style={{ height: 48 }}>
      <div className="flex h-full w-full">
        {scenes.map((scene, i) => {
          const widthPct = (scene.duration / totalDuration) * 100
          const isActive = scene.id === activeSceneId
          const colorBase = SCENE_COLORS[i % SCENE_COLORS.length]

          return (
            <button
              key={scene.id}
              onClick={() => onSceneClick(scene.id)}
              className={cn(
                'relative h-full flex-shrink-0 border-r border-border flex items-center justify-center',
                'transition-colors duration-150 cursor-pointer hover:bg-violet-500/30',
                'text-[11px] font-mono overflow-hidden'
              )}
              style={{
                width: `${widthPct}%`,
                background: isActive ? `${colorBase}0.6)` : `${colorBase}0.25)`,
                borderLeft: isActive ? '2px solid #7C3AED' : '1px solid hsl(var(--border))',
                boxShadow: isActive ? 'inset 0 0 0 1px rgba(124,58,237,0.6)' : 'none',
              }}
            >
              <span
                className="px-1 truncate"
                style={{ color: isActive ? '#E5E7EB' : '#9CA3AF' }}
              >
                {scene.index + 1}
              </span>
              {/* Scene status dot */}
              {scene.status === 'generating' && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              )}
              {scene.status === 'completed' && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>
          )
        })}
      </div>

      {/* Playhead overlay */}
      <div
        className="absolute top-0 bottom-0 w-px bg-white pointer-events-none"
        style={{ left: `${(playheadPosition / totalDuration) * 100}%` }}
      />
    </div>
  )
}

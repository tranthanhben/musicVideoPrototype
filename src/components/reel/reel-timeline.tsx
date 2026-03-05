'use client'

import { useRef } from 'react'
import type { MockScene } from '@/lib/mock/types'
import { ReelSceneBlock } from './reel-scene-block'

interface ReelTimelineProps {
  scenes: MockScene[]
  selectedSceneId: string | null
  onSceneSelect: (sceneId: string) => void
}

export function ReelTimeline({ scenes, selectedSceneId, onSceneSelect }: ReelTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <div className="flex flex-col shrink-0 border-b border-border bg-background" style={{ height: '50vh' }}>
      {/* Audio waveform bar */}
      <div className="h-8 mx-3 mt-2 rounded-md overflow-hidden shrink-0 bg-muted">
        <svg viewBox="0 0 800 32" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="reelAudioGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.6" />
              <stop offset="40%" stopColor="#22D3EE" stopOpacity="0.8" />
              <stop offset="75%" stopColor="#EC4899" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          {Array.from({ length: 160 }).map((_, i) => {
            const h = 4 + Math.abs(Math.sin(i * 0.35) * 10 + Math.sin(i * 0.8) * 6)
            return (
              <rect
                key={i}
                x={i * 5}
                y={(32 - h) / 2}
                width="3"
                height={h}
                rx="0.5"
                fill="url(#reelAudioGrad)"
              />
            )
          })}
        </svg>
      </div>

      {/* Scene blocks — horizontally scrollable */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-x-auto overflow-y-hidden px-3 py-3 min-h-0"
      >
        <div className="flex gap-3 h-full items-start">
          {scenes.map((scene) => (
            <ReelSceneBlock
              key={scene.id}
              scene={scene}
              selected={scene.id === selectedSceneId}
              onSelect={() => onSceneSelect(scene.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

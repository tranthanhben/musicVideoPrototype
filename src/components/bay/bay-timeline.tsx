'use client'

import { cn } from '@/lib/utils'
import { SimpleTimeline } from '@/components/editor/simple-timeline'
import { mockProjects } from '@/lib/mock/projects'
import type { BayTab } from './bay-top-bar'

interface BayTimelineProps {
  activeTab: BayTab
  selectedSceneId: string | null
  onSceneClick: (id: string) => void
}

const project = mockProjects[0]

const SVG_WIDTH = 800
const SVG_HEIGHT = 32
const BAND_HEIGHT = 8

export function BayTimeline({ activeTab, selectedSceneId, onSceneClick }: BayTimelineProps) {
  const isFullEdit = activeTab === 'edit'

  const { segments, beatMarkers, duration } = project.audio

  return (
    <div
      className={cn(
        'h-36 border-t border-border bg-background flex flex-col shrink-0 transition-all',
        !isFullEdit && 'opacity-60'
      )}
    >
      {/* Audio waveform bar with segment bands + beat markers */}
      <div className="h-8 mx-3 mt-2 rounded-md overflow-hidden shrink-0 bg-muted">
        <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="audioGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#22D3EE" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#EC4899" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {/* Segment color bands at top */}
          {segments.map((seg) => {
            const x = (seg.startTime / duration) * SVG_WIDTH
            const w = ((seg.endTime - seg.startTime) / duration) * SVG_WIDTH
            return (
              <rect
                key={seg.id}
                x={x.toFixed(1)}
                y={0}
                width={w.toFixed(1)}
                height={BAND_HEIGHT}
                fill={seg.color}
                opacity="0.8"
              />
            )
          })}

          {/* Waveform bars */}
          {Array.from({ length: 160 }).map((_, i) => {
            const h = 4 + Math.abs(Math.sin(i * 0.35) * 10 + Math.sin(i * 0.8) * 6)
            return (
              <rect
                key={i}
                x={i * 5}
                y={(SVG_HEIGHT - h) / 2}
                width="3"
                height={h}
                rx="0.5"
                fill="url(#audioGrad)"
              />
            )
          })}

          {/* Beat marker tick lines — every 4th beat */}
          {beatMarkers.map((t, i) => {
            if (i % 4 !== 0) return null
            const x = (t / duration) * SVG_WIDTH
            return (
              <line
                key={i}
                x1={x.toFixed(1)}
                y1={BAND_HEIGHT}
                x2={x.toFixed(1)}
                y2={SVG_HEIGHT}
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.2"
              />
            )
          })}
        </svg>
      </div>

      {/* Segment label row */}
      <div className="relative h-4 mx-3 mt-1 shrink-0 overflow-hidden">
        {segments.map((seg) => {
          const leftPct = (seg.startTime / duration) * 100
          return (
            <span
              key={seg.id}
              className="absolute text-[10px] font-medium whitespace-nowrap"
              style={{ left: `${leftPct.toFixed(1)}%`, color: seg.color, transform: 'translateX(2px)' }}
            >
              {seg.label}
            </span>
          )
        })}
      </div>

      {/* Scene timeline */}
      <div className="flex-1 px-3 py-1 min-h-0">
        <SimpleTimeline
          scenes={project.scenes}
          activeSceneId={selectedSceneId ?? undefined}
          onSceneClick={onSceneClick}
          className="h-full"
        />
      </div>
    </div>
  )
}

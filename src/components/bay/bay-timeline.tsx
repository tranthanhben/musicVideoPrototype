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

export function BayTimeline({ activeTab, selectedSceneId, onSceneClick }: BayTimelineProps) {
  const isFullEdit = activeTab === 'edit'

  return (
    <div
      className={cn(
        'h-36 border-t border-border bg-background flex flex-col shrink-0 transition-all',
        !isFullEdit && 'opacity-60'
      )}
    >
      {/* Audio waveform bar */}
      <div className="h-8 mx-3 mt-2 rounded-md overflow-hidden shrink-0">
        <svg viewBox="0 0 800 32" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="audioGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#22D3EE" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#EC4899" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          <rect width="800" height="32" fill="#18181b" />
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
                fill="url(#audioGrad)"
              />
            )
          })}
        </svg>
      </div>

      {/* Scene timeline */}
      <div className="flex-1 px-3 py-2 min-h-0">
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

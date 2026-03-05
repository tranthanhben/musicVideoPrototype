'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { MockScene } from '@/lib/mock/types'

interface SceneCarouselProps {
  scenes: MockScene[]
  activeIndex: number
  onIndexChange: (index: number) => void
}

export function SceneCarousel({ scenes, activeIndex, onIndexChange }: SceneCarouselProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPrompt, setEditPrompt] = useState('')

  function handleSceneTap(scene: MockScene) {
    if (editingId === scene.id) {
      setEditingId(null)
    } else {
      setEditingId(scene.id)
      setEditPrompt(scene.prompt)
    }
  }

  return (
    <div className="relative flex h-full">
      {/* Vertical scroll container */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ scrollSnapType: 'y mandatory' }}
        onScroll={(e) => {
          const el = e.currentTarget
          const idx = Math.round(el.scrollTop / el.clientHeight)
          if (idx !== activeIndex) onIndexChange(idx)
        }}
      >
        {scenes.map((scene, i) => (
          <div
            key={scene.id}
            className="relative flex w-full flex-col"
            style={{ scrollSnapAlign: 'start', height: '100%' }}
          >
            {/* Thumbnail */}
            <button
              className="relative w-full flex-1 overflow-hidden"
              onClick={() => handleSceneTap(scene)}
            >
              <img
                src={scene.thumbnailUrl}
                alt={`Scene ${i + 1}`}
                className="h-full w-full object-cover"
              />
              {/* Scene number badge */}
              <div className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-xs font-bold text-white backdrop-blur-sm">
                {i + 1}
              </div>
              {/* Prompt overlay on tap */}
              {editingId === scene.id && (
                <div className="absolute inset-0 flex flex-col justify-end bg-black/60 p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-pink-300">
                    Edit Prompt
                  </p>
                  <textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    className="w-full rounded-xl bg-white/10 p-3 text-sm text-white placeholder-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                    rows={3}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    className="mt-2 rounded-full py-2 text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, #EC4899, #8B5CF6)' }}
                    onClick={(e) => { e.stopPropagation(); setEditingId(null) }}
                  >
                    Done
                  </button>
                </div>
              )}
            </button>

            {/* Scene info */}
            <div className="bg-background px-4 py-2">
              <p className="text-sm font-medium text-foreground">{scene.subject}</p>
              <p className="text-xs text-muted-foreground">{scene.action}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Dot indicators on right side */}
      <div className="absolute right-3 top-1/2 flex -translate-y-1/2 flex-col gap-2">
        {scenes.map((_, i) => (
          <div
            key={i}
            className={cn(
              'rounded-full transition-all duration-200',
              i === activeIndex
                ? 'h-4 w-2 bg-pink-500'
                : 'h-2 w-2 bg-white/60'
            )}
          />
        ))}
      </div>
    </div>
  )
}

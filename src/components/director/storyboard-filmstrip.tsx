'use client'

import { useState } from 'react'
import type { MockScene } from '@/lib/mock/types'
import { SceneCardFlip } from './scene-card-flip'
import { TakeStrip } from './take-strip'

interface StoryboardFilmstripProps {
  scenes: MockScene[]
  flippedId: string | null
  onFlip: (id: string) => void
  onSceneUpdate: (id: string, data: Partial<MockScene>) => void
}

// Per-scene selected take state
type TakeSelections = Record<string, string>

function Perforation() {
  return (
    <div className="flex flex-col justify-around" style={{ height: 360 }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="rounded-sm bg-border"
          style={{ width: 12, height: 22 }}
        />
      ))}
    </div>
  )
}

export function StoryboardFilmstrip({
  scenes,
  flippedId,
  onFlip,
  onSceneUpdate,
}: StoryboardFilmstripProps) {
  const initialSelections: TakeSelections = {}
  for (const scene of scenes) {
    const sel = scene.takes.find((t) => t.selected)
    initialSelections[scene.id] = sel?.id ?? scene.takes[0]?.id ?? ''
  }
  const [selections, setSelections] = useState<TakeSelections>(initialSelections)

  function handleFlipToggle(sceneId: string) {
    onFlip(sceneId)
  }

  function handleSelect(sceneId: string, takeId: string) {
    setSelections((prev) => ({ ...prev, [sceneId]: takeId }))
  }

  return (
    <div className="relative">
      {/* Top film perforations edge */}
      <div className="flex items-center gap-4 px-8 mb-2 overflow-x-hidden pointer-events-none">
        {scenes.map((s) => (
          <div key={s.id} className="shrink-0" style={{ width: 280 }}>
            <div className="flex justify-around">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="rounded-sm bg-border" style={{ width: 22, height: 12 }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Main scrollable strip */}
      <div
        className="flex items-start gap-4 px-8 pb-4 overflow-x-auto"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {/* Left perforations */}
        <Perforation />

        {scenes.map((scene) => (
          <div
            key={scene.id}
            className="shrink-0 flex flex-col gap-3"
            style={{ scrollSnapAlign: 'start' }}
          >
            <SceneCardFlip
              scene={scene}
              isFlipped={flippedId === scene.id}
              onFlip={() => handleFlipToggle(scene.id)}
              onUpdate={(updates) => onSceneUpdate(scene.id, updates)}
            />
            <TakeStrip
              takes={scene.takes}
              selectedId={selections[scene.id] ?? ''}
              onSelect={(id) => handleSelect(scene.id, id)}
            />
          </div>
        ))}

        {/* Right perforations */}
        <Perforation />
      </div>

      {/* Bottom film perforations edge */}
      <div className="flex items-center gap-4 px-8 mt-2 overflow-x-hidden pointer-events-none">
        {scenes.map((s) => (
          <div key={s.id} className="shrink-0" style={{ width: 280 }}>
            <div className="flex justify-around">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="rounded-sm bg-border" style={{ width: 22, height: 12 }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

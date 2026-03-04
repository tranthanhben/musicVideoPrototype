'use client'

import { cn } from '@/lib/utils'
import type { MockScene } from '@/lib/mock/types'
import { ScenePreviewCard } from '@/components/shared/scene-preview-card'

interface SceneGridProps {
  scenes: MockScene[]
  activeSceneId?: string
  onSelect?: (sceneId: string) => void
  columns?: 2 | 3 | 4
  className?: string
}

const colsClass = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
}

export function SceneGrid({
  scenes, activeSceneId, onSelect, columns = 3, className,
}: SceneGridProps) {
  return (
    <div className={cn('grid gap-3', colsClass[columns], className)}>
      {scenes.map((scene) => (
        <ScenePreviewCard
          key={scene.id}
          scene={scene}
          selected={scene.id === activeSceneId}
          onClick={() => onSelect?.(scene.id)}
        />
      ))}
    </div>
  )
}

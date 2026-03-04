'use client'

import { useState } from 'react'
import { Layers } from 'lucide-react'
import { SceneGrid } from '@/components/editor/scene-grid'
import { mockProjects } from '@/lib/mock/projects'

const project = mockProjects[0]

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

const totalDuration = project.scenes.reduce((sum, s) => sum + s.duration, 0)

export function StoryboardView() {
  const [activeSceneId, setActiveSceneId] = useState<string | undefined>()

  return (
    <div className="flex h-full flex-col p-6 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Storyboard</h2>
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>{project.scenes.length} scenes</span>
          <span>{formatDuration(totalDuration)} total</span>
        </div>
      </div>

      {/* Scene grid */}
      <div className="flex-1 overflow-y-auto">
        <SceneGrid
          scenes={project.scenes}
          activeSceneId={activeSceneId}
          onSelect={setActiveSceneId}
          columns={3}
        />
      </div>
    </div>
  )
}

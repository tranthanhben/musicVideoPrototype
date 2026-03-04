'use client'

import { useState } from 'react'
import { MockVideoPlayer } from '@/components/shared/mock-video-player'
import { SimpleTimeline } from '@/components/editor/simple-timeline'
import { mockProjects } from '@/lib/mock/projects'

const project = mockProjects[0]
const previewScene = project.scenes[0]

export function EditingView() {
  const [activeSceneId, setActiveSceneId] = useState<string>(previewScene.id)

  const activeScene = project.scenes.find((s) => s.id === activeSceneId) ?? previewScene
  const totalDuration = project.scenes.reduce((sum, s) => sum + s.duration, 0)

  return (
    <div className="flex h-full flex-col p-6 gap-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground">Post-Production</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Final assembly and color grading</p>
      </div>

      {/* Video player */}
      <div className="flex-1 min-h-0">
        <MockVideoPlayer
          thumbnailUrl={activeScene.thumbnailUrl}
          duration={activeScene.duration}
          className="h-full w-full"
        />
      </div>

      {/* Timeline */}
      <div className="shrink-0">
        <p className="text-[10px] text-muted-foreground mb-2 font-mono uppercase tracking-wider">
          Timeline · {project.scenes.length} scenes
        </p>
        <SimpleTimeline
          scenes={project.scenes}
          activeSceneId={activeSceneId}
          playheadPosition={0}
          onSceneClick={setActiveSceneId}
        />
      </div>
    </div>
  )
}

'use client'

import { Check } from 'lucide-react'
import { usePipelineStore } from '@/lib/pipeline/store'
import { GenerationLoading } from '@/components/shared/generation-loading'
import { mockProjects } from '@/lib/mock/projects'

const scenes = mockProjects[0].scenes
const LAYER_ID = 'L4_PRODUCTION'

export function GenerationView() {
  const layers = usePipelineStore((s) => s.layers)
  const layerProgress = layers[LAYER_ID]?.progress ?? 0

  // Distribute global layer progress across scenes for display
  const sceneCount = scenes.length
  const progressPerScene = 100 / sceneCount
  const completedCount = Math.floor(layerProgress / progressPerScene)

  return (
    <div className="flex h-full flex-col p-6 gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Generating Scenes</h2>
        <span className="text-xs text-muted-foreground font-mono">
          {completedCount}/{sceneCount} complete · {Math.round(layerProgress)}%
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 gap-3">
          {scenes.map((scene, idx) => {
            const isDone = idx < completedCount
            const isActive = idx === completedCount && layerProgress < 100
            const sceneProgress = isActive
              ? ((layerProgress % progressPerScene) / progressPerScene) * 100
              : isDone ? 100 : 0

            return (
              <div key={scene.id} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted">
                {/* Thumbnail */}
                <img
                  src={scene.thumbnailUrl}
                  alt={`Scene ${scene.index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Overlay */}
                {isDone ? (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/90">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  </div>
                ) : isActive ? (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <GenerationLoading
                      progress={sceneProgress}
                      message={`Scene ${scene.index + 1}`}
                      variant="minimal"
                    />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-black/50" />
                )}

                {/* Scene label */}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-[10px] font-medium text-white truncate">
                    S{scene.index + 1} · {scene.subject}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

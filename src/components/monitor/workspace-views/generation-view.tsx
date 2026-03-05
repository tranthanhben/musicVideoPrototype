'use client'

import { Check } from 'lucide-react'
import { usePipelineStore } from '@/lib/pipeline/store'
import { GenerationLoading } from '@/components/shared/generation-loading'
import { mockProjects } from '@/lib/mock/projects'
import type { AudioSegment, SegmentType } from '@/lib/mock/types'

const scenes = mockProjects[0].scenes
const segments = mockProjects[0].audio.segments
const audioDuration = mockProjects[0].audio.duration
const LAYER_ID = 'L4_PRODUCTION'

const HIGH_ENERGY_TYPES: SegmentType[] = ['chorus', 'bridge', 'drop']

function getSegmentForScene(sceneIndex: number): AudioSegment | undefined {
  const totalVideoDuration = scenes.reduce((sum, s) => sum + s.duration, 0)
  let elapsed = 0
  for (let i = 0; i < sceneIndex; i++) elapsed += scenes[i].duration
  const mid = elapsed + scenes[sceneIndex].duration / 2
  const audioTime = (mid / totalVideoDuration) * audioDuration
  return segments.find((seg) => audioTime >= seg.startTime && audioTime < seg.endTime)
}

function isHighEnergy(seg: AudioSegment | undefined): boolean {
  return seg ? HIGH_ENERGY_TYPES.includes(seg.type) : false
}

// Scenes that render in parallel (3 active at once for visual effect)
const PARALLEL_WINDOW = 3

export function GenerationView() {
  const layers = usePipelineStore((s) => s.layers)
  const layerProgress = layers[LAYER_ID]?.progress ?? 0

  const sceneCount = scenes.length
  const progressPerScene = 100 / sceneCount
  const completedCount = Math.floor(layerProgress / progressPerScene)

  // Active scenes: up to PARALLEL_WINDOW around the current index
  const activeIndices = new Set<number>()
  for (let i = 0; i < PARALLEL_WINDOW; i++) {
    const idx = completedCount + i
    if (idx < sceneCount && layerProgress < 100) activeIndices.add(idx)
  }

  return (
    <div className="flex h-full flex-col p-6 gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Generating Scenes</h2>
          {/* Style seed badge */}
          <span className="mt-1 inline-flex items-center rounded-full border border-purple-500/40 bg-purple-500/10 px-2 py-0.5 text-[10px] font-mono font-medium text-purple-400 tracking-wide">
            Style Seed: CREMI-7C3A-COSMIC
          </span>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          {completedCount}/{sceneCount} complete · {Math.round(layerProgress)}%
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 gap-3">
          {scenes.map((scene, idx) => {
            const isDone = idx < completedCount
            const isActive = activeIndices.has(idx)
            const seg = getSegmentForScene(idx)
            const highEnergy = isHighEnergy(seg)

            // For parallel active scenes, stagger the progress slightly
            const parallelOffset = idx - completedCount
            const baseProgress = isActive
              ? ((layerProgress % progressPerScene) / progressPerScene) * 100
              : isDone ? 100 : 0
            const sceneProgress = isActive
              ? Math.max(0, baseProgress - parallelOffset * 15)
              : baseProgress

            const modelBadge = highEnergy ? 'Kling 2.6' : 'Runway Gen-4'
            const motionLabel = highEnergy ? 'Dynamic' : 'Gentle'
            const motionColor = highEnergy ? 'text-orange-400 bg-orange-500/15' : 'text-blue-400 bg-blue-500/15'

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

                {/* Model badge — top left */}
                <div className="absolute top-1.5 left-1.5 rounded-md bg-black/70 px-1.5 py-0.5">
                  <span className="text-[9px] font-mono font-medium text-white/80">{modelBadge}</span>
                </div>

                {/* Motion type pill — top right */}
                <div className={`absolute top-1.5 right-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${motionColor}`}>
                  {motionLabel}
                </div>

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

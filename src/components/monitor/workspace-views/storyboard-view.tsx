'use client'

import { useState } from 'react'
import { Layers } from 'lucide-react'
import { SceneGrid } from '@/components/editor/scene-grid'
import { mockProjects } from '@/lib/mock/projects'
import type { AudioSegment } from '@/lib/mock/types'

const project = mockProjects[0]
const segments = project.audio.segments
const duration = project.audio.duration

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

const totalDuration = project.scenes.reduce((sum, s) => sum + s.duration, 0)

function getSegmentForTime(time: number, segs: AudioSegment[]): AudioSegment | undefined {
  return segs.find((seg) => time >= seg.startTime && time < seg.endTime)
}

// Build a lookup: sceneId -> segment color dot
// Use cumulative scene start time mapped proportionally to audio duration
function buildSceneSegmentMap(): Record<string, string | undefined> {
  const totalVideoDuration = project.scenes.reduce((sum, s) => sum + s.duration, 0)
  let elapsed = 0
  const map: Record<string, string | undefined> = {}
  for (const scene of project.scenes) {
    const midPoint = elapsed + scene.duration / 2
    const audioTime = (midPoint / totalVideoDuration) * duration
    const seg = getSegmentForTime(audioTime, segments)
    map[scene.id] = seg?.color
    elapsed += scene.duration
  }
  return map
}

const sceneSegmentMap = buildSceneSegmentMap()

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

      {/* Segment pills row */}
      <div className="flex flex-wrap gap-1.5">
        {segments.map((seg) => (
          <span
            key={seg.id}
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium text-white"
            style={{ backgroundColor: seg.color }}
          >
            {seg.label}
          </span>
        ))}
      </div>

      {/* Scene grid with segment dot overlay */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 gap-3">
          {project.scenes.map((scene) => {
            const dotColor = sceneSegmentMap[scene.id]
            const isActive = scene.id === activeSceneId
            return (
              <div
                key={scene.id}
                className="relative cursor-pointer"
                onClick={() => setActiveSceneId(scene.id)}
              >
                {/* Dot marker */}
                {dotColor && (
                  <div
                    className="absolute top-1.5 right-1.5 z-10 h-2.5 w-2.5 rounded-full border border-foreground/40 shadow"
                    style={{ backgroundColor: dotColor }}
                  />
                )}
                {/* Active ring */}
                {isActive && (
                  <div className="absolute inset-0 z-10 rounded-xl ring-2 ring-primary ring-offset-1 ring-offset-background pointer-events-none" />
                )}
                {/* Scene card via SceneGrid child — we replicate the card style here */}
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-muted relative">
                  <img
                    src={scene.thumbnailUrl}
                    alt={`Scene ${scene.index + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                    <p className="text-[10px] font-medium text-white truncate">
                      S{scene.index + 1} · {scene.subject}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

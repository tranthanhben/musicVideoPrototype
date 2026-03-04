'use client'

import { usePipelineStore } from '@/lib/pipeline/store'
import { GenerationLoading } from '@/components/shared/generation-loading'
import { MockVideoPlayer } from '@/components/shared/mock-video-player'
import { mockProjects } from '@/lib/mock/projects'
import type { MockScene } from '@/lib/mock/types'

interface ReelStageContentProps {
  scene: MockScene
}

const audio = mockProjects[0].audio

const COLOR_SWATCHES = ['#7C3AED', '#22D3EE', '#EC4899', '#F59E0B', '#10B981']
const STYLE_TAGS = ['Cinematic', 'Epic', 'Cosmic', 'Ethereal', 'Dynamic']

export function ReelStageContent({ scene }: ReelStageContentProps) {
  const currentLayerId = usePipelineStore((s) => s.currentLayerId)
  const layers = usePipelineStore((s) => s.layers)
  const isRunning = usePipelineStore((s) => s.isRunning)

  if (!isRunning && !layers['L5_POSTPRODUCTION']?.status) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Click &quot;Run Pipeline&quot; to begin
      </div>
    )
  }

  if (!currentLayerId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Click &quot;Run Pipeline&quot; to begin
      </div>
    )
  }

  if (layers['L5_POSTPRODUCTION']?.status === 'complete') {
    return (
      <div className="flex flex-col items-center gap-3 p-2">
        <p className="text-xs text-green-400 font-medium">Post-Production Complete</p>
        <MockVideoPlayer
          thumbnailUrl={scene.thumbnailUrl}
          duration={scene.duration}
          className="w-full max-w-sm"
        />
      </div>
    )
  }

  if (currentLayerId === 'L4_PRODUCTION') {
    const progress = layers['L4_PRODUCTION']?.progress ?? 0
    return (
      <div className="flex items-center justify-center h-full">
        <GenerationLoading progress={progress} message="Generating video clips and assets..." />
      </div>
    )
  }

  if (currentLayerId === 'L3_PREPRODUCTION') {
    return (
      <div className="p-3 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Storyboard</p>
        <div className="rounded-lg border border-border p-3 space-y-2 bg-card">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Camera Angle</span>
            <span className="font-medium capitalize">{scene.cameraAngle}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Camera Movement</span>
            <span className="font-medium capitalize">{scene.cameraMovement}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Environment</span>
            <span className="font-medium capitalize text-right max-w-[60%]">{scene.environment}</span>
          </div>
        </div>
      </div>
    )
  }

  if (currentLayerId === 'L2_CREATIVE') {
    return (
      <div className="p-3 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mood Board</p>
        <div className="grid grid-cols-3 gap-1.5">
          {mockProjects[0].scenes.slice(0, 6).map((s) => (
            <div key={s.id} className="aspect-video rounded overflow-hidden">
              <img src={s.thumbnailUrl} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          {COLOR_SWATCHES.map((c) => (
            <div key={c} className="h-6 w-6 rounded-full border border-border" style={{ background: c }} />
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STYLE_TAGS.map((t) => (
            <span key={t} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">{t}</span>
          ))}
        </div>
      </div>
    )
  }

  // L1_INPUT
  return (
    <div className="p-3 space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Audio Analysis</p>
      <div className="rounded-lg border border-border p-3 space-y-2 bg-card">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">BPM</span>
          <span className="font-bold tabular-nums">{audio.bpm}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Duration</span>
          <span className="font-medium">{Math.floor(audio.duration / 60)}:{String(audio.duration % 60).padStart(2, '0')}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Beat Markers</span>
          <span className="font-medium">{audio.beatMarkers?.length ?? 0}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Title</span>
          <span className="font-medium truncate max-w-[60%]">{audio.title}</span>
        </div>
      </div>
    </div>
  )
}

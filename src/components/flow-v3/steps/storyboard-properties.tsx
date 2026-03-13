'use client'

import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MockScene } from '@/lib/mock/types'

interface StoryboardPropertiesProps {
  scene: MockScene
  sceneIndex: number
  timestamp: string
  onClose: () => void
}

function PropRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[9px] uppercase tracking-wide text-muted-foreground font-semibold">{label}</p>
      <p className="text-[11px] text-foreground bg-muted/60 rounded-md px-2.5 py-1.5 leading-relaxed">{value}</p>
    </div>
  )
}

export function StoryboardProperties({ scene, sceneIndex, timestamp, onClose }: StoryboardPropertiesProps) {
  return (
    <div className="flex flex-col h-full bg-card border-l border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border shrink-0">
        <div>
          <span className="text-[11px] font-semibold text-foreground">Scene {sceneIndex + 1}</span>
          <span className="ml-2 text-[9px] font-mono text-muted-foreground">{timestamp}</span>
        </div>
        <button
          onClick={onClose}
          className="flex h-5 w-5 items-center justify-center rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {/* Properties list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {/* Thumbnail preview */}
        <div className="aspect-video rounded-lg overflow-hidden bg-muted">
          <img
            src={scene.thumbnailUrl}
            alt={`Scene ${sceneIndex + 1}`}
            className="w-full h-full object-cover"
          />
        </div>

        <PropRow label="Subject" value={scene.subject} />
        <PropRow label="Action" value={scene.action} />
        <PropRow label="Environment" value={scene.environment} />
        <PropRow label="Camera Angle" value={scene.cameraAngle} />
        <PropRow label="Camera Movement" value={scene.cameraMovement} />
        <PropRow label="Duration" value={`${scene.duration}s`} />

        {/* Prompt */}
        <div className="space-y-0.5">
          <p className="text-[9px] uppercase tracking-wide text-muted-foreground font-semibold">Full Prompt</p>
          <p className="text-[10px] text-muted-foreground bg-muted/60 rounded-md px-2.5 py-2 leading-relaxed font-mono">
            {scene.prompt}
          </p>
        </div>

        {/* Takes gallery */}
        {scene.takes.length > 0 && (
          <div className="space-y-1">
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground font-semibold">
              Takes ({scene.takes.length})
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {scene.takes.map((take, ti) => (
                <div
                  key={take.id}
                  className={cn(
                    'aspect-video rounded-md overflow-hidden border-2 transition-all cursor-pointer',
                    take.selected
                      ? 'border-primary'
                      : 'border-border/40 opacity-70 hover:opacity-100',
                  )}
                >
                  <img src={take.thumbnailUrl} alt={`Take ${ti + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {scene.takes.length === 0 && (
          <div className="rounded-md bg-muted/40 px-2.5 py-2 text-center">
            <p className="text-[10px] text-muted-foreground">No takes yet — generate to see options</p>
          </div>
        )}
      </div>
    </div>
  )
}

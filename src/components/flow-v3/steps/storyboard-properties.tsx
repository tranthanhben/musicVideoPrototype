'use client'

import { useState, useEffect } from 'react'
import { X, RefreshCw, Maximize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MockScene } from '@/lib/mock/types'

interface StoryboardPropertiesProps {
  scene: MockScene
  sceneIndex: number
  timestamp: string
  onClose: () => void
  onUpdate?: (sceneId: string, updates: Partial<MockScene>) => void
  onOpenEditModal?: (scene: MockScene) => void
}

function EditablePropRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-[9px] uppercase tracking-wide text-muted-foreground font-semibold">{label}</p>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-[11px] text-foreground bg-muted/60 rounded-md px-2.5 py-1.5 leading-relaxed border border-transparent focus:border-primary/40 focus:outline-none transition-colors"
      />
    </div>
  )
}

export function StoryboardProperties({ scene, sceneIndex, timestamp, onClose, onUpdate, onOpenEditModal }: StoryboardPropertiesProps) {
  const [subject, setSubject] = useState(scene.subject)
  const [action, setAction] = useState(scene.action)
  const [environment, setEnvironment] = useState(scene.environment)
  const [cameraAngle, setCameraAngle] = useState(scene.cameraAngle)
  const [cameraMovement, setCameraMovement] = useState(scene.cameraMovement)

  // Sync when scene changes
  useEffect(() => {
    setSubject(scene.subject)
    setAction(scene.action)
    setEnvironment(scene.environment)
    setCameraAngle(scene.cameraAngle)
    setCameraMovement(scene.cameraMovement)
  }, [scene.id, scene.subject, scene.action, scene.environment, scene.cameraAngle, scene.cameraMovement])

  const hasChanges =
    subject !== scene.subject ||
    action !== scene.action ||
    environment !== scene.environment ||
    cameraAngle !== scene.cameraAngle ||
    cameraMovement !== scene.cameraMovement

  const handleRegen = () => {
    if (onUpdate) {
      onUpdate(scene.id, { subject, action, environment, cameraAngle, cameraMovement })
    }
  }

  return (
    <div className="flex flex-col h-full bg-card border-l border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border shrink-0">
        <div>
          <span className="text-[11px] font-semibold text-foreground">Scene {sceneIndex + 1}</span>
          <span className="ml-2 text-[9px] font-mono text-muted-foreground">{timestamp}</span>
        </div>
        <div className="flex items-center gap-1">
          {onOpenEditModal && (
            <button
              onClick={() => onOpenEditModal(scene)}
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Open full editor"
            >
              <Maximize2 className="h-2.5 w-2.5" /> Edit
            </button>
          )}
          <button onClick={onClose} className="flex h-5 w-5 items-center justify-center rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground cursor-pointer">
            <X className="h-3 w-3" />
          </button>
        </div>
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

        <EditablePropRow label="Subject" value={subject} onChange={setSubject} />
        <EditablePropRow label="Action" value={action} onChange={setAction} />
        <EditablePropRow label="Environment" value={environment} onChange={setEnvironment} />
        <EditablePropRow label="Camera Angle" value={cameraAngle} onChange={setCameraAngle} />
        <EditablePropRow label="Camera Movement" value={cameraMovement} onChange={setCameraMovement} />

        <div className="space-y-0.5">
          <p className="text-[9px] uppercase tracking-wide text-muted-foreground font-semibold">Duration</p>
          <p className="text-[11px] text-foreground bg-muted/60 rounded-md px-2.5 py-1.5 leading-relaxed">{scene.duration}s</p>
        </div>

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

      {/* Regen button — sticky at bottom */}
      <div className="shrink-0 p-3 border-t border-border">
        <button
          onClick={handleRegen}
          disabled={!hasChanges}
          className={cn(
            'w-full flex items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-semibold transition-all cursor-pointer',
            hasChanges
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-muted text-muted-foreground cursor-not-allowed',
          )}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {hasChanges ? 'Regen Image' : 'Edit properties to regen'}
        </button>
      </div>
    </div>
  )
}

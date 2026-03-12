'use client'

import { useState } from 'react'
import type { MockScene, MockTake } from '@/lib/mock/types'
import { simulateGeneration } from '@/lib/utils/generation-simulator'

interface SceneCardFlipProps {
  scene: MockScene
  isFlipped: boolean
  onFlip: () => void
  onUpdate: (updates: Partial<MockScene>) => void
}

function formatDuration(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`
}

export function SceneCardFlip({ scene, isFlipped, onFlip, onUpdate }: SceneCardFlipProps) {
  const [subject, setSubject] = useState(scene.subject)
  const [action, setAction] = useState(scene.action)
  const [environment, setEnvironment] = useState(scene.environment)
  const [cameraAngle, setCameraAngle] = useState(scene.cameraAngle)
  const [cameraMovement, setCameraMovement] = useState(scene.cameraMovement)
  const [generating, setGenerating] = useState(false)
  const [genProgress, setGenProgress] = useState(0)

  async function handleGenerate(e: React.MouseEvent) {
    e.stopPropagation()
    if (generating) return
    setGenerating(true)
    setGenProgress(0)
    await simulateGeneration(2000, (p) => setGenProgress(p))
    const newTake: MockTake = {
      id: `${scene.id}-take-${Date.now()}`,
      thumbnailUrl: scene.thumbnailUrl,
      selected: false,
    }
    onUpdate({
      subject,
      action,
      environment,
      cameraAngle,
      cameraMovement,
      takes: [...scene.takes, newTake],
    })
    setGenerating(false)
    setGenProgress(0)
  }

  function handleFlipBack(e: React.MouseEvent) {
    e.stopPropagation()
    onFlip()
  }

  return (
    <div
      className="shrink-0"
      style={{ width: 280, height: 360, perspective: '1000px' }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* FRONT */}
        <div
          onClick={onFlip}
          className="absolute inset-0 rounded-lg overflow-hidden border border-border cursor-pointer group bg-card"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {/* Thumbnail */}
          <div className="relative aspect-video overflow-hidden">
            <img
              src={scene.thumbnailUrl}
              alt={`Scene ${scene.index + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            {/* Scene number badge */}
            <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{scene.index + 1}</span>
            </div>

            {/* Duration tag */}
            <div
              className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-xs"
              style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
            >
              {formatDuration(scene.duration)}
            </div>
          </div>

          {/* Card body */}
          <div className="p-4 flex flex-col gap-2">
            <p className="text-xs text-amber-500 uppercase tracking-wide font-semibold">
              Scene {scene.index + 1}
            </p>
            <p className="text-sm text-foreground leading-snug line-clamp-2">
              {scene.prompt}
            </p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span>{scene.cameraAngle}</span>
              <span>·</span>
              <span>{scene.cameraMovement}</span>
            </p>
            <div className="mt-2 flex items-center gap-1.5">
              <div className="h-1 flex-1 rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-amber-600"
                  style={{ width: `${Math.min(100, scene.takes.length * 33)}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{scene.takes.length} takes</span>
            </div>
            <p className="text-xs text-muted-foreground mt-auto text-center">Click to edit</p>
          </div>
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 rounded-lg overflow-hidden border border-amber-600/50 bg-card"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="h-full flex flex-col p-4 gap-2 overflow-y-auto">
            <p
              className="text-sm font-bold text-amber-500 mb-1"
              style={{ fontFamily: 'var(--font-playfair-display, serif)' }}
            >
              Scene {scene.index + 1} — Edit
            </p>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Subject</span>
              <textarea
                rows={2}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded bg-muted border border-border text-foreground text-xs px-2 py-1.5 resize-none focus:outline-none focus:border-amber-500"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Action</span>
              <textarea
                rows={2}
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="w-full rounded bg-muted border border-border text-foreground text-xs px-2 py-1.5 resize-none focus:outline-none focus:border-amber-500"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Environment</span>
              <textarea
                rows={2}
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="w-full rounded bg-muted border border-border text-foreground text-xs px-2 py-1.5 resize-none focus:outline-none focus:border-amber-500"
              />
            </label>

            <div className="flex gap-2">
              <label className="flex flex-col gap-1 flex-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Angle</span>
                <input
                  value={cameraAngle}
                  onChange={(e) => setCameraAngle(e.target.value)}
                  className="w-full rounded bg-muted border border-border text-foreground text-xs px-2 py-1.5 focus:outline-none focus:border-amber-500"
                />
              </label>
              <label className="flex flex-col gap-1 flex-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Movement</span>
                <input
                  value={cameraMovement}
                  onChange={(e) => setCameraMovement(e.target.value)}
                  className="w-full rounded bg-muted border border-border text-foreground text-xs px-2 py-1.5 focus:outline-none focus:border-amber-500"
                />
              </label>
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="mt-2 w-full py-2 rounded bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-white text-xs font-semibold transition-colors"
            >
              {generating ? `Generating… ${genProgress}%` : 'Generate Take'}
            </button>

            <button
              onClick={handleFlipBack}
              className="text-xs text-muted-foreground hover:text-foreground/80 transition-colors text-center mt-0.5"
            >
              ← Flip Back
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

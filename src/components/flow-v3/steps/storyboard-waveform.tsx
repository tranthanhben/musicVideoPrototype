'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MockAudio, MockScene } from '@/lib/mock/types'

// ─── Types ──────────────────────────────────────────────────

interface SceneTimeRange {
  sceneId: string
  index: number
  audioStart: number
  audioEnd: number
}

interface StoryboardWaveformProps {
  audio: MockAudio
  scenes: (MockScene & { isNew?: boolean })[]
  highlightedSceneId: string | null
  onSceneClick: (sceneId: string) => void
  onResizeScenes?: (leftIndex: number, rightIndex: number, leftDuration: number, rightDuration: number) => void
  lipsyncSceneIds?: Set<string>
}

// ─── Utils ──────────────────────────────────────────────────

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${String(Math.floor(s) % 60).padStart(2, '0')}`
}

export function computeSceneTimeRanges(
  scenes: { id: string; duration: number }[],
  audioDuration: number,
): SceneTimeRange[] {
  const total = scenes.reduce((sum, s) => sum + s.duration, 0)
  if (total === 0) return []
  let elapsed = 0
  return scenes.map((scene, i) => {
    const start = (elapsed / total) * audioDuration
    elapsed += scene.duration
    const end = (elapsed / total) * audioDuration
    return { sceneId: scene.id, index: i, audioStart: start, audioEnd: end }
  })
}

// ─── Component ──────────────────────────────────────────────

const SVG_W = 800
const SVG_H = 60
const BAR_COUNT = 160

export function StoryboardWaveform({ audio, scenes, highlightedSceneId, onSceneClick, onResizeScenes, lipsyncSceneIds }: StoryboardWaveformProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [hoveredSceneId, setHoveredSceneId] = useState<string | null>(null)
  const rafRef = useRef<number | null>(null)
  const prevTsRef = useRef<number | null>(null)
  const svgContainerRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const dragBoundaryRef = useRef<{ index: number } | null>(null)

  const sceneRanges = useMemo(
    () => computeSceneTimeRanges(scenes, audio.duration),
    [scenes, audio.duration],
  )

  const peaks = useMemo(
    () => audio.energyCurve.filter((p) => p.isPeak),
    [audio.energyCurve],
  )

  // Playback loop
  useEffect(() => {
    if (!isPlaying) {
      prevTsRef.current = null
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }
    const tick = (ts: number) => {
      if (prevTsRef.current === null) prevTsRef.current = ts
      const dt = (ts - prevTsRef.current) / 1000
      prevTsRef.current = ts
      setCurrentTime((t) => {
        const next = t + dt
        if (next >= audio.duration) {
          setIsPlaying(false)
          return audio.duration
        }
        return next
      })
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isPlaying, audio.duration])

  const togglePlay = useCallback(() => {
    if (currentTime >= audio.duration) setCurrentTime(0)
    setIsPlaying((p) => !p)
  }, [currentTime, audio.duration])

  // Click on waveform to seek
  const handleSvgClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const ratio = x / rect.width
      const time = ratio * audio.duration
      setCurrentTime(Math.max(0, Math.min(time, audio.duration)))
      // Find which scene this falls in
      const range = sceneRanges.find((r) => time >= r.audioStart && time < r.audioEnd)
      if (range) onSceneClick(range.sceneId)
    },
    [audio.duration, sceneRanges, onSceneClick],
  )

  // ── Boundary drag to resize scenes ────────────────────────
  const handleBoundaryMouseDown = useCallback((e: React.MouseEvent, leftIndex: number) => {
    e.stopPropagation()
    e.preventDefault()
    dragBoundaryRef.current = { index: leftIndex }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const drag = dragBoundaryRef.current
      if (!drag || !stripRef.current || !onResizeScenes) return
      const rect = stripRef.current.getBoundingClientRect()
      const mouseRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      const mouseTime = mouseRatio * audio.duration
      const leftRange = sceneRanges[drag.index]
      const rightRange = sceneRanges[drag.index + 1]
      if (!leftRange || !rightRange) return
      const totalSceneDuration = scenes.reduce((sum, s) => sum + s.duration, 0)
      const minAudioSpan = 0.3
      const clampedTime = Math.max(
        leftRange.audioStart + minAudioSpan,
        Math.min(mouseTime, rightRange.audioEnd - minAudioSpan),
      )
      const newLeftDuration = ((clampedTime - leftRange.audioStart) / audio.duration) * totalSceneDuration
      const newRightDuration = ((rightRange.audioEnd - clampedTime) / audio.duration) * totalSceneDuration
      onResizeScenes(drag.index, drag.index + 1, Math.max(0.5, newLeftDuration), Math.max(0.5, newRightDuration))
    }
    const handleMouseUp = () => {
      if (dragBoundaryRef.current) {
        dragBoundaryRef.current = null
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [audio.duration, sceneRanges, scenes, onResizeScenes])

  // Current scene from playhead
  const currentSceneId = sceneRanges.find(
    (r) => currentTime >= r.audioStart && currentTime < r.audioEnd,
  )?.sceneId ?? null

  const playheadX = (currentTime / audio.duration) * SVG_W

  return (
    <div className="rounded-xl border border-border bg-card p-3 space-y-2">
      {/* Transport controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer shrink-0"
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
        </button>
        <span className="text-[11px] font-mono text-muted-foreground tabular-nums">
          {fmt(currentTime)} <span className="text-muted-foreground/40">/</span> {fmt(audio.duration)}
        </span>
        <p className="text-[10px] text-white/40 font-medium truncate ml-auto">
          &quot;{audio.title}&quot; — {audio.artist}
        </p>
      </div>

      {/* Waveform SVG */}
      <div
        ref={svgContainerRef}
        className="relative cursor-pointer"
        onClick={handleSvgClick}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const ratio = (e.clientX - rect.left) / rect.width
          const time = ratio * audio.duration
          const range = sceneRanges.find((r) => time >= r.audioStart && time < r.audioEnd)
          setHoveredSceneId(range?.sceneId ?? null)
        }}
        onMouseLeave={() => setHoveredSceneId(null)}
      >
        <svg
          width="100%"
          height="60"
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          preserveAspectRatio="none"
          className="block"
        >
          {/* Scene background regions */}
          {sceneRanges.map((range) => {
            const x1 = (range.audioStart / audio.duration) * SVG_W
            const x2 = (range.audioEnd / audio.duration) * SVG_W
            const isHovered = hoveredSceneId === range.sceneId
            const isHighlighted = highlightedSceneId === range.sceneId
            const isCurrent = currentSceneId === range.sceneId
            return (
              <rect
                key={`bg-${range.sceneId}`}
                x={x1}
                y={0}
                width={x2 - x1}
                height={SVG_H}
                fill={isHighlighted || isHovered ? 'rgba(124,58,237,0.15)' : isCurrent ? 'rgba(255,255,255,0.03)' : 'transparent'}
                className="transition-all duration-200"
              />
            )
          })}

          {/* Waveform bars */}
          {Array.from({ length: BAR_COUNT }).map((_, i) => {
            const x = (i / BAR_COUNT) * SVG_W
            const time = (i / BAR_COUNT) * audio.duration
            const idx = Math.floor((i / BAR_COUNT) * audio.energyCurve.length)
            const e = audio.energyCurve[Math.min(idx, audio.energyCurve.length - 1)]?.energy ?? 0.3
            const seed = Math.sin(i * 12.9898 + 78.233) * 43758.5453
            const rand = seed - Math.floor(seed)
            const h = Math.max((e * 0.7 + rand * 0.3) * 40, 3)
            const seg = audio.segments.find((s) => time >= s.startTime && time < s.endTime) ?? audio.segments[audio.segments.length - 1]
            const pastPlayhead = time <= currentTime
            return (
              <rect
                key={`w-${i}`}
                x={x}
                y={30 - h / 2}
                width={SVG_W / BAR_COUNT * 0.65}
                height={h}
                rx={1}
                fill={seg.color}
                opacity={pastPlayhead ? 0.7 : 0.3}
                className="transition-opacity duration-100"
              />
            )
          })}

          {/* Energy curve */}
          <polyline
            fill="none"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={audio.energyCurve
              .map((p) => `${(p.time / audio.duration) * SVG_W},${50 - p.energy * 44}`)
              .join(' ')}
          />

          {/* Peak dots */}
          {peaks.map((p, i) => (
            <circle
              key={`pk-${i}`}
              cx={(p.time / audio.duration) * SVG_W}
              cy={50 - p.energy * 44}
              r="2"
              fill="#EF4444"
              opacity={0.7}
            />
          ))}

          {/* Scene boundary lines */}
          {sceneRanges.slice(1).map((range) => {
            const x = (range.audioStart / audio.duration) * SVG_W
            return (
              <line
                key={`bnd-${range.sceneId}`}
                x1={x}
                y1={0}
                x2={x}
                y2={SVG_H}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="0.8"
                strokeDasharray="2,2"
              />
            )
          })}

          {/* Playhead */}
          {currentTime > 0 && (
            <line
              x1={playheadX}
              y1={0}
              x2={playheadX}
              y2={SVG_H}
              stroke="#7C3AED"
              strokeWidth="1.5"
            />
          )}
        </svg>
      </div>

      {/* Scene thumbnail strip — drag boundaries to resize */}
      <div ref={stripRef} className="relative flex">
        {sceneRanges.map((range) => {
          const width = ((range.audioEnd - range.audioStart) / audio.duration) * 100
          const scene = scenes[range.index]
          const isHovered = hoveredSceneId === range.sceneId
          const isHighlighted = highlightedSceneId === range.sceneId
          const isCurrent = currentSceneId === range.sceneId
          const isLipsync = lipsyncSceneIds?.has(range.sceneId)
          return (
            <button
              key={`strip-${range.sceneId}`}
              onClick={() => onSceneClick(range.sceneId)}
              className={cn(
                'relative h-10 min-w-0 overflow-hidden transition-all cursor-pointer shrink-0',
                isHighlighted ? 'ring-1 ring-primary brightness-125' : isHovered ? 'brightness-125' : isCurrent ? 'brightness-110' : 'brightness-75 hover:brightness-100',
              )}
              style={{ width: `${width}%` }}
            >
              <img
                src={scene?.thumbnailUrl}
                alt={`S${range.index + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-0.5">
                <span className="text-[7px] font-bold text-white/90 drop-shadow-sm">
                  S{range.index + 1}
                </span>
              </div>
              {/* Lipsync indicator */}
              {isLipsync && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-emerald-400/80" />
              )}
            </button>
          )
        })}
        {/* Drag handles at scene boundaries */}
        {sceneRanges.slice(0, -1).map((range) => {
          const leftPercent = (range.audioEnd / audio.duration) * 100
          return (
            <div
              key={`resize-${range.sceneId}`}
              className="absolute top-0 bottom-0 z-10 cursor-col-resize group/resize"
              style={{ left: `${leftPercent}%`, width: '8px', transform: 'translateX(-50%)' }}
              onMouseDown={(e) => handleBoundaryMouseDown(e, range.index)}
            >
              <div className="w-0.5 h-full mx-auto bg-white/20 group-hover/resize:bg-white/60 group-hover/resize:shadow-[0_0_4px_rgba(255,255,255,0.3)] transition-all" />
            </div>
          )
        })}
      </div>

      {/* Time markers */}
      <div className="flex justify-between text-[8px] text-muted-foreground/50 px-0.5">
        <span>0:00</span>
        <span>{fmt(audio.duration / 4)}</span>
        <span>{fmt(audio.duration / 2)}</span>
        <span>{fmt((audio.duration * 3) / 4)}</span>
        <span>{fmt(audio.duration)}</span>
      </div>
    </div>
  )
}

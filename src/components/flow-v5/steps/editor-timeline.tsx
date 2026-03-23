'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MockScene, MockAudio } from '@/lib/mock/types'

// ─── Types ──────────────────────────────────────────────────

interface EditorTimelineProps {
  scenes: MockScene[]
  audio: MockAudio
  activeSceneId: string
  onSceneClick: (sceneId: string) => void
  onPlayStateChange?: (isPlaying: boolean) => void
  onTimeChange?: (time: number) => void
  /** Controlled playing state — when provided, overrides internal state */
  playing?: boolean
  onTogglePlay?: () => void
  draggable?: boolean
  onSceneDragStart?: (sceneIndex: number) => void
  onSceneDragOver?: (e: React.DragEvent, sceneIndex: number) => void
  onSceneDrop?: (sceneIndex: number) => void
  onSceneDragEnd?: () => void
  draggedIdx?: number | null
  dragOverIdx?: number | null
  sceneStatuses?: Record<string, 'pending' | 'rendering' | 'done'>
}

interface TimeRange {
  sceneId: string
  audioStart: number
  audioEnd: number
}

// ─── Utils ──────────────────────────────────────────────────

function formatTimecode(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const frames = Math.floor((seconds % 1) * 25)
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(frames).padStart(2, '0')}`
}

function formatTimeShort(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

function computeSceneTimeRanges(scenes: MockScene[], audioDuration: number): TimeRange[] {
  const total = scenes.reduce((sum, s) => sum + s.duration, 0)
  let elapsed = 0
  return scenes.map((scene) => {
    const start = (elapsed / total) * audioDuration
    elapsed += scene.duration
    const end = (elapsed / total) * audioDuration
    return { sceneId: scene.id, audioStart: start, audioEnd: end }
  })
}

// ─── Waveform bars generation ───────────────────────────────

function generateWaveformBars(count: number): number[] {
  const bars: number[] = []
  for (let i = 0; i < count; i++) {
    const t = i / count
    // Create a more organic waveform pattern
    const base = 0.15
    const wave1 = Math.sin(t * Math.PI * 8) * 0.25
    const wave2 = Math.sin(t * Math.PI * 16 + 1.3) * 0.15
    const wave3 = Math.sin(t * Math.PI * 3) * 0.2
    const noise = (Math.random() - 0.5) * 0.15
    bars.push(Math.max(0.05, Math.min(1, base + wave1 + wave2 + wave3 + noise)))
  }
  return bars
}

const WAVEFORM_BARS = generateWaveformBars(200)

// ─── Component ──────────────────────────────────────────────

export function EditorTimeline({
  scenes,
  audio,
  activeSceneId,
  onSceneClick,
  onPlayStateChange,
  onTimeChange,
  playing: controlledPlaying,
  onTogglePlay,
  draggable,
  onSceneDragStart,
  onSceneDragOver,
  onSceneDrop,
  onSceneDragEnd,
  draggedIdx,
  dragOverIdx,
  sceneStatuses,
}: EditorTimelineProps) {
  const [internalPlaying, setInternalPlaying] = useState(false)
  const isControlled = controlledPlaying !== undefined
  const isPlaying = isControlled ? controlledPlaying : internalPlaying
  const [currentTime, setCurrentTime] = useState(0)
  const [zoom, setZoom] = useState(100)
  const timelineRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const lastFrameRef = useRef<number>(0)

  const duration = audio.duration
  const timeRanges = computeSceneTimeRanges(scenes, duration)

  // Playback loop
  useEffect(() => {
    if (isPlaying) {
      lastFrameRef.current = performance.now()
      const tick = (now: number) => {
        const delta = (now - lastFrameRef.current) / 1000
        lastFrameRef.current = now
        setCurrentTime((prev) => {
          const next = prev + delta
          if (next >= duration) {
            if (isControlled) {
              onTogglePlay?.()
            } else {
              setInternalPlaying(false)
            }
            onPlayStateChange?.(false)
            return 0
          }
          return next
        })
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isPlaying, duration, onPlayStateChange, isControlled, onTogglePlay])

  useEffect(() => {
    onTimeChange?.(currentTime)
  }, [currentTime, onTimeChange])

  const togglePlay = useCallback(() => {
    if (isControlled) {
      onTogglePlay?.()
    } else {
      setInternalPlaying((p) => {
        const next = !p
        onPlayStateChange?.(next)
        return next
      })
    }
  }, [isControlled, onTogglePlay, onPlayStateChange])

  const skipBackward = useCallback(() => {
    setCurrentTime((prev) => Math.max(0, prev - 5))
  }, [])

  const skipForward = useCallback(() => {
    setCurrentTime((prev) => Math.min(duration, prev + 5))
  }, [duration])

  const skipToStart = useCallback(() => {
    setCurrentTime(0)
  }, [])

  const skipToEnd = useCallback(() => {
    setCurrentTime(duration)
  }, [duration])

  const handleTimelineClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      setCurrentTime(ratio * duration)
    },
    [duration],
  )

  // Find which scene is at current time
  const currentSceneRange = timeRanges.find(
    (r) => currentTime >= r.audioStart && currentTime < r.audioEnd,
  )

  // Generate time ruler markers
  const markerInterval = duration <= 30 ? 5 : duration <= 120 ? 15 : 30
  const markers: number[] = []
  for (let t = 0; t <= duration; t += markerInterval) {
    markers.push(t)
  }

  const playheadPct = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="flex flex-col bg-zinc-950 border-t border-white/[0.08]">
      {/* Transport controls bar */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-white/[0.08]">
        {/* Left: Timecode */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-zinc-300 tabular-nums tracking-wider bg-black/40 rounded px-2 py-0.5">
            {formatTimecode(currentTime)}
          </span>
        </div>

        {/* Center: Transport buttons */}
        <div className="flex items-center gap-1">
          <button onClick={skipToStart} className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">
            <SkipBack className="h-3.5 w-3.5" />
          </button>
          <button onClick={skipBackward} className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={togglePlay}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full transition-colors cursor-pointer',
              isPlaying ? 'bg-white/10 text-white' : 'bg-white/10 text-white hover:bg-white/15',
            )}
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
          </button>
          <button onClick={skipForward} className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <button onClick={skipToEnd} className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">
            <SkipForward className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Right: Zoom */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-zinc-500">{zoom}%</span>
          <input
            type="range"
            min={50}
            max={200}
            value={zoom}
            onChange={(e) => setZoom(parseInt(e.target.value))}
            className="w-20 h-1 appearance-none bg-zinc-700 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-zinc-400"
          />
        </div>
      </div>

      {/* Time ruler */}
      <div className="relative h-5 border-b border-white/[0.08] bg-zinc-900/50" onClick={handleTimelineClick}>
        {markers.map((t) => (
          <div
            key={t}
            className="absolute top-0 flex flex-col items-center"
            style={{ left: `${(t / duration) * 100}%` }}
          >
            <div className="h-2 w-px bg-zinc-700" />
            <span className="text-[8px] font-mono text-zinc-600 mt-0.5">{formatTimeShort(t)}</span>
          </div>
        ))}
        {/* Playhead on ruler */}
        <div
          className="absolute top-0 bottom-0 w-px bg-white z-10"
          style={{ left: `${playheadPct}%` }}
        />
      </div>

      {/* Track lanes */}
      <div className="relative flex flex-col" ref={timelineRef}>
        {/* Main track */}
        <div className="flex items-center h-14 border-b border-white/[0.08]">
          <div className="w-24 shrink-0 flex items-center px-3">
            <span className="text-[10px] font-medium text-zinc-400">Main</span>
          </div>
          <div className="flex-1 relative h-full bg-zinc-900/30" onClick={handleTimelineClick}>
            {timeRanges.map((range) => {
              const leftPct = (range.audioStart / duration) * 100
              const widthPct = ((range.audioEnd - range.audioStart) / duration) * 100
              const scene = scenes.find((s) => s.id === range.sceneId)
              const sceneIdx = scenes.findIndex((s) => s.id === range.sceneId)
              const isActive = range.sceneId === activeSceneId
              const isDragged = draggable && draggedIdx === sceneIdx
              const isDragOver = draggable && dragOverIdx === sceneIdx
              const status = sceneStatuses?.[range.sceneId]
              return (
                <div
                  key={range.sceneId}
                  draggable={draggable}
                  onDragStart={draggable ? () => onSceneDragStart?.(sceneIdx) : undefined}
                  onDragOver={draggable ? (e) => { e.preventDefault(); onSceneDragOver?.(e, sceneIdx) } : undefined}
                  onDrop={draggable ? () => onSceneDrop?.(sceneIdx) : undefined}
                  onDragEnd={draggable ? () => onSceneDragEnd?.() : undefined}
                  className={cn(
                    'absolute top-1.5 bottom-1.5 rounded-md overflow-hidden cursor-pointer transition-all',
                    isActive
                      ? 'ring-2 ring-primary z-[5]'
                      : 'ring-1 ring-white/10 hover:ring-white/20',
                    isDragged && 'opacity-40',
                    isDragOver && 'ring-2 ring-primary/80 z-[5]',
                  )}
                  style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onSceneClick(range.sceneId)
                  }}
                >
                  {scene && (
                    <img
                      src={scene.thumbnailUrl}
                      alt=""
                      className={cn(
                        'absolute inset-0 w-full h-full object-cover opacity-50',
                        status === 'pending' && 'opacity-20 grayscale',
                        status === 'rendering' && 'opacity-30',
                      )}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
                  <div className="relative z-10 flex items-center gap-1 px-1.5 py-0.5">
                    <span className="text-[9px] font-mono font-medium text-white/80">S{sceneIdx + 1}</span>
                    {scene && (
                      <span className="text-[8px] text-white/50 truncate">{scene.subject}</span>
                    )}
                  </div>
                  {/* Generation status overlay */}
                  {status === 'rendering' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                    </div>
                  )}
                  {status === 'pending' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40" />
                  )}
                </div>
              )
            })}
            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 w-px bg-white z-10 pointer-events-none"
              style={{ left: `${playheadPct}%` }}
            />
          </div>
        </div>

        {/* Music track */}
        <div className="flex items-center h-10">
          <div className="w-24 shrink-0 flex items-center px-3">
            <span className="text-[10px] font-medium text-zinc-500">Music</span>
          </div>
          <div className="flex-1 relative h-full bg-zinc-900/30" onClick={handleTimelineClick}>
            {/* Waveform visualization */}
            <div className="absolute inset-x-0 top-1 bottom-1 flex items-end gap-px px-0.5 rounded-md overflow-hidden bg-zinc-900/50 ring-1 ring-white/5">
              {WAVEFORM_BARS.map((height, i) => {
                const barPct = (i / WAVEFORM_BARS.length) * 100
                const isBeforePlayhead = barPct <= playheadPct
                // Color based on audio segments
                const barTime = (i / WAVEFORM_BARS.length) * duration
                const segment = audio.segments.find((seg) => barTime >= seg.startTime && barTime < seg.endTime)
                const segColor = segment?.color ?? '#3f3f46'

                return (
                  <div
                    key={i}
                    className="flex-1 rounded-sm transition-colors"
                    style={{
                      height: `${height * 100}%`,
                      backgroundColor: isBeforePlayhead ? segColor : `${segColor}44`,
                      minWidth: 1,
                    }}
                  />
                )
              })}
            </div>
            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 w-px bg-white z-10 pointer-events-none"
              style={{ left: `${playheadPct}%` }}
            />
          </div>
        </div>

        {/* Global playhead line across all tracks */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white z-20 pointer-events-none"
          style={{ left: `calc(96px + (100% - 96px) * ${playheadPct / 100})` }}
        />
      </div>
    </div>
  )
}

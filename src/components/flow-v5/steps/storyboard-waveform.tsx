'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight, LayoutGrid, Maximize2 } from 'lucide-react'
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
  /** When provided, waveform uses this time instead of its own internal playback */
  externalTime?: number
  /** When provided, waveform reflects this playing state instead of its own */
  externalPlaying?: boolean
  /** Called when user clicks play/pause in external mode — parent controls playback */
  onExternalTogglePlay?: () => void
  /** Called when user seeks on the timeline in external mode */
  onExternalSeek?: (time: number) => void
  /** View mode toggle */
  viewMode?: 'timeline' | 'spotlight'
  onViewModeChange?: (mode: 'timeline' | 'spotlight') => void
}

// ─── Utils ──────────────────────────────────────────────────

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${String(Math.floor(s) % 60).padStart(2, '0')}`
}

function formatTimecode(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const frames = Math.floor((seconds % 1) * 25)
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(frames).padStart(2, '0')}`
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

// ─── Waveform bars generation ───────────────────────────────

function generateWaveformBars(count: number): number[] {
  const bars: number[] = []
  for (let i = 0; i < count; i++) {
    const t = i / count
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

export function StoryboardWaveform({ audio, scenes, highlightedSceneId, onSceneClick, onResizeScenes, lipsyncSceneIds, externalTime, externalPlaying, onExternalTogglePlay, onExternalSeek, viewMode, onViewModeChange }: StoryboardWaveformProps) {
  const isExternallyControlled = externalTime !== undefined
  const [_internalPlaying, _setInternalPlaying] = useState(false)
  const [_internalTime, _setInternalTime] = useState(0)
  const isPlaying = isExternallyControlled ? (externalPlaying ?? false) : _internalPlaying
  const setIsPlaying = isExternallyControlled ? (() => {}) : _setInternalPlaying
  const currentTime = isExternallyControlled ? externalTime : _internalTime
  const setCurrentTime = isExternallyControlled ? (() => {}) : _setInternalTime
  const rafRef = useRef<number | null>(null)
  const prevTsRef = useRef<number | null>(null)
  const mainTrackRef = useRef<HTMLDivElement>(null)
  const dragBoundaryRef = useRef<{ index: number } | null>(null)

  const duration = audio.duration

  const sceneRanges = useMemo(
    () => computeSceneTimeRanges(scenes, duration),
    [scenes, duration],
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
        if (next >= duration) {
          setIsPlaying(false)
          return duration
        }
        return next
      })
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isPlaying, duration])

  const togglePlay = useCallback(() => {
    if (isExternallyControlled) {
      onExternalTogglePlay?.()
      return
    }
    if (currentTime >= duration) setCurrentTime(0)
    setIsPlaying((p: boolean) => !p)
  }, [isExternallyControlled, onExternalTogglePlay, currentTime, duration, setCurrentTime, setIsPlaying])

  const seekTo = useCallback((time: number) => {
    if (isExternallyControlled) {
      onExternalSeek?.(time)
    } else {
      setCurrentTime(time)
    }
  }, [isExternallyControlled, onExternalSeek, setCurrentTime])

  const skipBackward = useCallback(() => {
    seekTo(Math.max(0, currentTime - 5))
  }, [seekTo, currentTime])

  const skipForward = useCallback(() => {
    seekTo(Math.min(duration, currentTime + 5))
  }, [seekTo, currentTime, duration])

  const skipToStart = useCallback(() => {
    seekTo(0)
  }, [seekTo])

  const skipToEnd = useCallback(() => {
    seekTo(duration)
  }, [seekTo, duration])

  const handleTimelineClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      const time = ratio * duration
      seekTo(time)
      const range = sceneRanges.find((r) => time >= r.audioStart && time < r.audioEnd)
      if (range) onSceneClick(range.sceneId)
    },
    [duration, sceneRanges, onSceneClick, seekTo],
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
      if (!drag || !mainTrackRef.current || !onResizeScenes) return
      const rect = mainTrackRef.current.getBoundingClientRect()
      const mouseRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      const mouseTime = mouseRatio * duration
      const leftRange = sceneRanges[drag.index]
      const rightRange = sceneRanges[drag.index + 1]
      if (!leftRange || !rightRange) return
      const totalSceneDuration = scenes.reduce((sum, s) => sum + s.duration, 0)
      const minAudioSpan = 0.3
      const clampedTime = Math.max(
        leftRange.audioStart + minAudioSpan,
        Math.min(mouseTime, rightRange.audioEnd - minAudioSpan),
      )
      const newLeftDuration = ((clampedTime - leftRange.audioStart) / duration) * totalSceneDuration
      const newRightDuration = ((rightRange.audioEnd - clampedTime) / duration) * totalSceneDuration
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
  }, [duration, sceneRanges, scenes, onResizeScenes])

  const currentSceneId = sceneRanges.find(
    (r) => currentTime >= r.audioStart && currentTime < r.audioEnd,
  )?.sceneId ?? null

  const playheadPct = duration > 0 ? (currentTime / duration) * 100 : 0

  // Time ruler markers
  const markerInterval = duration <= 30 ? 5 : duration <= 120 ? 15 : 30
  const markers: number[] = []
  for (let t = 0; t <= duration; t += markerInterval) {
    markers.push(t)
  }

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Time ruler */}
      <div className="relative h-5" onClick={handleTimelineClick}>
        <div className="absolute inset-0 ml-24">
          {markers.map((t) => (
            <div
              key={t}
              className="absolute top-0 flex flex-col items-center"
              style={{ left: `${(t / duration) * 100}%` }}
            >
              <div className="h-2 w-px bg-border" />
              <span className="text-[8px] font-mono text-muted-foreground/50 mt-0.5">{fmt(t)}</span>
            </div>
          ))}
          {/* Playhead on ruler */}
          <div
            className="absolute top-0 bottom-0 w-px bg-primary z-10"
            style={{ left: `${playheadPct}%` }}
          />
        </div>
      </div>

      {/* Track lanes */}
      <div className="relative flex">
        {/* Left column — play button + timecode, vertically centered across both rows */}
        <div className="w-24 shrink-0 flex flex-col items-center justify-center gap-1">
          <button
            onClick={togglePlay}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full transition-all cursor-pointer shadow-lg',
              isPlaying
                ? 'bg-primary text-white shadow-primary/30 hover:bg-primary/80'
                : 'glass-surface text-foreground hover:bg-white/10 shadow-black/20',
            )}
          >
            {isPlaying ? <Pause className="h-4.5 w-4.5" /> : <Play className="h-4.5 w-4.5 ml-0.5" />}
          </button>
          <span className="font-mono text-[9px] text-muted-foreground/60 tabular-nums">{formatTimecode(currentTime)}</span>
          {viewMode && onViewModeChange && (
            <div className="flex flex-col items-center glass-surface rounded-lg p-0.5 mt-1.5 w-[76px]">
              {(['timeline', 'spotlight'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => onViewModeChange(m)}
                  className={cn(
                    'w-full rounded-md px-1.5 py-1 text-[10px] font-semibold transition-all cursor-pointer text-center',
                    viewMode === m
                      ? 'bg-primary text-white shadow-[0_0_10px_rgba(124,58,237,0.3)]'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {m === 'timeline'
                    ? <><LayoutGrid className="h-3 w-3 inline-block mr-1 -mt-px" />Timeline</>
                    : <><Maximize2 className="h-3 w-3 inline-block mr-1 -mt-px" />Spotlight</>}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Right column — scene + music tracks stacked */}
        <div className="flex-1 flex flex-col relative">
          {/* Main scene track */}
          <div ref={mainTrackRef} className="relative h-14 bg-muted/10" onClick={handleTimelineClick}>
            {sceneRanges.map((range) => {
              const leftPct = (range.audioStart / duration) * 100
              const widthPct = ((range.audioEnd - range.audioStart) / duration) * 100
              const scene = scenes[range.index]
              const isActive = currentSceneId === range.sceneId
              const isHighlighted = highlightedSceneId === range.sceneId
              const isLipsync = lipsyncSceneIds?.has(range.sceneId)
              return (
                <div
                  key={range.sceneId}
                  className={cn(
                    'absolute top-1.5 bottom-1.5 rounded-md overflow-hidden cursor-pointer transition-all',
                    isHighlighted
                      ? 'ring-2 ring-primary z-[5] brightness-125'
                      : isActive
                        ? 'ring-2 ring-primary/60 z-[5]'
                        : 'ring-1 ring-white/10 hover:ring-white/20',
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
                      className="absolute inset-0 w-full h-full object-cover opacity-50"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
                  <div className="relative z-10 flex items-center gap-1 px-1.5 py-0.5">
                    <span className="text-[9px] font-mono font-medium text-white/80">S{range.index + 1}</span>
                    {scene && (
                      <span className="text-[8px] text-white/50 truncate">{scene.subject}</span>
                    )}
                  </div>
                  {/* Lipsync indicator bar */}
                  {isLipsync && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-emerald-400/80" />
                  )}
                </div>
              )
            })}

            {/* Drag handles at scene boundaries */}
            {sceneRanges.slice(0, -1).map((range) => {
              const leftPct = (range.audioEnd / duration) * 100
              return (
                <div
                  key={`resize-${range.sceneId}`}
                  className="absolute top-0 bottom-0 z-10 cursor-col-resize group/resize"
                  style={{ left: `${leftPct}%`, width: '8px', transform: 'translateX(-50%)' }}
                  onMouseDown={(e) => handleBoundaryMouseDown(e, range.index)}
                >
                  <div className="w-0.5 h-full mx-auto bg-white/20 group-hover/resize:bg-white/60 group-hover/resize:shadow-[0_0_4px_rgba(255,255,255,0.3)] transition-all" />
                </div>
              )
            })}

            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 w-px bg-primary z-10 pointer-events-none"
              style={{ left: `${playheadPct}%` }}
            />
          </div>

          {/* Music track */}
          <div className="relative h-10 bg-muted/5" onClick={handleTimelineClick}>
            {/* Waveform visualization */}
            <div className="absolute inset-x-0 top-1 bottom-1 flex items-end gap-px px-0.5 rounded-md overflow-hidden bg-muted/10">
              {WAVEFORM_BARS.map((height, i) => {
                const barPct = (i / WAVEFORM_BARS.length) * 100
                const isBeforePlayhead = barPct <= playheadPct
                const barTime = (i / WAVEFORM_BARS.length) * duration
                const segment = audio.segments.find((seg) => barTime >= seg.startTime && barTime < seg.endTime)
                const segColor = segment?.color ?? '#71717a'
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
              className="absolute top-0 bottom-0 w-px bg-primary/60 z-10 pointer-events-none"
              style={{ left: `${playheadPct}%` }}
            />
          </div>

          {/* Global playhead line across all tracks */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-primary z-20 pointer-events-none"
            style={{ left: `${playheadPct}%` }}
          />
        </div>
      </div>
    </div>
  )
}

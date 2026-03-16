'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight } from 'lucide-react'
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

export function StoryboardWaveform({ audio, scenes, highlightedSceneId, onSceneClick, onResizeScenes, lipsyncSceneIds }: StoryboardWaveformProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [zoom, setZoom] = useState(100)
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
    if (currentTime >= duration) setCurrentTime(0)
    setIsPlaying((p) => !p)
  }, [currentTime, duration])

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
      const time = ratio * duration
      setCurrentTime(time)
      const range = sceneRanges.find((r) => time >= r.audioStart && time < r.audioEnd)
      if (range) onSceneClick(range.sceneId)
    },
    [duration, sceneRanges, onSceneClick],
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
    <div className="flex flex-col border-t border-border bg-card overflow-hidden">
      {/* Transport controls bar */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-border/50 bg-card">
        {/* Left: Timecode */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-muted-foreground tabular-nums tracking-wider bg-black/20 rounded px-2 py-0.5">
            {formatTimecode(currentTime)}
          </span>
        </div>

        {/* Center: Transport buttons */}
        <div className="flex items-center gap-1">
          <button onClick={skipToStart} className="p-1.5 text-muted-foreground/50 hover:text-foreground transition-colors cursor-pointer">
            <SkipBack className="h-3.5 w-3.5" />
          </button>
          <button onClick={skipBackward} className="p-1.5 text-muted-foreground/50 hover:text-foreground transition-colors cursor-pointer">
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={togglePlay}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full transition-colors cursor-pointer',
              isPlaying ? 'bg-primary/20 text-primary' : 'bg-muted text-foreground hover:bg-muted/80',
            )}
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
          </button>
          <button onClick={skipForward} className="p-1.5 text-muted-foreground/50 hover:text-foreground transition-colors cursor-pointer">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <button onClick={skipToEnd} className="p-1.5 text-muted-foreground/50 hover:text-foreground transition-colors cursor-pointer">
            <SkipForward className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Right: Zoom + track info */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground/50">{zoom}%</span>
          <input
            type="range"
            min={50}
            max={200}
            value={zoom}
            onChange={(e) => setZoom(parseInt(e.target.value))}
            className="w-20 h-1 appearance-none bg-muted rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-muted-foreground"
          />
        </div>
      </div>

      {/* Time ruler */}
      <div className="relative h-5 border-b border-border/50 bg-muted/30" onClick={handleTimelineClick}>
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
      <div className="relative flex flex-col">
        {/* Main scene track */}
        <div className="flex items-center h-14 border-b border-border/30">
          <div className="w-24 shrink-0 flex items-center px-3">
            <span className="text-[10px] font-medium text-muted-foreground">Scenes</span>
          </div>
          <div ref={mainTrackRef} className="flex-1 relative h-full bg-muted/10" onClick={handleTimelineClick}>
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
        </div>

        {/* Music track */}
        <div className="flex items-center h-10">
          <div className="w-24 shrink-0 flex items-center px-3">
            <span className="text-[10px] font-medium text-muted-foreground/50">Music</span>
          </div>
          <div className="flex-1 relative h-full bg-muted/5" onClick={handleTimelineClick}>
            {/* Waveform visualization */}
            <div className="absolute inset-x-0 top-1 bottom-1 flex items-end gap-px px-0.5 rounded-md overflow-hidden bg-muted/10 ring-1 ring-border/20">
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
        </div>

        {/* Global playhead line across all tracks */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-primary z-20 pointer-events-none"
          style={{ left: `calc(96px + (100% - 96px) * ${playheadPct / 100})` }}
        />
      </div>
    </div>
  )
}

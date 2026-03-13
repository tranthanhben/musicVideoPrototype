'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause } from 'lucide-react'
import type { MockScene } from '@/lib/mock/types'

interface AudioPlayerProps {
  scenes: MockScene[]
  totalDuration: number
  activeSceneId?: string
  onSceneChange?: (sceneId: string) => void
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

function buildSceneOffsets(scenes: MockScene[]): { id: string; start: number; end: number }[] {
  let elapsed = 0
  return scenes.map((s) => {
    const entry = { id: s.id, start: elapsed, end: elapsed + s.duration }
    elapsed += s.duration
    return entry
  })
}

export function StoryboardAudioPlayer({ scenes, totalDuration, activeSceneId, onSceneChange }: AudioPlayerProps) {
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const sceneOffsets = buildSceneOffsets(scenes)

  // Advance playhead when playing
  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((t) => {
          const next = t + 0.25
          if (next >= totalDuration) { setPlaying(false); return 0 }
          return next
        })
      }, 250)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [playing, totalDuration])

  // Notify parent about active scene
  useEffect(() => {
    const current = sceneOffsets.find((s) => currentTime >= s.start && currentTime < s.end)
    if (current && current.id !== activeSceneId && onSceneChange) {
      onSceneChange(current.id)
    }
  }, [currentTime]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleScrub(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    setCurrentTime(ratio * totalDuration)
  }

  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0
  const playingSceneOffset = sceneOffsets.find((s) => currentTime >= s.start && currentTime < s.end)

  return (
    <div className="shrink-0 rounded-xl bg-black/30 border border-border/30 p-3">
      <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Playback</p>

      {/* Scene thumbnail strip */}
      <div className="flex rounded-lg overflow-hidden mb-2 h-8 gap-px">
        {scenes.map((scene) => (
          <button
            key={scene.id}
            onClick={() => {
              const off = sceneOffsets.find((s) => s.id === scene.id)
              if (off) setCurrentTime(off.start)
            }}
            className="relative flex-1 overflow-hidden cursor-pointer transition-opacity hover:opacity-90"
            style={{ flexBasis: `${(scene.duration / totalDuration) * 100}%` }}
            title={`Scene ${scene.index + 1}: ${scene.subject}`}
          >
            <img src={scene.thumbnailUrl} alt="" className="w-full h-full object-cover" />
            {(playingSceneOffset?.id === scene.id) && (
              <div className="absolute inset-0 ring-1 ring-inset ring-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div
        className="relative h-2 rounded-full bg-white/10 cursor-pointer mb-2 overflow-hidden"
        onClick={handleScrub}
      >
        {/* Scene boundaries */}
        {sceneOffsets.map((s) => (
          <div
            key={s.id}
            className="absolute top-0 bottom-0 w-px bg-white/20"
            style={{ left: `${(s.start / totalDuration) * 100}%` }}
          />
        ))}
        {/* Filled */}
        <div
          className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all"
          style={{ width: `${progress}%` }}
        />
        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white shadow"
          style={{ left: `calc(${progress}% - 6px)` }}
        />
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setPlaying((p) => !p)}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-primary hover:bg-primary/90 transition-colors cursor-pointer"
        >
          {playing
            ? <Pause className="h-3.5 w-3.5 text-primary-foreground" />
            : <Play className="h-3.5 w-3.5 text-primary-foreground ml-0.5" />
          }
        </button>
        <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
          {formatTime(currentTime)} / {formatTime(totalDuration)}
        </span>
        {playingSceneOffset && (
          <span className="text-[9px] font-semibold text-primary/80">
            Scene {(scenes.findIndex((s) => s.id === playingSceneOffset.id) ?? 0) + 1}
          </span>
        )}
      </div>
    </div>
  )
}

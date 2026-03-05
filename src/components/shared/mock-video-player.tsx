'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MockVideoPlayerProps {
  thumbnailUrl: string
  duration: number
  className?: string
  aspectRatio?: '16:9' | '9:16' | '1:1'
}

const aspectMap = {
  '16:9': 'aspect-video',
  '9:16': 'aspect-[9/16]',
  '1:1': 'aspect-square',
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function MockVideoPlayer({
  thumbnailUrl,
  duration,
  className,
  aspectRatio = '16:9',
}: MockVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false)
            return 0
          }
          return prev + 0.1
        })
      }, 100)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying, duration])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  function handleScrub(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    setCurrentTime(Math.max(0, Math.min(duration, ratio * duration)))
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-card group',
        aspectMap[aspectRatio],
        className
      )}
    >
      {/* Thumbnail background */}
      <img
        src={thumbnailUrl}
        alt="Video thumbnail"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/20" />

      {/* Play/Pause button */}
      <button
        onClick={() => setIsPlaying((p) => !p)}
        className="absolute inset-0 flex items-center justify-center transition-opacity"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm border border-border transition-transform group-hover:scale-110">
          {isPlaying ? (
            <Pause className="h-6 w-6 text-white" />
          ) : (
            <Play className="h-6 w-6 text-white ml-0.5" />
          )}
        </div>
      </button>

      {/* Controls bar */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Scrubber */}
        <div
          className="mb-2 h-1 w-full cursor-pointer rounded-full bg-white/30"
          onClick={handleScrub}
        >
          <div
            className="h-full rounded-full bg-white transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Time display */}
        <div className="flex items-center justify-between text-xs text-white/80 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  )
}

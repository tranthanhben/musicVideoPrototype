'use client'

import { useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface WaveformRulerProps {
  duration: number
  beatMarkers: number[]
  playheadPosition: number
  onSeek: (time: number) => void
  className?: string
}

function generateWaveformPath(width: number, height: number): string {
  const centerY = height / 2
  const points: string[] = []
  const steps = 200

  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width
    const t = i / steps
    // Layered sine waves with pseudo-random variation
    const wave =
      Math.sin(t * Math.PI * 40) * 0.4 +
      Math.sin(t * Math.PI * 17 + 1.3) * 0.3 +
      Math.sin(t * Math.PI * 7 + 0.7) * 0.2 +
      Math.sin(t * Math.PI * 3) * 0.1

    const amplitude = (centerY - 4) * Math.abs(wave)
    if (i === 0) {
      points.push(`M ${x} ${centerY - amplitude}`)
    } else {
      points.push(`L ${x} ${centerY - amplitude}`)
    }
  }

  // Return path back along bottom
  for (let i = steps; i >= 0; i--) {
    const x = (i / steps) * width
    const t = i / steps
    const wave =
      Math.sin(t * Math.PI * 40) * 0.4 +
      Math.sin(t * Math.PI * 17 + 1.3) * 0.3 +
      Math.sin(t * Math.PI * 7 + 0.7) * 0.2 +
      Math.sin(t * Math.PI * 3) * 0.1

    const amplitude = (centerY - 4) * Math.abs(wave)
    points.push(`L ${x} ${centerY + amplitude}`)
  }

  points.push('Z')
  return points.join(' ')
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function WaveformRuler({
  duration,
  beatMarkers,
  playheadPosition,
  onSeek,
  className,
}: WaveformRulerProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const width = 1200
  const height = 80

  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const rect = svgRef.current?.getBoundingClientRect()
      if (!rect) return
      const x = e.clientX - rect.left
      const ratio = x / rect.width
      onSeek(ratio * duration)
    },
    [duration, onSeek]
  )

  const waveformPath = generateWaveformPath(width, height)
  const playheadX = (playheadPosition / duration) * width

  // Time labels: every 10s if duration > 60, else every 5s
  const labelInterval = duration > 60 ? 10 : 5
  const timeLabels: number[] = []
  for (let t = 0; t <= duration; t += labelInterval) {
    timeLabels.push(t)
  }

  // Show only every 4th beat marker for visual clarity
  const visibleBeats = beatMarkers.filter((_, i) => i % 4 === 0)

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn('w-full cursor-crosshair', className)}
      style={{ height: 80 }}
      onClick={handleClick}
    >
      {/* Waveform fill */}
      <path d={waveformPath} fill="rgba(34,211,238,0.4)" />

      {/* Beat marker lines */}
      {visibleBeats.map((t) => {
        const x = (t / duration) * width
        return (
          <line
            key={t}
            x1={x}
            y1={0}
            x2={x}
            y2={height - 14}
            stroke="rgba(34,211,238,0.8)"
            strokeWidth="1"
          />
        )
      })}

      {/* Time labels */}
      {timeLabels.map((t) => {
        const x = (t / duration) * width
        return (
          <text
            key={t}
            x={x + 2}
            y={height - 2}
            fill="hsl(var(--muted-foreground))"
            fontSize="9"
            fontFamily="JetBrains Mono, monospace"
          >
            {formatTime(t)}
          </text>
        )
      })}

      {/* Playhead */}
      <line
        x1={playheadX}
        y1={0}
        x2={playheadX}
        y2={height}
        stroke="#ffffff"
        strokeWidth="1.5"
      />
      <polygon
        points={`${playheadX - 4},0 ${playheadX + 4},0 ${playheadX},6`}
        fill="#ffffff"
      />
    </svg>
  )
}

'use client'

import type { AudioSegment, EnergyPoint } from '@/lib/mock/types'

const BAR_COUNT = 48

function buildBars(): { height: number }[] {
  return Array.from({ length: BAR_COUNT }, (_, i) => ({
    height: 25 + Math.sin(i * 0.7) * 28 + Math.sin(i * 1.3) * 12 + ((i * 17 + 7) % 18),
  }))
}

const BARS = buildBars()

function getSegmentForBar(barIndex: number, segments: AudioSegment[], duration: number): AudioSegment | undefined {
  const t = (barIndex / BAR_COUNT) * duration
  return segments.find((seg) => t >= seg.startTime && t < seg.endTime)
}

function buildPolylinePoints(energyCurve: EnergyPoint[], svgW: number, svgH: number, duration: number): string {
  return energyCurve
    .map((pt) => `${((pt.time / duration) * svgW).toFixed(1)},${(svgH - pt.energy * svgH).toFixed(1)}`)
    .join(' ')
}

interface AnalysisWaveformProps {
  segments: AudioSegment[]
  energyCurve: EnergyPoint[]
  duration: number
}

export function AnalysisWaveform({ segments, energyCurve, duration }: AnalysisWaveformProps) {
  const W = 480
  const H = 56
  const points = buildPolylinePoints(energyCurve, W, H, duration)
  const peaks = energyCurve.filter((pt) => pt.isPeak)

  return (
    <div className="mb-4 rounded-xl bg-muted/30 border border-border/30 overflow-hidden">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 64 }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="50%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
        {segments.map((seg) => {
          const x = (seg.startTime / duration) * W
          const w = ((seg.endTime - seg.startTime) / duration) * W
          return <rect key={seg.id} x={x} y={0} width={w} height={H} fill={seg.color} opacity={0.12} />
        })}
        {BARS.map((bar, i) => {
          const seg = getSegmentForBar(i, segments, duration)
          const barW = W / BAR_COUNT
          const barH = (bar.height / 100) * H * 0.85
          return (
            <rect key={i} x={i * barW + 0.5} y={H - barH} width={Math.max(1, barW - 1.5)} height={barH}
              rx={1.5} fill={seg?.color ?? '#6366F1'} opacity={0.7} />
          )
        })}
        <polyline points={points} fill="none" stroke="url(#waveGrad)" strokeWidth={2} strokeOpacity={0.9} strokeLinejoin="round" />
        {peaks.map((pt) => {
          const cx = (pt.time / duration) * W
          const cy = H - pt.energy * H
          return (
            <g key={pt.time}>
              <circle cx={cx} cy={cy} r={5} fill="none" stroke="#ffffff" strokeWidth={1} opacity={0.3} />
              <circle cx={cx} cy={cy} r={3} fill="#ffffff" opacity={0.9} />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

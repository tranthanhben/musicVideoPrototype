'use client'

import { Music, Clock, Activity, Layers, Sparkles } from 'lucide-react'
import { mockProjects } from '@/lib/mock/projects'
import type { AudioSegment, EnergyPoint } from '@/lib/mock/types'

interface InputViewProps {
  projectIndex?: number
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

const BAR_COUNT = 40

function buildBars(): { height: number }[] {
  return Array.from({ length: BAR_COUNT }, (_, i) => ({
    height: 30 + Math.sin(i * 0.8) * 25 + ((i * 17 + 7) % 15),
  }))
}

const BARS = buildBars()

function getSegmentForBar(barIndex: number, segments: AudioSegment[], duration: number): AudioSegment | undefined {
  const t = (barIndex / BAR_COUNT) * duration
  return segments.find((seg) => t >= seg.startTime && t < seg.endTime)
}

function buildPolylinePoints(
  energyCurve: EnergyPoint[], svgW: number, svgH: number, duration: number,
): string {
  return energyCurve
    .map((pt) => {
      const x = (pt.time / duration) * svgW
      const y = svgH - pt.energy * svgH
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

// Mood tags derived from audio properties
function getMoodTags(bpm: number, key: string): string[] {
  const tags: string[] = []
  if (bpm >= 120) tags.push('Energetic')
  if (bpm < 100) tags.push('Relaxed')
  if (bpm >= 100 && bpm < 120) tags.push('Moderate')
  if (key.includes('minor')) tags.push('Melancholic', 'Introspective')
  if (key.includes('major')) tags.push('Uplifting', 'Bright')
  tags.push('Cinematic')
  return tags
}

export function InputView({ projectIndex = 0 }: InputViewProps) {
  const audio = mockProjects[projectIndex]?.audio ?? mockProjects[0].audio
  const { segments, energyCurve, duration } = audio

  const INFO_ROWS = [
    { icon: Activity, label: 'BPM', value: String(audio.bpm) },
    { icon: Clock, label: 'Duration', value: formatDuration(audio.duration) },
    { icon: Layers, label: 'Segments', value: String(audio.segments.length) },
    { icon: Music, label: 'Key', value: audio.key },
  ]

  const SVG_W = 400
  const SVG_H = 40
  const polylinePoints = buildPolylinePoints(energyCurve, SVG_W, SVG_H, duration)
  const peakPoints = energyCurve.filter((pt) => pt.isPeak)
  const moodTags = getMoodTags(audio.bpm, audio.key)

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Music className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Analysis Complete</p>
            <h2 className="text-lg font-semibold text-foreground">{audio.title}</h2>
          </div>
        </div>

        {/* Artist */}
        <p className="mb-4 text-sm text-muted-foreground">
          by <span className="text-foreground font-medium">{audio.artist}</span>
        </p>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {INFO_ROWS.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-lg bg-muted/50 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-muted-foreground">
                <Icon className="h-3.5 w-3.5" />
                <span className="text-xs">{label}</span>
              </div>
              <p className="text-xl font-bold tabular-nums text-foreground">{value}</p>
            </div>
          ))}
        </div>

        {/* Mood tags */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-2 text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Detected Mood</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {moodTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-medium text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Waveform */}
        <div className="rounded-lg bg-muted/30 overflow-hidden">
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className="w-full"
            style={{ height: 48 }}
            preserveAspectRatio="none"
          >
            {segments.map((seg) => {
              const x = (seg.startTime / duration) * SVG_W
              const w = ((seg.endTime - seg.startTime) / duration) * SVG_W
              return <rect key={seg.id} x={x} y={0} width={w} height={SVG_H} fill={seg.color} opacity={0.15} />
            })}
            {BARS.map((bar, i) => {
              const seg = getSegmentForBar(i, segments, duration)
              const barW = SVG_W / BAR_COUNT
              const barH = (bar.height / 100) * SVG_H
              return (
                <rect key={i} x={i * barW + 0.5} y={SVG_H - barH} width={Math.max(1, barW - 1)} height={barH} rx={1} fill={seg?.color ?? '#6366F1'} opacity={0.6} />
              )
            })}
            <polyline points={polylinePoints} fill="none" stroke="#ffffff" strokeWidth={1.5} strokeOpacity={0.7} strokeLinejoin="round" />
            {peakPoints.map((pt) => {
              const x = (pt.time / duration) * SVG_W
              const y = SVG_H - pt.energy * SVG_H
              return <circle key={pt.time} cx={x} cy={y} r={3} fill="#ffffff" stroke="#ffffff" strokeWidth={1} opacity={0.9} />
            })}
          </svg>
        </div>

        {/* Segment legend pills */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {segments.map((seg) => (
            <span
              key={seg.id}
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
              style={{ backgroundColor: seg.color, opacity: 0.85 }}
            >
              {seg.label}
            </span>
          ))}
        </div>

        {/* Peaks count */}
        <p className="mt-3 text-[11px] text-muted-foreground text-center">
          {peakPoints.length} emotional peak{peakPoints.length !== 1 ? 's' : ''} detected
        </p>
      </div>
    </div>
  )
}

'use client'

import { Music, Clock, Activity, Hash } from 'lucide-react'
import { mockProjects } from '@/lib/mock/projects'

const audio = mockProjects[0].audio

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

const INFO_ROWS = [
  { icon: Activity, label: 'BPM', value: String(audio.bpm) },
  { icon: Clock, label: 'Duration', value: formatDuration(audio.duration) },
  { icon: Hash, label: 'Beat Markers', value: String(audio.beatMarkers.length) },
  { icon: Music, label: 'Key', value: 'A minor' },
]

export function InputView() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-lg">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Music className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Analyzing</p>
            <h2 className="text-lg font-semibold text-foreground">{audio.title}</h2>
          </div>
        </div>

        {/* Artist */}
        <p className="mb-6 text-sm text-muted-foreground">
          by <span className="text-foreground font-medium">{audio.artist}</span>
        </p>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
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

        {/* Waveform placeholder */}
        <div className="mt-5 flex items-end gap-0.5 h-10 rounded-lg bg-muted/30 px-3 overflow-hidden">
          {Array.from({ length: 40 }, (_, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-primary/40 animate-pulse"
              style={{
                height: `${30 + Math.sin(i * 0.8) * 25 + Math.random() * 15}%`,
                animationDelay: `${i * 30}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

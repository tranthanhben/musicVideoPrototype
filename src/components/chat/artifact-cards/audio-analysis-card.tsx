'use client'

import { Music, Clock, Gauge, Hash } from 'lucide-react'
import type { ChatArtifact } from '@/lib/chat/types'

interface AudioAnalysisCardProps {
  artifact: ChatArtifact
}

export function AudioAnalysisCard({ artifact }: AudioAnalysisCardProps) {
  // Parse description like "BPM: 128 | Key: Am | Duration: 3:12 | 16 beat markers | 4 sections"
  const desc = artifact.description ?? ''
  const bpm = desc.match(/BPM:\s*(\d+)/)?.[1] ?? '—'
  const key = desc.match(/Key:\s*(\w+)/)?.[1] ?? '—'
  const duration = desc.match(/Duration:\s*([\d:]+)/)?.[1] ?? '—'
  const beats = desc.match(/(\d+)\s*beat/)?.[1] ?? '—'
  const sections = desc.match(/(\d+)\s*section/)?.[1] ?? '—'

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Music className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">{artifact.title}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge icon={<Gauge className="h-3 w-3" />} label="BPM" value={bpm} />
        <Badge icon={<Music className="h-3 w-3" />} label="Key" value={key} />
        <Badge icon={<Clock className="h-3 w-3" />} label="Duration" value={duration} />
        <Badge icon={<Hash className="h-3 w-3" />} label="Beats" value={beats} />
        <Badge icon={<Hash className="h-3 w-3" />} label="Sections" value={sections} />
      </div>
      {/* Mini waveform visualization - deterministic via sin/cos, no flicker */}
      <div className="flex items-end gap-px h-8">
        {Array.from({ length: 40 }, (_, i) => (
          <div
            key={i}
            className="flex-1 bg-primary/30 rounded-sm"
            style={{ height: `${20 + Math.sin(i * 0.5) * 60 + Math.cos(i * 0.3) * 20}%` }}
          />
        ))}
      </div>
    </div>
  )
}

function Badge({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-xs">
      {icon}
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}

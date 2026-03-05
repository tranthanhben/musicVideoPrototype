'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Music, Play } from 'lucide-react'
import { mockProjects } from '@/lib/mock/projects'
import { cn } from '@/lib/utils'

interface UploadViewProps {
  onTrackSelect: (projectIndex: number) => void
}

const DEMO_TRACKS = mockProjects.map((p, i) => ({
  index: i,
  title: p.audio.title,
  artist: p.audio.artist,
  bpm: p.audio.bpm,
  duration: p.audio.duration,
  key: p.audio.key,
  gradientFrom: p.scenes[0]?.takes[0]?.thumbnailUrl ? undefined : undefined,
  accentColor: i === 0 ? '#7C3AED' : i === 1 ? '#EC4899' : '#0EA5E9',
}))

function formatDuration(s: number): string {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export function UploadView({ onTrackSelect }: UploadViewProps) {
  const [hoveredTrack, setHoveredTrack] = useState<number | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Upload zone */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={cn(
            'rounded-2xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer',
            isDragOver
              ? 'border-primary bg-primary/10'
              : 'border-border bg-card hover:border-primary/50',
          )}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragOver(false)
            // Mock: treat any drop as selecting the first demo track
            onTrackSelect(0)
          }}
          onClick={() => onTrackSelect(0)}
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">Upload your track</p>
          <p className="text-xs text-muted-foreground mb-3">
            Drag & drop an audio file, or click to browse
          </p>
          <p className="text-[10px] text-muted-foreground/60">
            MP3, WAV, FLAC — up to 50MB
          </p>
        </motion.div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            or try a demo track
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Demo track cards */}
        <motion.div
          className="flex flex-col gap-2.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {DEMO_TRACKS.map((track) => (
            <button
              key={track.index}
              onClick={() => onTrackSelect(track.index)}
              onMouseEnter={() => setHoveredTrack(track.index)}
              onMouseLeave={() => setHoveredTrack(null)}
              className={cn(
                'flex items-center gap-3.5 rounded-xl border bg-card p-3.5 text-left transition-all cursor-pointer',
                hoveredTrack === track.index
                  ? 'border-primary/50 bg-primary/5 -translate-y-0.5 shadow-sm'
                  : 'border-border hover:border-border/80',
              )}
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${track.accentColor}20` }}
              >
                {hoveredTrack === track.index ? (
                  <Play className="h-5 w-5" style={{ color: track.accentColor }} />
                ) : (
                  <Music className="h-5 w-5" style={{ color: track.accentColor }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{track.title}</p>
                <p className="text-xs text-muted-foreground">{track.artist}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs font-mono text-foreground/70">{track.bpm} BPM</p>
                <p className="text-[10px] text-muted-foreground">
                  {formatDuration(track.duration)} · {track.key}
                </p>
              </div>
            </button>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

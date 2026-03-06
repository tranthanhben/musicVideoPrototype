'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Music, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockProjects } from '@/lib/mock/projects'
import { RENDER_MODES } from '@/lib/flow/mock-data'
import type { RenderMode } from '@/lib/flow/types'

interface SetupStepProps {
  trackIndex: number | null
  prompt: string
  mode: RenderMode
  musicControl: number
  lyricsControl: number
  onTrackSelect: (index: number) => void
  onPromptChange: (prompt: string) => void
  onModeChange: (mode: RenderMode) => void
  onMusicControlChange: (val: number) => void
  onLyricsControlChange: (val: number) => void
}

const DEMO_TRACKS = mockProjects.map((p, i) => ({
  index: i,
  title: p.audio.title,
  artist: p.audio.artist,
  bpm: p.audio.bpm,
  duration: p.audio.duration,
  key: p.audio.key,
  accentColor: i === 0 ? '#7C3AED' : i === 1 ? '#EC4899' : '#0EA5E9',
}))

function formatDuration(s: number): string {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export function SetupStep({
  trackIndex, prompt, mode, musicControl, lyricsControl,
  onTrackSelect, onPromptChange, onModeChange, onMusicControlChange, onLyricsControlChange,
}: SetupStepProps) {
  const [hoveredTrack, setHoveredTrack] = useState<number | null>(null)

  return (
    <div className="flex h-full justify-center overflow-y-auto p-6">
      <div className="w-full max-w-lg space-y-5">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-lg font-bold text-foreground">Track & Settings</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Upload your music and configure generation parameters</p>
        </motion.div>

        {/* Track selection */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Music Track</label>
          {trackIndex !== null ? (
            <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${DEMO_TRACKS[trackIndex].accentColor}20` }}>
                <Music className="h-5 w-5" style={{ color: DEMO_TRACKS[trackIndex].accentColor }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{DEMO_TRACKS[trackIndex].title}</p>
                <p className="text-xs text-muted-foreground">{DEMO_TRACKS[trackIndex].artist} | {DEMO_TRACKS[trackIndex].bpm} BPM | {DEMO_TRACKS[trackIndex].key}</p>
              </div>
              <button onClick={() => onTrackSelect(-1)} className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">Change</button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="rounded-xl border-2 border-dashed border-border bg-card p-4 text-center cursor-pointer hover:border-primary/40 transition-colors" onClick={() => onTrackSelect(0)}>
                <Upload className="h-5 w-5 mx-auto mb-1.5 text-muted-foreground" />
                <p className="text-xs font-medium text-foreground">Upload audio file</p>
                <p className="text-[10px] text-muted-foreground">MP3, WAV, FLAC</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <div className="flex-1 h-px bg-border" />
                <span>or demo</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              {DEMO_TRACKS.map((track) => (
                <button
                  key={track.index}
                  onClick={() => onTrackSelect(track.index)}
                  onMouseEnter={() => setHoveredTrack(track.index)}
                  onMouseLeave={() => setHoveredTrack(null)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg border bg-card p-2.5 text-left transition-all cursor-pointer',
                    hoveredTrack === track.index ? 'border-primary/50 bg-primary/5' : 'border-border',
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${track.accentColor}15` }}>
                    {hoveredTrack === track.index ? <Play className="h-3.5 w-3.5" style={{ color: track.accentColor }} /> : <Music className="h-3.5 w-3.5" style={{ color: track.accentColor }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{track.title}</p>
                    <p className="text-[10px] text-muted-foreground">{track.artist}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">{track.bpm} BPM | {formatDuration(track.duration)}</span>
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Prompt */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Creative Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="Describe your vision... e.g., 'A dreamy cosmic love story with floating astronauts in a nebula'"
            className="w-full rounded-xl border border-border bg-card p-3 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:border-primary/50 transition-colors"
            rows={3}
          />
        </motion.div>

        {/* Render mode */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Render Mode</label>
          <div className="grid grid-cols-4 gap-2">
            {RENDER_MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => onModeChange(m.id)}
                className={cn(
                  'relative rounded-lg border p-2.5 text-center transition-all cursor-pointer overflow-hidden',
                  mode === m.id ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-border/80',
                )}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-0.5"
                  style={{ background: `linear-gradient(to right, ${m.gradientFrom}, ${m.gradientTo})` }}
                />
                <p className="text-[11px] font-semibold text-foreground">{m.label}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{m.description}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Control sliders */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="space-y-3">
          <SliderControl
            label="Music Control"
            description="How closely the video matches music rhythm & energy"
            value={musicControl}
            onChange={onMusicControlChange}
            accentColor="#7C3AED"
          />
          <SliderControl
            label="Lyrics Control"
            description="Lipsync ratio and lyrical visual representation"
            value={lyricsControl}
            onChange={onLyricsControlChange}
            accentColor="#EC4899"
          />
        </motion.div>
      </div>
    </div>
  )
}

function SliderControl({ label, description, value, onChange, accentColor }: {
  label: string; description: string; value: number; onChange: (v: number) => void; accentColor: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs font-semibold text-foreground">{label}</p>
          <p className="text-[10px] text-muted-foreground">{description}</p>
        </div>
        <span className="text-sm font-bold tabular-nums" style={{ color: accentColor }}>{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${accentColor} ${value}%, var(--border) ${value}%)`,
        }}
      />
    </div>
  )
}

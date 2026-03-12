'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Music, Play, Sparkles } from 'lucide-react'
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
  waveform: Array.from({ length: 24 }, (_, j) => 20 + Math.abs(Math.sin(j * 0.8 + i) * 70)),
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
      <div className="w-full max-w-2xl lg:max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
          <h2 className="text-lg font-bold text-foreground">Track & Settings</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Configure music and generation parameters</p>
        </motion.div>

        {/* Responsive 2-col on lg+ */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 space-y-5 lg:space-y-0">

        {/* ---- LEFT col: track + prompt ---- */}
        <div className="space-y-5">

        {/* Track selection */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Music Track</label>
          {trackIndex !== null ? (
            <div className="flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/5 p-3 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: `${DEMO_TRACKS[trackIndex].accentColor}25` }}>
                <Music className="h-5 w-5" style={{ color: DEMO_TRACKS[trackIndex].accentColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{DEMO_TRACKS[trackIndex].title}</p>
                <p className="text-xs text-muted-foreground">{DEMO_TRACKS[trackIndex].artist} · {DEMO_TRACKS[trackIndex].bpm} BPM · {DEMO_TRACKS[trackIndex].key}</p>
              </div>
              <button onClick={() => onTrackSelect(-1)} className="text-xs text-muted-foreground hover:text-foreground cursor-pointer px-2 py-1 rounded-md hover:bg-muted transition-colors">Change</button>
            </div>
          ) : (
            <div className="space-y-2">
              <div
                className="rounded-xl border-2 border-dashed border-border bg-card p-5 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/3 transition-all"
                onClick={() => onTrackSelect(0)}
              >
                <Upload className="h-5 w-5 mx-auto mb-1.5 text-muted-foreground" />
                <p className="text-xs font-medium text-foreground">Upload audio file</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">MP3, WAV, FLAC · up to 100MB</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <div className="flex-1 h-px bg-border" />
                <span>or choose demo track</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              {DEMO_TRACKS.map((track) => {
                const isHovered = hoveredTrack === track.index
                return (
                  <button
                    key={track.index}
                    onClick={() => onTrackSelect(track.index)}
                    onMouseEnter={() => setHoveredTrack(track.index)}
                    onMouseLeave={() => setHoveredTrack(null)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl border bg-card p-3 text-left transition-all cursor-pointer',
                      isHovered ? 'border-primary/50 bg-primary/5 shadow-sm' : 'border-border',
                    )}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-transform duration-200" style={{ background: `${track.accentColor}18` }}>
                      {isHovered
                        ? <Play className="h-3.5 w-3.5" style={{ color: track.accentColor }} />
                        : <Music className="h-3.5 w-3.5" style={{ color: track.accentColor }} />}
                    </div>
                    {/* Mini waveform */}
                    <div className="flex items-end gap-[2px] h-7 w-16 shrink-0">
                      {track.waveform.map((h, j) => (
                        <div
                          key={j}
                          className="flex-1 rounded-full transition-all duration-300"
                          style={{
                            height: `${isHovered ? h : 30}%`,
                            background: isHovered ? track.accentColor : 'var(--border)',
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{track.title}</p>
                      <p className="text-[10px] text-muted-foreground">{track.artist}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono shrink-0">{track.bpm} BPM · {formatDuration(track.duration)}</span>
                  </button>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Prompt */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Creative Prompt</label>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              placeholder="Describe your vision… e.g. 'A dreamy cosmic love story with floating astronauts in a nebula'"
              className="w-full rounded-xl border border-border bg-card p-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:border-primary/50 transition-colors leading-relaxed"
              rows={4}
            />
            <Sparkles className="absolute top-3 right-3 h-4 w-4 text-muted-foreground/40" />
          </div>
          <p className="text-[10px] text-muted-foreground/60 mt-1 ml-1">AI will use this alongside music analysis to generate visuals</p>
        </motion.div>

        </div>{/* end LEFT col */}

        {/* ---- RIGHT col: render mode + sliders ---- */}
        <div className="space-y-5">

        {/* Render mode */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Render Mode</label>
          <div className="grid grid-cols-2 gap-2.5">
            {RENDER_MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => onModeChange(m.id)}
                className={cn(
                  'relative rounded-xl border p-3 text-center transition-all cursor-pointer overflow-hidden group',
                  mode === m.id ? 'border-primary/50 shadow-md' : 'border-border bg-card hover:border-border/70',
                )}
              >
                {/* Gradient preview bar */}
                <div
                  className="h-8 w-full rounded-lg mb-2 transition-opacity"
                  style={{
                    background: `linear-gradient(135deg, ${m.gradientFrom}, ${m.gradientTo})`,
                    opacity: mode === m.id ? 1 : 0.6,
                  }}
                />
                {mode === m.id && (
                  <motion.div
                    layoutId="render-mode-bg"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: `linear-gradient(135deg, ${m.gradientFrom}15, ${m.gradientTo}15)` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  />
                )}
                <p className="relative text-[11px] font-semibold text-foreground">{m.label}</p>
                <p className="relative text-[9px] text-muted-foreground mt-0.5 leading-snug">{m.description}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Control sliders */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="space-y-3">
          <SliderControl
            label="Music Control"
            description="How closely the video follows music rhythm and energy"
            value={musicControl}
            onChange={onMusicControlChange}
            accentColor="#7C3AED"
          />
          <SliderControl
            label="Lyrics Control"
            description="Lipsync and lyrical visual representation ratio"
            value={lyricsControl}
            onChange={onLyricsControlChange}
            accentColor="#EC4899"
          />
        </motion.div>

        </div>{/* end RIGHT col */}
        </div>{/* end 2-col grid */}
      </div>
    </div>
  )
}

function SliderControl({ label, description, value, onChange, accentColor }: {
  label: string; description: string; value: number; onChange: (v: number) => void; accentColor: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3.5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-foreground">{label}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{description}</p>
        </div>
        <motion.span
          key={value}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="text-sm font-bold tabular-nums ml-3 shrink-0"
          style={{ color: accentColor }}
        >
          {value}%
        </motion.span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${accentColor} ${value}%, var(--muted) ${value}%)`,
          }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[9px] text-muted-foreground/60">Low</span>
        <span className="text-[9px] text-muted-foreground/60">High</span>
      </div>
    </div>
  )
}

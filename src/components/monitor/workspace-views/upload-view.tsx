'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Music, Play, ChevronRight, Wand2 } from 'lucide-react'
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
  from: i === 0 ? '#7C3AED' : i === 1 ? '#EC4899' : '#0EA5E9',
  to: i === 0 ? '#22D3EE' : i === 1 ? '#F59E0B' : '#10B981',
}))

const PIPELINE_STAGES = ['🎵 Analyze', '🎨 Style', '🎬 Storyboard', '⚡ Generate', '📤 Export']

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export function UploadView({ onTrackSelect }: UploadViewProps) {
  const [hovered, setHovered] = useState<number | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  return (
    <div className="relative flex h-full items-center justify-center p-6 overflow-hidden">
      {/* Subtle animated waveform bg */}
      <div className="absolute inset-0 flex items-end justify-center gap-[2px] opacity-[0.035] pointer-events-none overflow-hidden">
        {Array.from({ length: 55 }, (_, i) => (
          <motion.div key={i} className="w-1 rounded-full bg-primary"
            style={{ height: `${18 + Math.sin(i * 0.5) * 14 + (i * 11) % 18}%` }}
            animate={{ scaleY: [1, 1.3, 0.8, 1.1, 1] }}
            transition={{ duration: 2 + (i % 3) * 0.4, repeat: Infinity, delay: i * 0.04, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Upload zone */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={cn(
            'relative rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer',
            isDragOver ? 'border-primary bg-primary/10 scale-[1.01]' : 'border-border bg-card/60 hover:border-primary/60 hover:bg-primary/5',
          )}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragOver(false); onTrackSelect(0) }}
          onClick={() => onTrackSelect(0)}
        >
          <motion.div
            animate={isDragOver ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20"
          >
            <Upload className="h-7 w-7 text-primary" />
          </motion.div>
          <p className="text-sm font-semibold text-foreground mb-1">{isDragOver ? 'Drop to analyze' : 'Upload your track'}</p>
          <p className="text-xs text-muted-foreground mb-3">Drag & drop an audio file, or click to browse</p>
          <p className="text-[10px] text-muted-foreground/60">MP3, WAV, FLAC — up to 50MB</p>
        </motion.div>

        {/* How it works strip */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="my-4 rounded-xl bg-muted/40 border border-border/50 px-4 py-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <Wand2 className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">How it works</span>
          </div>
          <div className="flex items-center gap-1">
            {PIPELINE_STAGES.map((stage, i) => (
              <div key={stage} className="flex items-center gap-1 flex-1 min-w-0">
                <span className="text-[9px] text-muted-foreground font-medium truncate flex-1 text-center">{stage}</span>
                {i < PIPELINE_STAGES.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground/30 shrink-0" />}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">or try a demo</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Demo tracks */}
        <motion.div className="flex flex-col gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          {DEMO_TRACKS.map((track) => {
            const isHov = hovered === track.index
            return (
              <button key={track.index} onClick={() => onTrackSelect(track.index)}
                onMouseEnter={() => setHovered(track.index)} onMouseLeave={() => setHovered(null)}
                className={cn(
                  'relative flex items-center gap-3 rounded-xl border p-3 text-left transition-all cursor-pointer overflow-hidden',
                  isHov ? 'border-primary/40 shadow-sm -translate-y-0.5' : 'border-border bg-card hover:border-border/70',
                )}
              >
                <motion.div className="absolute inset-0 opacity-0" animate={{ opacity: isHov ? 1 : 0 }}
                  style={{ background: `linear-gradient(135deg, ${track.from}08, ${track.to}08)` }} />
                {/* Gradient thumbnail */}
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${track.from}, ${track.to})` }}>
                  <AnimatePresence mode="wait">
                    {isHov
                      ? <motion.div key="p" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Play className="h-5 w-5 text-white fill-white" /></motion.div>
                      : <motion.div key="m" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Music className="h-5 w-5 text-white" /></motion.div>
                    }
                  </AnimatePresence>
                  <div className="absolute bottom-1 left-1 right-1 flex gap-0.5 items-end h-2">
                    {[4, 8, 6, 10, 7, 9, 5].map((h, i) => (
                      <motion.div key={i} className="flex-1 rounded-sm bg-white/50" style={{ height: h }}
                        animate={isHov ? { scaleY: [1, 1.5, 0.8, 1.2, 1] } : {}}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }} />
                    ))}
                  </div>
                </div>
                <div className="relative flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{track.title}</p>
                  <p className="text-xs text-muted-foreground">{track.artist}</p>
                </div>
                <div className="relative shrink-0 text-right">
                  <p className="text-xs font-mono font-medium text-foreground/80">{track.bpm} BPM</p>
                  <p className="text-[10px] text-muted-foreground">{fmt(track.duration)} · {track.key}</p>
                </div>
              </button>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}

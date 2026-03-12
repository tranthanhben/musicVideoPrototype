'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Music, Clock, Activity, Layers, Sparkles } from 'lucide-react'
import { mockProjects } from '@/lib/mock/projects'
import { AnalysisWaveform } from './analysis-waveform'

interface InputViewProps {
  projectIndex?: number
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function getMoodTags(bpm: number, key: string): { label: string; from: string; to: string }[] {
  const tags: { label: string; from: string; to: string }[] = []
  if (bpm >= 120) tags.push({ label: 'Energetic', from: '#F97316', to: '#EF4444' })
  if (bpm < 100) tags.push({ label: 'Relaxed', from: '#0EA5E9', to: '#10B981' })
  if (bpm >= 100 && bpm < 120) tags.push({ label: 'Moderate', from: '#8B5CF6', to: '#6366F1' })
  if (key.includes('minor')) tags.push({ label: 'Melancholic', from: '#6366F1', to: '#8B5CF6' }, { label: 'Introspective', from: '#7C3AED', to: '#A855F7' })
  if (key.includes('major')) tags.push({ label: 'Uplifting', from: '#F59E0B', to: '#10B981' }, { label: 'Bright', from: '#22D3EE', to: '#0EA5E9' })
  tags.push({ label: 'Cinematic', from: '#EC4899', to: '#8B5CF6' })
  return tags
}

function AnimatedCounter({ target }: { target: number }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const start = Date.now()
    const tick = () => {
      const p = Math.min((Date.now() - start) / 1000, 1)
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target])
  return <span>{val}</span>
}

export function InputView({ projectIndex = 0 }: InputViewProps) {
  const audio = mockProjects[projectIndex]?.audio ?? mockProjects[0].audio
  const { segments, energyCurve, duration } = audio

  type StatRow = { icon: typeof Activity; label: string; numVal?: number; strVal?: string }
  const STATS: StatRow[] = [
    { icon: Activity, label: 'BPM', numVal: audio.bpm },
    { icon: Clock, label: 'Duration', strVal: formatDuration(audio.duration) },
    { icon: Layers, label: 'Segments', numVal: audio.segments.length },
    { icon: Music, label: 'Key', strVal: audio.key },
  ]

  const moodTags = getMoodTags(audio.bpm, audio.key)

  return (
    <div className="flex h-full items-center justify-center p-5">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl rounded-2xl border border-border/60 bg-card shadow-xl overflow-hidden"
      >
        <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-500" />

        <div className="p-6">
          {/* Header */}
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
              <Music className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-primary uppercase tracking-widest mb-0.5">Analysis Complete</p>
              <h2 className="text-base font-bold text-foreground leading-tight">{audio.title}</h2>
              <p className="text-xs text-muted-foreground">by <span className="text-foreground/80 font-medium">{audio.artist}</span></p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-2 mb-5">
            {STATS.map(({ icon: Icon, label, numVal, strVal }, i) => (
              <motion.div key={label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="rounded-xl bg-muted/40 border border-border/40 p-2.5 text-center"
              >
                <div className="mb-1 flex justify-center text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
                <p className="text-sm font-bold tabular-nums text-foreground">
                  {numVal !== undefined ? <AnimatedCounter target={numVal} /> : strVal}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Segment timeline */}
          <div className="mb-4">
            <p className="text-[10px] font-medium text-muted-foreground mb-2 uppercase tracking-wider">Segment Timeline</p>
            <div className="flex rounded-lg overflow-hidden h-3">
              {segments.map((seg) => (
                <motion.div key={seg.id}
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.3 }}
                  style={{ width: `${((seg.endTime - seg.startTime) / duration) * 100}%`, backgroundColor: seg.color }}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {segments.map((seg) => (
                <span key={seg.id} className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold text-white"
                  style={{ backgroundColor: seg.color }}>{seg.label}</span>
              ))}
            </div>
          </div>

          {/* Waveform */}
          <AnalysisWaveform segments={segments} energyCurve={energyCurve} duration={duration} />

          {/* Mood tags */}
          <div>
            <div className="flex items-center gap-1.5 mb-2 text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">Detected Mood</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {moodTags.map((tag) => (
                <span key={tag.label} className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-white"
                  style={{ background: `linear-gradient(135deg, ${tag.from}, ${tag.to})` }}>
                  {tag.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

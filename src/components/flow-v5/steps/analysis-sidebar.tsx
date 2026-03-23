'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { MockAudio } from '@/lib/mock/types'

function useCountUp(target: number, dur = 1000) {
  const [value, setValue] = useState(0)
  const raf = useRef<number | null>(null)
  const t0 = useRef<number | null>(null)
  useEffect(() => {
    t0.current = null
    const tick = (ts: number) => {
      if (!t0.current) t0.current = ts
      const p = Math.min((ts - t0.current) / dur, 1)
      setValue(Math.round(target * p))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [target, dur])
  return value
}

interface AnalysisSidebarProps {
  audio: MockAudio
}

export function AnalysisSidebar({ audio }: AnalysisSidebarProps) {
  const peaks = audio.energyCurve.filter((p) => p.isPeak)
  const bpmCount = useCountUp(audio.bpm, 900)
  const peakCount = useCountUp(peaks.length, 600)

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s) % 60).padStart(2, '0')}`

  const metrics = [
    { label: 'Genre', value: 'Pop', color: '#8B5CF6' },
    { label: 'BPM', value: String(bpmCount), color: '#F97316' },
    { label: 'Key', value: audio.key, color: '#06B6D4' },
    { label: 'Duration', value: fmt(audio.duration), color: '#10B981' },
    { label: 'Peaks', value: String(peakCount), color: '#EF4444' },
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-bold text-foreground">Analysis</h2>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[9px] font-medium text-muted-foreground">Auto-detected</span>
      </div>

      {/* Song Structure waveform */}
      <div>
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Song Structure</p>
        <div className="rounded-2xl glass-surface p-2 relative overflow-hidden">
          <p className="text-[9px] text-white/50 font-medium mb-1 truncate">&quot;{audio.title}&quot; — {audio.artist}</p>
          <div className="h-16">
            <svg width="100%" height="100%" viewBox="0 0 200 60" preserveAspectRatio="none">
              {Array.from({ length: 80 }).map((_, i) => {
                const x = (i / 80) * 200
                const time = (i / 80) * audio.duration
                const idx = Math.floor((i / 80) * audio.energyCurve.length)
                const e = audio.energyCurve[Math.min(idx, audio.energyCurve.length - 1)]?.energy ?? 0.3
                const seed = Math.sin(i * 12.9898 + 78.233) * 43758.5453
                const rand = seed - Math.floor(seed)
                const h = Math.max((e * 0.7 + rand * 0.3) * 40, 3)
                const seg = audio.segments.find((s) => time >= s.startTime && time < s.endTime) ?? audio.segments[audio.segments.length - 1]
                return (
                  <motion.rect
                    key={`w-${i}`}
                    x={x}
                    y={30 - h / 2}
                    width={1.6}
                    height={h}
                    rx={0.8}
                    fill={seg.color}
                    opacity={0.5}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.3, delay: 0.05 + i * 0.01 }}
                  />
                )
              })}
              <motion.polyline
                fill="none"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={audio.energyCurve
                  .map((p) => `${(p.time / audio.duration) * 200},${50 - p.energy * 44}`)
                  .join(' ')}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.2 }}
              />
              {peaks.map((p, i) => (
                <motion.circle
                  key={i}
                  cx={(p.time / audio.duration) * 200}
                  cy={50 - p.energy * 44}
                  r="2.5"
                  fill="#EF4444"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 12, delay: 1.6 + i * 0.12 }}
                />
              ))}
            </svg>
          </div>
          {/* Segment bar */}
          <div className="flex gap-0.5 mt-1">
            {audio.segments.map((seg, i) => {
              const width = ((seg.endTime - seg.startTime) / audio.duration) * 100
              return (
                <motion.div
                  key={seg.id}
                  className="h-4 flex items-center justify-center rounded-sm min-w-0"
                  style={{ width: `${width}%`, backgroundColor: seg.color }}
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 + i * 0.08 }}
                >
                  {width > 10 && (
                    <span className="text-[7px] font-bold text-white truncate px-0.5">{seg.label}</span>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
        <div className="flex justify-between text-[8px] text-muted-foreground mt-1 px-1">
          <span>0:00</span>
          <span>{fmt(audio.duration / 2)}</span>
          <span>{fmt(audio.duration)}</span>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-x-3 mt-1.5">
          <span className="inline-flex items-center gap-1 text-[9px] text-muted-foreground">
            <span className="h-[2px] w-2.5 rounded-full bg-white/70" />
            Energy curve
          </span>
          <span className="inline-flex items-center gap-1 text-[9px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            Emotional peaks
          </span>
        </div>
      </div>

      {/* Metrics — 2-column grid for sidebar */}
      <div className="grid grid-cols-2 gap-1.5">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            className="rounded-lg glass-surface px-2 py-1.5 text-center"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
          >
            <p className="text-xs font-bold" style={{ color: m.color }}>{m.value}</p>
            <p className="text-[8px] text-muted-foreground font-medium">{m.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Sub-genres */}
      <motion.div
        className="space-y-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.35 }}
      >
        <span className="text-[9px] text-muted-foreground font-medium">Sub-genres</span>
        <div className="flex flex-wrap gap-1">
          {['Dance-Pop', 'Electropop', 'Contemporary R&B'].map((tag, i) => (
            <motion.span
              key={tag}
              className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-medium text-primary"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: 0.4 + i * 0.08 }}
            >
              {tag}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

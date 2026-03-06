'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { MockAudio } from '@/lib/mock/types'

const AI_INSIGHTS = [
  'High energy in chorus — ideal for dynamic camera cuts',
  'Quiet bridge moment — perfect for emotional close-up',
  'Driving beat throughout verse — suits rhythmic montage',
] as const

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

interface AnalysisResultsProps {
  audio: MockAudio
  onContinue: () => void
}

export function AnalysisResults({ audio, onContinue }: AnalysisResultsProps) {
  const peaks = audio.energyCurve.filter((p) => p.isPeak)
  const bpmCount = useCountUp(audio.bpm, 900)
  const peakCount = useCountUp(peaks.length, 600)

  const svgPoints = audio.energyCurve
    .map((p) => `${(p.time / audio.duration) * 100},${40 - p.energy * 36}`)
    .join(' ')

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s) % 60).padStart(2, '0')}`

  const metrics = [
    { label: 'BPM',      value: String(bpmCount),      color: '#7C3AED' },
    { label: 'Key',      value: audio.key,              color: '#06B6D4' },
    { label: 'Duration', value: fmt(audio.duration),    color: '#10B981' },
    { label: 'Peaks',    value: String(peakCount),      color: '#F59E0B' },
  ]

  return (
    <div className="flex h-full justify-center overflow-y-auto p-6">
      <motion.div
        className="w-full max-w-lg space-y-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h2 className="text-lg font-bold text-foreground">Music Analysis Complete</h2>
          <p className="text-xs text-muted-foreground mt-0.5">&quot;{audio.title}&quot; by {audio.artist}</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-4 gap-2">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              className="rounded-xl border border-border bg-card p-3 text-center"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
            >
              <p className="text-lg font-bold" style={{ color: m.color }}>{m.value}</p>
              <p className="text-[10px] text-muted-foreground font-medium">{m.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Song structure */}
        <div>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Song Structure</p>
          <div className="flex gap-1 rounded-lg overflow-hidden">
            {audio.segments.map((seg, i) => {
              const width = ((seg.endTime - seg.startTime) / audio.duration) * 100
              return (
                <motion.div
                  key={seg.id}
                  className="h-8 flex items-center justify-center text-[9px] font-bold text-white min-w-[30px]"
                  style={{ width: `${width}%`, backgroundColor: seg.color }}
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
                  title={`${seg.label}: ${seg.startTime}s – ${seg.endTime}s`}
                >
                  {width > 8 && seg.label}
                </motion.div>
              )
            })}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {audio.segments.map((seg) => (
              <span key={seg.id} className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: seg.color }} />
                {seg.label}
              </span>
            ))}
          </div>
        </div>

        {/* Energy curve */}
        <div>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Emotion / Energy Curve</p>
          <div className="h-20 rounded-xl border border-border bg-card p-2 relative">
            <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
              <motion.polyline
                fill="none"
                stroke="var(--primary, #7C3AED)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={svgPoints}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.2 }}
              />
              {peaks.map((p, i) => {
                const cx = (p.time / audio.duration) * 100
                const cy = 40 - p.energy * 36
                return (
                  <motion.circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r="2"
                    fill="#EF4444"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 12, delay: 1.6 + i * 0.12 }}
                  />
                )
              })}
            </svg>
          </div>
          <div className="flex justify-between text-[9px] text-muted-foreground mt-1 px-1">
            <span>0:00</span>
            <span>{fmt(audio.duration / 2)}</span>
            <span>{fmt(audio.duration)}</span>
          </div>
        </div>

        {/* Peaks */}
        <div>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Detected Emotional Peaks</p>
          <div className="space-y-1.5">
            {peaks.slice(0, 4).map((p, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 1.8 + i * 0.1 }}
              >
                <span className="text-[10px] font-mono text-primary">{fmt(p.time)}</span>
                <div className="flex-1 h-1.5 rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-pink-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${p.energy * 100}%` }}
                    transition={{ duration: 0.6, delay: 1.9 + i * 0.1 }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground font-medium">{Math.round(p.energy * 100)}%</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">AI Insights</p>
          <div className="space-y-1.5">
            {AI_INSIGHTS.map((insight, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 2.2 + i * 0.12 }}
              >
                <span className="mt-0.5 text-primary text-[10px]">&#9670;</span>
                <p className="text-[11px] text-foreground/80 leading-snug">{insight}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Continue */}
        <motion.button
          onClick={onContinue}
          className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.6 }}
        >
          Continue to Storyline
        </motion.button>
      </motion.div>
    </div>
  )
}

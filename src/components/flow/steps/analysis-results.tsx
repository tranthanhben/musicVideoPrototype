'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { MockAudio } from '@/lib/mock/types'
import { AnalysisEnergyCurve } from './analysis-energy-curve'

const AI_INSIGHTS = [
  'High energy in chorus — ideal for dynamic camera cuts and fast-paced edits',
  'Quiet bridge moment — perfect for emotional close-up and slow motion',
  'Driving beat throughout verse — suits rhythmic montage and synchronized motion',
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
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [target, dur])
  return value
}

function TypewriterText({ text, delay }: { text: string; delay: number }) {
  const [displayed, setDisplayed] = useState('')
  useEffect(() => {
    let i = 0
    let iv: ReturnType<typeof setInterval> | null = null
    const t = setTimeout(() => {
      iv = setInterval(() => {
        i++
        setDisplayed(text.slice(0, i))
        if (i >= text.length) { if (iv) clearInterval(iv); iv = null }
      }, 22)
    }, delay)
    return () => { clearTimeout(t); if (iv) clearInterval(iv) }
  }, [text, delay])
  return <>{displayed}</>
}

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${String(Math.floor(s) % 60).padStart(2, '0')}`
}

interface AnalysisResultsProps {
  audio: MockAudio
  onContinue: () => void
}

export function AnalysisResults({ audio, onContinue }: AnalysisResultsProps) {
  const peaks = audio.energyCurve.filter((p) => p.isPeak)
  const bpmCount = useCountUp(audio.bpm, 900)
  const peakCount = useCountUp(peaks.length, 600)

  const metrics = [
    { label: 'BPM',      value: String(bpmCount),   color: '#7C3AED', bg: '#7C3AED15' },
    { label: 'Key',      value: audio.key,           color: '#06B6D4', bg: '#06B6D415' },
    { label: 'Duration', value: fmt(audio.duration), color: '#10B981', bg: '#10B98115' },
    { label: 'Peaks',    value: String(peakCount),   color: '#F59E0B', bg: '#F59E0B15' },
  ]

  return (
    <div className="flex h-full justify-center overflow-y-auto p-6">
      <motion.div
        className="w-full max-w-xl lg:max-w-5xl"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="mb-4">
          <h2 className="text-lg font-bold text-foreground">Music Analysis Complete</h2>
          <p className="text-xs text-muted-foreground mt-0.5">&quot;{audio.title}&quot; by {audio.artist}</p>
        </div>

        {/* Metrics — always full-width spanning both cols */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              className="rounded-xl border border-border p-3 text-center overflow-hidden relative"
              style={{ background: m.bg }}
              initial={{ opacity: 0, scale: 0.8, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08, type: 'spring', stiffness: 280, damping: 22 }}
            >
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: m.color }} />
              <p className="text-xl font-bold tabular-nums" style={{ color: m.color }}>{m.value}</p>
              <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{m.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Responsive 2-col on lg+ */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 space-y-4 lg:space-y-0">

          {/* ---- LEFT col: structure + energy curve ---- */}
          <div className="space-y-4">

            {/* Song structure */}
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Song Structure</p>
              <div className="flex gap-[2px] rounded-xl overflow-hidden h-9">
                {audio.segments.map((seg, i) => {
                  const width = ((seg.endTime - seg.startTime) / audio.duration) * 100
                  return (
                    <motion.div
                      key={seg.id}
                      className="relative flex items-center justify-center text-[9px] font-bold text-white overflow-hidden cursor-default group"
                      style={{ width: `${width}%`, backgroundColor: seg.color }}
                      initial={{ opacity: 0, scaleY: 0 }}
                      animate={{ opacity: 1, scaleY: 1 }}
                      transition={{ duration: 0.35, delay: 0.25 + i * 0.08 }}
                      title={`${seg.label}: ${fmt(seg.startTime)} – ${fmt(seg.endTime)}`}
                    >
                      {width > 8 && seg.label}
                      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/15 transition-colors duration-200" />
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
            <AnalysisEnergyCurve energyCurve={audio.energyCurve} duration={audio.duration} />

          </div>{/* end LEFT col */}

          {/* ---- RIGHT col: peaks + insights + continue ---- */}
          <div className="space-y-4">

            {/* Emotional peaks */}
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Detected Emotional Peaks</p>
              <div className="space-y-1.5">
                {peaks.slice(0, 4).map((p, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: 1.9 + i * 0.1 }}
                  >
                    <span className="text-[10px] font-mono text-primary w-8 shrink-0">{fmt(p.time)}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #7C3AED, #EC4899)' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${p.energy * 100}%` }}
                        transition={{ duration: 0.7, delay: 2.0 + i * 0.1 }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-semibold w-8 text-right shrink-0">
                      {Math.round(p.energy * 100)}%
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">AI Insights</p>
              <div className="space-y-2">
                {AI_INSIGHTS.map((insight, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-2 rounded-xl border border-primary/25 bg-primary/5 px-3 py-2.5"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 2.3 + i * 0.15 }}
                  >
                    <span className="mt-0.5 text-primary text-xs shrink-0">&#9670;</span>
                    <p className="text-[11px] text-foreground/85 leading-snug">
                      <TypewriterText text={insight} delay={(2300 + i * 150)} />
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Continue */}
            <motion.button
              onClick={onContinue}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.9 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              Continue to Storyline
            </motion.button>

          </div>{/* end RIGHT col */}

        </div>{/* end 2-col grid */}
      </motion.div>
    </div>
  )
}

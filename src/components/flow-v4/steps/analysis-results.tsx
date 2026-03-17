'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { MockAudio } from '@/lib/mock/types'
import { StorylineConceptsSection } from './storyline-concepts'

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

const MIN_TRIM_SECONDS = 10

interface AnalysisResultsProps {
  audio: MockAudio
  selectedConceptId: string | null
  onConceptSelect: (id: string) => void
  onContinue: () => void
  hideIdeation?: boolean
}

export function AnalysisResults({ audio, selectedConceptId, onConceptSelect, onContinue, hideIdeation }: AnalysisResultsProps) {
  const peaks = audio.energyCurve.filter((p) => p.isPeak)
  const bpmCount = useCountUp(audio.bpm, 900)
  const peakCount = useCountUp(peaks.length, 600)

  // Trim state
  const [trimStart, setTrimStart] = useState(0)
  const [trimEnd, setTrimEnd] = useState(audio.duration)
  const waveContainerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<'start' | 'end' | null>(null)
  const trimRef = useRef({ start: trimStart, end: trimEnd })
  trimRef.current = { start: trimStart, end: trimEnd }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current || !waveContainerRef.current) return
      const rect = waveContainerRef.current.getBoundingClientRect()
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      const time = ratio * audio.duration
      const { start, end } = trimRef.current
      if (dragRef.current === 'start') {
        const newStart = Math.max(0, Math.min(time, end - MIN_TRIM_SECONDS))
        setTrimStart(newStart)
      } else {
        const newEnd = Math.min(audio.duration, Math.max(time, start + MIN_TRIM_SECONDS))
        setTrimEnd(newEnd)
      }
    }
    const handleMouseUp = () => {
      if (dragRef.current) {
        dragRef.current = null
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [audio.duration])

  const startDrag = useCallback((handle: 'start' | 'end') => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragRef.current = handle
    document.body.style.cursor = 'ew-resize'
    document.body.style.userSelect = 'none'
  }, [])

  const selectedDuration = trimEnd - trimStart
  const durationRatio = selectedDuration / audio.duration

  // Play state
  const [isPlaying, setIsPlaying] = useState(false)
  const [playPosition, setPlayPosition] = useState(trimStart)
  const playRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      if (playRef.current) clearInterval(playRef.current)
      playRef.current = null
      setIsPlaying(false)
    } else {
      setPlayPosition(trimStart)
      setIsPlaying(true)
      playRef.current = setInterval(() => {
        setPlayPosition((pos) => {
          const next = pos + 0.1
          if (next >= trimEnd) {
            if (playRef.current) clearInterval(playRef.current)
            playRef.current = null
            setIsPlaying(false)
            return trimStart
          }
          return next
        })
      }, 100)
    }
  }, [isPlaying, trimStart, trimEnd])

  useEffect(() => () => { if (playRef.current) clearInterval(playRef.current) }, [])

  // Ref for the Ideation heading — scroll target
  const ideationRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Scroll to Ideation when storyline + concepts are fully loaded
  const handleConceptsReady = useCallback(() => {
    // Small delay to let framer-motion finish rendering the concept cards
    setTimeout(() => {
      const container = scrollContainerRef.current
      const target = ideationRef.current
      if (!container || !target) return
      // Scroll so the Ideation heading sits at the very top of the visible area
      const targetTop = target.offsetTop - container.offsetTop
      container.scrollTo({ top: targetTop, behavior: 'smooth' })
    }, 400)
  }, [])

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s) % 60).padStart(2, '0')}`

  const metrics = [
    { label: 'BPM',      value: String(bpmCount),      color: '#F97316' },
    { label: 'Key',      value: audio.key,              color: '#06B6D4' },
    { label: 'Duration', value: fmt(audio.duration),    color: '#10B981' },
    { label: 'Peaks',    value: String(peakCount),      color: '#EF4444' },
  ]

  return (
    <div ref={scrollContainerRef} className="flex h-full justify-center overflow-y-auto p-6">
      <motion.div
        className="w-full space-y-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* ── SONG ANALYSIS (combined summary + waveform) ── */}
        <motion.div
          className="rounded-xl border border-border bg-card p-4 space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0 }}
        >
          {/* Title + artist + badge */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-foreground leading-tight">&ldquo;{audio.title}&rdquo;</h2>
              <p className="text-[11px] text-muted-foreground">{audio.artist}</p>
            </div>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold text-primary shrink-0">Cremi Analysis</span>
          </div>

          {/* AI-generated description */}
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground/70">Lyrics:</span> Two lovers separated across galaxies chase each other through nebulae, asteroid fields, and wormholes — until they finally touch and send a shockwave of light through the cosmos.
          </p>

          {/* Metrics row */}
          <div className="flex items-center gap-2 flex-wrap">
            {metrics.map((m, i) => (
              <motion.span
                key={m.label}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
              >
                <span className="text-[10px] font-bold" style={{ color: m.color }}>{m.value}</span>
                <span className="text-[9px] text-muted-foreground">{m.label}</span>
              </motion.span>
            ))}
          </div>

          {/* Tags: genre, sub-genre, mood */}
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full bg-[#8B5CF6]/15 px-2 py-0.5 text-[10px] font-semibold text-[#8B5CF6]">Pop</span>
            {['Dance-Pop', 'Electropop', 'Contemporary R&B'].map((tag) => (
              <span key={tag} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{tag}</span>
            ))}
            {['Euphoric', 'Romantic', 'Uplifting'].map((mood) => (
              <span key={mood} className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">{mood}</span>
            ))}
          </div>

          {/* Waveform + Energy curve + Trim handles */}
          <div className="rounded-lg bg-background/50 p-2 relative overflow-hidden">
            <div ref={waveContainerRef} className="h-20 relative group/wave">
              <svg width="100%" height="100%" viewBox="0 0 200 60" preserveAspectRatio="none">
                {/* Audio waveform bars — colored by song segment */}
                {Array.from({ length: 80 }).map((_, i) => {
                  const x = (i / 80) * 200
                  const time = (i / 80) * audio.duration
                  const idx = Math.floor((i / 80) * audio.energyCurve.length)
                  const e = audio.energyCurve[Math.min(idx, audio.energyCurve.length - 1)]?.energy ?? 0.3
                  const seed = Math.sin(i * 12.9898 + 78.233) * 43758.5453
                  const rand = seed - Math.floor(seed)
                  const h = Math.max((e * 0.7 + rand * 0.3) * 40, 3)
                  const seg = audio.segments.find((s) => time >= s.startTime && time < s.endTime) ?? audio.segments[audio.segments.length - 1]
                  const inRange = time >= trimStart && time <= trimEnd
                  return (
                    <motion.rect
                      key={`w-${i}`}
                      x={x}
                      y={30 - h / 2}
                      width={1.6}
                      height={h}
                      rx={0.8}
                      fill={seg.color}
                      opacity={inRange ? 0.5 : 0.15}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.3, delay: 0.05 + i * 0.01 }}
                    />
                  )
                })}
                {/* Energy curve line */}
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
              </svg>

              {/* Peak dots — rendered as HTML so they stay perfectly circular */}
              {peaks.map((p, i) => {
                const left = (p.time / audio.duration) * 100
                const top = ((1 - p.energy) * 0.733 + 0.1) * 100 // maps energy to vertical position within waveform
                return (
                  <motion.div
                    key={i}
                    className="absolute w-[7px] h-[7px] rounded-full bg-red-500 -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow-[0_0_4px_rgba(239,68,68,0.5)]"
                    style={{ left: `${left}%`, top: `${top}%` }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 12, delay: 1.6 + i * 0.12 }}
                  />
                )
              })}

              {/* Dim overlays outside trim selection */}
              <div className="absolute inset-y-0 left-0 bg-black/30 pointer-events-none rounded-l" style={{ width: `${(trimStart / audio.duration) * 100}%` }} />
              <div className="absolute inset-y-0 right-0 bg-black/30 pointer-events-none rounded-r" style={{ width: `${(1 - trimEnd / audio.duration) * 100}%` }} />

              {/* Selection border lines */}
              <div className="absolute top-0 h-[1px] bg-white/25 pointer-events-none" style={{ left: `${(trimStart / audio.duration) * 100}%`, width: `${((trimEnd - trimStart) / audio.duration) * 100}%` }} />
              <div className="absolute bottom-0 h-[1px] bg-white/25 pointer-events-none" style={{ left: `${(trimStart / audio.duration) * 100}%`, width: `${((trimEnd - trimStart) / audio.duration) * 100}%` }} />

              {/* Start handle */}
              <div
                className="absolute inset-y-0 z-10 cursor-ew-resize group/trimL"
                style={{ left: `${(trimStart / audio.duration) * 100}%`, width: '14px', transform: 'translateX(-50%)' }}
                onMouseDown={startDrag('start')}
              >
                <div className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-white/80 group-hover/trimL:bg-white group-hover/trimL:shadow-[0_0_6px_rgba(255,255,255,0.4)] transition-all" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-1.5 rounded-sm bg-white shadow-sm" />
              </div>

              {/* End handle */}
              <div
                className="absolute inset-y-0 z-10 cursor-ew-resize group/trimR"
                style={{ left: `${(trimEnd / audio.duration) * 100}%`, width: '14px', transform: 'translateX(-50%)' }}
                onMouseDown={startDrag('end')}
              >
                <div className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-white/80 group-hover/trimR:bg-white group-hover/trimR:shadow-[0_0_6px_rgba(255,255,255,0.4)] transition-all" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-1.5 rounded-sm bg-white shadow-sm" />
              </div>

              {/* Playhead */}
              {isPlaying && (
                <div
                  className="absolute inset-y-0 z-20 pointer-events-none"
                  style={{ left: `${(playPosition / audio.duration) * 100}%` }}
                >
                  <div className="absolute inset-y-0 left-0 w-[2px] bg-white shadow-[0_0_6px_rgba(255,255,255,0.6)]" />
                </div>
              )}

              {/* Centered play/pause overlay */}
              <button
                onClick={togglePlay}
                className={`absolute z-30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm border border-white/20 transition-all duration-200 cursor-pointer ${isPlaying ? 'opacity-80 hover:opacity-100' : 'opacity-0 group-hover/wave:opacity-70 hover:!opacity-100'}`}
              >
                {isPlaying ? (
                  <svg width="11" height="11" viewBox="0 0 10 10" fill="white"><rect x="1.5" y="1" width="2.5" height="8" rx="0.5" /><rect x="6" y="1" width="2.5" height="8" rx="0.5" /></svg>
                ) : (
                  <svg width="11" height="11" viewBox="0 0 10 10" fill="white"><polygon points="3,0 10,5 3,10" /></svg>
                )}
              </button>
            </div>
            {/* Segment bar — HTML so text isn't stretched */}
            <div className="flex gap-0.5 mt-1">
              {audio.segments.map((seg, i) => {
                const width = ((seg.endTime - seg.startTime) / audio.duration) * 100
                return (
                  <motion.div
                    key={seg.id}
                    className="h-5 flex items-center justify-center rounded-sm min-w-0"
                    style={{ width: `${width}%`, backgroundColor: seg.color }}
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 + i * 0.08 }}
                  >
                    {width > 8 && (
                      <span className="text-[8px] font-bold text-white truncate px-1">{seg.label}</span>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
          {/* Time labels with selected duration */}
          <div className="flex items-center justify-between text-[9px] text-muted-foreground mt-1 px-1">
            <span className="tabular-nums">{fmt(trimStart)}</span>
            <span className="text-[10px] font-bold text-foreground tabular-nums">{fmt(selectedDuration)} selected</span>
            <span className="tabular-nums">{fmt(trimEnd)}</span>
          </div>
          {/* Legend: energy curve + peaks only */}
          <div className="flex items-center gap-x-4 mt-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="h-[2px] w-3 rounded-full bg-white/70" />
              Energy curve
            </span>
            <span className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Emotional peaks
            </span>
          </div>
        </motion.div>
        {!hideIdeation && (
          <>
            {/* ── Divider ── */}
            <motion.div
              className="relative flex items-center py-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
            >
              <div className="flex-1 border-t border-border" />
              <span className="px-3 text-[9px] text-muted-foreground/50 uppercase tracking-widest">your turn</span>
              <div className="flex-1 border-t border-border" />
            </motion.div>

            {/* ── IDEATION (interactive) ── */}
            <motion.div
              ref={ideationRef}
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-lg font-bold text-foreground">Music Video Ideation</h2>
            </motion.div>

            {/* Storyline + Visual Concepts */}
            <StorylineConceptsSection
              selectedConceptId={selectedConceptId}
              onConceptSelect={onConceptSelect}
              onContinue={onContinue}
              onConceptsReady={handleConceptsReady}
              durationRatio={durationRatio}
            />
          </>
        )}
      </motion.div>
    </div>
  )
}

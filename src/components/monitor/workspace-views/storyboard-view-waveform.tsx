'use client'

import { motion } from 'framer-motion'
import type { AudioSegment } from '@/lib/mock/types'
import type { EnergyPoint } from '@/lib/mock/types'

interface WaveformProps {
  energyCurve: EnergyPoint[]
  segments: AudioSegment[]
  duration: number
}

function WaveformBar({ energy, height, color }: { energy: number; height: number; color: string }) {
  return (
    <motion.div
      className="w-full rounded-sm opacity-80"
      style={{ height: Math.max(2, energy * height), backgroundColor: color, alignSelf: 'flex-end' }}
      initial={{ scaleY: 0 }}
      animate={{ scaleY: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    />
  )
}

function getSegmentForTime(time: number, segs: AudioSegment[]): AudioSegment | undefined {
  return segs.find((seg) => time >= seg.startTime && time < seg.endTime)
}

export function StoryboardViewWaveform({ energyCurve, segments, duration }: WaveformProps) {
  const totalBars = Math.min(energyCurve.length, 80)
  const sampledCurve = energyCurve.length > totalBars
    ? energyCurve.filter((_, i) => i % Math.ceil(energyCurve.length / totalBars) === 0).slice(0, totalBars)
    : energyCurve

  function getColorForIndex(index: number, total: number): string {
    const audioTime = (index / total) * duration
    const seg = getSegmentForTime(audioTime, segments)
    return seg?.color ?? '#6366f1'
  }

  return (
    <div className="shrink-0 rounded-xl bg-black/30 border border-border/30 p-3">
      <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Audio Waveform</p>
      <div className="flex items-end gap-[1px] h-10">
        {sampledCurve.map((point, i) => (
          <WaveformBar key={i} energy={point.energy} height={36} color={getColorForIndex(i, sampledCurve.length)} />
        ))}
      </div>
      {/* Segment strip */}
      <div className="flex mt-2 rounded overflow-hidden">
        {segments.map((seg) => {
          const widthPct = ((seg.endTime - seg.startTime) / duration) * 100
          return (
            <div key={seg.id} className="flex items-center justify-center overflow-hidden"
              style={{ width: `${widthPct}%`, backgroundColor: seg.color, height: 14 }}>
              <span className="text-[8px] font-bold text-white truncate px-1">{seg.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

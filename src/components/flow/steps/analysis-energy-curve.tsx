'use client'

import { motion } from 'framer-motion'

interface EnergyPoint {
  time: number
  energy: number
  isPeak: boolean
}

interface AnalysisEnergyCurveProps {
  energyCurve: EnergyPoint[]
  duration: number
}

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${String(Math.floor(s) % 60).padStart(2, '0')}`
}

export function AnalysisEnergyCurve({ energyCurve, duration }: AnalysisEnergyCurveProps) {
  const peaks = energyCurve.filter((p) => p.isPeak)

  const coords = energyCurve.map((p) => ({
    x: (p.time / duration) * 100,
    y: 40 - p.energy * 36,
  }))

  // Build SVG path `d` attribute for proper pathLength animation
  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x},${c.y}`).join(' ')
  const areaPath = `M0,40 ${coords.map((c) => `L${c.x},${c.y}`).join(' ')} L100,40 Z`

  return (
    <div>
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Emotion / Energy Curve</p>
      <div className="h-24 rounded-xl border border-border bg-card p-2 relative overflow-hidden">
        <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
          <defs>
            <linearGradient id="curve-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="50%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
            <linearGradient id="area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path
            d={areaPath}
            fill="url(#area-gradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.3 }}
          />
          <motion.path
            d={linePath}
            fill="none"
            stroke="url(#curve-gradient)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.6, ease: 'easeInOut', delay: 0.2 }}
          />
          {peaks.map((p, i) => {
            const cx = (p.time / duration) * 100
            const cy = 40 - p.energy * 36
            return (
              <motion.circle
                key={i}
                cx={cx} cy={cy} r="2"
                fill="#EF4444"
                stroke="#fff"
                strokeWidth="0.5"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 12, delay: 1.7 + i * 0.12 }}
              />
            )
          })}
        </svg>
      </div>
      <div className="flex justify-between text-[9px] text-muted-foreground mt-1 px-1">
        <span>0:00</span>
        <span>{fmt(duration / 2)}</span>
        <span>{fmt(duration)}</span>
      </div>
    </div>
  )
}

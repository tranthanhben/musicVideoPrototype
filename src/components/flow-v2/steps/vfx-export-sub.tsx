'use client'

import { motion } from 'framer-motion'
import { Download, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// --- VFX filter map ---

type FilterMap = Record<string, string>

export const VFX_FILTERS: FilterMap = {
  'cosmic-cinema': 'contrast(1.1) brightness(1.05)',
  'neon-glow': 'saturate(1.5) brightness(1.15)',
  'film-noir': 'grayscale(0.8) contrast(1.4)',
  'dreamy-soft': 'blur(0.5px) brightness(1.1) sepia(0.2)',
  'clean-pop': 'saturate(1.3) brightness(1.1)',
  'vintage-16mm': 'sepia(0.4) contrast(0.9)',
}

// --- Confetti particle ---

interface ParticleProps {
  color: string
  x: number
  delay: number
  duration: number
  size: number
  xOffset: number
}

const CONFETTI_COLORS = [
  '#7C3AED', '#EC4899', '#22D3EE', '#10B981', '#F59E0B',
  '#EF4444', '#06B6D4', '#A855F7', '#F97316', '#84CC16',
]

export function ConfettiParticle({ color, x, delay, duration, size, xOffset }: ParticleProps) {
  return (
    <motion.div
      initial={{ y: 0, opacity: 1, x }}
      animate={{ y: -180, opacity: 0, x: x + xOffset }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className="absolute bottom-0 rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        left: `${x}%`,
      }}
    />
  )
}

export function generateParticles() {
  return Array.from({ length: 24 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    x: Math.random() * 100,
    delay: Math.random() * 0.6,
    duration: 0.9 + Math.random() * 0.8,
    size: Math.random() * 6 + 4,
    xOffset: Math.random() * 60 - 30,
  }))
}

// --- VFX preset + transition selectors ---

import { VFX_PRESETS, TRANSITION_TYPES } from '@/lib/flow-v2/mock-data'

interface VfxControlsProps {
  selectedVfx: string
  selectedTransition: string
  onVfxChange: (id: string) => void
  onTransitionChange: (id: string) => void
}

export function VfxControls({ selectedVfx, selectedTransition, onVfxChange, onTransitionChange }: VfxControlsProps) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] text-muted-foreground mb-1.5 font-mono uppercase tracking-wider">VFX Preset</p>
        <div className="grid grid-cols-3 gap-2">
          {VFX_PRESETS.map((vfx) => (
            <button
              key={vfx.id}
              onClick={() => onVfxChange(vfx.id)}
              className={cn(
                'rounded-lg border p-2 text-left transition-all cursor-pointer',
                selectedVfx === vfx.id ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-border/80',
              )}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: vfx.accentColor }} />
                <span className="text-[11px] font-semibold text-foreground">{vfx.label}</span>
              </div>
              <p className="text-[9px] text-muted-foreground">{vfx.description}</p>
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground mb-1.5 font-mono uppercase tracking-wider">Transition Style</p>
        <div className="flex gap-1.5 flex-wrap">
          {TRANSITION_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => onTransitionChange(t.id)}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-[11px] font-medium transition-colors cursor-pointer',
                selectedTransition === t.id
                  ? 'bg-primary/15 border-primary/30 text-primary'
                  : 'bg-card border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// --- Export platform card ---

interface ExportFormat {
  platform: string
  format: string
  aspectLabel: string
  ratio: [number, number]
}

interface ExportPlatformCardProps {
  fmt: ExportFormat
  exported: boolean
}

function AspectIcon({ ratio }: { ratio: [number, number] }) {
  const [w, h] = ratio
  const scale = 28 / Math.max(w, h)
  return (
    <div className="flex items-center justify-center" style={{ width: 28, height: 28 }}>
      <div className="rounded-sm border border-border bg-muted" style={{ width: Math.round(w * scale), height: Math.round(h * scale) }} />
    </div>
  )
}

export function ExportPlatformCard({ fmt, exported }: ExportPlatformCardProps) {
  return (
    <motion.div
      animate={exported ? { borderColor: 'rgba(34,197,94,0.5)', backgroundColor: 'rgba(34,197,94,0.05)' } : {}}
      className={cn(
        'flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card p-3 transition-colors',
        exported ? 'cursor-pointer hover:border-green-500/70' : 'cursor-default',
      )}
    >
      <div className="relative">
        <AspectIcon ratio={fmt.ratio} />
        {exported && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-green-500 flex items-center justify-center"
          >
            <CheckCircle2 className="h-2.5 w-2.5 text-white" />
          </motion.div>
        )}
      </div>
      <p className="text-[11px] font-semibold text-foreground">{fmt.platform}</p>
      <p className="text-[9px] text-muted-foreground text-center">{fmt.format}</p>
      {exported && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1 mt-0.5"
        >
          <span className="text-[9px] font-semibold text-green-500 uppercase tracking-wide">Ready</span>
          <Download className="h-2.5 w-2.5 text-green-500" />
        </motion.div>
      )}
    </motion.div>
  )
}

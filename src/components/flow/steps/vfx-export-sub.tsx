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

// --- Confetti ---

interface ParticleProps {
  color: string
  x: number
  delay: number
  duration: number
  size: number
  xOffset: number
  shape: 'circle' | 'square'
}

const CONFETTI_COLORS = [
  '#7C3AED', '#EC4899', '#22D3EE', '#10B981', '#F59E0B',
  '#EF4444', '#06B6D4', '#A855F7', '#F97316', '#84CC16',
]

export function ConfettiParticle({ color, x, delay, duration, size, xOffset, shape }: ParticleProps) {
  return (
    <motion.div
      initial={{ y: 0, opacity: 1, x, rotate: 0 }}
      animate={{ y: -220, opacity: 0, x: x + xOffset, rotate: 360 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className="absolute bottom-0 pointer-events-none"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: shape === 'circle' ? '50%' : 2,
        left: `${x}%`,
      }}
    />
  )
}

export function generateParticles() {
  return Array.from({ length: 32 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    x: Math.random() * 100,
    delay: Math.random() * 0.7,
    duration: 0.8 + Math.random() * 1.0,
    size: Math.random() * 7 + 4,
    xOffset: Math.random() * 80 - 40,
    shape: (i % 3 === 0 ? 'square' : 'circle') as 'circle' | 'square',
  }))
}

// --- VFX preset selector ---

import { VFX_PRESETS, TRANSITION_TYPES } from '@/lib/flow/mock-data'

interface VfxControlsProps {
  selectedVfx: string
  selectedTransition: string
  onVfxChange: (id: string) => void
  onTransitionChange: (id: string) => void
}

// Visual preview per preset
const VFX_PREVIEW_STYLE: Record<string, React.CSSProperties> = {
  'cosmic-cinema': { background: 'linear-gradient(135deg, #1E1B4B, #7C3AED, #22D3EE)' },
  'neon-glow':     { background: 'linear-gradient(135deg, #0A0A0F, #EC4899, #7C3AED)', filter: 'saturate(1.5)' },
  'film-noir':     { background: 'linear-gradient(135deg, #111, #555, #999)', filter: 'grayscale(1) contrast(1.4)' },
  'dreamy-soft':   { background: 'linear-gradient(135deg, #FDE68A, #F9A8D4, #C4B5FD)', filter: 'blur(0.5px) sepia(0.2)' },
  'clean-pop':     { background: 'linear-gradient(135deg, #22D3EE, #4ADE80, #F59E0B)', filter: 'saturate(1.3)' },
  'vintage-16mm':  { background: 'linear-gradient(135deg, #92400E, #D97706, #78716C)', filter: 'sepia(0.4)' },
}

export function VfxControls({ selectedVfx, selectedTransition, onVfxChange, onTransitionChange }: VfxControlsProps) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] text-muted-foreground mb-2 font-mono uppercase tracking-wider">VFX Preset</p>
        <div className="grid grid-cols-3 gap-2">
          {VFX_PRESETS.map((vfx) => {
            const isSelected = selectedVfx === vfx.id
            return (
              <motion.button
                key={vfx.id}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onVfxChange(vfx.id)}
                className={cn(
                  'rounded-xl border p-2.5 text-left transition-all cursor-pointer overflow-hidden',
                  isSelected ? 'border-primary shadow-md' : 'border-border bg-card hover:border-border/60',
                )}
                style={isSelected ? { boxShadow: `0 0 0 1px ${vfx.accentColor}40, 0 4px 12px ${vfx.accentColor}15` } : {}}
              >
                {/* Visual preview thumbnail */}
                <div
                  className="h-8 w-full rounded-lg mb-2 transition-all duration-300"
                  style={VFX_PREVIEW_STYLE[vfx.id] ?? { background: vfx.accentColor }}
                />
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: vfx.accentColor }} />
                  <span className="text-[11px] font-semibold text-foreground">{vfx.label}</span>
                </div>
                <p className="text-[9px] text-muted-foreground leading-snug">{vfx.description}</p>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Transition types */}
      <div>
        <p className="text-[10px] text-muted-foreground mb-1.5 font-mono uppercase tracking-wider">Transition Style</p>
        <div className="flex gap-1.5 flex-wrap">
          {TRANSITION_TYPES.map((t) => {
            const isSelected = selectedTransition === t.id
            return (
              <motion.button
                key={t.id}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onTransitionChange(t.id)}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-[11px] font-medium transition-all cursor-pointer',
                  isSelected
                    ? 'bg-primary/15 border-primary/40 text-primary shadow-sm'
                    : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-border/60',
                )}
              >
                {t.label}
              </motion.button>
            )
          })}
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
  dimensions?: string
  fileFormat?: string
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
      <div
        className="rounded-sm border border-border bg-muted"
        style={{ width: Math.round(w * scale), height: Math.round(h * scale) }}
      />
    </div>
  )
}

export function ExportPlatformCard({ fmt, exported }: ExportPlatformCardProps) {
  return (
    <motion.div
      animate={exported ? { borderColor: 'rgba(34,197,94,0.5)', backgroundColor: 'rgba(34,197,94,0.06)' } : {}}
      whileHover={exported ? { scale: 1.03 } : {}}
      className={cn(
        'flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card p-3 transition-all',
        exported ? 'cursor-pointer' : 'cursor-default',
      )}
    >
      <div className="relative">
        <AspectIcon ratio={fmt.ratio} />
        {exported && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-green-500 flex items-center justify-center"
          >
            <CheckCircle2 className="h-2.5 w-2.5 text-white" />
          </motion.div>
        )}
      </div>
      <p className="text-[11px] font-semibold text-foreground">{fmt.platform}</p>
      <p className="text-[9px] text-muted-foreground text-center leading-snug">{fmt.format}</p>
      {fmt.dimensions && (
        <p className="text-[9px] text-muted-foreground/60">{fmt.dimensions}</p>
      )}
      {exported && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1 mt-0.5"
        >
          <span className="text-[9px] font-bold text-green-500 uppercase tracking-wide">Ready</span>
          <Download className="h-2.5 w-2.5 text-green-500" />
        </motion.div>
      )}
    </motion.div>
  )
}

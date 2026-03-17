'use client'

import { useState } from 'react'
import { Sparkles, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { CostBreakdown } from '@/lib/flow-v3/cost-calculator'

interface CreditsSpendingPanelProps {
  breakdown: CostBreakdown
  sceneCount: number
  model: string
  quality: string
}

const LINE_ITEMS = [
  { key: 'analysis', label: 'Analysis & Ideation', color: 'bg-blue-400', textColor: 'text-blue-400' },
  { key: 'sceneGeneration', label: (n: number) => `Scene Generation (${n} scenes)`, color: 'bg-purple-400', textColor: 'text-purple-400' },
  { key: 'vfxProcessing', label: 'VFX Processing', color: 'bg-pink-400', textColor: 'text-pink-400' },
  { key: 'export', label: 'Export & Render', color: 'bg-emerald-400', textColor: 'text-emerald-400' },
] as const

export function CreditsSpendingPanel({
  breakdown,
  sceneCount,
  model,
  quality,
}: CreditsSpendingPanelProps) {
  const [expanded, setExpanded] = useState(false)

  const barSegments = LINE_ITEMS.map(({ key, color }) => ({
    color,
    pct: breakdown.total > 0 ? (breakdown[key as keyof CostBreakdown] as number) / breakdown.total * 100 : 0,
  }))

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Compact bar */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2 hover:bg-muted/30 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-xs font-semibold text-foreground">{breakdown.total.toLocaleString()} credits</span>
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Expanded breakdown */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-3 border-t border-border pt-3">
              {/* Stacked bar */}
              <div className="flex h-2 w-full overflow-hidden rounded-full gap-px">
                {barSegments.map(({ color, pct }, i) => (
                  <div
                    key={i}
                    className={cn('h-full rounded-full', color)}
                    style={{ width: `${pct}%` }}
                  />
                ))}
              </div>

              {/* Line items */}
              <div className="space-y-1.5">
                {LINE_ITEMS.map(({ key, label, textColor }) => {
                  const value = breakdown[key as keyof CostBreakdown] as number
                  const displayLabel = typeof label === 'function' ? label(sceneCount) : label
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <span className={cn('text-[11px]', textColor)}>{displayLabel}</span>
                      <span className="text-[11px] text-muted-foreground tabular-nums">{value.toLocaleString()}</span>
                    </div>
                  )
                })}
              </div>

              <div className="border-t border-border pt-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-400">Total</span>
                  <span className="text-[11px] font-bold text-amber-400 tabular-nums">{breakdown.total.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-muted-foreground/60">
                  Using {model} model at {quality} quality
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

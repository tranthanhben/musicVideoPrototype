'use client'

import { useState, useRef, useEffect } from 'react'
import { Sparkles, TrendingDown, ShoppingCart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { CostBreakdown } from '@/lib/flow-v3/cost-calculator'

interface CreditsBadgeProps {
  balance?: number
  estimatedCost?: number
  breakdown?: CostBreakdown
}

const BREAKDOWN_ITEMS = [
  { key: 'analysis' as const, label: 'Analysis', color: 'bg-blue-400' },
  { key: 'sceneGeneration' as const, label: 'Scene Generation', color: 'bg-purple-400' },
  { key: 'vfxProcessing' as const, label: 'VFX Processing', color: 'bg-pink-400' },
  { key: 'export' as const, label: 'Export & Render', color: 'bg-emerald-400' },
]

export function CreditsBadge({ balance = 1250, estimatedCost = 0, breakdown }: CreditsBadgeProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const cost = breakdown?.total ?? estimatedCost
  const remaining = balance - cost
  const insufficient = remaining < 0

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn(
          'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer',
          insufficient
            ? 'border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/15'
            : 'border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/15',
        )}
      >
        <Sparkles className="h-3 w-3 shrink-0" />
        <span className="tabular-nums">{balance.toLocaleString()}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 z-50 w-64 rounded-xl border border-border bg-card shadow-xl shadow-black/30 overflow-hidden"
          >
            {/* Balance */}
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Balance</p>
                <button type="button" className="flex items-center gap-1 text-[10px] font-semibold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer">
                  <ShoppingCart className="h-3 w-3" /> Buy more
                </button>
              </div>
              <span className={cn('text-2xl font-bold tabular-nums', insufficient ? 'text-red-400' : 'text-amber-400')}>
                {balance.toLocaleString()}
              </span>
            </div>

            {/* Spending breakdown */}
            {breakdown && cost > 0 && (
              <div className="px-4 py-3 border-b border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-2">Project Estimate</p>
                {/* Proportional bar */}
                <div className="flex h-1.5 rounded-full overflow-hidden mb-2.5">
                  {BREAKDOWN_ITEMS.map(({ key, color }) => {
                    const val = breakdown[key]
                    if (!val) return null
                    return <div key={key} className={cn('h-full', color)} style={{ width: `${(val / cost) * 100}%` }} />
                  })}
                </div>
                {/* Line items */}
                <div className="space-y-1.5">
                  {BREAKDOWN_ITEMS.map(({ key, label, color }) => {
                    const val = breakdown[key]
                    if (!val) return null
                    return (
                      <div key={key} className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <span className={cn('h-2 w-2 rounded-full', color)} />{label}
                        </span>
                        <span className="font-medium text-foreground tabular-nums">{val.toLocaleString()}</span>
                      </div>
                    )
                  })}
                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-border">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="font-bold text-amber-400 tabular-nums">{cost.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* After generation */}
            <div className="px-4 py-2.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <TrendingDown className="h-3 w-3" /> After generation
                </span>
                <span className={cn('font-bold tabular-nums', insufficient ? 'text-red-400' : 'text-emerald-400')}>
                  {remaining.toLocaleString()}
                </span>
              </div>
              {insufficient && (
                <p className="text-[10px] text-red-400 mt-1.5">Insufficient credits</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

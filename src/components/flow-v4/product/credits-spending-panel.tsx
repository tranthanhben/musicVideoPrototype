'use client'

import { useState } from 'react'
import { X, Sparkles, ShoppingCart, TrendingDown, AlertTriangle, History } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { CostBreakdown } from '@/lib/flow-v4/cost-calculator'

interface CreditsHistoryEntry {
  id: string
  label: string
  amount: number
  ts: string
}

interface CreditsSpendingPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  balance?: number
  breakdown?: CostBreakdown
  history?: CreditsHistoryEntry[]
}

const BREAKDOWN_ITEMS = [
  { key: 'analysis' as const, label: 'Analysis & Ideation', color: 'bg-blue-400', textColor: 'text-blue-400' },
  { key: 'sceneGeneration' as const, label: 'Scene Generation', color: 'bg-purple-400', textColor: 'text-purple-400' },
  { key: 'vfxProcessing' as const, label: 'VFX Processing', color: 'bg-pink-400', textColor: 'text-pink-400' },
  { key: 'export' as const, label: 'Export & Render', color: 'bg-emerald-400', textColor: 'text-emerald-400' },
]

const MOCK_HISTORY: CreditsHistoryEntry[] = [
  { id: 'h1', label: 'Analysis run', amount: -50, ts: '2 min ago' },
  { id: 'h2', label: 'Storyboard draft', amount: -120, ts: '5 min ago' },
  { id: 'h3', label: 'Top-up purchase', amount: +500, ts: '1 hr ago' },
]

export function CreditsSpendingPanel({
  open,
  onOpenChange,
  balance = 1250,
  breakdown,
  history = MOCK_HISTORY,
}: CreditsSpendingPanelProps) {
  const [activeTab, setActiveTab] = useState<'breakdown' | 'history'>('breakdown')

  const cost = breakdown?.total ?? 0
  const remaining = balance - cost
  const lowCredits = remaining / balance < 0.2
  const insufficient = remaining < 0

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => onOpenChange(false)}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-72 flex-col border-l border-border bg-card"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-semibold text-foreground">Credits</span>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Balance card */}
            <div className={cn(
              'mx-3 mt-3 rounded-xl border p-3',
              insufficient ? 'border-red-500/30 bg-red-500/5' : lowCredits ? 'border-amber-500/40 bg-amber-500/5' : 'border-border bg-muted/20',
            )}>
              <div className="flex items-start justify-between mb-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Balance</p>
                <button
                  type="button"
                  className="flex items-center gap-1 text-[10px] font-semibold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                >
                  <ShoppingCart className="h-2.5 w-2.5" /> Buy more
                </button>
              </div>
              <span className={cn(
                'text-3xl font-bold tabular-nums',
                insufficient ? 'text-red-400' : lowCredits ? 'text-amber-400' : 'text-foreground',
              )}>
                {balance.toLocaleString()}
              </span>

              {/* Remaining after project */}
              {cost > 0 && (
                <div className="mt-2 pt-2 border-t border-border/60 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <TrendingDown className="h-3 w-3" /> After generation
                  </span>
                  <span className={cn('text-[11px] font-bold tabular-nums', insufficient ? 'text-red-400' : 'text-emerald-400')}>
                    {remaining.toLocaleString()}
                  </span>
                </div>
              )}

              {/* Low/insufficient warning */}
              {(insufficient || lowCredits) && (
                <div className={cn('mt-2 flex items-center gap-1.5 text-[10px] font-medium', insufficient ? 'text-red-400' : 'text-amber-400')}>
                  <AlertTriangle className="h-3 w-3 shrink-0" />
                  {insufficient ? 'Insufficient credits for this project' : 'Low credits — consider topping up'}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-0.5 border-b border-border px-3 pt-3 pb-0">
              {(['breakdown', 'history'] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={cn(
                    'capitalize px-2.5 pb-2 pt-1 text-[11px] font-medium transition-colors cursor-pointer border-b-2',
                    activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3">
              {activeTab === 'breakdown' && breakdown && cost > 0 ? (
                <div className="space-y-3">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Project Estimate</p>

                  {/* Stacked bar */}
                  <div className="flex h-2 w-full overflow-hidden rounded-full gap-px">
                    {BREAKDOWN_ITEMS.map(({ key, color }) => {
                      const val = breakdown[key]
                      if (!val) return null
                      return (
                        <div key={key} className={cn('h-full rounded-full', color)} style={{ width: `${(val / cost) * 100}%` }} />
                      )
                    })}
                  </div>

                  {/* Line items */}
                  <div className="space-y-1.5">
                    {BREAKDOWN_ITEMS.map(({ key, label, textColor, color }) => {
                      const val = breakdown[key]
                      if (!val) return null
                      return (
                        <div key={key} className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <span className={cn('h-2 w-2 rounded-full', color)} />
                            <span className={textColor}>{label}</span>
                          </span>
                          <span className="text-[11px] font-medium text-foreground tabular-nums">{val.toLocaleString()}</span>
                        </div>
                      )
                    })}
                  </div>

                  <div className="border-t border-border pt-2 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-400">Total estimate</span>
                    <span className="text-[11px] font-bold text-amber-400 tabular-nums">{cost.toLocaleString()}</span>
                  </div>
                </div>
              ) : activeTab === 'breakdown' ? (
                <p className="text-[11px] text-muted-foreground/60 text-center py-6">No cost estimate yet</p>
              ) : null}

              {activeTab === 'history' && (
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Session History</p>
                  {history.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground/60 text-center py-6">No transactions yet</p>
                  ) : (
                    history.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-2">
                          <History className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                          <div>
                            <p className="text-[11px] text-foreground">{entry.label}</p>
                            <p className="text-[10px] text-muted-foreground">{entry.ts}</p>
                          </div>
                        </div>
                        <span className={cn('text-[11px] font-bold tabular-nums', entry.amount < 0 ? 'text-red-400' : 'text-emerald-400')}>
                          {entry.amount > 0 ? '+' : ''}{entry.amount.toLocaleString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Download, Zap, ShoppingCart, ChevronRight, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ShowcaseSection } from './showcase-section-wrapper'

const transactions = [
  { id: 1, icon: Zap, desc: 'Scene generation — Solar Flare', credits: -150, time: '2h ago', type: 'debit' },
  { id: 2, icon: Download, desc: 'Video export — Midnight Dreams', credits: -80, time: '5h ago', type: 'debit' },
  { id: 3, icon: ShoppingCart, desc: 'Credit purchase — 500 pack', credits: +500, time: '1d ago', type: 'credit' },
  { id: 4, icon: Zap, desc: 'Scene generation — Neon Pulse', credits: -200, time: '2d ago', type: 'debit' },
  { id: 5, icon: ShoppingCart, desc: 'Monthly Pro allocation', credits: +1000, time: '5d ago', type: 'credit' },
]

const stats = [
  { label: 'Credits Used This Month', value: '780', color: 'text-amber-400' },
  { label: 'Projects Created', value: '12', color: 'text-blue-400' },
  { label: 'Videos Exported', value: '8', color: 'text-emerald-400' },
]

export function CreditsBillingSection() {
  const [showAll, setShowAll] = useState(false)

  return (
    <ShowcaseSection
      id="credits-billing"
      title="Credits & Billing"
      description="Monitor usage, transactions and manage your plan"
      icon={<Sparkles className="h-4 w-4 text-amber-400" />}
    >
      <div className="space-y-4">
        {/* Balance card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between rounded-lg bg-gradient-to-r from-amber-950/50 to-orange-950/30 border border-amber-900/40 p-4"
        >
          <div>
            <p className="text-[10px] text-muted-foreground mb-0.5">Available Credits</p>
            <div className="flex items-baseline gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span className="text-3xl font-bold text-amber-300">1,250</span>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center rounded-full bg-primary/20 px-2.5 py-1 text-[10px] font-semibold text-primary border border-primary/30">
              Pro Plan
            </span>
            <p className="text-[9px] text-muted-foreground mt-1">Resets in 22 days</p>
          </div>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.3 }}
              className="rounded-lg border border-border bg-card/60 p-3 text-center"
            >
              <p className={cn('text-xl font-bold', stat.color)}>{stat.value}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Transactions */}
        <div>
          <p className="text-[11px] font-semibold text-foreground mb-2">Recent Transactions</p>
          <div className="space-y-1">
            {transactions.map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.05, duration: 0.25 }}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-muted/40 transition-colors"
              >
                <div className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-md', tx.type === 'credit' ? 'bg-emerald-900/50' : 'bg-zinc-800')}>
                  <tx.icon className={cn('h-3 w-3', tx.type === 'credit' ? 'text-emerald-400' : 'text-zinc-400')} />
                </div>
                <p className="flex-1 text-[11px] text-foreground truncate">{tx.desc}</p>
                <span className={cn('text-[11px] font-semibold shrink-0', tx.type === 'credit' ? 'text-emerald-400' : 'text-amber-400')}>
                  {tx.type === 'credit' ? '+' : ''}{tx.credits}
                </span>
                <span className="text-[9px] text-muted-foreground shrink-0">{tx.time}</span>
              </motion.div>
            ))}
          </div>
          <button onClick={() => setShowAll(!showAll)} className="mt-1 flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors px-3">
            View All History <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        {/* Buy Credits button */}
        <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          <CreditCard className="h-3.5 w-3.5" />
          Buy Credits
        </button>
      </div>
    </ShowcaseSection>
  )
}

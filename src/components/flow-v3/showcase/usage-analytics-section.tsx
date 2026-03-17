'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, FolderOpen, Film, Download, BarChart3 } from 'lucide-react'
import { ShowcaseSection } from './showcase-section-wrapper'
import { cn } from '@/lib/utils'

const stats = [
  { label: 'Credits Used', value: '8,420', trend: '+12%', trendUp: true, icon: TrendingUp, sub: 'this month' },
  { label: 'Projects',     value: '24',    trend: '+3',   trendUp: true, icon: FolderOpen, sub: 'this month' },
  { label: 'Scenes',       value: '892',   trend: '+156', trendUp: true, icon: Film,       sub: 'this month' },
  { label: 'Exports',      value: '18',    trend: '+5',   trendUp: true, icon: Download,   sub: 'this month' },
]

const dailyData = [
  { day: 'Mon', value: 320 },
  { day: 'Tue', value: 180 },
  { day: 'Wed', value: 450 },
  { day: 'Thu', value: 280 },
  { day: 'Fri', value: 520 },
  { day: 'Sat', value: 150 },
  { day: 'Sun', value: 380 },
]

const breakdown = [
  { label: 'Scene Generation', pct: 65, credits: 5473, color: 'bg-purple-500' },
  { label: 'Video Export',     pct: 20, credits: 1684, color: 'bg-emerald-500' },
  { label: 'Character Creation', pct: 10, credits: 842, color: 'bg-pink-500' },
  { label: 'VFX Processing',   pct:  5, credits: 421, color: 'bg-amber-500' },
]

const MAX = Math.max(...dailyData.map(d => d.value))

export function UsageAnalyticsSection() {
  const [tooltip, setTooltip] = useState<{ day: string; value: number } | null>(null)

  return (
    <ShowcaseSection
      id="usage-analytics"
      title="Usage Analytics"
      description="Credits consumed, projects, and export statistics"
      icon={<BarChart3 className="h-4 w-4 text-primary" />}
    >
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-5">
        {stats.map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3"
            >
              <div className="flex items-start justify-between mb-1">
                <p className="text-[10px] text-zinc-500">{s.label}</p>
                <Icon className="h-3 w-3 text-zinc-600" />
              </div>
              <p className="text-[18px] font-bold text-zinc-100 leading-none">{s.value}</p>
              <p className="mt-1 text-[10px] text-emerald-400">{s.trend} {s.sub}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Bar chart */}
      <div className="mb-5">
        <p className="text-[11px] font-medium text-zinc-400 mb-3">Credits Used Per Day</p>
        <div className="relative flex items-end gap-1.5 h-20">
          {dailyData.map((d, i) => {
            const heightPct = (d.value / MAX) * 100
            return (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1 h-full">
                <div className="relative flex-1 w-full flex items-end">
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: i * 0.07, ease: 'easeOut' }}
                    style={{ height: `${heightPct}%`, originY: 1 }}
                    onMouseEnter={() => setTooltip(d)}
                    onMouseLeave={() => setTooltip(null)}
                    className="w-full rounded-t-sm bg-gradient-to-t from-purple-600 to-purple-400 cursor-pointer hover:from-purple-500 hover:to-purple-300 transition-colors"
                  />
                  {tooltip?.day === d.day && (
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-200 whitespace-nowrap z-10">
                      {d.value}
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-zinc-600">{d.day}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Breakdown */}
      <div>
        <p className="text-[11px] font-medium text-zinc-400 mb-3">Credit Usage Breakdown</p>
        <div className="space-y-2">
          {breakdown.map((b, i) => (
            <motion.div
              key={b.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="flex items-center gap-3"
            >
              <div className="w-28 shrink-0 text-[11px] text-zinc-400">{b.label}</div>
              <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${b.pct}%` }}
                  transition={{ delay: 0.2 + i * 0.07, ease: 'easeOut' }}
                  className={cn('h-full rounded-full', b.color)}
                />
              </div>
              <div className="w-16 shrink-0 text-right">
                <span className="text-[11px] font-medium text-zinc-300">{b.pct}%</span>
                <span className="ml-1 text-[10px] text-zinc-600">{b.credits.toLocaleString()}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </ShowcaseSection>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, GitCompare, Wrench, Bot, Clock, Zap, Layers, BarChart3, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { persona, beforeSteps, afterSteps } from '@/lib/mock/scenarios'
import { ScenarioStepCard } from '@/components/scenarios/scenario-step-card'
import { FrictionSummaryTable } from '@/components/scenarios/friction-summary-table'

type View = 'compare' | 'before' | 'after'

const VIEWS: { id: View; label: string; icon: React.ReactNode }[] = [
  { id: 'compare', label: 'Compare', icon: <GitCompare className="h-3.5 w-3.5" /> },
  { id: 'before', label: 'Manual AI', icon: <Wrench className="h-3.5 w-3.5" /> },
  { id: 'after', label: 'Agentic', icon: <Bot className="h-3.5 w-3.5" /> },
]

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0)
  const started = useRef(false)
  useEffect(() => {
    if (started.current) return
    started.current = true
    const step = Math.ceil(target / (duration / 16))
    let cur = 0
    const id = setInterval(() => {
      cur = Math.min(cur + step, target)
      setCount(cur)
      if (cur >= target) clearInterval(id)
    }, 16)
    return () => clearInterval(id)
  }, [target, duration])
  return count
}

function TimeRing({ pct, color, label, time }: { pct: number; color: string; label: string; time: string }) {
  const r = 28; const circ = 2 * Math.PI * r
  const dash = circ * (pct / 100)
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-16 h-16">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
          <motion.circle
            cx="36" cy="36" r={r} fill="none"
            stroke={color} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={circ - dash}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - dash }}
            transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[9px] font-black" style={{ color }}>{pct}%</span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-[11px] font-bold" style={{ color }}>{time}</div>
        <div className="text-[10px] text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}

function SummaryBanner({ variant }: { variant: 'before' | 'after' }) {
  const isBefore = variant === 'before'
  const accent = isBefore ? '#ff6b6b' : '#a78bfa'
  const pct = isBefore ? 100 : 13
  return (
    <div className="rounded-xl p-4 mb-4 border flex items-center gap-4"
      style={{ background: `${accent}10`, borderColor: `${accent}30` }}>
      <TimeRing pct={pct} color={accent} label={isBefore ? 'Baseline' : 'of baseline'} time={isBefore ? '8–15 hrs' : '60–90 min'} />
      <div className="flex-1 min-w-0">
        <div className="font-bold text-[13px] mb-0.5" style={{ color: accent }}>
          {isBefore ? 'Manual AI Orchestration' : 'Agentic MV System'}
        </div>
        <div className="text-[11px] text-muted-foreground leading-relaxed">
          {isBefore
            ? 'ChatGPT + Claude + Kling + Midjourney + CapCut'
            : 'Agent orchestration + MCP + Shared context'}
        </div>
        <div className="mt-1.5 text-[11px] italic" style={{ color: `${accent}90` }}>
          {isBefore ? 'User is the glue between tools' : 'System is the glue — user only reviews'}
        </div>
      </div>
    </div>
  )
}

function CompareView() {
  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <SummaryBanner variant="before" />
          {beforeSteps.map((s) => <ScenarioStepCard key={s.id} step={s} />)}
        </div>
        {/* VS divider — visible on md+ */}
        <div className="hidden md:flex absolute left-1/2 top-24 bottom-0 -translate-x-1/2 flex-col items-center gap-2 pointer-events-none z-10">
          <div className="w-px flex-1 bg-gradient-to-b from-transparent via-border to-transparent" />
          <div className="w-8 h-8 rounded-full bg-background border-2 border-border flex items-center justify-center text-[10px] font-black text-muted-foreground">VS</div>
          <div className="w-px flex-1 bg-gradient-to-b from-border via-border to-transparent" />
        </div>
        <div>
          <SummaryBanner variant="after" />
          {afterSteps.map((s) => <ScenarioStepCard key={s.id} step={s} />)}
        </div>
      </div>
    </div>
  )
}

function SingleView({ side }: { side: 'before' | 'after' }) {
  const steps = side === 'before' ? beforeSteps : afterSteps
  return (
    <div className="max-w-[600px]">
      <SummaryBanner variant={side} />
      {steps.map((s) => <ScenarioStepCard key={s.id} step={s} />)}
    </div>
  )
}

const SUMMARY_METRICS = [
  { icon: <Clock className="h-5 w-5" />, value: '87%', label: 'Faster', desc: '8–15 hrs → 60–90 min', color: '#a78bfa' },
  { icon: <Zap className="h-5 w-5" />, value: '5', label: 'Steps Automated', desc: 'Full pipeline, end-to-end', color: '#20c997' },
  { icon: <Layers className="h-5 w-5" />, value: '6+', label: 'Tools Replaced', desc: 'Single orchestrated system', color: '#ffd43b' },
  { icon: <BarChart3 className="h-5 w-5" />, value: '100%', label: 'Style Consistent', desc: 'vs manual drift across scenes', color: '#74c0fc' },
]

function SummarySection() {
  return (
    <div className="mt-12 mb-8">
      <div className="flex items-center gap-2 mb-5">
        <Sparkles className="h-4 w-4 text-purple-400" />
        <h2 className="text-base font-bold text-foreground">Impact at a Glance</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {SUMMARY_METRICS.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.07 }}
            className="rounded-xl border border-border p-4 flex flex-col gap-1.5"
            style={{ background: `${m.color}08` }}
          >
            <div style={{ color: m.color }}>{m.icon}</div>
            <div className="text-2xl font-black" style={{ color: m.color }}>{m.value}</div>
            <div className="text-[12px] font-bold text-foreground/80">{m.label}</div>
            <div className="text-[11px] text-muted-foreground leading-snug">{m.desc}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default function ScenariosPage() {
  const [view, setView] = useState<View>('compare')
  const savings = useCountUp(87)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_-10%,rgba(139,92,246,0.25)_0%,transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_10%_110%,rgba(32,201,151,0.12)_0%,transparent_50%)]" />
        <div className="relative max-w-[980px] mx-auto px-7 pt-8 pb-9">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to prototypes
          </Link>

          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex-1">
                <span className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/35 rounded-full px-3.5 py-1 text-[11px] text-purple-400 font-semibold tracking-wide mb-4">
                  🎬 MV AGENT — USER SCENARIO RESEARCH
                </span>
                <h1 className="text-3xl font-extrabold text-foreground leading-tight mb-2.5">
                  Manual AI Orchestration<br />
                  <span className="text-purple-400">vs</span> Agentic System
                </h1>
                <p className="text-sm text-muted-foreground max-w-[500px] leading-relaxed mb-5">
                  Both scenarios use AI. The key difference is <strong className="text-foreground/80">who acts as the glue</strong> between tools — the user spending hours, or the system handling it automatically.
                </p>
                {/* Persona card */}
                <div className="inline-flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xl shrink-0">
                    {persona.avatar}
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-foreground">{persona.name}</div>
                    <div className="text-[11px] text-muted-foreground leading-snug max-w-[340px]">{persona.desc}</div>
                  </div>
                </div>
              </div>

              {/* Time savings metric */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="flex flex-col items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/8 px-8 py-6 shrink-0 min-w-[160px]"
              >
                <div className="text-5xl font-black text-emerald-400 tabular-nums leading-none">{savings}%</div>
                <div className="text-sm font-bold text-emerald-400/80 mt-1">Faster</div>
                <div className="text-[10px] text-muted-foreground mt-2 text-center leading-relaxed">
                  8–15 hrs<br />→ 60–90 min
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* View toggle — tab style */}
      <div className="sticky top-0 z-20 bg-background/90 backdrop-blur border-b border-border">
        <div className="max-w-[980px] mx-auto px-7">
          <div className="flex gap-0 relative">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={cn(
                  'flex items-center gap-1.5 px-5 py-3.5 text-[12px] font-semibold cursor-pointer transition-colors relative',
                  view === v.id ? 'text-purple-400' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {v.icon}
                {v.label}
                {view === v.id && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400 rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[980px] mx-auto px-7 pt-6 pb-10">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {view === 'compare' && <CompareView />}
          {view === 'before' && <SingleView side="before" />}
          {view === 'after' && <SingleView side="after" />}
        </motion.div>

        <SummarySection />
        <FrictionSummaryTable />
      </div>
    </div>
  )
}

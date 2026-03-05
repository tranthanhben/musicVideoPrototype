'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { persona, beforeSteps, afterSteps } from '@/lib/mock/scenarios'
import { ScenarioStepCard } from '@/components/scenarios/scenario-step-card'
import { FrictionSummaryTable } from '@/components/scenarios/friction-summary-table'

type View = 'compare' | 'before' | 'after'

const VIEWS: { id: View; label: string }[] = [
  { id: 'compare', label: '⇄ Compare' },
  { id: 'before', label: '🛠 Before — Manual AI' },
  { id: 'after', label: '🤖 After — Agentic system' },
]

export default function ScenariosPage() {
  const [view, setView] = useState<View>('compare')

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div
        className="relative overflow-hidden border-b border-border bg-card"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_0%,rgba(139,92,246,0.2)_0%,transparent_60%)]" />
        <div className="relative max-w-[900px] mx-auto px-7 pt-8 pb-9">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-5 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to prototypes
          </Link>

          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <span className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/40 rounded-full px-3.5 py-1 text-[11px] text-purple-400 font-semibold tracking-wide mb-4">
              🎬 MV AGENT — USER SCENARIO RESEARCH
            </span>

            <h1 className="text-2xl font-extrabold text-foreground leading-tight mb-2.5">
              Users manually orchestrating AI tools<br />
              <span className="text-purple-400">vs</span> AI Agent orchestration
            </h1>
            <p className="text-sm text-muted-foreground max-w-[560px] leading-relaxed mb-6">
              Both scenarios use AI. The key difference: who acts as the &quot;glue&quot; between tools —{' '}
              <strong className="text-foreground/80">the user or the system?</strong>
            </p>

            {/* Persona */}
            <div className="inline-flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-2.5">
              <span className="text-2xl">{persona.avatar}</span>
              <div>
                <div className="text-[13px] font-bold text-foreground">{persona.name}</div>
                <div className="text-[11px] text-muted-foreground">{persona.desc}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* View toggle */}
      <div className="max-w-[900px] mx-auto px-7 pt-5">
        <div className="flex gap-2">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={cn(
                'px-4 py-2 rounded-lg border text-xs font-semibold cursor-pointer transition-colors',
                view === v.id
                  ? 'border-purple-400 bg-purple-500/25 text-purple-400'
                  : 'border-border bg-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[900px] mx-auto px-7 pt-4 pb-10">
        {view === 'compare' && <CompareView />}
        {view === 'before' && <SingleView side="before" />}
        {view === 'after' && <SingleView side="after" />}
        <FrictionSummaryTable />
      </div>
    </div>
  )
}

// --- Sub-views (kept in same file to avoid single-use component files) ---

function CompareView() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div>
        <SummaryBanner variant="before" />
        {beforeSteps.map((s) => <ScenarioStepCard key={s.id} step={s} />)}
      </div>
      <div>
        <SummaryBanner variant="after" />
        {afterSteps.map((s) => <ScenarioStepCard key={s.id} step={s} />)}
      </div>
    </div>
  )
}

function SingleView({ side }: { side: 'before' | 'after' }) {
  const steps = side === 'before' ? beforeSteps : afterSteps
  return (
    <div className="max-w-[560px]">
      <SummaryBanner variant={side} />
      {steps.map((s) => <ScenarioStepCard key={s.id} step={s} />)}
    </div>
  )
}

function SummaryBanner({ variant }: { variant: 'before' | 'after' }) {
  const isBefore = variant === 'before'
  const accent = isBefore ? '#ff6b6b' : '#a78bfa'
  return (
    <div
      className="rounded-xl p-3 px-4 mb-3.5 text-center border"
      style={{ background: `${accent}15`, borderColor: `${accent}35` }}
    >
      <div className="font-bold text-[13px]" style={{ color: accent }}>
        {isBefore ? '🛠 Manual AI orchestration' : '🤖 Agentic MV System'}
      </div>
      <div className="text-[11px] text-muted-foreground mt-1">
        {isBefore
          ? 'ChatGPT + Claude + Kling + Midjourney + CapCut'
          : 'Agent orchestration + MCP + Shared context'}
      </div>
      <div className="text-lg font-extrabold mt-2" style={{ color: accent }}>
        {isBefore ? '~8–15 hours' : '~60–90 minutes'}
      </div>
      <div className="text-[11px] text-muted-foreground">
        {isBefore ? 'User acts as glue between tools' : 'System is the glue, user only reviews'}
      </div>
    </div>
  )
}

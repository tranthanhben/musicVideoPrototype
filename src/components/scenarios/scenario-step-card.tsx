'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Wrench, CheckCircle2, AlertCircle, Quote } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ScenarioStep } from '@/lib/mock/scenarios'
import { PHASE_COLORS } from '@/lib/mock/scenarios'

// Time-to-minutes helper for progress bar (rough estimate)
function parseMinutes(t: string): number {
  if (t.includes('< 2')) return 2
  if (t.includes('10–15')) return 12
  if (t.includes('15–20')) return 17
  if (t.includes('20–30')) return 25
  if (t.includes('45 min')) return 45
  if (t.includes('1–2 hrs')) return 90
  if (t.includes('2–4 hrs')) return 180
  if (t.includes('3–6 hrs')) return 270
  if (t.includes('3–5 hrs')) return 240
  return 60
}

const STEP_MAX_MINUTES = { before: 360, after: 90 }

interface Props {
  step: ScenarioStep
  totalMinutes?: number
}

export function ScenarioStepCard({ step, totalMinutes }: Props) {
  const [expanded, setExpanded] = useState(false)
  const isGood = step.good
  const items = step.value ?? step.friction ?? []
  const phaseColor = PHASE_COLORS[step.phase] ?? step.color
  const stepNum = String(step.id).padStart(2, '0')
  const maxMin = totalMinutes ?? (isGood ? STEP_MAX_MINUTES.after : STEP_MAX_MINUTES.before)
  const stepMin = parseMinutes(step.time)
  const pct = Math.min(100, Math.round((stepMin / maxMin) * 100))

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: step.id * 0.04 }}
      className={cn(
        'rounded-xl mb-3 border border-border/60 overflow-hidden transition-shadow',
        'hover:shadow-lg hover:border-border cursor-pointer',
      )}
      style={{ background: `linear-gradient(135deg, ${step.color}10, ${step.color}04)` }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4"
      >
        {/* Step number + header row */}
        <div className="flex items-start gap-3">
          {/* Step badge */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 border-2"
            style={{ background: `${step.color}20`, borderColor: step.color, color: step.color }}
          >
            {stepNum}
          </div>

          <div className="flex-1 min-w-0">
            {/* Phase + time badges */}
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded tracking-widest"
                style={{
                  background: `${phaseColor}25`,
                  color: phaseColor,
                  border: `1px solid ${phaseColor}45`,
                }}
              >
                {step.phase}
              </span>
              <span
                className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1"
                style={{ color: step.color, background: `${step.color}18` }}
              >
                ⏱ {step.time}
              </span>
            </div>
            <h3 className="text-sm font-bold text-foreground/90 leading-snug pr-4">{step.title}</h3>
          </div>

          <ChevronDown
            className={cn('h-4 w-4 text-foreground/25 shrink-0 transition-transform mt-1', expanded && 'rotate-180')}
          />
        </div>

        {/* Mini time progress bar */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full bg-foreground/8 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: step.color }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground/60 shrink-0">{pct}% of total</span>
        </div>
      </button>

      {/* Expandable body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0.5" style={{ borderTop: `1px solid ${step.color}20` }}>
              <p className="text-[13px] text-foreground/50 leading-relaxed mb-3 mt-3">{step.what}</p>

              {/* Friction / Value points */}
              <div
                className="rounded-lg p-3 mb-3"
                style={{ background: isGood ? 'rgba(32,201,151,0.08)' : 'rgba(255,107,107,0.08)' }}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  {isGood
                    ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    : <AlertCircle className="h-3.5 w-3.5" style={{ color: '#ff6b6b' }} />}
                  <span
                    className="text-[11px] font-bold tracking-wide uppercase"
                    style={{ color: isGood ? '#20c997' : '#ff6b6b' }}
                  >
                    {isGood ? 'Value Delivered' : 'Friction Points'}
                  </span>
                </div>
                {items.map((item, i) => (
                  <div key={i} className="flex gap-2 mb-1.5 text-xs text-foreground/55 leading-relaxed">
                    <span className="shrink-0 mt-0.5" style={{ color: isGood ? '#20c997' : '#ff6b6b' }}>
                      {isGood ? '→' : '×'}
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Quote */}
              <div
                className="p-3 rounded-lg mb-3 flex gap-2.5 items-start"
                style={{ background: `${step.color}10`, borderLeft: `3px solid ${step.color}60` }}
              >
                <Quote className="h-3.5 w-3.5 shrink-0 mt-0.5 opacity-50" style={{ color: step.color }} />
                <p className="text-xs text-foreground/45 italic leading-relaxed">{step.quote}</p>
              </div>

              {/* Tools */}
              <div className="flex flex-wrap gap-1.5">
                <Wrench className="h-3.5 w-3.5 text-muted-foreground/40 mt-0.5" />
                {step.tools.map((t, i) => (
                  <span
                    key={i}
                    className="text-[11px] rounded-md px-2 py-0.5 border font-medium"
                    style={{
                      background: `${step.color}10`,
                      borderColor: `${step.color}30`,
                      color: step.color,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ScenarioStep } from '@/lib/mock/scenarios'
import { PHASE_COLORS } from '@/lib/mock/scenarios'

export function ScenarioStepCard({ step }: { step: ScenarioStep }) {
  const [expanded, setExpanded] = useState(false)
  const isGood = step.good
  const items = step.value ?? step.friction ?? []

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className="w-full text-left rounded-xl p-4 mb-3 transition-all cursor-pointer border-l-4"
      style={{
        background: `linear-gradient(135deg, ${step.color}12, ${step.color}06)`,
        borderColor: `${step.color}35`,
        borderLeftColor: step.color,
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-2.5">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0"
          style={{ background: step.color }}
        >
          {step.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide"
              style={{
                background: `${PHASE_COLORS[step.phase]}30`,
                color: PHASE_COLORS[step.phase],
                border: `1px solid ${PHASE_COLORS[step.phase]}50`,
              }}
            >
              {step.phase}
            </span>
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ color: step.color, background: `${step.color}20` }}
            >
              ⏱ {step.time}
            </span>
          </div>
          <h3 className="mt-1.5 text-sm font-bold text-foreground/90 leading-snug">{step.title}</h3>
        </div>
        <ChevronDown
          className={cn('h-4 w-4 text-foreground/30 shrink-0 transition-transform', expanded && 'rotate-180')}
        />
      </div>

      {/* Expandable body */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3.5 pt-3.5" style={{ borderTop: `1px solid ${step.color}25` }}>
              <p className="text-[13px] text-foreground/50 leading-relaxed mb-3">{step.what}</p>

              {/* Friction / Value */}
              <div
                className="rounded-lg p-3 mb-3"
                style={{ background: isGood ? 'rgba(32,201,151,0.08)' : 'rgba(255,107,107,0.08)' }}
              >
                <div
                  className="text-[11px] font-bold mb-2 tracking-wide"
                  style={{ color: isGood ? '#20c997' : '#ff6b6b' }}
                >
                  {isGood ? '✅ VALUE DELIVERED' : '⚡ FRICTION POINTS'}
                </div>
                {items.map((item, i) => (
                  <div key={i} className="flex gap-2 mb-1.5 text-xs text-foreground/50 leading-relaxed">
                    <span>{isGood ? '→' : '×'}</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Quote */}
              <div
                className="p-2.5 rounded-lg text-xs text-foreground/40 italic mb-3 border-l-[3px]"
                style={{ background: 'rgba(255,255,255,0.04)', borderLeftColor: `${step.color}70` }}
              >
                {step.quote}
              </div>

              {/* Tools */}
              <div className="flex flex-wrap gap-1.5">
                {step.tools.map((t, i) => (
                  <span
                    key={i}
                    className="text-[11px] bg-muted/50 border border-border rounded px-2 py-0.5 text-foreground/40"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  )
}

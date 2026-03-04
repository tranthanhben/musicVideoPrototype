'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Check, X, Shield } from 'lucide-react'
import type { QualityGateId } from '@/lib/pipeline/types'

interface CanvasGateCardProps {
  gate: { gateId: QualityGateId; message: string } | null
  journeyText: string
  onResolve: (result: 'pass' | 'revise') => void
}

export function CanvasGateCard({ gate, journeyText, onResolve }: CanvasGateCardProps) {
  const score = 85 + Math.floor(Math.random() * 15)

  return (
    <AnimatePresence>
      {gate && (
        <motion.div
          key={gate.gateId}
          initial={{ y: -40, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -40, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md"
        >
          <div className="rounded-2xl border border-amber-500/30 bg-card/95 backdrop-blur-xl shadow-2xl p-4">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-semibold text-amber-300">{gate.gateId}</span>
              <span className="ml-auto text-xs font-mono text-amber-400/80">Score {score}/100</span>
            </div>

            {/* Journey text excerpt */}
            <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-3">
              {journeyText}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onResolve('pass')}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-500 transition-colors"
              >
                <Check className="h-3.5 w-3.5" />
                Approve
              </button>
              <button
                onClick={() => onResolve('revise')}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/80 hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Revise
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

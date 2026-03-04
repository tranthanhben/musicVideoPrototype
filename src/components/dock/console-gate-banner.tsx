'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { QualityGateId } from '@/lib/pipeline/types'

interface ConsoleGateBannerProps {
  gateId: QualityGateId
  message: string
  status: 'pending' | 'approved' | 'revised'
  onResolve: (gateId: QualityGateId, result: 'pass' | 'revise') => void
  score?: number
}

// Stable random score per gate
const GATE_SCORES: Record<QualityGateId, number> = {
  QG1: 92, QG2: 88, QG3: 95, QG4: 87, QG5: 91,
}

export function ConsoleGateBanner({ gateId, message, status, onResolve, score }: ConsoleGateBannerProps) {
  const displayScore = score ?? GATE_SCORES[gateId] ?? 90

  if (status === 'approved') {
    return (
      <div className="mx-3 my-1 flex items-center gap-2 rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2">
        <Check className="h-3.5 w-3.5 text-green-400 shrink-0" />
        <span className="text-xs font-medium text-green-400">
          {gateId} Approved — advancing to next layer
        </span>
      </div>
    )
  }

  if (status === 'revised') {
    return (
      <div className="mx-3 my-1 flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2">
        <span className="text-xs font-medium text-amber-400">
          {gateId} Revision requested — re-running layer
        </span>
      </div>
    )
  }

  return (
    <div className="mx-3 my-1 flex items-center gap-3 rounded-md border border-yellow-500/40 bg-yellow-500/10 px-3 py-2">
      <div className="flex-1 min-w-0">
        <span className="text-xs font-semibold text-yellow-400">
          {gateId} Review Required
        </span>
        <span className="text-xs text-yellow-300/70 ml-2">
          {message && message.length > 0 ? message : `Quality gate review`}
        </span>
        <span className="ml-2 text-xs text-yellow-400 font-mono">
          Score {displayScore}/100
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onResolve(gateId, 'pass')}
          className={cn(
            'px-3 py-1 rounded text-xs font-semibold transition-colors',
            'bg-green-500/20 text-green-400 border border-green-500/30',
            'hover:bg-green-500/30 hover:text-green-300'
          )}
        >
          Approve
        </button>
        <button
          onClick={() => onResolve(gateId, 'revise')}
          className={cn(
            'px-3 py-1 rounded text-xs font-semibold transition-colors',
            'bg-red-500/20 text-red-400 border border-red-500/30',
            'hover:bg-red-500/30 hover:text-red-300'
          )}
        >
          Revise
        </button>
      </div>
    </div>
  )
}

'use client'

import { cn } from '@/lib/utils'
import { ShieldCheck, AlertTriangle, XCircle, ChevronRight } from 'lucide-react'
import type { ChatArtifact } from '@/lib/chat/types'

interface QualityGateCardProps {
  artifact: ChatArtifact
  onAction?: (action: string) => void
  className?: string
}

export function QualityGateCard({ artifact, onAction, className }: QualityGateCardProps) {
  const score = (artifact.data?.score as number) || 85
  const gateId = (artifact.data?.gateId as string) ?? 'QG'

  const scoreColor = score >= 90 ? 'text-green-400' : score >= 70 ? 'text-yellow-400' : 'text-red-400'
  const barColor = score >= 90 ? 'bg-green-500' : score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
  const scoreLabel = score >= 90 ? 'Excellent' : score >= 70 ? 'Good' : 'Needs Work'
  const ScoreIcon = score >= 90 ? ShieldCheck : score >= 70 ? AlertTriangle : XCircle

  return (
    <div className={cn(
      'rounded-xl border bg-card overflow-hidden max-w-sm',
      score >= 90 ? 'border-green-500/30' : score >= 70 ? 'border-yellow-500/30' : 'border-red-500/30',
      className,
    )}>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <ScoreIcon className={cn('h-5 w-5', scoreColor)} />
          <span className="text-sm font-semibold text-card-foreground">{gateId}: {artifact.title}</span>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <span className={cn('text-2xl font-bold tabular-nums', scoreColor)}>{score}</span>
          <div>
            <span className="text-xs text-muted-foreground">/100 quality score</span>
            <p className={cn('text-xs font-medium', scoreColor)}>{scoreLabel}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-muted rounded-full mb-3 overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all', barColor)}
            style={{ width: `${score}%` }}
          />
        </div>

        {artifact.description && (
          <p className="text-xs text-muted-foreground mb-3">{artifact.description}</p>
        )}

        <div className="flex gap-2 animate-[fadeSlideUp_0.4s_ease-out]">
          <button
            onClick={() => onAction?.('approve')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition-colors shadow-md shadow-green-600/25 animate-[ctaPulse_2s_ease-in-out_infinite]"
          >
            Approve
            <ChevronRight className="h-3 w-3" />
          </button>
          <button
            onClick={() => onAction?.('revise')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:bg-muted/80 border border-border transition-colors"
          >
            Request Revision
          </button>
        </div>
      </div>
    </div>
  )
}

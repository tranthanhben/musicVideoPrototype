'use client'

import { cn } from '@/lib/utils'
import { ShieldCheck, AlertTriangle, XCircle } from 'lucide-react'
import type { ChatArtifact } from '@/lib/chat/types'

interface QualityGateCardProps {
  artifact: ChatArtifact
  onAction?: (action: string) => void
  className?: string
}

export function QualityGateCard({ artifact, onAction, className }: QualityGateCardProps) {
  const score = (artifact.data?.score as number) ?? 0
  const gateId = (artifact.data?.gateId as string) ?? 'QG'

  const scoreColor = score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'
  const ScoreIcon = score >= 80 ? ShieldCheck : score >= 60 ? AlertTriangle : XCircle

  return (
    <div className={cn(
      'rounded-xl border bg-card overflow-hidden max-w-sm',
      score >= 80 ? 'border-green-500/30' : score >= 60 ? 'border-yellow-500/30' : 'border-red-500/30',
      className,
    )}>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <ScoreIcon className={cn('h-5 w-5', scoreColor)} />
          <span className="text-sm font-semibold text-card-foreground">{gateId}: {artifact.title}</span>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <span className={cn('text-2xl font-bold tabular-nums', scoreColor)}>{score}</span>
          <span className="text-xs text-muted-foreground">/100 quality score</span>
        </div>

        {artifact.description && (
          <p className="text-xs text-muted-foreground mb-3">{artifact.description}</p>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => onAction?.('approve')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            Approve
          </button>
          <button
            onClick={() => onAction?.('revise')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
          >
            Request Revision
          </button>
        </div>
      </div>
    </div>
  )
}

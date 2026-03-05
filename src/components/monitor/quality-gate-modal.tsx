'use client'

import { ShieldCheck, RotateCcw, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { usePipelineStore } from '@/lib/pipeline/store'
import type { QualityGateId } from '@/lib/pipeline/types'
import { QUALITY_GATES } from '@/lib/pipeline/constants'
import { cn } from '@/lib/utils'

interface QualityGateModalProps {
  open: boolean
  gateId: QualityGateId | null
  onResolve: (result: 'pass' | 'revise') => void
  onClose: () => void
}

const GATE_LABELS: Record<QualityGateId, { name: string; fromLayer: string; toLayer: string }> = {
  QG1: { name: 'Input Quality Gate', fromLayer: 'Input & Understanding', toLayer: 'Creative Direction' },
  QG2: { name: 'Creative Quality Gate', fromLayer: 'Creative Direction', toLayer: 'Pre-Production' },
  QG3: { name: 'Pre-Production Quality Gate', fromLayer: 'Pre-Production', toLayer: 'Production' },
  QG4: { name: 'Production Quality Gate', fromLayer: 'Production', toLayer: 'Post-Production' },
  QG5: { name: 'Final Quality Gate', fromLayer: 'Post-Production', toLayer: 'Complete' },
}

function ScoreRing({ score }: { score: number }) {
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative flex items-center justify-center" style={{ width: 72, height: 72 }}>
      <svg width={72} height={72} viewBox="0 0 72 72" className="-rotate-90">
        <circle cx={36} cy={36} r={radius} fill="none" stroke="currentColor" strokeWidth={5} className="text-muted" />
        <circle
          cx={36} cy={36} r={radius} fill="none" stroke={color} strokeWidth={5}
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <span className="absolute text-base font-bold tabular-nums" style={{ color }}>{score}</span>
    </div>
  )
}

export function QualityGateModal({ open, gateId, onResolve, onClose }: QualityGateModalProps) {
  const qualityGates = usePipelineStore((s) => s.qualityGates)

  if (!gateId) return null

  const gate = qualityGates[gateId]
  const meta = GATE_LABELS[gateId]
  const score = gate?.score ?? 0

  return (
    <Dialog open={open} onOpenChange={() => { /* prevent accidental close via overlay — must use Approve or Request Revision */ }}>
      <DialogContent showCloseButton={false} className="max-w-md">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle>{meta.name}</DialogTitle>
                <DialogDescription className="mt-0.5">
                  {meta.fromLayer} → {meta.toLayer}
                </DialogDescription>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>

        {/* Score */}
        <div className="flex items-center gap-5 rounded-xl bg-muted/50 p-4 my-1">
          <ScoreRing score={score} />
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Quality Score</p>
            <p className={cn(
              'text-sm font-semibold mt-1',
              score >= 80 ? 'text-green-500' : score >= 60 ? 'text-yellow-500' : 'text-red-500'
            )}>
              {score >= 80 ? 'Excellent — ready to advance' : score >= 60 ? 'Acceptable — consider revision' : 'Poor — revision recommended'}
            </p>
            {gate?.message && (
              <p className="text-xs text-muted-foreground mt-1">{gate.message}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <button
            onClick={() => onResolve('revise')}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Request Revision
          </button>
          <button
            onClick={() => onResolve('pass')}
            className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Approve
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

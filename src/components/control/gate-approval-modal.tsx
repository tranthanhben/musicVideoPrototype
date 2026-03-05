'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { QUALITY_GATES, PIPELINE_LAYERS } from '@/lib/pipeline/constants'
import { usePipelineStore } from '@/lib/pipeline/store'
import type { QualityGateId } from '@/lib/pipeline/types'
import { CheckCircle, RefreshCw, Shield } from 'lucide-react'

interface Props {
  open: boolean
  gateId: QualityGateId | null
  onResolve: (gateId: QualityGateId, result: 'pass' | 'revise') => void
  onClose: () => void
}

export function GateApprovalModal({ open, gateId, onResolve, onClose }: Props) {
  const qualityGates = usePipelineStore((s) => s.qualityGates)

  if (!gateId) return null

  const gateDef = QUALITY_GATES.find((g) => g.id === gateId)
  const gateState = qualityGates[gateId]
  const fromLayer = PIPELINE_LAYERS.find((l) => l.id === gateDef?.before)
  const toLayer = PIPELINE_LAYERS.find((l) => l.id === gateDef?.after)

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md bg-card border-border text-card-foreground">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-amber-400 font-mono uppercase tracking-widest">
              Quality Gate {gateId}
            </span>
          </div>
          <DialogTitle className="text-foreground text-lg">Review Required</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {fromLayer?.name} output is ready for review before advancing to{' '}
            {toLayer?.name ?? 'completion'}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1">
          {/* Flow indicator */}
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-1 rounded bg-muted text-muted-foreground font-mono">
              {fromLayer?.name ?? gateDef?.before}
            </span>
            <span className="text-muted-foreground/40">→</span>
            <span className="px-2 py-1 rounded bg-muted text-muted-foreground font-mono">
              {toLayer?.name ?? gateDef?.after}
            </span>
          </div>

          {/* Score */}
          {gateState?.score > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Quality Score</span>
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${gateState.score}%` }}
                />
              </div>
              <span className="text-xs font-mono text-emerald-400">{gateState.score}%</span>
            </div>
          )}

          {/* Summary */}
          <div className="rounded bg-muted/60 border border-border p-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {fromLayer?.description ?? 'Layer output ready for quality review.'}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <button
            onClick={() => onResolve(gateId, 'revise')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-amber-400 border border-amber-400/30 bg-amber-400/5 hover:bg-amber-400/10 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Request Revision
          </button>
          <button
            onClick={() => onResolve(gateId, 'pass')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-emerald-400 border border-emerald-400/30 bg-emerald-400/5 hover:bg-emerald-400/10 transition-colors"
          >
            <CheckCircle className="w-3 h-3" />
            Approve
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

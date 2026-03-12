'use client'

import { cn } from '@/lib/utils'
import { frictionSummary } from '@/lib/mock/scenarios'
import {
  Share2, Palette, Music2, FolderOpen, RefreshCw, GitBranch,
  X, Check,
} from 'lucide-react'

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Context sharing': <Share2 className="h-3.5 w-3.5" />,
  'Style consistency': <Palette className="h-3.5 w-3.5" />,
  'Music-visual sync': <Music2 className="h-3.5 w-3.5" />,
  'File management': <FolderOpen className="h-3.5 w-3.5" />,
  'Iteration cost': <RefreshCw className="h-3.5 w-3.5" />,
  'Orchestration': <GitBranch className="h-3.5 w-3.5" />,
}

export function FrictionSummaryTable() {
  return (
    <div className="mt-10">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-base font-bold text-foreground">Friction Analysis</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          6 systemic problems the agentic system eliminates entirely
        </p>
      </div>

      <div className="border border-border rounded-xl overflow-hidden">
        {/* Column headers */}
        <div className="grid grid-cols-[180px_1fr_1fr] border-b border-border bg-muted/30">
          <div className="p-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center">
            Category
          </div>
          <div className="p-3 border-l border-border/50 text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5" style={{ color: 'rgba(255,107,107,0.9)' }}>
            <X className="h-3 w-3" /> Before — Manual
          </div>
          <div className="p-3 border-l border-border/50 text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5" style={{ color: 'rgba(139,92,246,0.9)' }}>
            <Check className="h-3 w-3" /> After — Agentic
          </div>
        </div>

        {frictionSummary.map((row, i) => (
          <div
            key={i}
            className={cn(
              'grid grid-cols-[180px_1fr_1fr]',
              i % 2 === 0 ? 'bg-background' : 'bg-muted/10',
              i < frictionSummary.length - 1 && 'border-b border-border/40'
            )}
          >
            {/* Category cell */}
            <div className="p-3.5 border-r border-border/40 flex items-start gap-2">
              <span className="text-muted-foreground mt-0.5 shrink-0">
                {CATEGORY_ICONS[row.category] ?? <Share2 className="h-3.5 w-3.5" />}
              </span>
              <span className="text-[11px] font-semibold text-foreground/70 leading-snug">{row.category}</span>
            </div>

            {/* Before */}
            <div className="p-3.5 border-r border-border/40 flex items-start gap-2">
              <X className="h-3 w-3 mt-0.5 shrink-0" style={{ color: 'rgba(255,107,107,0.6)' }} />
              <span className="text-xs leading-relaxed" style={{ color: 'rgba(255,107,107,0.8)' }}>{row.before}</span>
            </div>

            {/* After */}
            <div className="p-3.5 flex items-start gap-2">
              <Check className="h-3 w-3 mt-0.5 shrink-0" style={{ color: 'rgba(139,92,246,0.8)' }} />
              <span className="text-xs leading-relaxed" style={{ color: 'rgba(139,92,246,0.9)' }}>{row.after}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

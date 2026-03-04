'use client'

import Link from 'next/link'
import { ArrowLeft, Clapperboard } from 'lucide-react'
import { usePipelineStore } from '@/lib/pipeline/store'

const STATE_LABELS: Record<string, string> = {
  idle: 'Ready',
  uploaded: 'Song received...',
  analyzing: 'Analyzing your music...',
  vision_ready: 'Creative vision ready',
  plan_ready: 'Storyboard complete',
  assets_ready: 'Assets generated',
  assembled: 'Video assembled',
  complete: 'Production complete',
}

export function ScreeningHeader() {
  const currentState = usePipelineStore((s) => s.currentState)
  const statusLabel = STATE_LABELS[currentState] ?? 'Ready'

  return (
    <header className="flex items-center justify-between border-b border-border px-4 py-3 shrink-0 bg-background/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Back to home"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex items-center gap-2">
          <Clapperboard className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Screening Room</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            currentState === 'idle' || currentState === 'complete'
              ? 'bg-muted-foreground'
              : 'bg-primary animate-pulse'
          }`}
        />
        <span className="text-xs text-muted-foreground">{statusLabel}</span>
      </div>
    </header>
  )
}

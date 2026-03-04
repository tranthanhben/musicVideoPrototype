'use client'

import { cn } from '@/lib/utils'
import type { ChatArtifact } from '@/lib/chat/types'

interface ProgressCardProps {
  artifact: ChatArtifact
  className?: string
}

export function ProgressCard({ artifact, className }: ProgressCardProps) {
  const progress = (artifact.data?.progress as number) ?? 0

  return (
    <div className={cn('rounded-xl border border-border bg-card p-4 max-w-sm', className)}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-card-foreground">{artifact.title}</p>
        <span className="text-xs font-mono text-muted-foreground">{Math.round(progress)}%</span>
      </div>

      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {artifact.description && (
        <p className="text-xs text-muted-foreground mt-2">{artifact.description}</p>
      )}
    </div>
  )
}

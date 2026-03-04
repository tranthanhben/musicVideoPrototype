'use client'

import { cn } from '@/lib/utils'
import type { ChatArtifact } from '@/lib/chat/types'

interface MoodBoardCardProps {
  artifact: ChatArtifact
  className?: string
}

export function MoodBoardCard({ artifact, className }: MoodBoardCardProps) {
  const thumbnails = artifact.thumbnails ?? []

  return (
    <div className={cn('rounded-xl border border-border bg-card overflow-hidden max-w-sm', className)}>
      {/* Thumbnail grid */}
      <div className="grid grid-cols-2 gap-0.5 p-0.5">
        {thumbnails.slice(0, 4).map((url, i) => (
          <div key={i} className="aspect-video overflow-hidden">
            <img src={url} alt={`Mood ${i + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-medium text-card-foreground">{artifact.title}</p>
        {artifact.description && (
          <p className="text-xs text-muted-foreground mt-1">{artifact.description}</p>
        )}
      </div>
    </div>
  )
}

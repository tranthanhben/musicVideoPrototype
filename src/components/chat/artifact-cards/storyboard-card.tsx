'use client'

import { cn } from '@/lib/utils'
import type { ChatArtifact } from '@/lib/chat/types'

interface StoryboardCardProps {
  artifact: ChatArtifact
  className?: string
}

export function StoryboardCard({ artifact, className }: StoryboardCardProps) {
  const thumbnails = artifact.thumbnails ?? []

  return (
    <div className={cn('rounded-xl border border-border bg-card overflow-hidden max-w-md', className)}>
      {/* Horizontal filmstrip */}
      <div className="flex gap-1 p-2 overflow-x-auto">
        {thumbnails.map((url, i) => (
          <div key={i} className="relative shrink-0 w-20 aspect-video rounded-lg overflow-hidden border border-border/50">
            <img src={url} alt={`Scene ${i + 1}`} className="w-full h-full object-cover" />
            <div className="absolute top-1 left-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/60 text-[10px] font-bold text-white">
              {i + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="px-3 pb-3">
        <p className="text-sm font-medium text-card-foreground">{artifact.title}</p>
        {artifact.description && (
          <p className="text-xs text-muted-foreground mt-1">{artifact.description}</p>
        )}
      </div>
    </div>
  )
}

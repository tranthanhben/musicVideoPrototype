'use client'

import { cn } from '@/lib/utils'
import type { ChatArtifact } from '@/lib/chat/types'
import { MockVideoPlayer } from '@/components/shared/mock-video-player'

interface VideoPreviewCardProps {
  artifact: ChatArtifact
  className?: string
}

export function VideoPreviewCard({ artifact, className }: VideoPreviewCardProps) {
  const thumbnailUrl = artifact.thumbnails?.[0] ?? ''

  return (
    <div className={cn('rounded-xl border border-border bg-card overflow-hidden max-w-md', className)}>
      <MockVideoPlayer thumbnailUrl={thumbnailUrl} duration={192} />
      <div className="p-3">
        <p className="text-sm font-medium text-card-foreground">{artifact.title}</p>
        {artifact.description && (
          <p className="text-xs text-muted-foreground mt-1">{artifact.description}</p>
        )}
      </div>
    </div>
  )
}

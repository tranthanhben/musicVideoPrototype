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

  // Parse duration from description like "Duration: 3:12 | ..."
  const durationMatch = artifact.description?.match(/(\d+):(\d+)/)
  const duration = durationMatch
    ? parseInt(durationMatch[1]) * 60 + parseInt(durationMatch[2])
    : 192

  return (
    <div className={cn('rounded-xl border border-border bg-card overflow-hidden max-w-md', className)}>
      <MockVideoPlayer thumbnailUrl={thumbnailUrl} duration={duration} />
      <div className="p-3">
        <p className="text-sm font-medium text-card-foreground">{artifact.title}</p>
        {artifact.description && (
          <p className="text-xs text-muted-foreground mt-1">{artifact.description}</p>
        )}
      </div>
    </div>
  )
}

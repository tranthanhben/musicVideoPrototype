'use client'

import type { ChatArtifact } from '@/lib/chat/types'
import { MoodBoardCard } from './mood-board-card'
import { StoryboardCard } from './storyboard-card'
import { VideoPreviewCard } from './video-preview-card'
import { QualityGateCard } from './quality-gate-card'
import { ProgressCard } from './progress-card'

interface ArtifactCardRendererProps {
  artifact: ChatArtifact
  onAction?: (action: string) => void
}

export function ArtifactCardRenderer({ artifact, onAction }: ArtifactCardRendererProps) {
  switch (artifact.type) {
    case 'mood_board':
      return <MoodBoardCard artifact={artifact} />
    case 'storyboard':
      return <StoryboardCard artifact={artifact} />
    case 'video_preview':
      return <VideoPreviewCard artifact={artifact} />
    case 'quality_gate':
      return <QualityGateCard artifact={artifact} onAction={onAction} />
    case 'progress_update':
      return <ProgressCard artifact={artifact} />
    case 'audio_analysis':
      return <MoodBoardCard artifact={artifact} />
    case 'image_gallery':
      return <MoodBoardCard artifact={artifact} />
    default:
      return null
  }
}

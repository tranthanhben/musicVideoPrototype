'use client'

import { cn } from '@/lib/utils'
import type { PipelineArtifact, ArtifactType } from '@/lib/pipeline/types'
import { ArtifactChatThread } from './artifact-chat-thread'

interface CanvasArtifactNodeProps {
  artifact: PipelineArtifact
  isActive: boolean
  onOpenThread: (artifactId: string | null) => void
  threadOpen: boolean
}

const TYPE_LABELS: Record<ArtifactType, string> = {
  mood_board: 'Mood',
  storyboard: 'Board',
  style_guide: 'Style',
  image: 'Image',
  video_clip: 'Clip',
  lipsync: 'Lip',
  assembled_video: 'Asm',
  final_video: 'Final',
  audio_analysis: 'Audio',
  creative_vision: 'Vision',
  production_plan: 'Plan',
}

const TYPE_COLORS: Record<ArtifactType, string> = {
  mood_board: 'bg-purple-500/20 text-purple-300',
  storyboard: 'bg-cyan-500/20 text-cyan-300',
  style_guide: 'bg-blue-500/20 text-blue-300',
  image: 'bg-green-500/20 text-green-300',
  video_clip: 'bg-orange-500/20 text-orange-300',
  lipsync: 'bg-pink-500/20 text-pink-300',
  assembled_video: 'bg-violet-500/20 text-violet-300',
  final_video: 'bg-emerald-500/20 text-emerald-300',
  audio_analysis: 'bg-blue-500/20 text-blue-300',
  creative_vision: 'bg-purple-500/20 text-purple-300',
  production_plan: 'bg-yellow-500/20 text-yellow-300',
}

export function CanvasArtifactNode({ artifact, isActive, onOpenThread, threadOpen }: CanvasArtifactNodeProps) {
  return (
    <div className="relative">
      <button
        onClick={() => onOpenThread(threadOpen ? null : artifact.id)}
        className={cn(
          'group relative w-40 h-24 rounded-lg border overflow-hidden text-left transition-all duration-200',
          'hover:scale-105 hover:shadow-lg hover:shadow-primary/20',
          threadOpen
            ? 'border-primary ring-1 ring-primary/50 scale-105'
            : 'border-border hover:border-primary/50',
          isActive && 'shadow-md shadow-primary/10'
        )}
        style={{ width: 160, height: 96 }}
      >
        {/* Thumbnail */}
        <div className="absolute inset-0">
          {artifact.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={artifact.thumbnailUrl}
              alt={artifact.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-2">
          <span className="text-[10px] font-semibold text-white leading-tight truncate">
            {artifact.name}
          </span>
          <span className={cn('mt-1 self-start text-[9px] font-medium px-1.5 py-0.5 rounded-full', TYPE_COLORS[artifact.type])}>
            {TYPE_LABELS[artifact.type]}
          </span>
        </div>

        {/* Glow on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg ring-1 ring-primary/40" />
      </button>

      {/* Chat thread popover */}
      {threadOpen && (
        <ArtifactChatThread
          artifact={artifact}
          onClose={() => onOpenThread(null)}
        />
      )}
    </div>
  )
}

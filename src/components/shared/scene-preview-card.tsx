'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { MockScene, SceneStatus } from '@/lib/mock/types'

interface ScenePreviewCardProps {
  scene: MockScene
  onClick?: () => void
  className?: string
  selected?: boolean
}

const statusConfig: Record<SceneStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  init: { label: 'Waiting', variant: 'outline' },
  generating: { label: 'Generating', variant: 'secondary' },
  completed: { label: 'Done', variant: 'default' },
  failed: { label: 'Failed', variant: 'destructive' },
}

export function ScenePreviewCard({
  scene,
  onClick,
  className,
  selected = false,
}: ScenePreviewCardProps) {
  const status = statusConfig[scene.status]

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-lg border transition-all',
        selected
          ? 'border-primary ring-2 ring-primary/50'
          : 'border-border hover:border-primary/50',
        className
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={scene.thumbnailUrl}
          alt={`Scene ${scene.index + 1}`}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />

        {/* Scene index overlay */}
        <div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs font-bold text-white backdrop-blur-sm">
          {scene.index + 1}
        </div>

        {/* Duration overlay */}
        <div className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white backdrop-blur-sm font-mono">
          {scene.duration}s
        </div>

        {/* Generating pulse overlay */}
        {scene.status === 'generating' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-1 text-sm font-medium text-foreground">
            {scene.subject}
          </p>
          <Badge variant={status.variant} className="shrink-0 text-xs">
            {status.label}
          </Badge>
        </div>
        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
          {scene.action}
        </p>
      </div>
    </div>
  )
}

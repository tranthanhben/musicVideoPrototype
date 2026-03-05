'use client'

import { Images } from 'lucide-react'
import type { ChatArtifact } from '@/lib/chat/types'

interface ImageGalleryCardProps {
  artifact: ChatArtifact
}

export function ImageGalleryCard({ artifact }: ImageGalleryCardProps) {
  const thumbnails = artifact.thumbnails ?? []

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Images className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">{artifact.title}</span>
        </div>
        <span className="text-xs text-muted-foreground">{thumbnails.length} scenes</span>
      </div>
      {/* Scrollable filmstrip */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {thumbnails.map((thumb, i) => (
          <div key={i} className="relative shrink-0 w-20 h-14 rounded-lg overflow-hidden border border-border group">
            <img src={thumb} alt={`Scene ${i + 1}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] font-bold text-white">Scene {i + 1}</span>
            </div>
          </div>
        ))}
      </div>
      {artifact.description && (
        <p className="text-xs text-muted-foreground">{artifact.description}</p>
      )}
    </div>
  )
}

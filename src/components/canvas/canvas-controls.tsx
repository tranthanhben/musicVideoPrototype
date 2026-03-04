'use client'

import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CanvasControlsProps {
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onFitAll: () => void
}

export function CanvasControls({ zoom, onZoomIn, onZoomOut, onFitAll }: CanvasControlsProps) {
  return (
    <div className={cn(
      'fixed top-4 right-4 z-30 flex items-center gap-1',
      'bg-card/80 backdrop-blur-md border border-border rounded-xl px-2 py-1.5 shadow-lg'
    )}>
      <button
        onClick={onZoomOut}
        className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        title="Zoom out"
      >
        <ZoomOut className="w-3.5 h-3.5" />
      </button>

      <span className="text-xs font-mono text-muted-foreground min-w-[3rem] text-center">
        {Math.round(zoom * 100)}%
      </span>

      <button
        onClick={onZoomIn}
        className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        title="Zoom in"
      >
        <ZoomIn className="w-3.5 h-3.5" />
      </button>

      <div className="w-px h-4 bg-border mx-0.5" />

      <button
        onClick={onFitAll}
        className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        title="Fit all"
      >
        <Maximize2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

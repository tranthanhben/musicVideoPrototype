'use client'

import type { MockScene } from '@/lib/mock/types'

interface PreviewMonitorProps {
  scene: MockScene | null
  isPlaying: boolean
  onTogglePlay: () => void
}

export function PreviewMonitor({ scene, isPlaying, onTogglePlay }: PreviewMonitorProps) {
  return (
    <div
      className="relative w-full aspect-video rounded-sm overflow-hidden border border-white/10 flex items-center justify-center bg-card"
    >
      {/* Thumbnail background */}
      {scene?.thumbnailUrl && (
        <img
          src={scene.thumbnailUrl}
          alt={scene.subject}
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* PREVIEW label */}
      <div
        className="absolute top-2 left-2 text-[10px] tracking-widest opacity-60"
        style={{ fontFamily: 'JetBrains Mono, monospace', color: '#22D3EE' }}
      >
        PREVIEW
      </div>

      {/* Scene name */}
      {scene && (
        <div
          className="absolute bottom-2 left-2 right-2 text-[11px] truncate opacity-80"
          style={{ fontFamily: 'JetBrains Mono, monospace', color: '#E5E7EB' }}
        >
          {`S${scene.index + 1} — ${scene.subject}`}
        </div>
      )}

      {/* Play/Pause button */}
      <button
        onClick={onTogglePlay}
        className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-110"
        style={{ background: 'rgba(124,58,237,0.7)', backdropFilter: 'blur(4px)' }}
      >
        {isPlaying ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="#fff">
            <rect x="4" y="3" width="4" height="14" rx="1" />
            <rect x="12" y="3" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="#fff">
            <polygon points="5,3 18,10 5,17" />
          </svg>
        )}
      </button>

      {/* No scene placeholder */}
      {!scene && (
        <div
          className="relative z-10 text-[11px] tracking-widest opacity-30"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          NO SCENE SELECTED
        </div>
      )}
    </div>
  )
}

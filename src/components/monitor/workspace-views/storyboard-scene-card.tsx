'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Pencil, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MockScene } from '@/lib/mock/types'

interface SceneCardProps {
  scene: MockScene
  index: number
  segInfo?: { color: string; label: string }
  isActive: boolean
  selectedTakeId: string
  totalScenes: number
  timeStart: number
  timeEnd: number
  onToggle: () => void
  onTakeSelect: (takeId: string) => void
  onMoveUp?: () => void
  onMoveDown?: () => void
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

export function StoryboardSceneCard({
  scene, index, segInfo, isActive, selectedTakeId,
  totalScenes, timeStart, timeEnd,
  onToggle, onTakeSelect, onMoveUp, onMoveDown,
}: SceneCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div className="flex flex-col gap-1.5">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.04 }}
        className="relative cursor-pointer group"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onToggle}
      >
        {isActive && (
          <div className="absolute inset-0 z-20 rounded-xl ring-2 ring-primary ring-offset-1 ring-offset-background pointer-events-none" />
        )}

        <div className={cn('aspect-video rounded-xl overflow-hidden bg-muted relative transition-transform duration-200', 'group-hover:scale-[1.03]')}>
          <img src={scene.thumbnailUrl} alt={`Scene ${scene.index + 1}`} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />

          {/* Segment badge */}
          {segInfo && (
            <div className="absolute top-1.5 left-1.5 z-10 rounded-md px-1.5 py-0.5" style={{ backgroundColor: segInfo.color }}>
              <span className="text-[8px] font-bold text-white">{segInfo.label}</span>
            </div>
          )}

          {/* Scene number */}
          <div className="absolute top-1.5 right-1.5 z-10 h-5 w-5 rounded-full bg-black/60 flex items-center justify-center">
            <span className="text-[9px] font-bold text-white">{scene.index + 1}</span>
          </div>

          {/* Timestamp badge */}
          <div className="absolute top-1.5 z-10 left-1/2 -translate-x-1/2">
            <span className="text-[8px] font-mono font-bold text-white/90 bg-black/50 rounded px-1.5 py-0.5">
              {formatTime(timeStart)}–{formatTime(timeEnd)}
            </span>
          </div>

          {/* Hover action buttons */}
          {hovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute bottom-8 right-1.5 z-30 flex flex-col gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="h-6 w-6 rounded-md bg-black/70 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer"
                title="Edit"
              >
                <Pencil className="h-3 w-3 text-white" />
              </button>
              {index > 0 && onMoveUp && (
                <button
                  onClick={onMoveUp}
                  className="h-6 w-6 rounded-md bg-black/70 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer"
                  title="Move up"
                >
                  <ChevronUp className="h-3 w-3 text-white" />
                </button>
              )}
              {index < totalScenes - 1 && onMoveDown && (
                <button
                  onClick={onMoveDown}
                  className="h-6 w-6 rounded-md bg-black/70 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer"
                  title="Move down"
                >
                  <ChevronDown className="h-3 w-3 text-white" />
                </button>
              )}
              <button
                className="h-6 w-6 rounded-md bg-black/70 flex items-center justify-center hover:bg-emerald-500 transition-colors cursor-pointer"
                title="Regenerate"
              >
                <RefreshCw className="h-3 w-3 text-white" />
              </button>
            </motion.div>
          )}

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-[9px] font-semibold text-white truncate">{scene.subject}</p>
            <p className="text-[8px] text-white/60 flex items-center gap-1">
              <Camera className="h-2 w-2" />
              {scene.cameraAngle}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Takes strip */}
      {scene.takes && scene.takes.length > 1 && (
        <div className="grid grid-cols-3 gap-1">
          {scene.takes.slice(0, 3).map((take) => (
            <button key={take.id} onClick={() => onTakeSelect(take.id)}
              className={cn(
                'rounded overflow-hidden border-2 transition-all cursor-pointer aspect-video',
                take.id === selectedTakeId ? 'border-primary' : 'border-border/40 opacity-60 hover:opacity-100',
              )}
            >
              <img src={take.thumbnailUrl} alt="Take" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

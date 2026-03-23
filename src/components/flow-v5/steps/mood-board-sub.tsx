'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { makeSvgThumb } from '@/lib/flow-v5/mock-data'
import type { MoodImage } from '@/lib/flow-v5/types'

// --- CSS filter map for visual properties ---

type FilterMap = Record<string, string>

const LIGHTING_FILTERS: FilterMap = {
  'golden-hour': 'sepia(0.3) saturate(1.2)',
  dramatic: 'contrast(1.3) brightness(0.9)',
  neon: 'saturate(1.5) brightness(1.1)',
}

const GRADING_FILTERS: FilterMap = {
  monochrome: 'grayscale(1)',
  desaturated: 'saturate(0.4)',
  vibrant: 'saturate(1.5)',
}

export function resolveImageFilter(visualProps: Record<string, string>): string {
  const lighting = LIGHTING_FILTERS[visualProps['lighting'] ?? ''] ?? ''
  const grading = GRADING_FILTERS[visualProps['grading'] ?? ''] ?? ''
  return [lighting, grading].filter(Boolean).join(' ') || 'none'
}

// --- Mood composite banner ---

interface MoodCompositeProps {
  images: MoodImage[]
}

export function MoodComposite({ images }: MoodCompositeProps) {
  const approved = images.filter((i) => i.approved)

  if (approved.length === 0) {
    return (
      <div className="w-full h-[80px] rounded-2xl border border-dashed border-white/[0.08] flex items-center justify-center bg-muted/30">
        <p className="text-[11px] text-muted-foreground italic">Approve images to build your mood.</p>
      </div>
    )
  }

  return (
    <div className="w-full h-[80px] rounded-2xl overflow-hidden relative glass-surface">
      {approved.map((img, idx) => (
        <img
          key={img.id}
          src={img.imageUrl ?? makeSvgThumb(img.colors[0], img.colors[1])}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: 1 / approved.length,
            mixBlendMode: idx === 0 ? 'normal' : 'screen',
          }}
        />
      ))}
      <div className="absolute inset-0 flex items-end p-2 bg-gradient-to-t from-black/40 to-transparent">
        <span className="text-[10px] text-white/80 font-medium">
          {approved.length} image{approved.length > 1 ? 's' : ''} in mood
        </span>
      </div>
    </div>
  )
}

// --- Individual image card ---

interface MoodImageCardProps {
  img: MoodImage
  index: number
  categoryKey: string
  imageFilter: string
  onApprove: (id: string) => void
  onRegenerate: (id: string) => void
}

export function MoodImageCard({ img, index, categoryKey, imageFilter, onApprove, onRegenerate }: MoodImageCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      key={`${categoryKey}-${img.id}`}
      initial={{ opacity: 0, filter: 'blur(16px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.8, delay: index * 0.12 }}
      className={cn(
        'relative rounded-2xl border overflow-hidden transition-colors',
        img.approved ? 'border-green-500/50 shadow-sm' : 'border-white/[0.08]',
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="aspect-[4/3] relative">
        <img
          src={img.imageUrl ?? makeSvgThumb(img.colors[0], img.colors[1])}
          alt={img.label}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-300"
          style={{ filter: imageFilter }}
        />

        {/* Action overlay — tied to hovered state, above zoom overlay */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 z-20 bg-black/40 flex items-center justify-center gap-2"
            >
          <button
            onClick={() => onApprove(img.id)}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full transition-colors cursor-pointer z-10',
              img.approved ? 'bg-green-500 text-white' : 'bg-white/90 text-foreground',
            )}
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={() => onRegenerate(img.id)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-foreground cursor-pointer z-10"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
            </motion.div>
          )}
        </AnimatePresence>

        {img.approved && (
          <div className="absolute top-1.5 right-1.5 z-10">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
              <Check className="h-3 w-3 text-white" />
            </div>
          </div>
        )}
      </div>

      <div className="p-2">
        <p className="text-[10px] font-medium text-foreground truncate">{img.label}</p>
      </div>
    </motion.div>
  )
}

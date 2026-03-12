'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, RefreshCw, ThumbsUp, ThumbsDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { makeSvgThumb } from '@/lib/flow/mock-data'
import type { MoodImage } from '@/lib/flow/types'

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

// --- Mood composite ---

interface MoodCompositeProps {
  images: MoodImage[]
}

export function MoodComposite({ images }: MoodCompositeProps) {
  const approved = images.filter((i) => i.approved)

  if (approved.length === 0) {
    return (
      <div className="w-full h-[90px] rounded-xl border border-dashed border-border flex flex-col items-center justify-center gap-1 bg-muted/20">
        <p className="text-[11px] text-muted-foreground/60 italic">Approve images below to build your mood palette</p>
        <p className="text-[10px] text-muted-foreground/40">Use the thumbs up button to add images</p>
      </div>
    )
  }

  return (
    <div className="w-full h-[90px] rounded-xl overflow-hidden relative border border-border shadow-md">
      {approved.map((img, idx) => (
        <img
          key={img.id}
          src={img.url ?? makeSvgThumb(img.colors[0], img.colors[1])}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          style={{
            opacity: 1 / approved.length,
            mixBlendMode: idx === 0 ? 'normal' : 'screen',
          }}
        />
      ))}
      <div className="absolute inset-0 flex items-end p-2.5 bg-gradient-to-t from-black/50 to-transparent">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {approved.slice(0, 5).map((img) => (
              <div
                key={img.id}
                className="h-3 w-3 rounded-full border border-white/30 shrink-0"
                style={{ background: img.colors[0] }}
              />
            ))}
          </div>
          <span className="text-[10px] text-white/80 font-medium">
            {approved.length} image{approved.length > 1 ? 's' : ''} in mood palette
          </span>
        </div>
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
      initial={{ opacity: 0, filter: 'blur(20px)', scale: 0.96 }}
      animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
      transition={{ duration: 0.7, delay: index * 0.1 }}
      className={cn(
        'relative rounded-xl border overflow-hidden transition-all duration-200',
        img.approved
          ? 'border-green-500/60 shadow-md shadow-green-500/10'
          : 'border-border hover:border-border/70',
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="aspect-video relative">
        <img
          src={img.url ?? makeSvgThumb(img.colors[0], img.colors[1])}
          alt={img.label}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
          style={{
            filter: imageFilter,
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
          }}
        />

        {/* Hover overlay with larger action buttons */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 z-20 bg-black/50 flex flex-col items-center justify-center gap-2"
            >
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onApprove(img.id)}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full transition-colors cursor-pointer shadow-lg',
                    img.approved
                      ? 'bg-green-500 text-white shadow-green-500/40'
                      : 'bg-white/95 text-foreground',
                  )}
                  title={img.approved ? 'Remove from mood' : 'Add to mood'}
                >
                  {img.approved ? <ThumbsDown className="h-4 w-4" /> : <ThumbsUp className="h-4 w-4" />}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onRegenerate(img.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-foreground cursor-pointer shadow-lg"
                  title="Regenerate"
                >
                  <RefreshCw className="h-4 w-4" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Approved badge */}
        {img.approved && (
          <div className="absolute top-1.5 right-1.5 z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 shadow"
            >
              <Check className="h-3 w-3 text-white" />
            </motion.div>
          </div>
        )}
      </div>

      <div className="p-2 bg-card">
        <p className="text-[10px] font-medium text-foreground truncate">{img.label}</p>
        <div className="flex gap-1 mt-1">
          {img.colors.map((c, i) => (
            <div key={i} className="h-2 flex-1 rounded-full" style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

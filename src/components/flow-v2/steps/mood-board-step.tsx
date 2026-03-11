'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { MOCK_MOOD_IMAGES, VISUAL_PROPERTIES } from '@/lib/flow-v2/mock-data'
import type { MoodImage } from '@/lib/flow-v2/types'
import { MoodComposite, MoodImageCard, resolveImageFilter } from './mood-board-sub'

interface MoodBoardStepProps {
  onContinue: () => void
}

const CATEGORIES = [
  { key: 'color' as const, label: 'Color & Palette' },
  { key: 'mood' as const, label: 'Mood & Emotion' },
  { key: 'scene' as const, label: 'Scene Context' },
]

export function MoodBoardStep({ onContinue }: MoodBoardStepProps) {
  const [images, setImages] = useState<MoodImage[]>(MOCK_MOOD_IMAGES)
  const [visualProps, setVisualProps] = useState<Record<string, string>>({})
  const [activeCategory, setActiveCategory] = useState<'color' | 'mood' | 'scene'>('color')

  const approvedCount = images.filter((i) => i.approved).length
  const filteredImages = images.filter((img) => img.category === activeCategory)
  const imageFilter = resolveImageFilter(visualProps)

  function toggleApprove(id: string) {
    setImages((prev) => prev.map((img) => img.id === id ? { ...img, approved: !img.approved } : img))
  }

  function regenerateImage(id: string) {
    setImages((prev) => prev.map((img) => {
      if (img.id !== id) return img
      return { ...img, colors: [img.colors[1], img.colors[0]] as [string, string], approved: false }
    }))
  }

  return (
    <div className="flex h-full justify-center overflow-y-auto p-6">
      <div className="w-full max-w-2xl space-y-4">

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-lg font-bold text-foreground">Mood Board</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review generated mood references and set visual properties
          </p>
        </motion.div>

        {/* Live composite banner */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
          <MoodComposite images={images} />
        </motion.div>

        {/* Visual Properties */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-2">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Visual Properties</p>
          <div className="grid grid-cols-3 gap-2">
            {VISUAL_PROPERTIES.map((prop) => (
              <div key={prop.id} className="rounded-lg border border-border bg-card p-2.5">
                <p className="text-[10px] font-medium text-foreground mb-1.5">{prop.label}</p>
                <div className="flex flex-wrap gap-1">
                  {prop.options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setVisualProps((p) => ({ ...p, [prop.id]: opt.id }))}
                      className={cn(
                        'rounded-md px-2 py-1 text-[10px] font-medium transition-colors cursor-pointer',
                        visualProps[prop.id] === opt.id
                          ? 'bg-primary/15 text-primary border border-primary/30'
                          : 'bg-muted/50 text-muted-foreground border border-transparent hover:bg-muted',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Category tabs */}
        <div className="flex gap-1">
          {CATEGORIES.map((cat) => {
            const count = images.filter((i) => i.category === cat.key && i.approved).length
            const total = images.filter((i) => i.category === cat.key).length
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={cn(
                  'flex-1 rounded-lg py-1.5 text-[11px] font-medium transition-colors cursor-pointer text-center',
                  activeCategory === cat.key
                    ? 'bg-primary/15 text-primary border border-primary/30'
                    : 'bg-muted/50 text-muted-foreground border border-transparent',
                )}
              >
                {cat.label} {count > 0 && <span className="text-green-500">({count}/{total})</span>}
              </button>
            )
          })}
        </div>

        {/* Image grid — key triggers re-mount so blur animation replays on category switch */}
        <motion.div
          key={activeCategory}
          className="grid grid-cols-3 gap-3"
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {filteredImages.map((img, idx) => (
            <MoodImageCard
              key={img.id}
              img={img}
              index={idx}
              categoryKey={activeCategory}
              imageFilter={imageFilter}
              onApprove={toggleApprove}
              onRegenerate={regenerateImage}
            />
          ))}
        </motion.div>

        {/* Status + continue */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {approvedCount} of {images.length} images approved
          </span>
          <button
            onClick={onContinue}
            className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer"
          >
            Continue to Storyboard
          </button>
        </div>

      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { MOCK_MOOD_IMAGES, VISUAL_PROPERTIES } from '@/lib/flow/mock-data'
import type { MoodImage } from '@/lib/flow/types'
import { MoodComposite, MoodImageCard, resolveImageFilter } from './mood-board-sub'

interface MoodBoardStepProps {
  onContinue: () => void
}

const CATEGORIES = [
  { key: 'color' as const, label: 'Color & Palette', accent: '#F59E0B' },
  { key: 'mood' as const, label: 'Mood & Emotion', accent: '#EC4899' },
  { key: 'scene' as const, label: 'Scene Context', accent: '#06B6D4' },
]

export function MoodBoardStep({ onContinue }: MoodBoardStepProps) {
  const [images, setImages] = useState<MoodImage[]>(MOCK_MOOD_IMAGES)
  const [visualProps, setVisualProps] = useState<Record<string, string>>({})
  const [activeCategory, setActiveCategory] = useState<'color' | 'mood' | 'scene'>('color')

  const approvedCount = images.filter((i) => i.approved).length
  const filteredImages = images.filter((img) => img.category === activeCategory)
  const imageFilter = resolveImageFilter(visualProps)
  const activeCat = CATEGORIES.find((c) => c.key === activeCategory)

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
      <div className="w-full max-w-5xl space-y-4">

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-lg font-bold text-foreground">Mood Board</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Approve visual references to shape your video&apos;s aesthetic
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
              <div key={prop.id} className="rounded-xl border border-border bg-card p-3">
                <p className="text-[10px] font-semibold text-foreground mb-2">{prop.label}</p>
                <div className="flex flex-wrap gap-1">
                  {prop.options.map((opt) => {
                    const isActive = visualProps[prop.id] === opt.id
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setVisualProps((p) => ({
                          ...p,
                          [prop.id]: isActive ? '' : opt.id,
                        }))}
                        className={cn(
                          'rounded-md px-2 py-1 text-[10px] font-medium transition-all cursor-pointer',
                          isActive
                            ? 'bg-primary/15 text-primary border border-primary/30 shadow-sm'
                            : 'bg-muted/40 text-muted-foreground border border-transparent hover:bg-muted hover:text-foreground',
                        )}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Category tabs */}
        <div className="flex gap-1.5">
          {CATEGORIES.map((cat) => {
            const count = images.filter((i) => i.category === cat.key && i.approved).length
            const total = images.filter((i) => i.category === cat.key).length
            const isActive = activeCategory === cat.key
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={cn(
                  'flex-1 rounded-xl py-2 text-[11px] font-medium transition-all cursor-pointer text-center border',
                  isActive
                    ? 'bg-primary/10 text-primary border-primary/30 shadow-sm'
                    : 'bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50',
                )}
              >
                {cat.label}
                {count > 0 && (
                  <span className="ml-1.5 text-green-500 font-semibold">({count}/{total})</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Active filter indicator */}
        {imageFilter !== 'none' && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2"
          >
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            <p className="text-[11px] text-primary font-medium">Filter preview active — {imageFilter}</p>
          </motion.div>
        )}

        {/* Image grid */}
        <motion.div
          key={activeCategory}
          className="grid grid-cols-3 xl:grid-cols-4 gap-3"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
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
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">
            {approvedCount > 0 ? (
              <><span className="text-green-500 font-semibold">{approvedCount}</span> of {images.length} approved</>
            ) : (
              'No images approved yet'
            )}
          </span>
          <button
            onClick={onContinue}
            className="rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer"
          >
            Continue to Storyboard
          </button>
        </div>

      </div>
    </div>
  )
}

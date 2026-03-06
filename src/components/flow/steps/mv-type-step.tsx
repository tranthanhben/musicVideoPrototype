'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { MV_TYPES } from '@/lib/flow/mock-data'
import type { MvType } from '@/lib/flow/types'

interface MvTypeStepProps {
  selected: MvType | null
  onSelect: (type: MvType) => void
}

export function MvTypeStep({ selected, onSelect }: MvTypeStepProps) {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center"
        >
          <h2 className="text-lg font-bold text-foreground">What type of music video?</h2>
          <p className="text-xs text-muted-foreground mt-1">Choose the style that best fits your creative vision</p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {MV_TYPES.map((type) => {
            const isSelected = selected === type.id
            return (
              <button
                key={type.id}
                onClick={() => onSelect(type.id)}
                className={cn(
                  'relative rounded-xl border p-4 text-left transition-all cursor-pointer overflow-hidden group',
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-md -translate-y-0.5'
                    : 'border-border bg-card hover:border-border/80 hover:-translate-y-0.5',
                )}
              >
                {/* Accent bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 transition-opacity"
                  style={{
                    backgroundColor: type.accentColor,
                    opacity: isSelected ? 1 : 0.3,
                  }}
                />
                <div className="flex items-start gap-3 pt-1">
                  <span className="text-2xl">{type.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{type.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{type.description}</p>
                  </div>
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: type.accentColor }} />
                  </div>
                )}
              </button>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}

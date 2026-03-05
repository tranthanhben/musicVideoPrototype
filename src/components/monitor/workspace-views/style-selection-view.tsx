'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  VIDEO_STYLES, MOOD_OPTIONS, GENRE_OPTIONS, PALETTE_OPTIONS,
  type StyleOption, type PaletteOption,
} from '@/lib/mock/style-options'

interface StyleSelectionViewProps {
  onConfirm: (selections: StyleSelections) => void
}

export interface StyleSelections {
  style: string | null
  mood: string | null
  genre: string | null
  palette: string | null
}

type Step = 'style' | 'mood' | 'genre' | 'palette'
const STEPS: { key: Step; label: string; options: StyleOption[] }[] = [
  { key: 'style', label: 'Video Style', options: VIDEO_STYLES },
  { key: 'mood', label: 'Mood & Tone', options: MOOD_OPTIONS },
  { key: 'genre', label: 'Genre / Category', options: GENRE_OPTIONS },
]

export function StyleSelectionView({ onConfirm }: StyleSelectionViewProps) {
  const [selections, setSelections] = useState<StyleSelections>({
    style: null, mood: null, genre: null, palette: null,
  })
  const [currentStep, setCurrentStep] = useState<number>(0)

  const isLastStep = currentStep === 3 // palette step

  function selectOption(key: Step, id: string) {
    setSelections((s) => ({ ...s, [key]: id }))
    // Auto-advance after short delay
    if (currentStep < 3) {
      setTimeout(() => setCurrentStep((p) => p + 1), 300)
    }
  }

  function selectPalette(id: string) {
    setSelections((s) => ({ ...s, palette: id }))
  }

  const allSelected = selections.style && selections.mood && selections.genre && selections.palette

  return (
    <div className="flex h-full flex-col p-6 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Creative Direction</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Define the visual style for your music video</p>
        </div>
        {allSelected && (
          <button
            onClick={() => onConfirm(selections)}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer"
          >
            Continue <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Step tabs */}
      <div className="flex gap-1">
        {[...STEPS.map((s) => s.label), 'Color Palette'].map((label, i) => (
          <button
            key={label}
            onClick={() => setCurrentStep(i)}
            className={cn(
              'flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer text-center',
              i === currentStep
                ? 'bg-primary/15 text-primary border border-primary/30'
                : selections[i === 3 ? 'palette' : STEPS[i].key]
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-muted/50 text-muted-foreground border border-transparent',
            )}
          >
            {selections[i === 3 ? 'palette' : STEPS[i]?.key] && i !== currentStep && (
              <Check className="inline h-3 w-3 mr-0.5" />
            )}
            {label}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          {currentStep < 3 ? (
            <OptionGrid
              options={STEPS[currentStep].options}
              selectedId={selections[STEPS[currentStep].key]}
              onSelect={(id) => selectOption(STEPS[currentStep].key, id)}
            />
          ) : (
            <PaletteGrid
              options={PALETTE_OPTIONS}
              selectedId={selections.palette}
              onSelect={selectPalette}
            />
          )}
        </motion.div>
      </div>
    </div>
  )
}

function OptionGrid({ options, selectedId, onSelect }: {
  options: StyleOption[]; selectedId: string | null; onSelect: (id: string) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {options.map((opt) => {
        const isSelected = opt.id === selectedId
        return (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className={cn(
              'relative rounded-xl border p-3 text-left transition-all cursor-pointer overflow-hidden',
              isSelected
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border bg-card hover:border-border/80',
            )}
          >
            {/* Gradient accent bar */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ background: `linear-gradient(to right, ${opt.gradientFrom}, ${opt.gradientTo})` }}
            />
            <div className="pt-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-foreground">{opt.label}</span>
                {isSelected && (
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                    <Check className="h-2.5 w-2.5 text-primary-foreground" />
                  </div>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{opt.description}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function PaletteGrid({ options, selectedId, onSelect }: {
  options: PaletteOption[]; selectedId: string | null; onSelect: (id: string) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {options.map((pal) => {
        const isSelected = pal.id === selectedId
        return (
          <button
            key={pal.id}
            onClick={() => onSelect(pal.id)}
            className={cn(
              'rounded-xl border p-3 text-left transition-all cursor-pointer',
              isSelected
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border bg-card hover:border-border/80',
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-foreground">{pal.label}</span>
              {isSelected && (
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                  <Check className="h-2.5 w-2.5 text-primary-foreground" />
                </div>
              )}
            </div>
            <div className="flex gap-1.5">
              {pal.colors.map((c) => (
                <div
                  key={c}
                  className="h-6 flex-1 rounded-md border border-white/10"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </button>
        )
      })}
    </div>
  )
}

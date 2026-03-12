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

const STYLE_IMAGES: Record<string, string> = {
  cinematic: '/assets/mood-board/mood-cinematic.jpg',
  anime: '/assets/mood-board/scene-intimate-portrait.jpg',
  abstract: '/assets/mood-board/color-cool-cosmic.jpg',
  documentary: '/assets/mood-board/scene-vast-starfield.jpg',
  performance: '/assets/mood-board/mood-euphoric.jpg',
  surreal: '/assets/mood-board/scene-space-station.jpg',
}

const MOOD_IMAGES: Record<string, string> = {
  dark: '/assets/mood-board/mood-melancholic.jpg',
  ethereal: '/assets/mood-board/color-cool-cosmic.jpg',
  energetic: '/assets/mood-board/mood-euphoric.jpg',
  romantic: '/assets/mood-board/color-warm-golden.jpg',
  nostalgic: '/assets/mood-board/color-warm-golden.jpg',
  futuristic: '/assets/mood-board/color-cool-cosmic.jpg',
}

const GENRE_IMAGES: Record<string, string> = {
  'pop-mv': '/assets/mood-board/mood-euphoric.jpg',
  hiphop: '/assets/mood-board/scene-vast-starfield.jpg',
  'indie-art': '/assets/mood-board/mood-melancholic.jpg',
  edm: '/assets/mood-board/mood-cinematic.jpg',
  lofi: '/assets/mood-board/color-warm-golden.jpg',
  rock: '/assets/mood-board/scene-intimate-portrait.jpg',
}

type Step = 'style' | 'mood' | 'genre' | 'palette'
const STEPS: { key: Step; label: string; options: StyleOption[]; images: Record<string, string> }[] = [
  { key: 'style', label: 'Video Style', options: VIDEO_STYLES, images: STYLE_IMAGES },
  { key: 'mood', label: 'Mood & Tone', options: MOOD_OPTIONS, images: MOOD_IMAGES },
  { key: 'genre', label: 'Genre', options: GENRE_OPTIONS, images: GENRE_IMAGES },
]
const TAB_LABELS = [...STEPS.map((s) => s.label), 'Palette']

export function StyleSelectionView({ onConfirm }: StyleSelectionViewProps) {
  const [selections, setSelections] = useState<StyleSelections>({ style: null, mood: null, genre: null, palette: null })
  const [currentStep, setCurrentStep] = useState<number>(0)

  function selectOption(key: Step, id: string) {
    setSelections((s) => ({ ...s, [key]: id }))
    if (currentStep < 3) setTimeout(() => setCurrentStep((p) => p + 1), 280)
  }

  const allSelected = selections.style && selections.mood && selections.genre && selections.palette
  const completedSteps = [selections.style, selections.mood, selections.genre, selections.palette].filter(Boolean).length

  return (
    <div className="flex h-full flex-col p-5 gap-3">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-sm font-bold text-foreground">Creative Direction</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Define the visual style for your music video</p>
        </div>
        {allSelected && (
          <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            onClick={() => onConfirm(selections)}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 cursor-pointer"
          >
            Continue <ChevronRight className="h-3.5 w-3.5" />
          </motion.button>
        )}
      </div>

      <div className="shrink-0">
        <div className="flex justify-between mb-1.5">
          <span className="text-[10px] text-muted-foreground">{completedSteps}/4 selections</span>
          <span className="text-[10px] font-mono text-primary">{Math.round((completedSteps / 4) * 100)}%</span>
        </div>
        <div className="h-1 rounded-full bg-muted overflow-hidden">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400"
            animate={{ width: `${(completedSteps / 4) * 100}%` }} transition={{ duration: 0.4 }} />
        </div>
      </div>

      <div className="flex gap-1.5 shrink-0">
        {TAB_LABELS.map((label, i) => {
          const key = i === 3 ? 'palette' : STEPS[i].key
          const isDone = !!selections[key]
          const isActive = i === currentStep
          return (
            <button key={label} onClick={() => setCurrentStep(i)}
              className={cn(
                'flex-1 py-2 rounded-xl text-[10px] font-semibold transition-all cursor-pointer text-center border',
                isActive ? 'bg-primary/15 text-primary border-primary/40 shadow-sm'
                  : isDone ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-muted/40 text-muted-foreground border-border/50',
              )}
            >
              {isDone && !isActive && <Check className="inline h-3 w-3 mr-0.5 mb-0.5" />}
              {label}
            </button>
          )
        })}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <motion.div key={currentStep} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
          {currentStep < 3 ? (
            <ImageOptionGrid
              options={STEPS[currentStep].options}
              images={STEPS[currentStep].images}
              selectedId={selections[STEPS[currentStep].key]}
              onSelect={(id) => selectOption(STEPS[currentStep].key, id)}
            />
          ) : (
            <PaletteGrid options={PALETTE_OPTIONS} selectedId={selections.palette}
              onSelect={(id) => setSelections((s) => ({ ...s, palette: id }))} />
          )}
        </motion.div>
      </div>
    </div>
  )
}

export function ImageOptionGrid({ options, images, selectedId, onSelect }: {
  options: StyleOption[]
  images: Record<string, string>
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {options.map((opt) => {
        const isSel = opt.id === selectedId
        const imgSrc = images[opt.id]
        return (
          <button key={opt.id} onClick={() => onSelect(opt.id)}
            className={cn('relative rounded-xl border p-0 text-left transition-all cursor-pointer overflow-hidden group',
              isSel ? 'border-primary shadow-md' : 'border-border hover:border-primary/40')}
          >
            <div className="h-16 w-full relative overflow-hidden">
              {imgSrc ? (
                <img src={imgSrc} alt={opt.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              ) : (
                <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${opt.gradientFrom}, ${opt.gradientTo})` }} />
              )}
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
              <div className="absolute bottom-2 left-3 right-8">
                <p className="text-[11px] font-bold text-white leading-tight">{opt.label}</p>
              </div>
              {isSel && (
                <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/40">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            <div className="p-2 pb-2.5">
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
        const isSel = pal.id === selectedId
        return (
          <button key={pal.id} onClick={() => onSelect(pal.id)}
            className={cn('rounded-xl border p-3 text-left transition-all cursor-pointer',
              isSel ? 'border-primary shadow-md bg-primary/5' : 'border-border bg-card hover:border-primary/40')}
          >
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-foreground">{pal.label}</span>
              {isSel && <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary"><Check className="h-2.5 w-2.5 text-primary-foreground" /></div>}
            </div>
            <div className="flex gap-1.5">
              {pal.colors.map((c) => (
                <div key={c} className="h-8 flex-1 rounded-lg border border-white/10 shadow-sm" style={{ backgroundColor: c }} />
              ))}
            </div>
          </button>
        )
      })}
    </div>
  )
}

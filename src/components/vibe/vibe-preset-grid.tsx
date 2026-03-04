'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { VibePreset } from '@/lib/mock/types'

interface VibePresetGridProps {
  presets: VibePreset[]
  selected: string | null
  onSelect: (id: string) => void
}

export function VibePresetGrid({ presets, selected, onSelect }: VibePresetGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {presets.map((preset) => {
        const isSelected = selected === preset.id
        return (
          <button
            key={preset.id}
            onClick={() => onSelect(preset.id)}
            className={cn(
              'relative flex flex-col items-center justify-center gap-2 rounded-2xl p-5 transition-all',
              isSelected
                ? 'ring-2 ring-pink-500 ring-offset-2'
                : 'hover:scale-[1.02] active:scale-[0.98]'
            )}
            style={{ background: preset.gradient, minHeight: 120 }}
          >
            {isSelected && (
              <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-pink-500">
                <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
              </div>
            )}
            <span className="text-4xl">{preset.icon}</span>
            <span className="text-sm font-semibold text-white drop-shadow-sm">
              {preset.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}

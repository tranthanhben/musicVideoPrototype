'use client'

import type { MockTake } from '@/lib/mock/types'
import { Check, Plus } from 'lucide-react'

interface TakeStripProps {
  takes: MockTake[]
  selectedId: string
  onSelect: (id: string) => void
  onAddTake?: () => void
}

export function TakeStrip({ takes, selectedId, onSelect, onAddTake }: TakeStripProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-stone-600">
      <span className="text-xs text-stone-500 uppercase tracking-wide shrink-0 mr-1">Takes</span>

      {takes.map((take, i) => {
        const isSelected = take.id === selectedId
        return (
          <button
            key={take.id}
            onClick={() => onSelect(take.id)}
            className="relative shrink-0 rounded overflow-hidden transition-transform hover:scale-105"
            style={{
              width: 56,
              height: 56,
              border: isSelected ? '2px solid #D97706' : '2px solid #44403C',
            }}
            title={`Take ${i + 1}`}
          >
            <img
              src={take.thumbnailUrl}
              alt={`Take ${i + 1}`}
              className="w-full h-full object-cover"
            />
            {isSelected && (
              <div className="absolute inset-0 bg-amber-600/30 flex items-center justify-center">
                <Check className="w-4 h-4 text-white drop-shadow" />
              </div>
            )}
            <span
              className="absolute bottom-0 left-0 right-0 text-center text-white"
              style={{ fontSize: 9, background: 'rgba(0,0,0,0.5)', lineHeight: '14px' }}
            >
              T{i + 1}
            </span>
          </button>
        )
      })}

      {/* Add take button */}
      <button
        onClick={onAddTake}
        className="shrink-0 rounded flex items-center justify-center bg-stone-700 hover:bg-stone-600 border-2 border-dashed border-stone-500 hover:border-amber-500 transition-colors"
        style={{ width: 56, height: 56 }}
        title="Generate new take"
      >
        <Plus className="w-4 h-4 text-stone-400" />
      </button>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronRight, Upload, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CHARACTER_ARCHETYPES, type CharacterArchetype } from '@/lib/mock/characters'

interface CharacterSetupViewProps {
  onConfirm: (selectedIds: string[]) => void
}

export function CharacterSetupView({ onConfirm }: CharacterSetupViewProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  function toggleCharacter(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 3) return prev
      return [...prev, id]
    })
  }

  const selectedChars = CHARACTER_ARCHETYPES.filter((c) => selectedIds.includes(c.id))

  return (
    <div className="flex h-full flex-col p-5 gap-3">
      <div className="flex items-center justify-between shrink-0 pr-28">
        <div>
          <h2 className="text-sm font-bold text-foreground">Character Setup</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Select 1–3 characters for your music video</p>
        </div>
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => onConfirm(selectedIds)}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-md shadow-primary/25 animate-[ctaPulse_2s_ease-in-out_infinite]"
            >
              Continue ({selectedIds.length}) <ChevronRight className="h-3.5 w-3.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Selected strip with real avatars */}
      <AnimatePresence>
        {selectedChars.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-2 items-center shrink-0"
          >
            {selectedChars.map((c) => (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-2.5 py-1.5"
              >
                <img
                  src={c.avatarUrl}
                  alt={c.name}
                  className="h-8 w-8 rounded-full object-cover shrink-0 border-2"
                  style={{ borderColor: c.accentColor }}
                />
                <span className="text-[11px] font-semibold text-foreground">{c.name}</span>
                <button onClick={() => toggleCharacter(c.id)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            ))}
            <span className="text-[10px] text-muted-foreground ml-1">
              {3 - selectedIds.length} slot{3 - selectedIds.length !== 1 ? 's' : ''} left
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload zone */}
      <div
        className="shrink-0 rounded-xl border border-dashed border-border bg-muted/20 p-3.5 flex items-center gap-3 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all"
        onClick={() => {
          const next = CHARACTER_ARCHETYPES.find((c) => !selectedIds.includes(c.id))
          if (next && selectedIds.length < 3) toggleCharacter(next.id)
        }}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted border border-border">
          <Upload className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground">Upload character reference</p>
          <p className="text-[10px] text-muted-foreground">PNG, JPG — face or full body shot</p>
        </div>
        <Plus className="h-4 w-4 text-muted-foreground ml-auto" />
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">or choose archetypes</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="grid grid-cols-2 gap-2.5">
          {CHARACTER_ARCHETYPES.map((char, i) => (
            <CharacterCard
              key={char.id}
              character={char}
              isSelected={selectedIds.includes(char.id)}
              isDisabled={selectedIds.length >= 3 && !selectedIds.includes(char.id)}
              order={i}
              onToggle={() => toggleCharacter(char.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function CharacterCard({ character, isSelected, isDisabled, order, onToggle }: {
  character: CharacterArchetype
  isSelected: boolean
  isDisabled: boolean
  order: number
  onToggle: () => void
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: order * 0.05 }}
      onClick={onToggle}
      disabled={isDisabled}
      className={cn(
        'relative rounded-xl border text-left transition-all cursor-pointer overflow-hidden',
        isSelected
          ? 'border-primary shadow-lg'
          : isDisabled
            ? 'border-border bg-muted/20 opacity-40 cursor-not-allowed'
            : 'border-border bg-card hover:border-primary/40',
      )}
      style={isSelected ? { boxShadow: `0 0 0 1px ${character.accentColor}40, 0 4px 20px ${character.accentColor}20` } : {}}
    >
      {/* Real photo header */}
      <div className="aspect-[3/2] w-full relative overflow-hidden group">
        <img
          src={character.avatarUrl}
          alt={character.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/0" />
        {/* Role badge */}
        <span
          className="absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ color: character.accentColor, backgroundColor: `${character.accentColor}30`, border: `1px solid ${character.accentColor}50` }}
        >
          {character.role}
        </span>
        {isSelected && (
          <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary shadow-sm">
            <Check className="h-3 w-3 text-primary-foreground" />
          </div>
        )}
        {/* Name overlay at bottom of image */}
        <div className="absolute bottom-2 left-3">
          <p className="text-xs font-bold text-white leading-tight">{character.name}</p>
        </div>
      </div>

      <div className="p-3 pt-2">
        <p className="text-[10px] text-muted-foreground leading-relaxed mb-2">{character.description}</p>
        <div className="flex flex-wrap gap-1">
          {character.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[9px] bg-muted/60 border border-border rounded px-1.5 py-0.5 text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.button>
  )
}

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
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
      if (prev.length >= 3) return prev // max 3
      return [...prev, id]
    })
  }

  const selectedChars = CHARACTER_ARCHETYPES.filter((c) => selectedIds.includes(c.id))

  return (
    <div className="flex h-full flex-col p-6 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Character Setup</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select 1-3 characters for your music video
          </p>
        </div>
        {selectedIds.length > 0 && (
          <button
            onClick={() => onConfirm(selectedIds)}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer"
          >
            Continue with {selectedIds.length} <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Selected characters strip */}
      {selectedChars.length > 0 && (
        <div className="flex gap-2">
          {selectedChars.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-2.5 py-1.5"
            >
              <img
                src={c.avatarUrl}
                alt={c.name}
                className="h-6 w-6 rounded-md object-cover"
              />
              <span className="text-[11px] font-medium text-foreground">{c.name}</span>
              <button
                onClick={() => toggleCharacter(c.id)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <span className="flex items-center text-[10px] text-muted-foreground">
            {3 - selectedIds.length} slot{3 - selectedIds.length !== 1 ? 's' : ''} left
          </span>
        </div>
      )}

      {/* Upload zone (mock) */}
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 flex items-center gap-3 cursor-pointer hover:border-primary/40 transition-colors"
        onClick={() => {
          // Mock upload — select first unselected character
          const next = CHARACTER_ARCHETYPES.find((c) => !selectedIds.includes(c.id))
          if (next && selectedIds.length < 3) toggleCharacter(next.id)
        }}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
          <Upload className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-xs font-medium text-foreground">Upload character reference</p>
          <p className="text-[10px] text-muted-foreground">PNG, JPG — face or full body shot</p>
        </div>
        <Plus className="h-4 w-4 text-muted-foreground ml-auto" />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          or choose archetypes
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Character grid */}
      <div className="flex-1 overflow-y-auto">
        <motion.div
          className="grid grid-cols-2 gap-2.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {CHARACTER_ARCHETYPES.map((char) => (
            <CharacterCard
              key={char.id}
              character={char}
              isSelected={selectedIds.includes(char.id)}
              isDisabled={selectedIds.length >= 3 && !selectedIds.includes(char.id)}
              onToggle={() => toggleCharacter(char.id)}
            />
          ))}
        </motion.div>
      </div>
    </div>
  )
}

function CharacterCard({ character, isSelected, isDisabled, onToggle }: {
  character: CharacterArchetype
  isSelected: boolean
  isDisabled: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      disabled={isDisabled}
      className={cn(
        'relative rounded-xl border p-3 text-left transition-all cursor-pointer',
        isSelected
          ? 'border-primary bg-primary/5 shadow-sm'
          : isDisabled
            ? 'border-border bg-muted/20 opacity-50 cursor-not-allowed'
            : 'border-border bg-card hover:border-border/80',
      )}
    >
      <div className="flex items-start gap-2.5">
        <img
          src={character.avatarUrl}
          alt={character.name}
          className="h-10 w-10 rounded-lg object-cover shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">{character.name}</span>
            {isSelected && (
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                <Check className="h-2.5 w-2.5 text-primary-foreground" />
              </div>
            )}
          </div>
          <span
            className="inline-block mt-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full"
            style={{
              color: character.accentColor,
              backgroundColor: `${character.accentColor}18`,
              border: `1px solid ${character.accentColor}30`,
            }}
          >
            {character.role}
          </span>
          <p className="mt-1 text-[10px] text-muted-foreground leading-relaxed">
            {character.description}
          </p>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mt-2">
        {character.tags.map((tag) => (
          <span
            key={tag}
            className="text-[9px] bg-muted/60 border border-border rounded px-1.5 py-0.5 text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
    </button>
  )
}

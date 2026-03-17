'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ShowcaseSection } from './showcase-section-wrapper'

const characters = [
  { id: 1, name: 'Aria', role: 'Main', usage: 3, style: 'Ethereal pop artist, flowing silver hair', projects: ['Midnight Dreams', 'Neon Pulse', 'Electric Dawn'], color: 'from-purple-600 to-violet-700', ring: 'ring-purple-500/50', badge: 'bg-purple-900/60 text-purple-300' },
  { id: 2, name: 'Kael', role: 'Supporting', usage: 2, style: 'Dark rock vocalist, intense gaze', projects: ['Solar Flare', 'Crimson Sky'], color: 'from-cyan-600 to-blue-700', ring: 'ring-cyan-500/50', badge: 'bg-zinc-800 text-zinc-300' },
  { id: 3, name: 'Luna', role: 'Main', usage: 4, style: 'Dreamy indie singer, pastel aesthetic', projects: ['Ocean Drift', 'Neon Pulse', 'Midnight Dreams', 'Electric Dawn'], color: 'from-pink-600 to-rose-700', ring: 'ring-pink-500/50', badge: 'bg-purple-900/60 text-purple-300' },
  { id: 4, name: 'Marcus', role: 'Supporting', usage: 1, style: 'Jazz musician, retro vibes', projects: ['Ocean Drift'], color: 'from-amber-600 to-orange-700', ring: 'ring-amber-500/50', badge: 'bg-zinc-800 text-zinc-300' },
  { id: 5, name: 'Zara', role: 'Main', usage: 2, style: 'Electronic DJ, futuristic style', projects: ['Solar Flare', 'Electric Dawn'], color: 'from-emerald-600 to-teal-700', ring: 'ring-emerald-500/50', badge: 'bg-purple-900/60 text-purple-300' },
]

export function CharacterLibrarySection() {
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  return (
    <ShowcaseSection
      id="character-library"
      title="Character Library"
      description="Create and manage recurring characters for your music videos"
      icon={<Users className="h-4 w-4 text-primary" />}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {characters.map((char, i) => (
          <motion.div
            key={char.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.28 }}
            onHoverStart={() => setHoveredId(char.id)}
            onHoverEnd={() => setHoveredId(null)}
            className="relative group cursor-pointer rounded-lg border border-border bg-card hover:border-primary/50 transition-colors p-3"
          >
            {/* Avatar */}
            <div className="flex items-center gap-3 mb-2">
              <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ring-2', char.color, char.ring)}>
                <span className="text-sm font-bold text-white">{char.name[0]}</span>
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-foreground">{char.name}</p>
                <span className={cn('inline-block rounded px-1.5 py-0.5 text-[9px] font-medium', char.badge)}>
                  {char.role}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">Used in {char.usage} project{char.usage !== 1 ? 's' : ''}</p>

            {/* Hover overlay */}
            <AnimatePresence>
              {hoveredId === char.id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="absolute inset-0 rounded-lg bg-card/95 p-3 flex flex-col justify-between"
                >
                  <div>
                    <p className="text-[10px] font-semibold text-foreground mb-1">{char.name}</p>
                    <p className="text-[9px] text-muted-foreground leading-relaxed">{char.style}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {char.projects.slice(0, 2).map((p) => (
                        <span key={p} className="rounded bg-muted px-1.5 py-0.5 text-[8px] text-muted-foreground">{p}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    <button className="flex items-center gap-1 rounded bg-muted px-2 py-1 text-[10px] text-foreground hover:bg-muted/80">
                      <Pencil className="h-2.5 w-2.5" /> Edit
                    </button>
                    <button className="flex items-center gap-1 rounded bg-red-900/40 px-2 py-1 text-[10px] text-red-400 hover:bg-red-900/60">
                      <Trash2 className="h-2.5 w-2.5" /> Delete
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        {/* Create card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.28 }}
          className="cursor-pointer rounded-lg border border-dashed border-border hover:border-primary/60 transition-colors flex flex-col items-center justify-center gap-2 p-6 text-muted-foreground hover:text-primary min-h-[110px]"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-current">
            <Plus className="h-3.5 w-3.5" />
          </div>
          <span className="text-[10px] font-medium">Create Character</span>
        </motion.div>
      </div>
    </ShowcaseSection>
  )
}

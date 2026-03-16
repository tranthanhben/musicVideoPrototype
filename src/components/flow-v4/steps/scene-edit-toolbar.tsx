'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  RefreshCw, Scissors, SplitSquareHorizontal, Trash2, Gauge,
  Sparkles, ArrowLeftRight, SlidersHorizontal, Type, Captions,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { VFX_PRESETS, TRANSITION_TYPES } from '@/lib/flow-v4/mock-data'

// ─── Types ──────────────────────────────────────────────────

interface SceneEditToolbarProps {
  activeSceneIndex: number
  activeTool: string | null
  onToolClick: (toolId: string) => void
  selectedVfx: string
  selectedTransition: string
  selectedFilter: string
  onVfxChange: (id: string) => void
  onTransitionChange: (id: string) => void
  onFilterChange: (id: string) => void
}

const FILTER_PRESETS = [
  { id: 'normal', label: 'Normal', color: '#71717A' },
  { id: 'warm', label: 'Warm', color: '#F59E0B' },
  { id: 'cool', label: 'Cool', color: '#06B6D4' },
  { id: 'vivid', label: 'Vivid', color: '#EC4899' },
  { id: 'muted', label: 'Muted', color: '#78716C' },
  { id: 'bw', label: 'B&W', color: '#A1A1AA' },
  { id: 'teal-orange', label: 'Teal/Orange', color: '#0D9488' },
  { id: 'cinematic', label: 'Cinematic', color: '#7C3AED' },
]

const TOOLS = [
  { id: 'regen', label: 'Regen', icon: RefreshCw },
  { id: 'trim', label: 'Trim', icon: Scissors },
  { id: 'split', label: 'Split', icon: SplitSquareHorizontal },
  { id: 'delete', label: 'Delete', icon: Trash2 },
  { id: 'speed', label: 'Speed', icon: Gauge },
  { id: 'effect', label: 'Effect', icon: Sparkles },
  { id: 'transition', label: 'Trans', icon: ArrowLeftRight },
  { id: 'filters', label: 'Filters', icon: SlidersHorizontal },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'captions', label: 'Captions', icon: Captions },
] as const

// ─── Component ──────────────────────────────────────────────

export function SceneEditToolbar({
  activeSceneIndex,
  activeTool,
  onToolClick,
  selectedVfx,
  selectedTransition,
  selectedFilter,
  onVfxChange,
  onTransitionChange,
  onFilterChange,
}: SceneEditToolbarProps) {
  return (
    <div className="shrink-0 border-t border-border/50 bg-card/30">
      {/* Toolbar row */}
      <div className="flex items-center gap-0.5 px-3 py-2.5 overflow-x-auto scrollbar-none">
        {/* Scene label */}
        <span className="text-[11px] font-mono font-semibold text-primary shrink-0 mr-3 bg-primary/10 rounded-md px-2 py-1">
          S{activeSceneIndex + 1}
        </span>

        {/* Tool buttons */}
        {TOOLS.map((tool) => {
          const Icon = tool.icon
          const isActive = activeTool === tool.id
          return (
            <button
              key={tool.id}
              onClick={() => onToolClick(tool.id)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all cursor-pointer min-w-[56px] shrink-0',
                isActive
                  ? 'bg-primary/15 text-primary border border-primary/25'
                  : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground border border-transparent',
                tool.id === 'delete' && isActive && 'bg-red-500/15 text-red-400 border-red-500/25',
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[9px] font-medium leading-none">{tool.label}</span>
            </button>
          )
        })}
      </div>

      {/* Expandable sub-panel */}
      <AnimatePresence>
        {activeTool === 'effect' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/30"
          >
            <div className="px-3 py-2">
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">VFX Preset</p>
              <div className="flex flex-wrap gap-1.5">
                {VFX_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => onVfxChange(preset.id)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition-all cursor-pointer border',
                      selectedVfx === preset.id
                        ? 'border-primary/40 bg-primary/10 text-primary'
                        : 'border-border/50 bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground',
                    )}
                  >
                    <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: preset.accentColor }} />
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTool === 'transition' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/30"
          >
            <div className="px-3 py-2">
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Transition</p>
              <div className="flex flex-wrap gap-1.5">
                {TRANSITION_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onTransitionChange(t.id)}
                    className={cn(
                      'rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition-all cursor-pointer border',
                      selectedTransition === t.id
                        ? 'border-primary/40 bg-primary/10 text-primary'
                        : 'border-border/50 bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground',
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTool === 'filters' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/30"
          >
            <div className="px-3 py-2">
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Color Filter</p>
              <div className="flex flex-wrap gap-1.5">
                {FILTER_PRESETS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => onFilterChange(f.id)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition-all cursor-pointer border',
                      selectedFilter === f.id
                        ? 'border-primary/40 bg-primary/10 text-primary'
                        : 'border-border/50 bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground',
                    )}
                  >
                    <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: f.color }} />
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

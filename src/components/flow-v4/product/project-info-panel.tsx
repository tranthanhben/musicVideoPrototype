'use client'

import { useState } from 'react'
import { X, Film, Clock, Music, Layers, Clapperboard, Calendar, Pencil, CheckCircle2, Circle, ZapOff } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { MvType, RenderMode } from '@/lib/flow-v4/types'

export type ProjectStatus = 'draft' | 'in_progress' | 'ready'

export interface ProjectMeta {
  name: string
  mvType: MvType | null
  renderMode: RenderMode
  duration: string
  bpm: number
  sceneCount: number
  estimatedRenderTime: string
  createdAt: string
  lastModified: string
  quality: string
  aspectRatio: string
  status: ProjectStatus
}

interface ProjectInfoPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  meta: ProjectMeta
  onNameChange: (name: string) => void
  onSettingsClick?: () => void
}

const MV_TYPE_LABELS: Record<MvType, string> = {
  dance: 'Dance',
  performance: 'Performance',
  lyrics: 'Lyrics Video',
  full_mv: 'Full Music Video',
  visualizer: 'Visualizer',
}

const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: 'Draft', color: 'text-muted-foreground', icon: <Circle className="h-3 w-3" /> },
  in_progress: { label: 'In Progress', color: 'text-amber-400', icon: <ZapOff className="h-3 w-3" /> },
  ready: { label: 'Ready to Export', color: 'text-emerald-400', icon: <CheckCircle2 className="h-3 w-3" /> },
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
      <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <span className="text-muted-foreground/50">{icon}</span>
        {label}
      </span>
      <span className="text-[11px] font-medium text-foreground">{value}</span>
    </div>
  )
}

export function ProjectInfoPanel({
  open,
  onOpenChange,
  meta,
  onNameChange,
  onSettingsClick,
}: ProjectInfoPanelProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(meta.name)

  function commitEdit() {
    const trimmed = draft.trim()
    if (trimmed) onNameChange(trimmed)
    setEditing(false)
  }

  const status = STATUS_CONFIG[meta.status]

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => onOpenChange(false)}
          />

          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-72 flex-col border-l border-border bg-card"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <Film className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Project Info</span>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {/* Project name + status */}
              <div className="rounded-xl border border-border bg-muted/20 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  {editing ? (
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onBlur={commitEdit}
                      onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(false) }}
                      className="text-sm font-semibold text-foreground bg-primary/10 border border-primary/30 rounded px-2 py-0.5 focus:outline-none flex-1 mr-2"
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-sm font-semibold text-foreground truncate">{meta.name}</span>
                      <button
                        onClick={() => { setDraft(meta.name); setEditing(true) }}
                        className="text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-pointer shrink-0"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Status badge */}
                <div className={cn('flex items-center gap-1.5 text-[11px] font-medium', status.color)}>
                  {status.icon}
                  {status.label}
                </div>
              </div>

              {/* Specs */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Specs</p>
                <div className="rounded-lg border border-border bg-muted/10 px-3 py-1">
                  <InfoRow icon={<Clapperboard className="h-3 w-3" />} label="Type" value={meta.mvType ? MV_TYPE_LABELS[meta.mvType] : '—'} />
                  <InfoRow icon={<Film className="h-3 w-3" />} label="Style" value={meta.renderMode.charAt(0).toUpperCase() + meta.renderMode.slice(1)} />
                  <InfoRow icon={<Clock className="h-3 w-3" />} label="Duration" value={meta.duration} />
                  <InfoRow icon={<Music className="h-3 w-3" />} label="BPM" value={`${meta.bpm}`} />
                  <InfoRow icon={<Layers className="h-3 w-3" />} label="Scenes" value={`${meta.sceneCount}`} />
                </div>
              </div>

              {/* Export settings */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Export</p>
                <div className="rounded-lg border border-border bg-muted/10 px-3 py-1">
                  <InfoRow icon={<Film className="h-3 w-3" />} label="Quality" value={meta.quality} />
                  <InfoRow icon={<Layers className="h-3 w-3" />} label="Aspect Ratio" value={meta.aspectRatio} />
                  <InfoRow icon={<Clock className="h-3 w-3" />} label="Est. Render" value={meta.estimatedRenderTime} />
                </div>
              </div>

              {/* Dates */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Timeline</p>
                <div className="rounded-lg border border-border bg-muted/10 px-3 py-1">
                  <InfoRow icon={<Calendar className="h-3 w-3" />} label="Created" value={meta.createdAt} />
                  <InfoRow icon={<Calendar className="h-3 w-3" />} label="Modified" value={meta.lastModified} />
                </div>
              </div>
            </div>

            {/* Footer */}
            {onSettingsClick && (
              <div className="border-t border-border p-3">
                <button
                  onClick={() => { onOpenChange(false); onSettingsClick() }}
                  className="w-full rounded-lg border border-border bg-muted/30 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  Open Project Settings
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

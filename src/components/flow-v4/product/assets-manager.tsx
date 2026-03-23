'use client'

import { useState } from 'react'
import { X, Upload, Download, Trash2, RefreshCw, Film, Music, Image, Package } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { MockScene } from '@/lib/mock/types'

type Tab = 'scenes' | 'media' | 'clips' | 'exports'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'scenes', label: 'Scenes', icon: <Film className="h-3 w-3" /> },
  { id: 'media', label: 'Media', icon: <Image className="h-3 w-3" /> },
  { id: 'clips', label: 'Clips', icon: <Film className="h-3 w-3" /> },
  { id: 'exports', label: 'Exports', icon: <Package className="h-3 w-3" /> },
]

type AssetStatus = 'pending' | 'generating' | 'completed' | 'failed'

const STATUS_FILTER_OPTIONS: { value: AssetStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'completed', label: 'Done' },
  { value: 'generating', label: 'Generating' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
]

function StatusDot({ status }: { status: string }) {
  const classes: Record<string, string> = {
    completed: 'bg-green-400',
    generating: 'bg-amber-400 animate-pulse',
    failed: 'bg-red-400',
    pending: 'bg-zinc-600',
  }
  return <span className={cn('absolute top-1.5 right-1.5 h-2 w-2 rounded-full', classes[status] ?? 'bg-zinc-600')} />
}

interface AssetsManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  scenes: MockScene[]
  sceneStatuses?: Record<string, string>
}

const MOCK_CLIPS = [
  { id: 'c1', label: 'Scene 1 — Take 1', status: 'completed', duration: '4s' },
  { id: 'c2', label: 'Scene 3 — Take 2', status: 'completed', duration: '4s' },
  { id: 'c3', label: 'Scene 5 — Generating', status: 'generating', duration: '4s' },
]

const MOCK_EXPORTS = [
  { id: 'e1', label: 'Draft Export v1', status: 'completed', size: '142 MB', format: 'MP4' },
  { id: 'e2', label: 'Full HD Export', status: 'pending', size: '—', format: 'MP4' },
]

const MOCK_MEDIA = [
  { id: 'm1', label: 'main-track.wav', type: 'audio', icon: <Music className="h-4 w-4 text-primary" />, meta: '3:24 · 128 BPM' },
  { id: 'm2', label: 'reference-01.jpg', type: 'image', icon: <Image className="h-4 w-4 text-muted-foreground" />, meta: '1920×1080' },
  { id: 'm3', label: 'reference-02.jpg', type: 'image', icon: <Image className="h-4 w-4 text-muted-foreground" />, meta: '1920×1080' },
]

export function AssetsManager({ open, onOpenChange, scenes, sceneStatuses }: AssetsManagerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('scenes')
  const [statusFilter, setStatusFilter] = useState<AssetStatus | 'all'>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function clearSelection() { setSelected(new Set()) }

  const filteredScenes = statusFilter === 'all'
    ? scenes
    : scenes.filter((s) => (sceneStatuses?.[s.id] ?? s.status) === statusFilter)

  const totalCount = scenes.length + MOCK_MEDIA.length + MOCK_CLIPS.length + MOCK_EXPORTS.length

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-96 flex-col border-l border-border bg-card"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">Assets Manager</span>
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{totalCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
                  title="Upload media"
                >
                  <Upload className="h-3 w-3" /> Upload
                </button>
                <button
                  onClick={() => onOpenChange(false)}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border px-3 pt-2 pb-0 gap-0.5 shrink-0">
              {TABS.map((tab) => (
                <button key={tab.id} onClick={() => { setActiveTab(tab.id); clearSelection() }}
                  className={cn(
                    'flex items-center gap-1 px-2.5 pb-2 pt-1 text-[11px] font-medium transition-colors cursor-pointer border-b-2',
                    activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Batch action bar */}
            {selected.size > 0 && (
              <div className="flex items-center justify-between bg-primary/10 border-b border-primary/20 px-3 py-1.5 shrink-0">
                <span className="text-[11px] font-medium text-primary">{selected.size} selected</span>
                <div className="flex items-center gap-1">
                  <button className="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer">
                    <Download className="h-3 w-3" /> Download
                  </button>
                  <button className="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer">
                    <RefreshCw className="h-3 w-3" /> Regen
                  </button>
                  <button className="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer">
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                  <button onClick={clearSelection} className="ml-1 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Filter row (scenes only) */}
            {activeTab === 'scenes' && (
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border shrink-0 overflow-x-auto">
                {STATUS_FILTER_OPTIONS.map((f) => (
                  <button key={f.value} onClick={() => setStatusFilter(f.value)}
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-colors cursor-pointer whitespace-nowrap',
                      statusFilter === f.value ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-muted/30 text-muted-foreground hover:bg-muted/50',
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3">
              {activeTab === 'scenes' && (
                <div className="grid grid-cols-2 gap-2">
                  {filteredScenes.map((scene) => {
                    const status = sceneStatuses?.[scene.id] ?? scene.status
                    const isSelected = selected.has(scene.id)
                    return (
                      <div key={scene.id}
                        onClick={() => toggleSelect(scene.id)}
                        className={cn('cursor-pointer group rounded-md overflow-hidden', isSelected && 'ring-2 ring-primary')}
                      >
                        <div className="relative aspect-video bg-zinc-800">
                          {scene.thumbnailUrl ? (
                            <img src={scene.thumbnailUrl} alt={`scene ${scene.index + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900" />
                          )}
                          <span className="absolute top-1.5 left-1.5 rounded bg-black/70 px-1 py-0.5 text-[10px] font-bold text-white">
                            S{scene.index + 1}
                          </span>
                          <StatusDot status={status} />
                          {isSelected && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                              <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                <span className="text-[8px] text-primary-foreground font-bold">✓</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <p className="mt-1 text-[10px] text-muted-foreground truncate px-0.5">{scene.subject || `Scene ${scene.index + 1}`}</p>
                      </div>
                    )
                  })}
                  {filteredScenes.length === 0 && (
                    <div className="col-span-2 text-center py-8 text-[11px] text-muted-foreground/60">No scenes match this filter</div>
                  )}
                </div>
              )}

              {activeTab === 'media' && (
                <div className="space-y-2">
                  {MOCK_MEDIA.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-2.5 hover:bg-muted/40 transition-colors cursor-pointer">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted shrink-0">
                        {item.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-foreground truncate">{item.label}</p>
                        <p className="text-[10px] text-muted-foreground">{item.meta}</p>
                      </div>
                      <button className="text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-pointer shrink-0">
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  <button className="w-full rounded-lg border border-dashed border-border py-3 text-[11px] text-muted-foreground hover:text-foreground hover:border-muted-foreground/40 transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                    <Upload className="h-3.5 w-3.5" /> Upload Media
                  </button>
                </div>
              )}

              {activeTab === 'clips' && (
                <div className="space-y-2">
                  {MOCK_CLIPS.map((clip) => (
                    <div key={clip.id} className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-2.5">
                      <div className="relative aspect-video w-16 shrink-0 rounded-md overflow-hidden bg-zinc-800">
                        <div className="w-full h-full bg-gradient-to-br from-violet-900 to-zinc-900" />
                        <StatusDot status={clip.status} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-foreground truncate">{clip.label}</p>
                        <p className="text-[10px] text-muted-foreground">{clip.duration}</p>
                      </div>
                      {clip.status === 'completed' && (
                        <button className="text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-pointer shrink-0">
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'exports' && (
                <div className="space-y-2">
                  {MOCK_EXPORTS.map((exp) => (
                    <div key={exp.id} className="rounded-lg border border-border bg-muted/20 p-3">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-[11px] font-medium text-foreground">{exp.label}</p>
                        <span className="rounded-full bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-[9px] font-medium text-primary">{exp.format}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <StatusDot status={exp.status} />
                          <span className="text-[10px] text-muted-foreground ml-3">{exp.size}</span>
                        </div>
                        {exp.status === 'completed' && (
                          <button className="flex items-center gap-1 text-[10px] font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer">
                            <Download className="h-3 w-3" /> Download
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

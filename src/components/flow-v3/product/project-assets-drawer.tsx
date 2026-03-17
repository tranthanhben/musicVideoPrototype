'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { MockScene } from '@/lib/mock/types'

type Tab = 'all' | 'scenes' | 'audio' | 'characters'

const TABS: { id: Tab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'scenes', label: 'Scenes' },
  { id: 'audio', label: 'Audio' },
  { id: 'characters', label: 'Characters' },
]

const MOCK_CHARACTERS = [
  { name: 'Zara', color: 'from-violet-500 to-purple-600' },
  { name: 'Kai', color: 'from-blue-500 to-cyan-600' },
  { name: 'Neon', color: 'from-pink-500 to-rose-600' },
  { name: 'Echo', color: 'from-emerald-500 to-teal-600' },
]

interface ProjectAssetsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  scenes: MockScene[]
  sceneStatuses?: Record<string, string>
}

function StatusDot({ status }: { status: string }) {
  if (status === 'completed') {
    return <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-green-400" />
  }
  if (status === 'generating') {
    return <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
  }
  return <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-zinc-600" />
}

function SceneGrid({ scenes, sceneStatuses }: { scenes: MockScene[]; sceneStatuses?: Record<string, string> }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {scenes.map((scene) => {
        const status = sceneStatuses?.[scene.id] ?? scene.status
        return (
          <div key={scene.id} className="cursor-pointer group">
            <div className="relative aspect-video rounded-md overflow-hidden bg-zinc-800">
              {scene.thumbnailUrl ? (
                <img src={scene.thumbnailUrl} alt={`scene ${scene.index + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900" />
              )}
              <span className="absolute top-1.5 left-1.5 rounded bg-black/70 px-1 py-0.5 text-[10px] font-bold text-white">
                S{scene.index + 1}
              </span>
              <StatusDot status={status} />
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground truncate">{scene.subject || `Scene ${scene.index + 1}`}</p>
          </div>
        )
      })}
    </div>
  )
}

function AudioCard() {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3 cursor-pointer hover:bg-muted/40 transition-colors">
      <div className="h-8 rounded-md mb-2 overflow-hidden" style={{ background: 'linear-gradient(90deg, #7c3aed 0%, #a855f7 30%, #ec4899 60%, #7c3aed 100%)' }}>
        <div className="w-full h-full opacity-60 flex items-center justify-around px-1">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="w-0.5 bg-white/80 rounded-full" style={{ height: `${30 + Math.sin(i * 0.8) * 50}%` }} />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-foreground">Main Track</p>
          <p className="text-[10px] text-muted-foreground">3:24 · 128 BPM</p>
        </div>
        <span className="rounded-full bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-[10px] text-primary font-medium">WAV</span>
      </div>
    </div>
  )
}

function CharactersGrid() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {MOCK_CHARACTERS.map((char) => (
        <div key={char.name} className="flex flex-col items-center gap-1.5 cursor-pointer group">
          <div className={cn('h-14 w-14 rounded-full bg-gradient-to-br flex items-center justify-center text-lg font-bold text-white group-hover:scale-105 transition-transform duration-200', char.color)}>
            {char.name[0]}
          </div>
          <p className="text-[10px] text-muted-foreground">{char.name}</p>
        </div>
      ))}
    </div>
  )
}

export function ProjectAssetsDrawer({
  open,
  onOpenChange,
  scenes,
  sceneStatuses,
}: ProjectAssetsDrawerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const totalAssets = scenes.length + 1 + MOCK_CHARACTERS.length

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => onOpenChange(false)}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-80 flex-col border-l border-border bg-card"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">Project Assets</span>
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {totalAssets}
                </span>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-0.5 border-b border-border px-3 pt-2 pb-0">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'px-2.5 pb-2 pt-1 text-[11px] font-medium transition-colors cursor-pointer border-b-2',
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {(activeTab === 'all' || activeTab === 'scenes') && scenes.length > 0 && (
                <div>
                  {activeTab === 'all' && (
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Scenes</p>
                  )}
                  <SceneGrid scenes={scenes} sceneStatuses={sceneStatuses} />
                </div>
              )}

              {(activeTab === 'all' || activeTab === 'audio') && (
                <div>
                  {activeTab === 'all' && (
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Audio</p>
                  )}
                  <AudioCard />
                </div>
              )}

              {(activeTab === 'all' || activeTab === 'characters') && (
                <div>
                  {activeTab === 'all' && (
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Characters</p>
                  )}
                  <CharactersGrid />
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

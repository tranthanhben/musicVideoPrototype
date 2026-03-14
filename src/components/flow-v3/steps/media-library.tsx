'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Film, Music, Type, Sparkles, Loader2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MockScene, MockAudio } from '@/lib/mock/types'

// ─── Types ──────────────────────────────────────────────────

interface MediaLibraryProps {
  scenes: MockScene[]
  audio: MockAudio
  activeSceneId: string
  onSceneClick: (sceneId: string) => void
  sceneStatuses?: Record<string, 'pending' | 'rendering' | 'done'>
}

type TabId = 'media' | 'audio' | 'text' | 'effects'

const TABS: { id: TabId; icon: typeof Film; label: string }[] = [
  { id: 'media', icon: Film, label: 'Media' },
  { id: 'audio', icon: Music, label: 'Audio' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'effects', icon: Sparkles, label: 'Effects' },
]

// Mock text presets
const TEXT_PRESETS = [
  { id: 'title-bold', label: 'Bold Title', preview: 'Aa', style: 'font-bold text-lg' },
  { id: 'subtitle', label: 'Subtitle', preview: 'Aa', style: 'font-medium text-sm' },
  { id: 'lower-third', label: 'Lower Third', preview: 'Aa', style: 'font-mono text-xs' },
  { id: 'lyric-pop', label: 'Lyric Pop', preview: 'Aa', style: 'italic font-light text-base' },
]

// Mock effect presets
const EFFECT_PRESETS = [
  { id: 'lens-flare', label: 'Lens Flare', color: '#F59E0B' },
  { id: 'particle-rain', label: 'Particles', color: '#7C3AED' },
  { id: 'glitch', label: 'Glitch', color: '#EF4444' },
  { id: 'film-grain', label: 'Film Grain', color: '#78716C' },
  { id: 'light-leak', label: 'Light Leak', color: '#EC4899' },
  { id: 'blur-motion', label: 'Motion Blur', color: '#06B6D4' },
]

// ─── Component ──────────────────────────────────────────────

export function MediaLibrary({ scenes, audio, activeSceneId, onSceneClick, sceneStatuses }: MediaLibraryProps) {
  const [activeTab, setActiveTab] = useState<TabId>('media')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredScenes = searchQuery
    ? scenes.filter(
        (s) =>
          s.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.action.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : scenes

  return (
    <div className="flex h-full flex-col bg-zinc-950 border-r border-white/8 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/8 shrink-0">
        <div>
          <h3 className="text-xs font-semibold text-zinc-200">Media Library</h3>
          <p className="text-[9px] text-zinc-500">Uploads & Assets</p>
        </div>
        <button className="flex items-center gap-1 rounded-md bg-white/5 border border-white/10 px-2 py-1 text-[10px] text-zinc-300 hover:bg-white/10 transition-colors cursor-pointer">
          <Plus className="h-3 w-3" />
          Add
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-white/5 shrink-0">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-600" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets..."
            className="w-full rounded-md bg-zinc-900 border border-white/5 pl-7 pr-2 py-1.5 text-[10px] text-zinc-300 placeholder:text-zinc-600 outline-none focus:border-white/15 transition-colors"
          />
        </div>
      </div>

      {/* Content based on tab */}
      <div className="flex-1 overflow-y-auto px-2 py-2 scrollbar-none">
        {activeTab === 'media' && (
          <div className="grid grid-cols-2 gap-1.5">
            {filteredScenes.map((scene) => (
              <button
                key={scene.id}
                onClick={() => onSceneClick(scene.id)}
                className={cn(
                  'relative aspect-video rounded-lg overflow-hidden cursor-pointer transition-all group',
                  scene.id === activeSceneId
                    ? 'ring-2 ring-primary'
                    : 'ring-1 ring-white/5 hover:ring-white/15',
                )}
              >
                <img
                  src={scene.thumbnailUrl}
                  alt={`Scene ${scene.index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Generation status overlays */}
                {sceneStatuses && sceneStatuses[scene.id] === 'rendering' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                      <Loader2 className="h-4 w-4 text-blue-400" />
                    </motion.div>
                  </div>
                )}
                {sceneStatuses && sceneStatuses[scene.id] === 'pending' && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-[7px] font-mono text-white/40">Queued</span>
                  </div>
                )}
                {sceneStatuses && sceneStatuses[scene.id] === 'done' && (
                  <div className="absolute top-0.5 right-0.5">
                    <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-green-500/90">
                      <Check className="h-2 w-2 text-white" />
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 px-1.5 py-1">
                  <span className="text-[8px] font-mono text-white/70">S{scene.index + 1}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'audio' && (
          <div className="space-y-2">
            {/* Main track */}
            <div className="rounded-lg border border-white/8 bg-white/3 p-2.5">
              <div className="flex items-center gap-2 mb-1.5">
                <Music className="h-3 w-3 text-emerald-400" />
                <span className="text-[10px] font-medium text-zinc-300">{audio.title}</span>
              </div>
              <p className="text-[9px] text-zinc-500">{audio.artist}</p>
              <div className="flex items-center gap-2 mt-1.5 text-[9px] text-zinc-500 font-mono">
                <span>{Math.floor(audio.duration / 60)}:{String(Math.floor(audio.duration % 60)).padStart(2, '0')}</span>
                <span>•</span>
                <span>{audio.bpm} BPM</span>
                <span>•</span>
                <span>{audio.key}</span>
              </div>
            </div>
            {/* Segments */}
            <div className="space-y-1">
              <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider px-1">Segments</p>
              {audio.segments.map((seg) => (
                <div key={seg.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-white/3 transition-colors">
                  <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                  <span className="text-[10px] text-zinc-300 flex-1">{seg.label}</span>
                  <span className="text-[9px] font-mono text-zinc-600">
                    {formatTime(seg.startTime)}–{formatTime(seg.endTime)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'text' && (
          <div className="grid grid-cols-2 gap-1.5">
            {TEXT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                className="flex flex-col items-center justify-center rounded-lg border border-white/8 bg-white/3 p-3 hover:bg-white/5 hover:border-white/15 transition-all cursor-pointer aspect-video"
              >
                <span className={cn('text-zinc-300 mb-1', preset.style)}>{preset.preview}</span>
                <span className="text-[8px] text-zinc-500">{preset.label}</span>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'effects' && (
          <div className="grid grid-cols-2 gap-1.5">
            {EFFECT_PRESETS.map((fx) => (
              <button
                key={fx.id}
                className="flex flex-col items-center justify-center rounded-lg border border-white/8 bg-white/3 p-3 hover:bg-white/5 hover:border-white/15 transition-all cursor-pointer aspect-video"
              >
                <div className="h-5 w-5 rounded-full mb-1.5 opacity-70" style={{ backgroundColor: fx.color, boxShadow: `0 0 12px ${fx.color}44` }} />
                <span className="text-[8px] text-zinc-400">{fx.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom toolbar tabs */}
      <div className="flex items-center border-t border-white/8 shrink-0">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors cursor-pointer',
                activeTab === tab.id
                  ? 'text-zinc-200 bg-white/5'
                  : 'text-zinc-600 hover:text-zinc-400',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="text-[8px]">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

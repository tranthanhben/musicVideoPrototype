'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Music2, ImageIcon, Users, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockProjects } from '@/lib/mock/projects'
import { CHARACTER_ARCHETYPES } from '@/lib/mock/characters'
import type { MockScene } from '@/lib/mock/types'
import type { BayTab } from './bay-top-bar'

// Progressive reveal: which sections are visible at each tab stage
const TAB_SECTIONS: Record<BayTab, Set<string>> = {
  input:      new Set(['audio']),
  creative:   new Set(['audio', 'characters', 'mood']),
  storyboard: new Set(['audio', 'characters', 'scenes', 'mood']),
  generate:   new Set(['audio', 'characters', 'scenes', 'mood']),
  edit:       new Set(['audio', 'characters', 'scenes', 'mood']),
}

interface AssetBrowserProps {
  activeTab: BayTab
  selectedSceneId: string | null
  onSceneSelect: (id: string) => void
  onAction?: (action: string) => void
}

function Section({ label, icon, defaultOpen = true, children }: {
  label: string; icon: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-border/50">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 w-full px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        {icon}
        <span className="uppercase tracking-wide">{label}</span>
      </button>
      {open && <div className="pb-2">{children}</div>}
    </div>
  )
}

const MOOD_BOARD = [
  { label: 'Warm Golden', url: '/assets/mood-board/color-warm-golden.jpg' },
  { label: 'Cool Cosmic', url: '/assets/mood-board/color-cool-cosmic.jpg' },
  { label: 'Ocean Blues', url: '/assets/mood-board/color-ocean-blues.jpg' },
  { label: 'Melancholic', url: '/assets/mood-board/mood-melancholic.jpg' },
  { label: 'Euphoric', url: '/assets/mood-board/mood-euphoric.jpg' },
  { label: 'Cinematic', url: '/assets/mood-board/mood-cinematic.jpg' },
]

const project = mockProjects[0]

export function AssetBrowser({ activeTab, selectedSceneId, onSceneSelect, onAction }: AssetBrowserProps) {
  const visible = TAB_SECTIONS[activeTab]
  function formatDuration(s: number) {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  }

  const SEGMENT_COLORS: Record<string, string> = {}
  project.audio.segments.forEach((seg) => { SEGMENT_COLORS[seg.id] = seg.color })

  // Map scene to segment by approximate time position
  const totalDuration = project.audio.duration
  function getSegmentColorForScene(scene: MockScene) {
    const sceneTime = project.scenes.slice(0, scene.index).reduce((s, sc) => s + sc.duration, 0)
    const seg = project.audio.segments.find(
      (sg) => sceneTime >= sg.startTime && sceneTime < sg.endTime
    )
    return seg?.color ?? '#7C3AED'
  }

  return (
    <div className="w-56 shrink-0 flex flex-col border-r border-border bg-background overflow-y-auto">
      <div className="px-3 py-2.5 border-b border-border">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Assets</span>
      </div>

      {/* Characters — visible from creative stage */}
      {visible.has('characters') && (
        <Section label="Characters" icon={<Users className="h-3 w-3" />}>
          <div className="px-3 flex flex-wrap gap-1.5">
            {CHARACTER_ARCHETYPES.slice(0, 6).map((char) => (
              <div
                key={char.id}
                title={char.name}
                className="h-9 w-9 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all cursor-pointer"
                style={{ borderColor: char.accentColor + '44' }}
              >
                <img src={char.avatarUrl} alt={char.name} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Audio — always visible */}
      <Section label="Audio" icon={<Music2 className="h-3 w-3" />}>
        <div className="mx-3 mb-1 p-2 rounded-lg bg-muted/60 text-xs space-y-0.5">
          <p className="font-medium text-foreground truncate">{project.audio.title}</p>
          <p className="text-muted-foreground truncate">{project.audio.artist}</p>
          <div className="flex gap-2 text-muted-foreground mt-1">
            <span>{project.audio.bpm} BPM</span>
            <span>·</span>
            <span>{formatDuration(project.audio.duration)}</span>
          </div>
          {/* Segment color strip */}
          <div className="flex h-1 rounded-full overflow-hidden mt-1.5">
            {project.audio.segments.map((seg) => (
              <div
                key={seg.id}
                className="h-full"
                title={seg.label}
                style={{
                  width: `${((seg.endTime - seg.startTime) / totalDuration) * 100}%`,
                  background: seg.color,
                }}
              />
            ))}
          </div>
        </div>
      </Section>

      {/* Scenes — visible from storyboard stage */}
      {visible.has('scenes') && (
        <Section label="Scenes" icon={<ImageIcon className="h-3 w-3" />}>
          <div className="space-y-0.5 px-2">
            {project.scenes.map((scene: MockScene) => (
              <button
                key={scene.id}
                onClick={() => onSceneSelect(scene.id)}
                className={cn(
                  'flex items-center gap-2 w-full px-1.5 py-1.5 rounded-md text-left transition-all',
                  selectedSceneId === scene.id
                    ? 'bg-primary/15 text-foreground ring-1 ring-primary/40'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                <div className="h-8 w-[52px] shrink-0 rounded overflow-hidden relative">
                  <img src={scene.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                  <span className="absolute top-0.5 left-0.5 text-[8px] font-bold text-white bg-black/60 rounded px-0.5 leading-tight">
                    {scene.index + 1}
                  </span>
                  <span
                    className="absolute bottom-0.5 right-0.5 h-1.5 w-1.5 rounded-full"
                    style={{ background: getSegmentColorForScene(scene) }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium leading-none">Scene {scene.index + 1}</p>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">{scene.subject}</p>
                </div>
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* Mood Board — visible from creative stage */}
      {visible.has('mood') && (
        <Section label="Mood Board" icon={<Palette className="h-3 w-3" />} defaultOpen={false}>
          <div className="px-3 grid grid-cols-3 gap-1">
            {MOOD_BOARD.map((item) => (
              <div
                key={item.label}
                title={item.label}
                className="aspect-square rounded-md overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
              >
                <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}

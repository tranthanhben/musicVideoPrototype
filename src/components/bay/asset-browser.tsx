'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Music2, ImageIcon, Sparkles, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockProjects } from '@/lib/mock/projects'
import type { MockScene } from '@/lib/mock/types'

interface AssetBrowserProps {
  selectedSceneId: string | null
  onSceneSelect: (id: string) => void
}

function Section({
  label, icon, defaultOpen = true, children,
}: {
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

const project = mockProjects[0]

export function AssetBrowser({ selectedSceneId, onSceneSelect }: AssetBrowserProps) {
  function formatDuration(s: number) {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  }

  return (
    <div className="w-56 shrink-0 flex flex-col border-r border-border bg-background overflow-y-auto">
      <div className="px-3 py-2.5 border-b border-border">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Assets</span>
      </div>

      {/* Audio */}
      <Section label="Audio" icon={<Music2 className="h-3 w-3" />}>
        <div className="mx-3 mb-1 p-2 rounded-lg bg-muted/60 text-xs space-y-0.5">
          <p className="font-medium text-foreground truncate">{project.audio.title}</p>
          <p className="text-muted-foreground truncate">{project.audio.artist}</p>
          <div className="flex gap-2 text-muted-foreground mt-1">
            <span>{project.audio.bpm} BPM</span>
            <span>·</span>
            <span>{formatDuration(project.audio.duration)}</span>
          </div>
        </div>
      </Section>

      {/* Scenes */}
      <Section label="Scenes" icon={<ImageIcon className="h-3 w-3" />}>
        <div className="space-y-0.5 px-2">
          {project.scenes.map((scene: MockScene) => (
            <button
              key={scene.id}
              onClick={() => onSceneSelect(scene.id)}
              className={cn(
                'flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-left transition-colors',
                selectedSceneId === scene.id
                  ? 'bg-primary/15 text-foreground'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="h-7 w-10 shrink-0 rounded overflow-hidden">
                <img src={scene.thumbnailUrl} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium leading-none">Scene {scene.index + 1}</p>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">{scene.subject}</p>
              </div>
            </button>
          ))}
        </div>
      </Section>

      {/* Generated */}
      <Section label="Generated" icon={<Sparkles className="h-3 w-3" />} defaultOpen={false}>
        <div className="px-3 space-y-1">
          {['Final_Cut_v1.mp4', 'ColorGraded_v2.mp4', 'Export_4K.mp4'].map((name) => (
            <div key={name} className="flex items-center gap-2 py-1 text-xs text-muted-foreground">
              <div className="h-5 w-5 rounded bg-muted shrink-0" />
              <span className="truncate">{name}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Effects */}
      <Section label="Effects" icon={<Layers className="h-3 w-3" />} defaultOpen={false}>
        <div className="px-3 space-y-0.5">
          {['Fade', 'Dissolve', 'Cut', 'Wipe'].map((effect) => (
            <div
              key={effect}
              className="px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
            >
              {effect}
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DockMiniPipeline } from './dock-mini-pipeline'
import { mockProjects } from '@/lib/mock/projects'

const project = mockProjects[0]

interface SectionProps {
  title: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}

function Section({ title, open, onToggle, children }: SectionProps) {
  return (
    <div className="border-b border-border">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="uppercase tracking-wider">{title}</span>
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>
      {open && <div className="px-2 pb-3">{children}</div>}
    </div>
  )
}

export function DockSidebar() {
  const [pipelineOpen, setPipelineOpen] = useState(true)
  const [assetsOpen, setAssetsOpen] = useState(true)

  return (
    <aside className="w-[200px] shrink-0 border-r border-border bg-card overflow-y-auto">
      <Section
        title="Pipeline"
        open={pipelineOpen}
        onToggle={() => setPipelineOpen((o) => !o)}
      >
        <DockMiniPipeline />
      </Section>

      <Section
        title="Scene Assets"
        open={assetsOpen}
        onToggle={() => setAssetsOpen((o) => !o)}
      >
        <div className="flex flex-col gap-1">
          {project.scenes.map((scene) => (
            <div key={scene.id} className="flex items-center gap-2 rounded-md p-1 hover:bg-muted/50 transition-colors cursor-pointer">
              <img
                src={scene.thumbnailUrl}
                alt={`Scene ${scene.index + 1}`}
                className="h-8 w-12 rounded object-cover shrink-0"
              />
              <div className="min-w-0">
                <p className="text-[10px] font-medium text-foreground truncate">
                  S{scene.index + 1}
                </p>
                <p className="text-[9px] text-muted-foreground truncate">
                  {scene.subject}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </aside>
  )
}

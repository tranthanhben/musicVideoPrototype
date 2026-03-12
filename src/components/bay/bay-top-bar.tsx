'use client'

import Link from 'next/link'
import { ArrowLeft, Music, Paintbrush, Layers, Zap, Clapperboard, Bot, Settings, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePipelineStore } from '@/lib/pipeline/store'
import { mockProjects } from '@/lib/mock/projects'

export type BayTab = 'input' | 'creative' | 'storyboard' | 'generate' | 'edit'

interface BayTopBarProps {
  activeTab: BayTab
  onTabChange: (tab: BayTab) => void
  projectName: string
  chatOpen: boolean
  onChatToggle: () => void
}

const TABS: { id: BayTab; label: string; icon: React.ReactNode; layerIndex: number }[] = [
  { id: 'input', label: 'Input', icon: <Music className="h-3.5 w-3.5" />, layerIndex: 0 },
  { id: 'creative', label: 'Creative', icon: <Paintbrush className="h-3.5 w-3.5" />, layerIndex: 1 },
  { id: 'storyboard', label: 'Storyboard', icon: <Layers className="h-3.5 w-3.5" />, layerIndex: 2 },
  { id: 'generate', label: 'Generate', icon: <Zap className="h-3.5 w-3.5" />, layerIndex: 3 },
  { id: 'edit', label: 'Edit', icon: <Clapperboard className="h-3.5 w-3.5" />, layerIndex: 4 },
]

const LAYER_IDS = ['L1_INPUT', 'L2_CREATIVE', 'L3_PREPRODUCTION', 'L4_PRODUCTION', 'L5_POSTPRODUCTION'] as const

const project = mockProjects[0]

export function BayTopBar({ activeTab, onTabChange, projectName, chatOpen, onChatToggle }: BayTopBarProps) {
  const layers = usePipelineStore((s) => s.layers)

  function isLocked(tab: { layerIndex: number }): boolean {
    if (tab.layerIndex === 0) return false
    const prevLayerId = LAYER_IDS[tab.layerIndex - 1]
    return layers[prevLayerId]?.status !== 'complete'
  }

  // Determine which tab index is the furthest completed
  const completedCount = LAYER_IDS.filter((id) => layers[id]?.status === 'complete').length

  return (
    <div className="h-13 flex items-center border-b border-border bg-background/95 backdrop-blur px-3 gap-3 shrink-0" style={{ height: '52px' }}>
      {/* Left: back + project thumbnail + name */}
      <div className="flex items-center gap-2 min-w-0 w-44">
        <Link
          href="/"
          className="flex items-center justify-center h-7 w-7 rounded-lg hover:bg-muted transition-colors shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="h-7 w-10 rounded-md overflow-hidden shrink-0 border border-border/50">
          <img src={project.thumbnailUrl} alt="" className="w-full h-full object-cover" />
        </div>
        <span className="text-sm font-medium truncate text-foreground">{projectName}</span>
      </div>

      {/* Center: tabs */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-0.5 h-8 bg-muted/40 rounded-lg p-0.5">
          {TABS.map((tab) => {
            const locked = isLocked(tab)
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => !locked && onTabChange(tab.id)}
                disabled={locked}
                title={locked ? 'Complete previous stage first' : tab.label}
                className={cn(
                  'relative flex items-center gap-1.5 px-3 h-7 rounded-md text-xs font-medium transition-all',
                  active
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/60',
                  locked && 'opacity-40 cursor-not-allowed'
                )}
              >
                {locked ? <Lock className="h-3 w-3" /> : tab.icon}
                {tab.label}
                {/* Gradient underline for active tab */}
                {active && (
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-0.5 rounded-full"
                    style={{ background: 'linear-gradient(to right, #7C3AED, #22D3EE)' }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Right: progress + chat toggle + settings */}
      <div className="flex items-center gap-2 w-44 justify-end">
        {/* Progress dots */}
        <div className="flex items-center gap-1 mr-1">
          {LAYER_IDS.map((id, i) => {
            const status = layers[id]?.status
            return (
              <div
                key={id}
                title={`Stage ${i + 1}: ${status ?? 'pending'}`}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  status === 'complete' ? 'w-4 bg-emerald-500' :
                  status === 'active' ? 'w-4 bg-primary animate-pulse' :
                  'w-1.5 bg-muted-foreground/30'
                )}
              />
            )
          })}
        </div>

        <button
          onClick={onChatToggle}
          className={cn(
            'flex items-center gap-1.5 px-3 h-7 rounded-lg text-xs font-medium transition-colors',
            chatOpen
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          )}
        >
          <Bot className="h-3.5 w-3.5" />
          AI
        </button>

        <button className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <Settings className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

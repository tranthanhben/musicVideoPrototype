'use client'

import Link from 'next/link'
import { ArrowLeft, Lock, Music, Lightbulb, Film, Clapperboard, Scissors, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePipelineStore } from '@/lib/pipeline/store'

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
  { id: 'creative', label: 'Creative', icon: <Lightbulb className="h-3.5 w-3.5" />, layerIndex: 1 },
  { id: 'storyboard', label: 'Storyboard', icon: <Film className="h-3.5 w-3.5" />, layerIndex: 2 },
  { id: 'generate', label: 'Generate', icon: <Clapperboard className="h-3.5 w-3.5" />, layerIndex: 3 },
  { id: 'edit', label: 'Edit', icon: <Scissors className="h-3.5 w-3.5" />, layerIndex: 4 },
]

const LAYER_IDS = ['L1_INPUT', 'L2_CREATIVE', 'L3_PREPRODUCTION', 'L4_PRODUCTION', 'L5_POSTPRODUCTION'] as const

export function BayTopBar({ activeTab, onTabChange, projectName, chatOpen, onChatToggle }: BayTopBarProps) {
  const layers = usePipelineStore((s) => s.layers)

  function isLocked(tab: { layerIndex: number }): boolean {
    if (tab.layerIndex === 0) return false
    const prevLayerId = LAYER_IDS[tab.layerIndex - 1]
    return layers[prevLayerId]?.status !== 'complete'
  }

  return (
    <div className="h-12 flex items-center border-b border-border bg-background px-3 gap-3 shrink-0">
      {/* Left */}
      <div className="flex items-center gap-2 min-w-0 w-40">
        <Link
          href="/"
          className="flex items-center justify-center h-7 w-7 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
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
                  'flex items-center gap-1.5 px-3 h-7 rounded-md text-xs font-medium transition-all',
                  active
                    ? 'bg-background text-foreground shadow-sm border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/60',
                  locked && 'opacity-40 cursor-not-allowed'
                )}
              >
                {locked ? <Lock className="h-3 w-3" /> : tab.icon}
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 w-40 justify-end">
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
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
          AI Assistant
        </button>
      </div>
    </div>
  )
}

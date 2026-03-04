'use client'

import Link from 'next/link'
import { ArrowLeft, Play, Command } from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockProjects } from '@/lib/mock/projects'

const project = mockProjects[0]

interface ReelTopBarProps {
  pipelineStarted: boolean
  pipelineComplete: boolean
  onRun: () => void
  onCommandPalette: () => void
}

export function ReelTopBar({ pipelineStarted, pipelineComplete, onRun, onCommandPalette }: ReelTopBarProps) {
  const runLabel = pipelineComplete ? 'Complete' : pipelineStarted ? 'Running...' : 'Run Pipeline'
  const runBg = pipelineComplete
    ? 'bg-green-600 hover:bg-green-600 cursor-default'
    : pipelineStarted
    ? 'bg-muted text-muted-foreground cursor-not-allowed'
    : 'bg-primary hover:bg-primary/90 text-primary-foreground'

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0 bg-background">
      {/* Left: back + brand */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Cremi</span>
        </Link>
      </div>

      {/* Center: project name */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <span className="text-sm font-semibold text-foreground">{project.title}</span>
      </div>

      {/* Right: command palette + run button */}
      <div className="flex items-center gap-2">
        <button
          onClick={onCommandPalette}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-sm"
        >
          <Command className="h-3.5 w-3.5" />
          <span>⌘K</span>
        </button>

        <button
          onClick={onRun}
          disabled={pipelineStarted}
          className={cn(
            'flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
            runBg
          )}
        >
          {pipelineStarted && !pipelineComplete ? (
            <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
          {runLabel}
        </button>
      </div>
    </header>
  )
}

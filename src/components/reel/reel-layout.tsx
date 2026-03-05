'use client'

import { mockProjects } from '@/lib/mock/projects'
import { ReelTopBar } from './reel-top-bar'
import { ReelGateNotification } from './reel-gate-notification'
import { ReelTimeline } from './reel-timeline'
import { ReelDetailPanel } from './reel-detail-panel'
import { ReelCommandPalette } from './reel-command-palette'
import type { QualityGateId } from '@/lib/pipeline/types'
import type { ChatSuggestion } from '@/lib/chat/types'

const project = mockProjects[0]

interface ReelLayoutProps {
  pipelineStarted: boolean
  pipelineComplete: boolean
  selectedSceneId: string | null
  pendingGate: { gateId: QualityGateId; message: string } | null
  commandPaletteOpen: boolean
  activeDetailTab: 'overview' | 'stage' | 'camera' | 'chat'
  onRunPipeline: () => void
  onGateResolve: (result: 'pass' | 'revise') => void
  onSceneSelect: (sceneId: string) => void
  onCommandPaletteOpen: () => void
  onCommandPaletteClose: () => void
  onDetailTabChange: (tab: 'overview' | 'stage' | 'camera' | 'chat') => void
  onDetailClose: () => void
  onAction?: (action: string) => void
  suggestions?: ChatSuggestion[]
}

export function ReelLayout({
  pipelineStarted,
  pipelineComplete,
  selectedSceneId,
  pendingGate,
  commandPaletteOpen,
  activeDetailTab,
  onRunPipeline,
  onGateResolve,
  onSceneSelect,
  onCommandPaletteOpen,
  onCommandPaletteClose,
  onDetailTabChange,
  onDetailClose,
  onAction,
  suggestions,
}: ReelLayoutProps) {
  const selectedScene = project.scenes.find((s) => s.id === selectedSceneId) ?? null

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <ReelTopBar
        pipelineStarted={pipelineStarted}
        pipelineComplete={pipelineComplete}
        onRun={onRunPipeline}
        onCommandPalette={onCommandPaletteOpen}
      />

      <ReelGateNotification gate={pendingGate} onResolve={onGateResolve} />

      <ReelTimeline
        scenes={project.scenes}
        selectedSceneId={selectedSceneId}
        onSceneSelect={onSceneSelect}
      />

      {selectedScene && (
        <ReelDetailPanel
          scene={selectedScene}
          onClose={onDetailClose}
          activeDetailTab={activeDetailTab}
          onDetailTabChange={onDetailTabChange}
          onAction={onAction}
          suggestions={suggestions}
        />
      )}

      <ReelCommandPalette open={commandPaletteOpen} onClose={onCommandPaletteClose} onAction={onAction} />
    </div>
  )
}

'use client'

import { MonitorChatPanel } from './monitor-chat-panel'
import { MonitorWorkspace } from './monitor-workspace'
import type { ChatSuggestion } from '@/lib/chat/types'
import type { JourneyStateId } from '@/lib/journey/orchestrator'
import type { StyleSelections } from './workspace-views/style-selection-view'

interface MonitorLayoutProps {
  onSend: (message: string) => void
  onAction: (action: string) => void
  suggestions?: ChatSuggestion[]
  viewHint: string
  journeyState: JourneyStateId
  projectIndex: number
  onTrackSelect: (index: number) => void
  onStyleConfirm: (selections: StyleSelections) => void
  onCharacterConfirm: (ids: string[]) => void
}

export function MonitorLayout({
  onSend, onAction, suggestions,
  viewHint, journeyState, projectIndex,
  onTrackSelect, onStyleConfirm, onCharacterConfirm,
}: MonitorLayoutProps) {
  return (
    <div className="flex h-full w-full flex-row overflow-hidden">
      {/* Left panel — chat (40%) */}
      <div className="w-[40%] shrink-0 flex flex-col overflow-hidden">
        <MonitorChatPanel onSend={onSend} onAction={onAction} suggestions={suggestions} />
      </div>

      {/* Right panel — workspace (60%) */}
      <div className="flex-1 overflow-hidden">
        <MonitorWorkspace
          viewHint={viewHint}
          journeyState={journeyState}
          projectIndex={projectIndex}
          onTrackSelect={onTrackSelect}
          onStyleConfirm={onStyleConfirm}
          onCharacterConfirm={onCharacterConfirm}
        />
      </div>
    </div>
  )
}

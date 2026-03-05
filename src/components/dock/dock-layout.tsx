'use client'

import { DockTopBar } from './dock-top-bar'
import { DockSidebar } from './dock-sidebar'
import { DockEditor } from './dock-editor'
import { DockConsole } from './dock-console'
import { DockChatPanel } from './dock-chat-panel'
import { mockProjects } from '@/lib/mock/projects'
import type { ConsoleEntryType } from '@/app/dock/page'
import type { QualityGateId } from '@/lib/pipeline/types'
import type { ChatSuggestion } from '@/lib/chat/types'

interface DockLayoutProps {
  entries: ConsoleEntryType[]
  onGateResolve: (gateId: QualityGateId, result: 'pass' | 'revise') => void
  consoleCollapsed: boolean
  onConsoleToggle: () => void
  onConsoleClear: () => void
  chatOpen: boolean
  onChatToggle: () => void
  onAction?: (action: string) => void
  suggestions?: ChatSuggestion[]
}

const project = mockProjects[0]

export function DockLayout({
  entries,
  onGateResolve,
  consoleCollapsed,
  onConsoleToggle,
  onConsoleClear,
  chatOpen,
  onChatToggle,
  onAction,
  suggestions,
}: DockLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Top bar */}
      <DockTopBar
        projectName={project.title}
        chatOpen={chatOpen}
        onChatToggle={onChatToggle}
      />

      {/* Middle zone */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <DockSidebar />

        {/* Main editor */}
        <div className="flex-1 overflow-hidden relative">
          <DockEditor />
        </div>

        {/* Optional AI chat panel */}
        <DockChatPanel
          open={chatOpen}
          onClose={onChatToggle}
          onAction={onAction}
          suggestions={suggestions}
        />
      </div>

      {/* Console */}
      <DockConsole
        entries={entries}
        onGateResolve={onGateResolve}
        collapsed={consoleCollapsed}
        onToggleCollapse={onConsoleToggle}
        onClear={onConsoleClear}
      />
    </div>
  )
}

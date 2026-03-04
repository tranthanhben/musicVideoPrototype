'use client'

import { MonitorChatPanel } from './monitor-chat-panel'
import { MonitorWorkspace } from './monitor-workspace'
import type { ChatSuggestion } from '@/lib/chat/types'

interface MonitorLayoutProps {
  onSend: (message: string) => void
  onAction: (action: string) => void
  suggestions?: ChatSuggestion[]
}

export function MonitorLayout({ onSend, onAction, suggestions }: MonitorLayoutProps) {
  return (
    <div className="flex h-full w-full flex-row overflow-hidden">
      {/* Left panel — chat (40%) */}
      <div className="w-[40%] shrink-0 flex flex-col overflow-hidden">
        <MonitorChatPanel onSend={onSend} onAction={onAction} suggestions={suggestions} />
      </div>

      {/* Right panel — workspace (60%) */}
      <div className="flex-1 overflow-hidden">
        <MonitorWorkspace />
      </div>
    </div>
  )
}

'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MonitorChatPanel } from '@/components/monitor/monitor-chat-panel'
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
  const prevViewHint = useRef(viewHint)
  const [viewChanged, setViewChanged] = useState(false)

  useEffect(() => {
    if (prevViewHint.current !== viewHint) {
      setViewChanged(true)
      prevViewHint.current = viewHint
      const timer = setTimeout(() => setViewChanged(false), 500)
      return () => clearTimeout(timer)
    }
  }, [viewHint])

  return (
    <div className="flex h-full w-full flex-row overflow-hidden">
      {/* Left panel — chat (36%) */}
      <div className="w-[36%] shrink-0 flex flex-col overflow-hidden">
        <MonitorChatPanel onSend={onSend} onAction={onAction} suggestions={suggestions} />
      </div>

      {/* Gradient divider */}
      <div className="relative w-[2px] shrink-0">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/40 to-primary/5" />
        <div className="absolute inset-y-0 left-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent translate-x-[1px]" />
      </div>

      {/* Right panel — workspace (64%) */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence>
          {viewChanged && (
            <motion.div
              key={viewHint + '-flash'}
              initial={{ opacity: 0.2 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-primary/8 pointer-events-none z-20"
            />
          )}
        </AnimatePresence>

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

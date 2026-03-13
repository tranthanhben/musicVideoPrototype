'use client'

import { cn } from '@/lib/utils'
import { BayTopBar, type BayTab } from './bay-top-bar'
import { AssetBrowser } from './asset-browser'
import { BayPreview } from './bay-preview'
import { BayProperties } from './bay-properties'
import { BayTimeline } from './bay-timeline'
import { BayChatPanel } from '@/components/bay/bay-chat-panel'
import type { ChatSuggestion } from '@/lib/chat/types'
import type { JourneyStateId } from '@/lib/journey/orchestrator'

interface BayLayoutProps {
  activeTab: BayTab
  onTabChange: (tab: BayTab) => void
  projectName: string
  chatOpen: boolean
  onChatToggle: () => void
  selectedSceneId: string | null
  onSceneSelect: (id: string) => void
  onAction: (action: string) => void
  suggestions?: ChatSuggestion[]
  selectedStoryline: number | null
  journeyState: JourneyStateId
  onTrackSelect?: (index: number) => void
}

export function BayLayout({
  activeTab,
  onTabChange,
  projectName,
  chatOpen,
  onChatToggle,
  selectedSceneId,
  onSceneSelect,
  onAction,
  suggestions,
  selectedStoryline,
  journeyState,
  onTrackSelect,
}: BayLayoutProps) {
  return (
    <div className="flex flex-col h-full">
      <BayTopBar
        activeTab={activeTab}
        onTabChange={onTabChange}
        projectName={projectName}
        chatOpen={chatOpen}
        onChatToggle={onChatToggle}
      />

      {/* Middle row */}
      <div className="flex flex-1 min-h-0 relative">
        <AssetBrowser
          activeTab={activeTab}
          selectedSceneId={selectedSceneId}
          onSceneSelect={onSceneSelect}
          onAction={onAction}
        />

        <BayPreview
          activeTab={activeTab}
          selectedSceneId={selectedSceneId}
          onAiAssist={onChatToggle}
          onAction={onAction}
          selectedStoryline={selectedStoryline}
          journeyState={journeyState}
          onTrackSelect={onTrackSelect}
        />

        {/* Properties panel — hidden when chat open */}
        <BayProperties
          activeTab={activeTab}
          selectedSceneId={selectedSceneId}
          className={cn(chatOpen && 'invisible pointer-events-none')}
          onAction={onAction}
        />

        {/* Chat panel — overlays properties */}
        <BayChatPanel
          open={chatOpen}
          onClose={onChatToggle}
          onAction={onAction}
          suggestions={suggestions}
          journeyState={journeyState}
        />
      </div>

      <BayTimeline
        activeTab={activeTab}
        selectedSceneId={selectedSceneId}
        onSceneClick={onSceneSelect}
      />
    </div>
  )
}

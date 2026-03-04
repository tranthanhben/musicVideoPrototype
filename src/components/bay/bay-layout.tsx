'use client'

import { cn } from '@/lib/utils'
import { BayTopBar, type BayTab } from './bay-top-bar'
import { AssetBrowser } from './asset-browser'
import { BayPreview } from './bay-preview'
import { BayProperties } from './bay-properties'
import { BayTimeline } from './bay-timeline'
import { BayChatPanel } from './bay-chat-panel'
import type { ChatSuggestion } from '@/lib/chat/types'

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
}: BayLayoutProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <BayTopBar
        activeTab={activeTab}
        onTabChange={onTabChange}
        projectName={projectName}
        chatOpen={chatOpen}
        onChatToggle={onChatToggle}
      />

      {/* Middle row */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Asset browser */}
        <AssetBrowser
          selectedSceneId={selectedSceneId}
          onSceneSelect={onSceneSelect}
        />

        {/* Preview monitor */}
        <BayPreview
          activeTab={activeTab}
          selectedSceneId={selectedSceneId}
          onAiAssist={onChatToggle}
        />

        {/* Properties panel — hidden when chat open */}
        <BayProperties
          activeTab={activeTab}
          selectedSceneId={selectedSceneId}
          className={cn(chatOpen && 'invisible pointer-events-none')}
        />

        {/* Chat panel — overlays properties */}
        <BayChatPanel
          open={chatOpen}
          onClose={onChatToggle}
          onAction={onAction}
          suggestions={suggestions}
        />
      </div>

      {/* Timeline */}
      <BayTimeline
        activeTab={activeTab}
        selectedSceneId={selectedSceneId}
        onSceneClick={onSceneSelect}
      />
    </div>
  )
}

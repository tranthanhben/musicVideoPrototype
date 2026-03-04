'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { X, Camera } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePipelineStore } from '@/lib/pipeline/store'
import { useChatStore } from '@/lib/chat/store'
import { ChatContainer } from '@/components/chat/chat-container'
import { ChatInput } from '@/components/chat/chat-input'
import { addUserMessage } from '@/lib/chat/simulator'
import { ReelStageContent } from './reel-stage-content'
import type { MockScene } from '@/lib/mock/types'
import { PIPELINE_LAYERS } from '@/lib/pipeline/constants'
import type { ChatSuggestion } from '@/lib/chat/types'

type DetailTab = 'overview' | 'stage' | 'camera' | 'chat'

interface ReelDetailPanelProps {
  scene: MockScene
  onClose: () => void
  activeDetailTab: DetailTab
  onDetailTabChange: (tab: DetailTab) => void
  onAction?: (action: string) => void
  suggestions?: ChatSuggestion[]
}

const TABS: { id: DetailTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'stage', label: 'Stage' },
  { id: 'camera', label: 'Camera' },
  { id: 'chat', label: 'Chat' },
]

export function ReelDetailPanel({
  scene,
  onClose,
  activeDetailTab,
  onDetailTabChange,
  onAction,
  suggestions,
}: ReelDetailPanelProps) {
  const currentLayerId = usePipelineStore((s) => s.currentLayerId)
  const messages = useChatStore((s) => s.messages)
  const isStreaming = useChatStore((s) => s.isStreaming)

  const currentLayerName = currentLayerId
    ? PIPELINE_LAYERS.find((l) => l.id === currentLayerId)?.name ?? ''
    : ''

  function handleSend(text: string) {
    addUserMessage(text)
    // Check for scene regen pattern
    const regenMatch = text.match(/regenerate scene (\d+)/i)
    if (regenMatch) {
      const sceneIndex = parseInt(regenMatch[1], 10) - 1
      onAction?.(`regenerate_scene_${sceneIndex}`)
    } else if (onAction) {
      onAction(`user_message:${text}`)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="flex flex-col flex-1 border-t border-border bg-background min-h-0 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold">Scene {scene.index + 1}</span>
          <span className="text-muted-foreground text-sm">·</span>
          <span className="text-sm text-muted-foreground truncate">{scene.subject}</span>
          {currentLayerName && (
            <>
              <span className="text-muted-foreground text-sm">·</span>
              <span className="text-xs text-primary font-medium">{currentLayerName}</span>
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onDetailTabChange(tab.id)}
              className={cn(
                'px-3 py-1 text-xs rounded-md transition-colors',
                activeDetailTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="ml-3 text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDetailTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="h-full"
          >
            {activeDetailTab === 'overview' && (
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Subject</p>
                    <p className="font-medium">{scene.subject}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Action</p>
                    <p className="font-medium">{scene.action}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Environment</p>
                    <p className="font-medium">{scene.environment}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Duration</p>
                    <p className="font-medium">{scene.duration}s</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Prompt</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{scene.prompt}</p>
                </div>
              </div>
            )}

            {activeDetailTab === 'stage' && (
              <div className="h-full">
                <ReelStageContent scene={scene} />
              </div>
            )}

            {activeDetailTab === 'camera' && (
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                  <Camera className="h-4 w-4 text-primary" />
                  Camera Setup
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border p-3 bg-card">
                    <p className="text-xs text-muted-foreground mb-1">Angle</p>
                    <p className="font-medium text-sm capitalize">{scene.cameraAngle}</p>
                  </div>
                  <div className="rounded-lg border border-border p-3 bg-card">
                    <p className="text-xs text-muted-foreground mb-1">Movement</p>
                    <p className="font-medium text-sm capitalize">{scene.cameraMovement}</p>
                  </div>
                </div>
                <div className="rounded-lg border border-border overflow-hidden aspect-video bg-muted flex items-center justify-center">
                  <img src={scene.thumbnailUrl} alt="camera preview" className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="border-2 border-white/40 rounded w-24 h-16 flex items-center justify-center">
                      <Camera className="h-5 w-5 text-white/60" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeDetailTab === 'chat' && (
              <div className="flex flex-col h-full">
                <ChatContainer messages={messages} onAction={onAction} className="flex-1" />
                <ChatInput
                  onSend={handleSend}
                  placeholder="Ask about this scene..."
                  disabled={isStreaming}
                  suggestions={suggestions}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

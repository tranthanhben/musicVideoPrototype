'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { usePipelineStore } from '@/lib/pipeline/store'
import { useChatStore } from '@/lib/chat/store'
import { PipelineSimulator } from '@/lib/pipeline/simulator'
import { streamResponse, addUserMessage } from '@/lib/chat/simulator'
import { ChatContainer } from '@/components/chat/chat-container'
import { ChatInput } from '@/components/chat/chat-input'
import { ScreeningHeader } from '@/components/screening/screening-header'
import { ScreeningWelcome } from '@/components/screening/screening-welcome'
import {
  JOURNEY_STATES,
  GATE_TO_REVIEW_STATE,
  getJourneyResponse,
  buildFreeformResponse,
  buildSceneRegenResponse,
  buildSceneRegenCompleteResponse,
  type JourneyStateId,
} from '@/lib/journey/orchestrator'
import { mockProjects } from '@/lib/mock/projects'
import type { ChatSuggestion } from '@/lib/chat/types'
import type { PipelineEvent } from '@/lib/pipeline/types'

const LAYER_TO_PROGRESS_STATE: Record<string, JourneyStateId> = {
  L1_INPUT: 'analyzing',
  L2_CREATIVE: 'creative',
  L3_PREPRODUCTION: 'storyboard',
  L4_PRODUCTION: 'generating',
  L5_POSTPRODUCTION: 'editing',
}

export default function ScreeningPage() {
  const messages = useChatStore((s) => s.messages)
  const isStreaming = useChatStore((s) => s.isStreaming)
  const { resetPipeline, setCurrentState, resolveGate: storeResolveGate } = usePipelineStore()
  const { clearMessages } = useChatStore()

  const simulatorRef = useRef<PipelineSimulator | null>(null)
  const pendingGateRef = useRef<string | null>(null)
  const pipelineStartedRef = useRef(false)
  const journeyStateRef = useRef<JourneyStateId>('welcome')

  const [journeyState, setJourneyState] = useState<JourneyStateId>('welcome')
  const [suggestions, setSuggestions] = useState<ChatSuggestion[]>([])

  function advanceJourneyState(stateId: JourneyStateId) {
    journeyStateRef.current = stateId
    setJourneyState(stateId)
    setSuggestions(JOURNEY_STATES[stateId].suggestions)
  }

  // Initialize on mount
  useEffect(() => {
    resetPipeline()
    clearMessages()
    pipelineStartedRef.current = false
    journeyStateRef.current = 'welcome'
    setJourneyState('welcome')
    setSuggestions([])

    const sim = new PipelineSimulator()
    simulatorRef.current = sim

    const unsubscribe = sim.emitter.on('*', (event: PipelineEvent) => {
      handlePipelineEvent(event)
    })

    return () => {
      unsubscribe()
      sim.stop()
      simulatorRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handlePipelineEvent(event: PipelineEvent) {
    switch (event.type) {
      case 'layer_start': {
        if (!event.layerId) break
        const progressStateId = LAYER_TO_PROGRESS_STATE[event.layerId]
        if (progressStateId) {
          advanceJourneyState(progressStateId)
          const response = getJourneyResponse(progressStateId)
          streamResponse({ text: response.text, charDelay: 20 })
        }
        break
      }

      case 'artifact_created':
        // artifacts surface via gate_pending responses
        break

      case 'gate_pending': {
        if (!event.gateId) break
        pendingGateRef.current = event.gateId
        const reviewStateId = GATE_TO_REVIEW_STATE[event.gateId]
        if (reviewStateId) {
          advanceJourneyState(reviewStateId)
          const response = getJourneyResponse(reviewStateId)
          streamResponse({
            text: response.text,
            artifacts: response.artifacts,
            actions: response.actions,
          })
          const pipelineState = JOURNEY_STATES[reviewStateId].pipelineState
          setCurrentState(pipelineState as Parameters<typeof setCurrentState>[0])
        }
        break
      }

      case 'gate_resolved': {
        const result = (event as PipelineEvent & { data?: { result?: string } }).data as { result?: string } | undefined
        const wasRevise = result?.result === 'revise'
        if (!wasRevise) {
          streamResponse({ text: 'Approved — moving to the next stage...', charDelay: 18 })
        }
        pendingGateRef.current = null
        break
      }

      case 'pipeline_complete': {
        advanceJourneyState('complete')
        const response = getJourneyResponse('complete')
        streamResponse({
          text: response.text,
          artifacts: response.artifacts,
          actions: response.actions,
        })
        setCurrentState('complete')
        break
      }

      default:
        break
    }
  }

  const handleAction = useCallback((action: string) => {
    const sim = simulatorRef.current
    const gateId = pendingGateRef.current
    const currentJourneyState = journeyStateRef.current

    if (action.startsWith('regenerate_scene_')) {
      const sceneIndex = parseInt(action.replace('regenerate_scene_', ''), 10)
      const scene = mockProjects[0].scenes[sceneIndex]
      if (!scene) return
      const regenResponse = buildSceneRegenResponse(sceneIndex, scene)
      streamResponse({ text: regenResponse.text, charDelay: 20 })
      setTimeout(() => {
        const completeResponse = buildSceneRegenCompleteResponse(sceneIndex)
        streamResponse({
          text: completeResponse.text,
          artifacts: completeResponse.artifacts,
          actions: completeResponse.actions,
          charDelay: 20,
        })
      }, 3000)
    } else if (action === 'show_regen_options') {
      setSuggestions(JOURNEY_STATES['l4_review'].suggestions)
    } else if (action === 'download') {
      streamResponse({ text: 'Preparing your download package — compiling YouTube, TikTok, and Instagram formats. This will be ready in a moment!', charDelay: 20 })
    } else if (action === 'approve' && gateId && sim) {
      storeResolveGate(gateId as Parameters<typeof storeResolveGate>[0], 'pass')
      sim.resolveGate(gateId as Parameters<typeof storeResolveGate>[0], 'pass')
      const nextState = JOURNEY_STATES[currentJourneyState]?.nextStateOnApprove
      if (nextState) advanceJourneyState(nextState)
    } else if (action === 'revise' && gateId && sim) {
      storeResolveGate(gateId as Parameters<typeof storeResolveGate>[0], 'revise')
      sim.resolveGate(gateId as Parameters<typeof storeResolveGate>[0], 'revise')
      streamResponse({ text: 'Got it — revising this stage for you...', charDelay: 20 })
    } else if (action === 'new_project') {
      resetPipeline()
      clearMessages()
      pipelineStartedRef.current = false
      pendingGateRef.current = null
      journeyStateRef.current = 'welcome'
      setJourneyState('welcome')
      setSuggestions([])
      if (simulatorRef.current) {
        simulatorRef.current.stop()
        const newSim = new PipelineSimulator()
        simulatorRef.current = newSim
        newSim.emitter.on('*', handlePipelineEvent)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeResolveGate, resetPipeline, clearMessages])

  const startPipeline = useCallback(() => {
    if (pipelineStartedRef.current) return
    pipelineStartedRef.current = true

    const { startPipeline: storStart } = usePipelineStore.getState()
    storStart()

    if (simulatorRef.current) {
      simulatorRef.current.start()
    }
  }, [])

  const handleSend = useCallback((text: string) => {
    addUserMessage(text)

    const regenMatch = text.match(/regenerate\s+scene\s+(\d+)/i)
    if (regenMatch) {
      const sceneIndex = parseInt(regenMatch[1], 10) - 1
      const scene = mockProjects[0].scenes[sceneIndex]
      if (scene) {
        const regenResponse = buildSceneRegenResponse(sceneIndex, scene)
        streamResponse({ text: regenResponse.text, charDelay: 20 })
        setTimeout(() => {
          const completeResponse = buildSceneRegenCompleteResponse(sceneIndex)
          streamResponse({
            text: completeResponse.text,
            artifacts: completeResponse.artifacts,
            actions: completeResponse.actions,
            charDelay: 20,
          })
        }, 3000)
        return
      }
    }

    if (!pipelineStartedRef.current) {
      startPipeline()
    } else {
      const response = buildFreeformResponse(journeyStateRef.current)
      streamResponse({ text: response.text, charDelay: 22 })
    }
  }, [startPipeline])

  const showWelcome = messages.length === 0
  const projectName = mockProjects[0].title

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <ScreeningHeader projectName={projectName} />

      <AnimatePresence mode="wait">
        {showWelcome ? (
          <motion.div
            key="welcome"
            className="flex-1 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ScreeningWelcome onSuggestion={handleSend} />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            className="flex-1 overflow-hidden flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <ChatContainer
              messages={messages}
              onAction={handleAction}
              className="flex-1"
            />
            <ChatInput
              onSend={handleSend}
              disabled={isStreaming}
              placeholder="Ask anything about your video..."
              suggestions={suggestions}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

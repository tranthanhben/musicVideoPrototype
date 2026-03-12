'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { usePipelineStore } from '@/lib/pipeline/store'
import { useChatStore } from '@/lib/chat/store'
import { PipelineSimulator } from '@/lib/pipeline/simulator'
import { streamResponse } from '@/lib/chat/simulator'
import { mockProjects } from '@/lib/mock/projects'
import { BayLayout } from '@/components/bay/bay-layout'
import type { BayTab } from '@/components/bay/bay-top-bar'
import type { ChatSuggestion } from '@/lib/chat/types'
import type { PipelineResponse } from '@/lib/chat/response-bank'
import {
  JOURNEY_STATES, GATE_TO_REVIEW_STATE,
  getJourneyResponse, buildFreeformResponse,
  buildSceneRegenResponse, buildSceneRegenCompleteResponse,
  type JourneyStateId,
} from '@/lib/journey/orchestrator'
import { matchIntent, buildBayResponse } from '@/lib/journey/bay-interactions'

const VIEW_HINT_TO_TAB: Record<string, BayTab> = {
  input: 'input', creative: 'creative', storyboard: 'storyboard',
  generate: 'generate', edit: 'edit',
}

const project = mockProjects[0]

export default function BayPage() {
  const [activeTab, setActiveTab] = useState<BayTab>('input')
  const [chatOpen, setChatOpen] = useState(true)
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(project.scenes[0]?.id ?? null)
  const [journeyState, setJourneyState] = useState<JourneyStateId>('welcome')
  const [suggestions, setSuggestions] = useState<ChatSuggestion[]>([])
  const [selectedStoryline, setSelectedStoryline] = useState<number | null>(null)

  const simulatorRef = useRef<PipelineSimulator | null>(null)
  const cancelStreamRef = useRef<(() => void) | null>(null)

  const resetPipeline = usePipelineStore((s) => s.resetPipeline)
  const startPipeline = usePipelineStore((s) => s.startPipeline)
  const setLayerStatus = usePipelineStore((s) => s.setLayerStatus)
  const setLayerProgress = usePipelineStore((s) => s.setLayerProgress)
  const setCurrentLayer = usePipelineStore((s) => s.setCurrentLayer)
  const clearMessages = useChatStore((s) => s.clearMessages)

  const streamChat = useCallback((response: PipelineResponse) => {
    if (cancelStreamRef.current) cancelStreamRef.current()
    cancelStreamRef.current = streamResponse({
      text: response.text,
      artifacts: response.artifacts,
      actions: response.actions,
    })
  }, [])

  const advanceToState = useCallback((stateId: JourneyStateId) => {
    setJourneyState(stateId)
    const state = JOURNEY_STATES[stateId]
    if (state.viewHint) setActiveTab(VIEW_HINT_TO_TAB[state.viewHint] ?? 'input')
    setSuggestions(state.suggestions)
    const response = getJourneyResponse(stateId)
    streamChat(response)
  }, [streamChat])

  const handleAction = useCallback((action: string) => {
    const state = JOURNEY_STATES[journeyState]

    if (action === 'approve' && state.gateToResolve && state.nextStateOnApprove) {
      simulatorRef.current?.resolveGate(state.gateToResolve, 'pass')
      const stageName = state.nextStateOnApprove.replace(/_/g, ' ').replace(/^l\d+\s*/, '')
      streamChat({ text: `Approved! Moving on to ${stageName}...` })
      return
    }

    if (action === 'revise' && state.gateToResolve) {
      simulatorRef.current?.resolveGate(state.gateToResolve, 'revise')
      streamChat({ text: "Got it! Let me rework this stage based on your feedback. Running the analysis again with adjusted parameters..." })
      return
    }

    if (action.startsWith('regenerate_scene_')) {
      const sceneIdx = parseInt(action.replace('regenerate_scene_', ''))
      const scene = project.scenes[sceneIdx]
      if (!scene) return
      const regenResponse = buildSceneRegenResponse(sceneIdx, scene)
      streamChat(regenResponse)
      setTimeout(() => {
        const completeResponse = buildSceneRegenCompleteResponse(sceneIdx)
        streamChat(completeResponse)
      }, 3000)
      return
    }

    if (action === 'show_regen_options') {
      setSuggestions(JOURNEY_STATES.l4_review.suggestions)
      streamChat({ text: "Which scene would you like to regenerate? Click a suggestion below or type 'Regenerate Scene X'." })
      return
    }

    if (action === 'download') {
      streamChat({ text: "Preparing your exports... YouTube (16:9), TikTok (9:16), and Instagram (1:1) formats are ready. In a real app, downloads would start now!" })
      return
    }

    if (action === 'new_project') {
      clearMessages()
      resetPipeline()
      setJourneyState('welcome')
      setActiveTab('input')
      setSuggestions([])
      setSelectedStoryline(null)
      setTimeout(() => advanceToState('welcome'), 500)
      return
    }

    if (action === 'start_analysis' || action === 'start_demo') {
      streamChat({
        text: action === 'start_demo'
          ? `Loading **"${project.audio.title}"** by ${project.audio.artist}... This cosmic love story follows Aria and Kael through a stellar separation. Let me analyze the track structure.`
          : `Great! Analyzing your track — **"${project.audio.title}"** by ${project.audio.artist}. Extracting BPM, key, emotional peaks, and segment structure...`,
      })
      startPipeline()
      simulatorRef.current?.start()
      return
    }

    if (action.startsWith('select_storyline_')) {
      const idx = parseInt(action.replace('select_storyline_', ''))
      setSelectedStoryline(idx)
      const response = buildBayResponse(action, journeyState, project)
      if (response) streamChat(response)
      return
    }

    const bayResponse = buildBayResponse(action, journeyState, project)
    if (bayResponse) {
      streamChat(bayResponse)
      return
    }

    if (action.startsWith('user_message:')) {
      const userText = action.slice('user_message:'.length)
      const matched = matchIntent(userText, journeyState)
      if (matched) {
        handleAction(matched)
        return
      }
      const response = buildFreeformResponse(journeyState)
      setTimeout(() => streamChat(response), 300)
      return
    }
  }, [journeyState, streamChat, clearMessages, resetPipeline, advanceToState])

  useEffect(() => {
    resetPipeline()
    clearMessages()

    const sim = new PipelineSimulator()
    simulatorRef.current = sim

    sim.emitter.on('layer_start', (event) => {
      if (event.layerId) {
        setLayerStatus(event.layerId, 'active')
        setCurrentLayer(event.layerId)
      }
    })

    sim.emitter.on('layer_progress', (event) => {
      if (event.layerId && event.progress !== undefined) {
        setLayerProgress(event.layerId, event.progress)
      }
    })

    sim.emitter.on('gate_pending', (event) => {
      if (event.gateId) {
        const reviewState = GATE_TO_REVIEW_STATE[event.gateId]
        if (reviewState) {
          if (event.layerId) setLayerStatus(event.layerId, 'complete')
          advanceToState(reviewState)
        }
      }
    })

    sim.emitter.on('gate_resolved', (event) => {
      if (event.layerId) setLayerStatus(event.layerId, 'complete')
    })

    sim.emitter.on('pipeline_complete', () => {
      setLayerStatus('L5_POSTPRODUCTION', 'complete')
      advanceToState('complete')
    })

    const welcomeTimer = setTimeout(() => { advanceToState('welcome') }, 500)

    return () => {
      clearTimeout(welcomeTimer)
      sim.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <BayLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      projectName={project.title}
      chatOpen={chatOpen}
      onChatToggle={() => setChatOpen((o) => !o)}
      selectedSceneId={selectedSceneId}
      onSceneSelect={setSelectedSceneId}
      onAction={handleAction}
      suggestions={suggestions}
      selectedStoryline={selectedStoryline}
      journeyState={journeyState}
    />
  )
}

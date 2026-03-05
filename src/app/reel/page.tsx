'use client'

import { useState, useEffect, useRef } from 'react'
import { usePipelineStore } from '@/lib/pipeline/store'
import { useChatStore } from '@/lib/chat/store'
import { PipelineSimulator } from '@/lib/pipeline/simulator'
import { streamResponse, addUserMessage } from '@/lib/chat/simulator'
import { ReelLayout } from '@/components/reel/reel-layout'
import type { QualityGateId } from '@/lib/pipeline/types'
import {
  JOURNEY_STATES,
  GATE_TO_REVIEW_STATE,
  getJourneyResponse,
  buildFreeformResponse,
  buildSceneRegenResponse,
  buildSceneRegenCompleteResponse,
  type JourneyStateId,
} from '@/lib/journey/orchestrator'
import type { ChatSuggestion } from '@/lib/chat/types'
import type { PipelineResponse } from '@/lib/chat/response-bank'
import { mockProjects } from '@/lib/mock/projects'

const scenes = mockProjects[0].scenes

export default function ReelPage() {
  const [pipelineStarted, setPipelineStarted] = useState(false)
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null)
  const [pendingGate, setPendingGate] = useState<{ gateId: QualityGateId; message: string } | null>(null)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'stage' | 'camera' | 'chat'>('overview')
  const [journeyState, setJourneyState] = useState<JourneyStateId>('welcome')
  const [suggestions, setSuggestions] = useState<ChatSuggestion[]>([])

  const simulatorRef = useRef<PipelineSimulator | null>(null)
  const journeyStateRef = useRef<JourneyStateId>('welcome')
  const cancelStreamRef = useRef<(() => void) | null>(null)
  const pendingGateRef = useRef<QualityGateId | null>(null)

  const resetPipeline = usePipelineStore((s) => s.resetPipeline)
  const startPipeline = usePipelineStore((s) => s.startPipeline)
  const setLayerStatus = usePipelineStore((s) => s.setLayerStatus)
  const setLayerProgress = usePipelineStore((s) => s.setLayerProgress)
  const setCurrentLayer = usePipelineStore((s) => s.setCurrentLayer)
  const clearMessages = useChatStore((s) => s.clearMessages)
  const layers = usePipelineStore((s) => s.layers)

  const pipelineComplete =
    layers['L5_POSTPRODUCTION']?.status === 'complete'

  function setJourneyStateSync(stateId: JourneyStateId) {
    journeyStateRef.current = stateId
    setJourneyState(stateId)
  }

  function streamChat(response: PipelineResponse) {
    cancelStreamRef.current?.()
    const cancel = streamResponse({
      text: response.text,
      artifacts: response.artifacts,
      actions: response.actions,
      charDelay: 20,
    })
    cancelStreamRef.current = cancel
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    return () => simulatorRef.current?.stop()
  }, [])

  function handleRunPipeline() {
    if (pipelineStarted) return
    resetPipeline()
    clearMessages()
    setPipelineStarted(true)
    setJourneyStateSync('analyzing')
    setSuggestions(JOURNEY_STATES['analyzing'].suggestions)

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
        pendingGateRef.current = event.gateId
        setPendingGate({ gateId: event.gateId, message: event.message ?? '' })

        const reviewState = GATE_TO_REVIEW_STATE[event.gateId]
        if (reviewState) {
          setJourneyStateSync(reviewState)
          streamChat(getJourneyResponse(reviewState))
          setSuggestions(JOURNEY_STATES[reviewState].suggestions)
        }
      }
    })

    sim.emitter.on('gate_resolved', (event) => {
      if (event.layerId) setLayerStatus(event.layerId, 'complete')
      setPendingGate(null)
      pendingGateRef.current = null
    })

    sim.emitter.on('pipeline_complete', () => {
      setLayerStatus('L5_POSTPRODUCTION', 'complete')
      setJourneyStateSync('complete')
      setSuggestions([])
      streamChat(getJourneyResponse('complete'))
    })

    startPipeline()
    sim.start()
  }

  function handleGateResolve(result: 'pass' | 'revise') {
    if (pendingGate && simulatorRef.current) {
      simulatorRef.current.resolveGate(pendingGate.gateId, result)
      if (result === 'pass') {
        const currentState = journeyStateRef.current
        const nextState = JOURNEY_STATES[currentState]?.nextStateOnApprove
        if (nextState) {
          setJourneyStateSync(nextState)
          streamChat({ text: `Approved — advancing to next stage...` })
          setTimeout(() => {
            streamChat(getJourneyResponse(nextState))
            setSuggestions(JOURNEY_STATES[nextState].suggestions)
          }, 1500)
        }
      }
      pendingGateRef.current = null
    }
  }

  function handleAction(action: string) {
    const currentState = journeyStateRef.current
    const sim = simulatorRef.current

    if (action === 'approve') {
      const gateId = pendingGateRef.current
      if (gateId && sim) {
        sim.resolveGate(gateId, 'pass')
        setPendingGate(null)
        const nextState = JOURNEY_STATES[currentState]?.nextStateOnApprove
        if (nextState) {
          setJourneyStateSync(nextState)
          streamChat({ text: `Approved — advancing to next stage...` })
          setTimeout(() => {
            streamChat(getJourneyResponse(nextState))
            setSuggestions(JOURNEY_STATES[nextState].suggestions)
          }, 1500)
        }
        pendingGateRef.current = null
      }
    } else if (action === 'revise') {
      const gateId = pendingGateRef.current
      if (gateId && sim) {
        sim.resolveGate(gateId, 'revise')
        setPendingGate(null)
        pendingGateRef.current = null
      }
    } else if (action.startsWith('regenerate_scene_')) {
      const sceneIndex = parseInt(action.replace('regenerate_scene_', ''), 10)
      const scene = scenes[sceneIndex]
      if (scene !== undefined) {
        streamChat(buildSceneRegenResponse(sceneIndex, scene))
        setTimeout(() => {
          streamChat(buildSceneRegenCompleteResponse(sceneIndex))
        }, 4000)
      }
    } else if (action === 'show_regen_options') {
      setSuggestions(JOURNEY_STATES['l4_review'].suggestions)
    } else if (action === 'download') {
      streamChat({ text: "Preparing your downloads... Export files for YouTube (16:9), TikTok (9:16), and Instagram (1:1) are being packaged now." })
    } else if (action === 'new_project') {
      setJourneyStateSync('welcome')
      setSuggestions([])
      clearMessages()
    } else if (action.startsWith('user_message:')) {
      streamChat(buildFreeformResponse(currentState))
    }
  }

  function handleSceneSelect(sceneId: string) {
    setSelectedSceneId(sceneId)
  }

  return (
    <ReelLayout
      pipelineStarted={pipelineStarted}
      pipelineComplete={pipelineComplete}
      selectedSceneId={selectedSceneId}
      pendingGate={pendingGate}
      commandPaletteOpen={commandPaletteOpen}
      activeDetailTab={activeDetailTab}
      onRunPipeline={handleRunPipeline}
      onGateResolve={handleGateResolve}
      onSceneSelect={handleSceneSelect}
      onCommandPaletteOpen={() => setCommandPaletteOpen(true)}
      onCommandPaletteClose={() => setCommandPaletteOpen(false)}
      onDetailTabChange={setActiveDetailTab}
      onDetailClose={() => setSelectedSceneId(null)}
      onAction={handleAction}
      suggestions={suggestions}
    />
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { usePipelineStore } from '@/lib/pipeline/store'
import { useChatStore } from '@/lib/chat/store'
import { PipelineSimulator } from '@/lib/pipeline/simulator'
import { streamResponse, addUserMessage } from '@/lib/chat/simulator'
import { getResponseForState } from '@/lib/chat/response-bank'
import { PipelineProgressBar } from '@/components/editor/pipeline-progress-bar'
import { MonitorLayout } from '@/components/monitor/monitor-layout'
import { QualityGateModal } from '@/components/monitor/quality-gate-modal'
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
import type { PipelineResponse } from '@/lib/chat/response-bank'
import type { QualityGateId } from '@/lib/pipeline/types'
import type { PipelineEvent } from '@/lib/pipeline/types'

export default function MonitorPage() {
  const simulatorRef = useRef<PipelineSimulator | null>(null)
  const cancelStreamRef = useRef<(() => void) | null>(null)
  const journeyStateRef = useRef<JourneyStateId>('welcome')

  const [pendingGateId, setPendingGateId] = useState<QualityGateId | null>(null)
  const [gateOpen, setGateOpen] = useState(false)
  const [journeyState, setJourneyState] = useState<JourneyStateId>('welcome')
  const [suggestions, setSuggestions] = useState<ChatSuggestion[]>([])

  const {
    layers, currentLayerId,
    resetPipeline, setCurrentLayer, setLayerStatus, setLayerProgress,
    addArtifact, addActivity, resolveGate, setCurrentState, startPipeline,
  } = usePipelineStore()
  const { clearMessages } = useChatStore()

  function advanceJourneyState(stateId: JourneyStateId) {
    journeyStateRef.current = stateId
    setJourneyState(stateId)
    setSuggestions(JOURNEY_STATES[stateId].suggestions)
  }

  function streamChat(response: PipelineResponse) {
    if (cancelStreamRef.current) {
      cancelStreamRef.current()
      cancelStreamRef.current = null
    }
    const cancel = streamResponse({
      text: response.text,
      artifacts: response.artifacts,
      actions: response.actions,
    })
    cancelStreamRef.current = cancel
  }

  function advanceToState(stateId: JourneyStateId) {
    advanceJourneyState(stateId)
    const response = getJourneyResponse(stateId)
    streamChat(response)
  }

  useEffect(() => {
    // Reset on mount
    resetPipeline()
    clearMessages()
    journeyStateRef.current = 'welcome'
    setJourneyState('welcome')
    setSuggestions([])

    const sim = new PipelineSimulator()
    simulatorRef.current = sim

    // Welcome message
    const resp = getResponseForState('idle')
    streamResponse({ text: resp.text, artifacts: resp.artifacts, actions: resp.actions })

    // Wire events
    function handleEvent(event: PipelineEvent) {
      if (event.type === 'layer_start' && event.layerId) {
        setCurrentLayer(event.layerId)
        setLayerStatus(event.layerId, 'active')
      }

      if (event.type === 'layer_progress' && event.layerId && event.progress !== undefined) {
        setLayerProgress(event.layerId, event.progress)
        if (event.progress >= 100) {
          setLayerStatus(event.layerId, 'complete')
        }
      }

      if (event.type === 'artifact_created' && event.layerId && event.data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        addArtifact(event.layerId, event.data as any)
      }

      if (event.type === 'activity_log' && event.layerId && event.data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const d = event.data as any
        addActivity({
          id: `act-${Date.now()}-${Math.random()}`,
          agentName: d.agentName ?? 'Agent',
          agentType: d.agentType ?? 'agent',
          layerId: event.layerId,
          action: event.message ?? '',
          status: d.status ?? 'running',
          timestamp: new Date().toISOString(),
          message: event.message ?? '',
        })
      }

      if (event.type === 'gate_pending' && event.gateId) {
        resolveGate(event.gateId, 'pending')
        const reviewStateId = GATE_TO_REVIEW_STATE[event.gateId]
        if (reviewStateId) {
          advanceToState(reviewStateId)
        }
        setPendingGateId(event.gateId)
        setGateOpen(true)
      }

      if (event.type === 'pipeline_complete') {
        setCurrentState('complete')
        advanceToState('complete')
      }
    }

    sim.emitter.on('*', handleEvent)
    startPipeline()
    sim.start()

    return () => {
      sim.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSend(message: string) {
    addUserMessage(message)

    const regenMatch = message.match(/regenerate\s+scene\s+(\d+)/i)
    if (regenMatch) {
      const sceneIndex = parseInt(regenMatch[1], 10) - 1
      const scene = mockProjects[0].scenes[sceneIndex]
      if (scene) {
        const regenResponse = buildSceneRegenResponse(sceneIndex, scene)
        streamChat(regenResponse)
        setTimeout(() => {
          const completeResponse = buildSceneRegenCompleteResponse(sceneIndex)
          streamChat(completeResponse)
        }, 3000)
        return
      }
    }

    streamChat(buildFreeformResponse(journeyStateRef.current))
  }

  function handleAction(action: string) {
    const currentJourneyState = journeyStateRef.current

    if (action === 'approve' && pendingGateId) {
      const nextState = JOURNEY_STATES[currentJourneyState]?.nextStateOnApprove
      handleGateResolve('pass')
      if (nextState) advanceJourneyState(nextState)
    } else if (action === 'revise' && pendingGateId) {
      handleGateResolve('revise')
    } else if (action.startsWith('regenerate_scene_')) {
      const sceneIndex = parseInt(action.replace('regenerate_scene_', ''), 10)
      const scene = mockProjects[0].scenes[sceneIndex]
      if (!scene) return
      const regenResponse = buildSceneRegenResponse(sceneIndex, scene)
      streamChat(regenResponse)
      setTimeout(() => {
        const completeResponse = buildSceneRegenCompleteResponse(sceneIndex)
        streamChat(completeResponse)
      }, 3000)
    } else if (action === 'show_regen_options') {
      setSuggestions(JOURNEY_STATES['l4_review'].suggestions)
    } else if (action === 'download') {
      streamChat({ text: 'Preparing your download package — compiling YouTube, TikTok, and Instagram formats. This will be ready in a moment!' })
    } else if (action === 'new_project') {
      resetPipeline()
      clearMessages()
      journeyStateRef.current = 'welcome'
      setJourneyState('welcome')
      setSuggestions([])
      setPendingGateId(null)
      setGateOpen(false)
      if (simulatorRef.current) {
        simulatorRef.current.stop()
      }
    } else if (action.startsWith('user_message:')) {
      const msg = action.replace('user_message:', '')
      streamChat(buildFreeformResponse(journeyStateRef.current))
      addUserMessage(msg)
    }
  }

  function handleGateResolve(result: 'pass' | 'revise') {
    if (!pendingGateId) return
    resolveGate(pendingGateId, result)
    simulatorRef.current?.resolveGate(pendingGateId, result)
    const text = result === 'pass'
      ? 'Approved. Advancing to the next production stage.'
      : 'Revision requested. Re-running this stage with adjustments.'
    streamChat({ text })
    setGateOpen(false)
    setPendingGateId(null)
  }

  function handleGateClose() {
    setGateOpen(false)
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Main area */}
      <div className="flex-1 overflow-hidden">
        <MonitorLayout onSend={handleSend} onAction={handleAction} suggestions={suggestions} />
      </div>

      {/* Pipeline progress bar — fixed at bottom */}
      <PipelineProgressBar layers={layers} currentLayerId={currentLayerId} />

      {/* Quality gate modal */}
      <QualityGateModal
        open={gateOpen}
        gateId={pendingGateId}
        onResolve={handleGateResolve}
        onClose={handleGateClose}
      />
    </div>
  )
}

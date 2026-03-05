'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { usePipelineStore } from '@/lib/pipeline/store'
import { useChatStore } from '@/lib/chat/store'
import { PipelineSimulator } from '@/lib/pipeline/simulator'
import { streamResponse, addUserMessage } from '@/lib/chat/simulator'
import { PipelineProgressBar } from '@/components/editor/pipeline-progress-bar'
import { MonitorLayout } from '@/components/monitor/monitor-layout'
import {
  JOURNEY_STATES,
  MONITOR_GATE_TO_STATE,
  type JourneyStateId,
} from '@/lib/journey/orchestrator'
import {
  MONITOR_RESPONSES,
  buildMonitorFreeformResponse,
  buildSceneRegenResponse,
  buildSceneRegenCompleteResponse,
} from '@/lib/journey/monitor-responses'
import { mockProjects } from '@/lib/mock/projects'
import type { ChatSuggestion } from '@/lib/chat/types'
import type { PipelineResponse } from '@/lib/chat/response-bank'
import type { PipelineEvent, QualityGateId } from '@/lib/pipeline/types'
import type { StyleSelections } from '@/components/monitor/workspace-views/style-selection-view'

export default function MonitorPage() {
  const simulatorRef = useRef<PipelineSimulator | null>(null)
  const cancelStreamRef = useRef<(() => void) | null>(null)
  const journeyStateRef = useRef<JourneyStateId>('upload')
  // Track pending pipeline gates that we haven't resolved yet
  const deferredGateRef = useRef<QualityGateId | null>(null)

  const [pendingGateId, setPendingGateId] = useState<QualityGateId | null>(null)
  const [journeyState, setJourneyState] = useState<JourneyStateId>('upload')
  const [suggestions, setSuggestions] = useState<ChatSuggestion[]>([])
  const [projectIndex, setProjectIndex] = useState(0)
  const [viewHint, setViewHint] = useState('upload')

  const {
    layers, currentLayerId,
    resetPipeline, setCurrentLayer, setLayerStatus, setLayerProgress,
    addArtifact, addActivity, resolveGate, setCurrentState, startPipeline,
  } = usePipelineStore()
  const { clearMessages } = useChatStore()

  // --- Helpers ---

  const advanceJourneyState = useCallback((stateId: JourneyStateId) => {
    journeyStateRef.current = stateId
    setJourneyState(stateId)
    setViewHint(JOURNEY_STATES[stateId].viewHint)
    setSuggestions(JOURNEY_STATES[stateId].suggestions)
  }, [])

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

  // Get response for a state — prefer monitor-specific, fallback to generic
  function getResponse(stateId: JourneyStateId): PipelineResponse {
    return MONITOR_RESPONSES[stateId] ?? { text: 'Processing...' }
  }

  function advanceToState(stateId: JourneyStateId) {
    advanceJourneyState(stateId)
    streamChat(getResponse(stateId))
  }

  // Resolve a deferred pipeline gate and let the simulator continue
  function resolvePipelineGate(gateId: QualityGateId, result: 'pass' | 'revise') {
    resolveGate(gateId, result)
    simulatorRef.current?.resolveGate(gateId, result)
    setPendingGateId(null)
    deferredGateRef.current = null
  }

  // --- Pipeline event handler ---

  const handlePipelineEvent = useCallback((event: PipelineEvent) => {
    if (event.type === 'layer_start' && event.layerId) {
      setCurrentLayer(event.layerId)
      setLayerStatus(event.layerId, 'active')
    }
    if (event.type === 'layer_progress' && event.layerId && event.progress !== undefined) {
      setLayerProgress(event.layerId, event.progress)
      if (event.progress >= 100) setLayerStatus(event.layerId, 'complete')
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
      setPendingGateId(event.gateId)
      deferredGateRef.current = event.gateId

      const reviewStateId = MONITOR_GATE_TO_STATE[event.gateId]
      if (reviewStateId) advanceToState(reviewStateId)
    }
    if (event.type === 'pipeline_complete') {
      setCurrentState('complete')
      advanceToState('complete')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // --- Init ---

  useEffect(() => {
    resetPipeline()
    clearMessages()
    journeyStateRef.current = 'upload'
    setJourneyState('upload')
    setViewHint('upload')
    setSuggestions(JOURNEY_STATES.upload.suggestions)

    const sim = new PipelineSimulator()
    simulatorRef.current = sim
    sim.emitter.on('*', handlePipelineEvent)

    const timer = setTimeout(() => {
      streamChat(getResponse('upload'))
    }, 500)

    return () => { clearTimeout(timer); sim.stop() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // --- User action handlers ---

  function handleTrackSelect(index: number) {
    setProjectIndex(index)
    const track = mockProjects[index].audio
    addUserMessage(`Use "${track.title}" by ${track.artist}`)

    // Show analyzing loading state
    journeyStateRef.current = 'analyzing'
    setJourneyState('analyzing')
    setViewHint('analyzing')
    setSuggestions(JOURNEY_STATES.analyzing.suggestions)
    streamChat({ text: `Analyzing "${track.title}"... Extracting BPM, key, segments, and mapping emotion curve.` })

    startPipeline()
    simulatorRef.current?.start()
  }

  function handleStyleConfirm(selections: StyleSelections) {
    const parts = [selections.style, selections.mood, selections.genre, selections.palette].filter(Boolean)
    addUserMessage(`Style: ${parts.join(', ')}`)
    advanceToState('character_setup')
  }

  function handleCharacterConfirm(ids: string[]) {
    addUserMessage(`Selected ${ids.length} character${ids.length > 1 ? 's' : ''}`)
    advanceToState('storyline_generating')

    // Now resolve the deferred QG1 gate so pipeline advances to L2
    if (deferredGateRef.current === 'QG1') {
      resolvePipelineGate('QG1', 'pass')
    }
    // Storyline loading for 3s then L2 gate will fire (storyline_review)
  }

  function handleSend(message: string) {
    // Intercept demo track selection from suggestions
    if (journeyStateRef.current === 'upload') {
      const trackMap: Record<string, number> = {
        'Use Cosmic Love Story demo': 0,
        'Use Neon City Nights demo': 1,
        'Use Ocean Dreams demo': 2,
      }
      const idx = trackMap[message]
      if (idx !== undefined) {
        handleTrackSelect(idx)
        return
      }
      // Any other message in upload state — treat as upload action
      addUserMessage(message)
      handleTrackSelect(0)
      return
    }

    addUserMessage(message)

    const regenMatch = message.match(/regenerate\s+scene\s+(\d+)/i)
    if (regenMatch) {
      const sceneIndex = parseInt(regenMatch[1], 10) - 1
      const scene = mockProjects[projectIndex].scenes[sceneIndex]
      if (scene) {
        streamChat(buildSceneRegenResponse(sceneIndex, scene))
        setTimeout(() => streamChat(buildSceneRegenCompleteResponse(sceneIndex)), 3000)
        return
      }
    }

    streamChat(buildMonitorFreeformResponse(journeyStateRef.current))
  }

  function handleAction(action: string) {
    const currentState = journeyStateRef.current

    if (action === 'approve' && pendingGateId) {
      const gate = pendingGateId
      const stateConfig = JOURNEY_STATES[currentState]

      // For analysis_review: don't resolve pipeline gate yet — go to style_selection
      if (currentState === 'analysis_review') {
        streamChat({ text: 'Approved! Now let\'s set up the creative direction.' })
        advanceJourneyState('style_selection')
        streamChat(getResponse('style_selection'))
        // Don't resolve pipeline gate — defer until character setup is done
        return
      }

      // For all other gates: resolve the pipeline gate and advance
      resolvePipelineGate(gate, 'pass')
      streamChat({ text: 'Approved! Advancing to the next stage.' })

      const nextState = stateConfig?.nextStateOnApprove
      if (nextState) {
        // For states with loading intermediates, show loading first
        if (nextState === 'storyboard_generating' || nextState === 'video_generating') {
          advanceJourneyState(nextState)
          streamChat(getResponse(nextState))
        } else if (nextState === 'editing') {
          // Show editing loading, then pipeline will fire QG5
          journeyStateRef.current = 'editing'
          setJourneyState('editing')
          setViewHint('edit_loading')
          setSuggestions(JOURNEY_STATES.editing.suggestions)
          streamChat(getResponse('editing'))
        } else {
          advanceJourneyState(nextState)
        }
      }
    } else if (action === 'revise' && pendingGateId) {
      resolvePipelineGate(pendingGateId, 'revise')
      streamChat({ text: 'Revision requested. Re-running this stage with adjustments.' })
    } else if (action.startsWith('regenerate_scene_')) {
      const sceneIndex = parseInt(action.replace('regenerate_scene_', ''), 10)
      const scene = mockProjects[projectIndex].scenes[sceneIndex]
      if (!scene) return
      streamChat(buildSceneRegenResponse(sceneIndex, scene))
      setTimeout(() => streamChat(buildSceneRegenCompleteResponse(sceneIndex)), 3000)
    } else if (action === 'show_regen_options') {
      setSuggestions(JOURNEY_STATES.video_review.suggestions)
    } else if (action === 'download') {
      streamChat({ text: 'Preparing download — YouTube, TikTok, and Instagram formats. Ready in a moment!' })
    } else if (action === 'new_project') {
      resetPipeline()
      clearMessages()
      journeyStateRef.current = 'upload'
      setJourneyState('upload')
      setViewHint('upload')
      setSuggestions(JOURNEY_STATES.upload.suggestions)
      setPendingGateId(null)
      deferredGateRef.current = null
      simulatorRef.current?.stop()
      const sim = new PipelineSimulator()
      simulatorRef.current = sim
      sim.emitter.on('*', handlePipelineEvent)
      setTimeout(() => streamChat(getResponse('upload')), 300)
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="flex-1 overflow-hidden">
        <MonitorLayout
          onSend={handleSend}
          onAction={handleAction}
          suggestions={suggestions}
          viewHint={viewHint}
          journeyState={journeyState}
          projectIndex={projectIndex}
          onTrackSelect={handleTrackSelect}
          onStyleConfirm={handleStyleConfirm}
          onCharacterConfirm={handleCharacterConfirm}
        />
      </div>
      <PipelineProgressBar layers={layers} currentLayerId={currentLayerId} />
    </div>
  )
}

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { usePipelineStore } from '@/lib/pipeline/store'
import { useChatStore } from '@/lib/chat/store'
import { PipelineSimulator } from '@/lib/pipeline/simulator'
import { streamResponse, addUserMessage } from '@/lib/chat/simulator'
import { DockLayout } from '@/components/dock/dock-layout'
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

export type ConsoleEntryType = {
  id: string
  timestamp: string
  type: 'log' | 'gate'
  agentName?: string
  agentType?: string
  message: string
  gateId?: QualityGateId
  gateStatus?: 'pending' | 'approved' | 'revised'
}

let entryCounter = 0

const scenes = mockProjects[0].scenes

export default function DockPage() {
  const [entries, setEntries] = useState<ConsoleEntryType[]>([])
  const [chatOpen, setChatOpen] = useState(false)
  const [consoleCollapsed, setConsoleCollapsed] = useState(false)
  const [journeyState, setJourneyState] = useState<JourneyStateId>('welcome')
  const [suggestions, setSuggestions] = useState<ChatSuggestion[]>([])

  const simulatorRef = useRef<PipelineSimulator | null>(null)
  const startTimeRef = useRef<number>(Date.now())
  const journeyStateRef = useRef<JourneyStateId>('welcome')
  const cancelStreamRef = useRef<(() => void) | null>(null)
  const pendingGateRef = useRef<QualityGateId | null>(null)

  const resetPipeline = usePipelineStore((s) => s.resetPipeline)
  const startPipeline = usePipelineStore((s) => s.startPipeline)
  const setLayerStatus = usePipelineStore((s) => s.setLayerStatus)
  const setLayerProgress = usePipelineStore((s) => s.setLayerProgress)
  const setCurrentLayer = usePipelineStore((s) => s.setCurrentLayer)
  const clearMessages = useChatStore((s) => s.clearMessages)

  function elapsed(): string {
    const s = Math.floor((Date.now() - startTimeRef.current) / 1000)
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  function addEntry(entry: Omit<ConsoleEntryType, 'id'>) {
    setEntries((prev) => [...prev, { ...entry, id: `entry-${++entryCounter}` }])
  }

  function updateGateEntry(gateId: QualityGateId, gateStatus: 'approved' | 'revised') {
    setEntries((prev) =>
      prev.map((e) =>
        e.type === 'gate' && e.gateId === gateId ? { ...e, gateStatus } : e
      )
    )
  }

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

  const handleAction = useCallback((action: string) => {
    const currentState = journeyStateRef.current
    const sim = simulatorRef.current

    if (action === 'approve') {
      const pendingGate = pendingGateRef.current
      if (pendingGate && sim) {
        sim.resolveGate(pendingGate, 'pass')
        updateGateEntry(pendingGate, 'approved')
        const nextState = JOURNEY_STATES[currentState]?.nextStateOnApprove
        if (nextState) setJourneyStateSync(nextState)
        pendingGateRef.current = null
      }
    } else if (action === 'revise') {
      const pendingGate = pendingGateRef.current
      if (pendingGate && sim) {
        sim.resolveGate(pendingGate, 'revise')
        updateGateEntry(pendingGate, 'revised')
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
      streamChat(getJourneyResponse('welcome'))
    } else if (action.startsWith('user_message:')) {
      streamChat(buildFreeformResponse(currentState))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleGateResolve = useCallback((gateId: QualityGateId, result: 'pass' | 'revise') => {
    const sim = simulatorRef.current
    if (!sim) return
    sim.resolveGate(gateId, result)
    updateGateEntry(gateId, result === 'pass' ? 'approved' : 'revised')
    if (result === 'pass') {
      const currentState = journeyStateRef.current
      const nextState = JOURNEY_STATES[currentState]?.nextStateOnApprove
      if (nextState) setJourneyStateSync(nextState)
    }
    pendingGateRef.current = null
  }, [])

  useEffect(() => {
    resetPipeline()
    clearMessages()

    const sim = new PipelineSimulator()
    simulatorRef.current = sim
    startTimeRef.current = Date.now()

    addEntry({
      type: 'log',
      agentName: 'pipeline',
      agentType: 'system',
      message: 'Pipeline starting...',
      timestamp: elapsed(),
    })

    // Stream welcome message on mount
    setTimeout(() => {
      streamChat(getJourneyResponse('welcome'))
      setSuggestions(JOURNEY_STATES['welcome'].suggestions)
    }, 600)

    sim.emitter.on('layer_start', (event) => {
      if (event.layerId) {
        setLayerStatus(event.layerId, 'active')
        setCurrentLayer(event.layerId)
        addEntry({
          type: 'log',
          agentName: 'pipeline',
          agentType: 'system',
          message: `Starting ${event.message ?? event.layerId}`,
          timestamp: elapsed(),
        })
      }
    })

    sim.emitter.on('layer_progress', (event) => {
      if (event.layerId && event.progress !== undefined) {
        setLayerProgress(event.layerId, event.progress)
      }
    })

    sim.emitter.on('activity_log', (event) => {
      if (event.data) {
        const d = event.data as { agentName: string; agentType: string }
        addEntry({
          type: 'log',
          agentName: d.agentName,
          agentType: d.agentType,
          message: event.message ?? 'processing',
          timestamp: elapsed(),
        })
      }
    })

    sim.emitter.on('gate_pending', (event) => {
      if (event.gateId) {
        pendingGateRef.current = event.gateId
        addEntry({
          type: 'gate',
          gateId: event.gateId,
          message: event.message ?? '',
          gateStatus: 'pending',
          timestamp: elapsed(),
        })

        const reviewState = GATE_TO_REVIEW_STATE[event.gateId]
        if (reviewState) {
          setJourneyStateSync(reviewState)
          const response = getJourneyResponse(reviewState)
          // Inject narration console entry
          addEntry({
            type: 'log',
            agentName: 'ai-producer',
            agentType: 'journey',
            message: response.text,
            timestamp: elapsed(),
          })
          // Stream rich chat response
          streamChat(response)
          setSuggestions(JOURNEY_STATES[reviewState].suggestions)
        }
      }
    })

    sim.emitter.on('gate_resolved', (event) => {
      if (event.layerId) setLayerStatus(event.layerId, 'complete')
      if (event.gateId) {
        addEntry({
          type: 'log',
          agentName: 'pipeline',
          agentType: 'system',
          message: `${event.gateId} passed — advancing to next layer`,
          timestamp: elapsed(),
        })
      }
    })

    sim.emitter.on('pipeline_complete', () => {
      setLayerStatus('L5_POSTPRODUCTION', 'complete')
      addEntry({
        type: 'log',
        agentName: 'pipeline',
        agentType: 'system',
        message: 'Pipeline complete — video ready',
        timestamp: elapsed(),
      })
      setJourneyStateSync('complete')
      setSuggestions([])
      streamChat(getJourneyResponse('complete'))
    })

    startPipeline()
    sim.start()

    return () => sim.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <DockLayout
      entries={entries}
      onGateResolve={handleGateResolve}
      consoleCollapsed={consoleCollapsed}
      onConsoleToggle={() => setConsoleCollapsed((c) => !c)}
      chatOpen={chatOpen}
      onChatToggle={() => setChatOpen((o) => !o)}
      onAction={handleAction}
      suggestions={suggestions}
    />
  )
}

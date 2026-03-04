'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { usePipelineStore } from '@/lib/pipeline/store'
import { useChatStore } from '@/lib/chat/store'
import { PipelineSimulator } from '@/lib/pipeline/simulator'
import { CanvasViewport } from '@/components/canvas/canvas-viewport'
import { CanvasControls } from '@/components/canvas/canvas-controls'
import { CanvasLayout } from '@/components/canvas/canvas-layout'
import { FloatingCommandBar } from '@/components/canvas/floating-command-bar'
import { CanvasGateCard } from '@/components/canvas/canvas-gate-card'
import {
  JOURNEY_STATES,
  GATE_TO_REVIEW_STATE,
  getJourneyResponse,
  type JourneyStateId,
} from '@/lib/journey/orchestrator'
import type { QualityGateId } from '@/lib/pipeline/types'
import type { ChatSuggestion } from '@/lib/chat/types'

const DEFAULT_ZOOM = 0.6
const DEFAULT_PAN_X = 40
const DEFAULT_PAN_Y = 60

export default function CanvasPage() {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const [panX, setPanX] = useState(DEFAULT_PAN_X)
  const [panY, setPanY] = useState(DEFAULT_PAN_Y)

  const simulatorRef = useRef<PipelineSimulator | null>(null)
  const journeyStateRef = useRef<JourneyStateId>('welcome')

  const [journeyState, setJourneyState] = useState<JourneyStateId>('welcome')
  const [pendingGate, setPendingGate] = useState<{ gateId: QualityGateId; message: string } | null>(null)
  const [suggestions, setSuggestions] = useState<ChatSuggestion[]>([])

  const { resetPipeline, setLayerStatus, setLayerProgress, addArtifact, addActivity, resolveGate } = usePipelineStore()
  const { clearMessages } = useChatStore()

  useEffect(() => {
    resetPipeline()
    clearMessages()

    const sim = new PipelineSimulator()
    simulatorRef.current = sim

    // Wire pipeline events to store
    const off = sim.emitter.on('*', (event) => {
      switch (event.type) {
        case 'layer_start':
          if (event.layerId) setLayerStatus(event.layerId, 'active')
          break
        case 'layer_progress':
          if (event.layerId && event.progress !== undefined)
            setLayerProgress(event.layerId, event.progress)
          break
        case 'artifact_created':
          if (event.layerId && event.data)
            addArtifact(event.layerId, event.data as Parameters<typeof addArtifact>[1])
          break
        case 'activity_log':
          if (event.layerId && event.data) {
            const d = event.data as { agentName: string; agentType: 'agent' | 'mcp' | 'skill' | 'service'; status: string }
            addActivity({
              id: `act-${Date.now()}-${Math.random()}`,
              agentName: d.agentName,
              agentType: d.agentType,
              layerId: event.layerId,
              action: 'processing',
              status: d.status as 'running',
              timestamp: new Date().toISOString(),
              message: event.message ?? '',
            })
          }
          break
        case 'gate_resolved':
          if (event.gateId) {
            resolveGate(event.gateId, 'pass')
            setPendingGate(null)
          }
          break
        case 'pipeline_complete':
          setJourneyState('complete')
          journeyStateRef.current = 'complete'
          setSuggestions([])
          break
      }
    })

    // Manual gate resolution — show gate card instead of auto-resolving
    sim.emitter.on('gate_pending', (event) => {
      if (event.gateId) {
        const reviewState = GATE_TO_REVIEW_STATE[event.gateId]
        if (reviewState) {
          if (event.layerId) setLayerStatus(event.layerId, 'complete')
          setPendingGate({ gateId: event.gateId as QualityGateId, message: event.message ?? '' })
          setJourneyState(reviewState)
          journeyStateRef.current = reviewState
          setSuggestions(JOURNEY_STATES[reviewState].suggestions)
        }
      }
    })

    return () => {
      off()
      sim.stop()
      simulatorRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleGateResolve = useCallback((result: 'pass' | 'revise') => {
    if (!pendingGate || !simulatorRef.current) return
    simulatorRef.current.resolveGate(pendingGate.gateId, result)
    if (result === 'pass') {
      const state = JOURNEY_STATES[journeyStateRef.current]
      if (state.nextStateOnApprove) {
        setJourneyState(state.nextStateOnApprove)
        journeyStateRef.current = state.nextStateOnApprove
        setSuggestions(JOURNEY_STATES[state.nextStateOnApprove].suggestions)
      }
    }
    setPendingGate(null)
  }, [pendingGate])

  const handleZoomIn = useCallback(() => setZoom((z) => Math.min(2.0, parseFloat((z + 0.1).toFixed(1)))), [])
  const handleZoomOut = useCallback(() => setZoom((z) => Math.max(0.3, parseFloat((z - 0.1).toFixed(1)))), [])
  const handleFitAll = useCallback(() => { setZoom(DEFAULT_ZOOM); setPanX(DEFAULT_PAN_X); setPanY(DEFAULT_PAN_Y) }, [])
  const handlePanChange = useCallback((x: number, y: number) => { setPanX(x); setPanY(y) }, [])

  const journeyTextForGate = pendingGate ? getJourneyResponse(journeyStateRef.current).text : ''

  return (
    <div className="relative w-full h-full">
      {/* Back button */}
      <Link
        href="/"
        className="fixed top-4 left-4 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card/80 backdrop-blur-md border border-border text-sm text-muted-foreground hover:text-foreground transition-colors shadow-lg"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back</span>
      </Link>

      {/* Gate review card — top-center, appears when gate is pending */}
      <CanvasGateCard
        gate={pendingGate}
        journeyText={journeyTextForGate}
        onResolve={handleGateResolve}
      />

      {/* Canvas viewport — fills entire area */}
      <CanvasViewport
        zoom={zoom}
        panX={panX}
        panY={panY}
        onZoomChange={setZoom}
        onPanChange={handlePanChange}
        className="absolute inset-0"
      >
        <CanvasLayout />
      </CanvasViewport>

      {/* Controls floating top-right */}
      <CanvasControls
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitAll={handleFitAll}
      />

      {/* Floating command bar bottom-center */}
      <FloatingCommandBar
        simulator={simulatorRef.current}
        journeyState={journeyState}
        suggestions={suggestions}
        onCommand={(cmd) => {
          const lower = cmd.toLowerCase()
          if (lower === 'approve' && pendingGate) {
            handleGateResolve('pass')
          } else if ((lower === 'revise' || lower === 'revision') && pendingGate) {
            handleGateResolve('revise')
          }
        }}
      />
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { ControlHeader } from '@/components/control/control-header'
import { ControlDashboard } from '@/components/control/control-dashboard'
import { EventLog } from '@/components/control/event-log'
import { GateApprovalModal } from '@/components/control/gate-approval-modal'
import { PipelineSimulator } from '@/lib/pipeline/simulator'
import { usePipelineStore } from '@/lib/pipeline/store'
import { QUALITY_GATES } from '@/lib/pipeline/constants'
import type { PipelineEvent, QualityGateId } from '@/lib/pipeline/types'
import {
  JOURNEY_STATES,
  GATE_TO_REVIEW_STATE,
  getJourneyResponse,
  type JourneyStateId,
} from '@/lib/journey/orchestrator'

function createJourneyEvent(message: string): PipelineEvent {
  return {
    type: 'activity_log' as const,
    message,
    layerId: undefined,
    gateId: undefined,
    data: { isJourney: true },
  }
}

export default function ControlPage() {
  const [events, setEvents] = useState<PipelineEvent[]>([])
  const [pendingGate, setPendingGate] = useState<QualityGateId | null>(null)
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [journeyState, setJourneyState] = useState<JourneyStateId>('welcome')

  const simulatorRef = useRef<PipelineSimulator | null>(null)
  const journeyStateRef = useRef<JourneyStateId>('welcome')
  const store = usePipelineStore

  function setJourneyStateSync(stateId: JourneyStateId) {
    journeyStateRef.current = stateId
    setJourneyState(stateId)
  }

  // Wire up store actions
  const {
    resetPipeline, startPipeline, setCurrentLayer,
    setLayerStatus, setLayerProgress, addArtifact, addActivity, resolveGate: storeResolveGate,
  } = store.getState()

  useEffect(() => {
    resetPipeline()
    const sim = new PipelineSimulator()
    simulatorRef.current = sim

    // Subscribe to all events
    sim.emitter.on('*', (event) => {
      setEvents((prev) => [...prev, event])
    })

    sim.emitter.on('layer_start', (event) => {
      if (!event.layerId) return
      setLayerStatus(event.layerId, 'active')
      setCurrentLayer(event.layerId)
    })

    sim.emitter.on('layer_progress', (event) => {
      if (!event.layerId || event.progress == null) return
      setLayerProgress(event.layerId, event.progress)
    })

    sim.emitter.on('artifact_created', (event) => {
      if (!event.layerId || !event.data) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      addArtifact(event.layerId, event.data as any)
    })

    sim.emitter.on('activity_log', (event) => {
      if (!event.layerId || !event.data) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = event.data as any
      addActivity({
        id: `act-${Date.now()}-${Math.random()}`,
        agentName: d.agentName ?? 'unknown',
        agentType: d.agentType ?? 'agent',
        layerId: event.layerId,
        action: event.message ?? '',
        status: d.status ?? 'running',
        timestamp: new Date().toISOString(),
        message: event.message ?? '',
      })
    })

    sim.emitter.on('gate_pending', (event) => {
      if (!event.gateId) return
      setPendingGate(event.gateId)

      const reviewState = GATE_TO_REVIEW_STATE[event.gateId]
      if (reviewState) {
        setJourneyStateSync(reviewState)
        const response = getJourneyResponse(reviewState)
        setEvents((prev) => [...prev, createJourneyEvent(response.text)])
      }
    })

    sim.emitter.on('gate_resolved', (event) => {
      if (!event.gateId) return
      setPendingGate(null)
      // Mark previous layer complete
      const gateDef = QUALITY_GATES.find((g) => g.id === event.gateId)
      if (gateDef) setLayerStatus(gateDef.before, 'complete')
    })

    sim.emitter.on('pipeline_complete', () => {
      // Mark last layer complete
      setLayerStatus('L5_POSTPRODUCTION', 'complete')
      store.setState({ currentState: 'complete', isRunning: false })
      setJourneyStateSync('complete')
      const response = getJourneyResponse('complete')
      setEvents((prev) => [...prev, createJourneyEvent(response.text)])
    })

    // Start
    startPipeline()
    setStartedAt(Date.now())
    sim.start()

    return () => {
      sim.stop()
      simulatorRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleStop() {
    simulatorRef.current?.stop()
    resetPipeline()
    setEvents([])
    setStartedAt(null)
    setPendingGate(null)
    setJourneyStateSync('welcome')
  }

  function handleGateResolve(gateId: QualityGateId, result: 'pass' | 'revise') {
    storeResolveGate(gateId, result)
    simulatorRef.current?.resolveGate(gateId, result)
    setPendingGate(null)
    if (result === 'pass') {
      const currentState = journeyStateRef.current
      const nextState = JOURNEY_STATES[currentState]?.nextStateOnApprove
      if (nextState) setJourneyStateSync(nextState)
    }
  }

  // Suppress unused state warning — journeyState drives ref used in handlers
  void journeyState

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-zinc-950 text-white">
      <ControlHeader onStop={handleStop} startedAt={startedAt} />
      <div className="flex-1 min-h-0">
        <ControlDashboard />
      </div>
      <EventLog events={events} />

      <GateApprovalModal
        open={pendingGate !== null}
        gateId={pendingGate}
        onResolve={handleGateResolve}
        onClose={() => setPendingGate(null)}
      />
    </div>
  )
}

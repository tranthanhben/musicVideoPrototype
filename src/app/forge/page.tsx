'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { PipelineSimulator } from '@/lib/pipeline/simulator'
import { usePipelineStore } from '@/lib/pipeline/store'
import { ForgeLayout } from '@/components/forge/forge-layout'
import type { ForgeAnnotation } from '@/components/forge/forge-annotation-card'
import type { PipelineLayerId, QualityGateId } from '@/lib/pipeline/types'
import {
  JOURNEY_STATES,
  GATE_TO_REVIEW_STATE,
  getJourneyResponse,
  type JourneyStateId,
} from '@/lib/journey/orchestrator'

const LAYER_IDS: PipelineLayerId[] = [
  'L1_INPUT', 'L2_CREATIVE', 'L3_PREPRODUCTION', 'L4_PRODUCTION', 'L5_POSTPRODUCTION',
]

const LAYER_TO_PROGRESS_STATE: Record<string, JourneyStateId> = {
  L1_INPUT: 'analyzing',
  L2_CREATIVE: 'creative',
  L3_PREPRODUCTION: 'storyboard',
  L4_PRODUCTION: 'generating',
  L5_POSTPRODUCTION: 'editing',
}

const GATE_TO_LAYER: Record<string, PipelineLayerId> = {
  QG1: 'L1_INPUT', QG2: 'L2_CREATIVE', QG3: 'L3_PREPRODUCTION',
  QG4: 'L4_PRODUCTION', QG5: 'L5_POSTPRODUCTION',
}

let annotationCounter = 0

export default function ForgePage() {
  const { resetPipeline, startPipeline, setLayerStatus, setLayerProgress, setCurrentLayer } =
    usePipelineStore()

  const simulatorRef = useRef<PipelineSimulator | null>(null)
  const journeyStateRef = useRef<JourneyStateId>('welcome')

  const [currentStep, setCurrentStep] = useState(0)
  const [layerComplete, setLayerComplete] = useState<Record<string, boolean>>({})
  const [annotations, setAnnotations] = useState<ForgeAnnotation[]>([])
  const [tooltipText, setTooltipText] = useState('')
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const [journeyState, setJourneyState] = useState<JourneyStateId>('welcome')
  const [pendingGateId, setPendingGateId] = useState<QualityGateId | null>(null)

  const addAnnotation = useCallback((ann: Omit<ForgeAnnotation, 'id'>) => {
    annotationCounter++
    setAnnotations((prev) => [
      ...prev.slice(-8),
      { ...ann, id: `ann-${annotationCounter}` },
    ])
  }, [])

  const handleTooltipDismiss = useCallback(() => {
    setTooltipVisible(false)
  }, [])

  useEffect(() => {
    resetPipeline()
    const sim = new PipelineSimulator()
    simulatorRef.current = sim

    sim.emitter.on('layer_start', (event) => {
      if (event.layerId) {
        setLayerStatus(event.layerId, 'active')
        setCurrentLayer(event.layerId)

        const progressState = LAYER_TO_PROGRESS_STATE[event.layerId]
        if (progressState) {
          const response = getJourneyResponse(progressState)
          const text = response.text
          setTooltipText(text.slice(0, 200) + (text.length > 200 ? '...' : ''))
          setTooltipVisible(true)
        }
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
        addAnnotation({
          agentName: d.agentName,
          agentType: d.agentType,
          message: event.message ?? '',
        })
      }
    })

    sim.emitter.on('gate_pending', (event) => {
      if (event.gateId) {
        const reviewState = GATE_TO_REVIEW_STATE[event.gateId]
        if (reviewState) {
          setPendingGateId(event.gateId as QualityGateId)
          setJourneyState(reviewState)
          journeyStateRef.current = reviewState

          const response = getJourneyResponse(reviewState)
          const text = response.text
          setTooltipText(text.slice(0, 200) + (text.length > 200 ? '...' : ''))
          setTooltipVisible(true)

          // Mark layer complete in the store
          const layerId = GATE_TO_LAYER[event.gateId]
          if (layerId) {
            setLayerComplete((prev) => ({ ...prev, [layerId]: true }))
          }
        }
      }
    })

    sim.emitter.on('gate_resolved', (event) => {
      if (event.gateId) {
        const layerId = GATE_TO_LAYER[event.gateId]
        if (layerId) {
          setLayerStatus(layerId, 'complete')
        }
      }
    })

    sim.emitter.on('pipeline_complete', () => {
      setLayerStatus('L5_POSTPRODUCTION', 'complete')
      setLayerComplete((prev) => ({ ...prev, L5_POSTPRODUCTION: true }))
      setJourneyState('complete')
      journeyStateRef.current = 'complete'
    })

    startPipeline()
    sim.start()

    return () => sim.stop()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleContinue = useCallback(() => {
    if (pendingGateId && simulatorRef.current) {
      simulatorRef.current.resolveGate(pendingGateId, 'pass')
      setPendingGateId(null)

      const state = JOURNEY_STATES[journeyStateRef.current]
      if (state.nextStateOnApprove) {
        setJourneyState(state.nextStateOnApprove)
        journeyStateRef.current = state.nextStateOnApprove
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, LAYER_IDS.length - 1))
  }, [pendingGateId])

  const handleRevise = useCallback(() => {
    if (pendingGateId && simulatorRef.current) {
      simulatorRef.current.resolveGate(pendingGateId, 'revise')
      setPendingGateId(null)
      setTooltipText('Revising this stage — re-running with adjusted parameters...')
      setTooltipVisible(true)
    }
  }, [pendingGateId])

  const currentLayerId = LAYER_IDS[currentStep]
  const isCurrentComplete = !!layerComplete[currentLayerId]
  const gateReady = pendingGateId !== null && isCurrentComplete

  return (
    <ForgeLayout
      currentStep={currentStep}
      layerComplete={layerComplete}
      annotations={annotations}
      tooltipText={tooltipText}
      tooltipVisible={tooltipVisible}
      onContinue={handleContinue}
      onTooltipDismiss={handleTooltipDismiss}
      onRevise={handleRevise}
      gateReady={gateReady}
    />
  )
}

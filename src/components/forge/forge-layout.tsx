'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ForgeStepIndicator } from './forge-step-indicator'
import { SpotlightTooltip } from './spotlight-tooltip'
import { ForgeAnnotationCard, type ForgeAnnotation } from './forge-annotation-card'
import { ForgeContinueButton } from './forge-continue-button'
import { ForgeStepUnderstand } from './forge-step-understand'
import { ForgeStepEnvision } from './forge-step-envision'
import { ForgeStepPlan } from './forge-step-plan'
import { ForgeStepCreate } from './forge-step-create'
import { ForgeStepPolish } from './forge-step-polish'

const STEP_NAMES = ['Analyze', 'Envision', 'Plan', 'Create', 'Polish']

interface ForgeLayoutProps {
  currentStep: number
  layerComplete: Record<string, boolean>
  annotations: ForgeAnnotation[]
  tooltipText: string
  tooltipVisible: boolean
  onContinue: () => void
  onTooltipDismiss: () => void
  onRevise?: () => void
  gateReady?: boolean
}

export function ForgeLayout({
  currentStep,
  layerComplete,
  annotations,
  tooltipText,
  tooltipVisible,
  onContinue,
  onTooltipDismiss,
  onRevise,
  gateReady,
}: ForgeLayoutProps) {
  const LAYER_IDS = ['L1_INPUT', 'L2_CREATIVE', 'L3_PREPRODUCTION', 'L4_PRODUCTION', 'L5_POSTPRODUCTION']
  const completedSteps = LAYER_IDS.map((id) => !!layerComplete[id])
  const isCurrentComplete = completedSteps[currentStep]
  const isFinal = currentStep === 4
  const nextStepName = STEP_NAMES[currentStep] ?? 'Done'

  // When gate is ready (pending gate + layer done), unlock continue
  const locked = gateReady ? false : !isCurrentComplete

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
        <Link href="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <span className="text-sm font-semibold text-foreground">Cosmic Love Story</span>
        <ForgeStepIndicator currentStep={currentStep} completedSteps={completedSteps} />
      </div>

      {/* Main content */}
      <div className="relative flex-1 overflow-y-auto">
        <SpotlightTooltip
          text={tooltipText}
          visible={tooltipVisible}
          onDismiss={onTooltipDismiss}
        />

        <div className="py-8">
          {currentStep === 0 && <ForgeStepUnderstand />}
          {currentStep === 1 && <ForgeStepEnvision />}
          {currentStep === 2 && <ForgeStepPlan />}
          {currentStep === 3 && <ForgeStepCreate />}
          {currentStep === 4 && <ForgeStepPolish />}
        </div>

        <ForgeAnnotationCard annotations={annotations} />
      </div>

      {/* Bottom continue button */}
      <ForgeContinueButton
        locked={locked}
        nextStepName={nextStepName}
        onContinue={onContinue}
        isFinal={isFinal}
        onRevise={onRevise}
        gateReady={gateReady}
      />
    </div>
  )
}

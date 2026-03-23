'use client'

import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { FlowStepIndicator } from '@/components/flow-v4/flow-step-indicator'
import { MvTypeStep } from '@/components/flow-v4/steps/mv-type-step'
import { SetupStep } from '@/components/flow-v4/steps/setup-step'
import { UnifiedWorkspace } from '@/components/flow-v4/steps/unified-workspace'
import { EditProjectModal } from '@/components/flow-v4/product/edit-project-modal'
import { AssetsManager } from '@/components/flow-v4/product/assets-manager'
import { CreditsSpendingPanel } from '@/components/flow-v4/product/credits-spending-panel'
import { ProjectInfoPanel, type ProjectMeta } from '@/components/flow-v4/product/project-info-panel'
import { FLOW_STEPS, type FlowStep, type FlowConfig, type MvType, type RenderMode } from '@/lib/flow-v4/types'
import { calculateProjectCost } from '@/lib/flow-v4/cost-calculator'
import { cn } from '@/lib/utils'
import type { MockScene } from '@/lib/mock/types'

const variants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
}

// Steps 3-4-5 are unified under the workspace — use a stable key
const isUnifiedStep = (step: FlowStep) => step === 'analysis' || step === 'storyboard' || step === 'vfx_export'

const SCENE_IMAGES = [
  '/assets/scenes/scene-01-the-void.jpg', '/assets/scenes/scene-02-aria-reaching.jpg',
  '/assets/scenes/scene-03-crystal-ship.jpg', '/assets/scenes/scene-04-moon-dance.jpg',
  '/assets/scenes/scene-05-supernova-voice.jpg', '/assets/scenes/scene-06-saturn-embrace.jpg',
  '/assets/scenes/scene-07-comet-guitar.jpg', '/assets/scenes/scene-08-edge-of-universe.jpg',
]

const drawerScenes: MockScene[] = Array.from({ length: 8 }, (_, i) => ({
  id: `drawer-${i}`, index: i, subject: ['Singer', 'Couple', 'Dancer', 'Band', 'Woman', 'Man', 'Crowd', 'Singer'][i],
  action: '', environment: '', cameraAngle: '', cameraMovement: '', prompt: '', duration: 4, status: 'completed', takes: [],
  thumbnailUrl: SCENE_IMAGES[i],
}))

const MOCK_BALANCE = 1250

export default function FlowPage() {
  const [currentStep, setCurrentStep] = useState<FlowStep>('mv_type')
  const [projectName, setProjectName] = useState('Untitled Music Video')
  const [showSettings, setShowSettings] = useState(false)
  const [showAssets, setShowAssets] = useState(false)
  const [showCredits, setShowCredits] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [config, setConfig] = useState<FlowConfig>({
    mvType: 'full_mv' as MvType,
    trackIndex: null,
    prompt: '',
    mode: 'realistic',
    musicControl: 33,
    lyricsControl: 66,
    selectedConceptId: null,
  })

  const estimatedCost = calculateProjectCost(39)

  // Unified steps (storyboard/vfx_export) map to the 'analysis' entry in FLOW_STEPS
  const effectiveStep = isUnifiedStep(currentStep) ? 'analysis' : currentStep
  const currentIndex = FLOW_STEPS.findIndex((s) => s.key === effectiveStep)
  const isFirstStep = currentIndex === 0

  const goToStep = useCallback((step: FlowStep) => setCurrentStep(step), [])

  function nextStep() {
    if (currentIndex < FLOW_STEPS.length - 1) {
      setCurrentStep(FLOW_STEPS[currentIndex + 1].key)
    }
  }

  function prevStep() {
    if (currentIndex > 0) {
      if (isUnifiedStep(currentStep)) {
        setCurrentStep('setup')
      } else {
        setCurrentStep(FLOW_STEPS[currentIndex - 1].key)
      }
    }
  }

  function canContinue(): boolean {
    switch (currentStep) {
      case 'mv_type': return config.mvType !== null
      case 'setup': return config.trackIndex !== null && config.trackIndex >= 0
      default: return false
    }
  }

  const animationKey = isUnifiedStep(currentStep) ? 'workspace' : currentStep

  function renderStep() {
    switch (currentStep) {
      case 'mv_type':
        return (
          <MvTypeStep
            selected={config.mvType}
            onSelect={(type: MvType) => {
              setConfig((c) => ({ ...c, mvType: type }))
              setTimeout(() => setCurrentStep('setup'), 400)
            }}
          />
        )
      case 'setup':
        return (
          <SetupStep
            mvType={config.mvType ?? undefined}
            trackIndex={config.trackIndex}
            prompt={config.prompt}
            mode={config.mode}
            musicControl={config.musicControl}
            lyricsControl={config.lyricsControl}
            onTrackSelect={(idx: number) => setConfig((c) => ({ ...c, trackIndex: idx < 0 ? null : idx }))}
            onPromptChange={(prompt: string) => setConfig((c) => ({ ...c, prompt }))}
            onModeChange={(mode: RenderMode) => setConfig((c) => ({ ...c, mode }))}
            onMusicControlChange={(val: number) => setConfig((c) => ({ ...c, musicControl: val }))}
            onLyricsControlChange={(val: number) => setConfig((c) => ({ ...c, lyricsControl: val }))}
            onGenerate={() => setCurrentStep('analysis')}
          />
        )
      case 'analysis':
      case 'storyboard':
      case 'vfx_export':
        return (
          <UnifiedWorkspace
            trackIndex={config.trackIndex ?? 0}
            selectedConceptId={config.selectedConceptId}
            onConceptSelect={(id: string) => setConfig((c) => ({ ...c, selectedConceptId: id }))}
          />
        )
      default:
        return null
    }
  }

  const showContinue = currentStep === 'mv_type' && canContinue()

  const projectMeta: ProjectMeta = {
    name: projectName,
    mvType: config.mvType,
    renderMode: config.mode,
    duration: '3:24',
    bpm: 128,
    sceneCount: 39,
    estimatedRenderTime: '~12 min',
    createdAt: 'Mar 23, 2026',
    lastModified: 'Just now',
    quality: 'SD 480p',
    aspectRatio: '16:9',
    status: isUnifiedStep(currentStep) ? 'in_progress' : 'draft',
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <FlowStepIndicator
        currentStep={currentStep}
        onStepClick={goToStep}
        onBack={prevStep}
        isFirstStep={isFirstStep}
        estimatedCost={estimatedCost.total}
        costBreakdown={estimatedCost}
        projectName={projectName}
        onProjectNameChange={setProjectName}
        onSettingsClick={() => setShowSettings(true)}
        onAssetsClick={() => setShowAssets(true)}
        onCreditsClick={() => setShowCredits(true)}
        onInfoClick={() => setShowInfo(true)}
        balance={MOCK_BALANCE}
      />

      {/* Panels / Modals */}
      <EditProjectModal
        projectName={projectName}
        onSave={(data) => setProjectName(data.name)}
        open={showSettings}
        onOpenChange={setShowSettings}
      />

      <AssetsManager
        open={showAssets}
        onOpenChange={setShowAssets}
        scenes={drawerScenes}
      />

      <CreditsSpendingPanel
        open={showCredits}
        onOpenChange={setShowCredits}
        balance={MOCK_BALANCE}
        breakdown={estimatedCost}
      />

      <ProjectInfoPanel
        open={showInfo}
        onOpenChange={setShowInfo}
        meta={projectMeta}
        onNameChange={setProjectName}
        onSettingsClick={() => setShowSettings(true)}
      />

      {/* Main content */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={animationKey}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom navigation bar */}
      {!isUnifiedStep(currentStep) && (
        <div className="shrink-0 border-t border-border bg-card/80 backdrop-blur-sm px-6 py-3 flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={isFirstStep}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer',
              isFirstStep
                ? 'text-muted-foreground/40 cursor-not-allowed'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            )}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>

          <div className="flex items-center gap-1.5">
            {FLOW_STEPS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1 rounded-full transition-all',
                  i === currentIndex ? 'w-6 bg-primary' : i < currentIndex ? 'w-1.5 bg-green-500' : 'w-1.5 bg-muted',
                )}
              />
            ))}
          </div>

          {showContinue ? (
            <button
              onClick={nextStep}
              disabled={!canContinue()}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer',
                canContinue()
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed',
              )}
            >
              Continue
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <div className="w-20" />
          )}
        </div>
      )}
    </div>
  )
}

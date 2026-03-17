'use client'

import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FlowStepIndicator } from '@/components/flow-v3/flow-step-indicator'
import { MvTypeStep } from '@/components/flow-v3/steps/mv-type-step'
import { SetupStep } from '@/components/flow-v3/steps/setup-step'
import { AnalysisStep } from '@/components/flow-v3/steps/analysis-step'
import { StoryboardStep } from '@/components/flow-v3/steps/storyboard-step'
import { VfxExportStep } from '@/components/flow-v3/steps/vfx-export-step'
import { EditProjectModal } from '@/components/flow-v3/product/edit-project-modal'
import { ProjectAssetsDrawer } from '@/components/flow-v3/product/project-assets-drawer'
import { FLOW_STEPS, type FlowStep, type FlowConfig, type MvType, type RenderMode } from '@/lib/flow-v3/types'
import { calculateProjectCost } from '@/lib/flow-v3/cost-calculator'
import type { MockScene } from '@/lib/mock/types'

const variants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
}

export default function FlowPage() {
  const [currentStep, setCurrentStep] = useState<FlowStep>('mv_type')
  const [projectName, setProjectName] = useState('Untitled Music Video')
  const [showSettings, setShowSettings] = useState(false)
  const [showAssets, setShowAssets] = useState(false)
  const [config, setConfig] = useState<FlowConfig>({
    mvType: 'full_mv' as MvType,
    trackIndex: null,
    prompt: '',
    mode: 'realistic',
    musicControl: 33,
    lyricsControl: 66,
    selectedConceptId: null,
    model: 'cremi-signature',
    quality: '480p',
    aspectRatio: '16:9',
  })

  const estimatedCost = calculateProjectCost({ model: config.model, quality: config.quality, sceneCount: 39 })

  // Mock scenes for assets drawer (uses real scene images from public/assets)
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
  const currentIndex = FLOW_STEPS.findIndex((s) => s.key === currentStep)
  const isFirstStep = currentIndex === 0

  const goToStep = useCallback((step: FlowStep) => setCurrentStep(step), [])
  function nextStep() { if (currentIndex < FLOW_STEPS.length - 1) setCurrentStep(FLOW_STEPS[currentIndex + 1].key) }
  function prevStep() { if (currentIndex > 0) setCurrentStep(FLOW_STEPS[currentIndex - 1].key) }

  function renderStep() {
    switch (currentStep) {
      case 'mv_type':
        return <MvTypeStep selected={config.mvType} onSelect={(type: MvType) => { setConfig((c) => ({ ...c, mvType: type })); setTimeout(() => setCurrentStep('setup'), 400) }} />
      case 'setup':
        return (
          <SetupStep
            mvType={config.mvType ?? undefined} trackIndex={config.trackIndex} prompt={config.prompt}
            mode={config.mode} musicControl={config.musicControl} lyricsControl={config.lyricsControl}
            model={config.model} quality={config.quality} aspectRatio={config.aspectRatio}
            onTrackSelect={(idx: number) => setConfig((c) => ({ ...c, trackIndex: idx < 0 ? null : idx }))}
            onPromptChange={(prompt: string) => setConfig((c) => ({ ...c, prompt }))}
            onModeChange={(mode: RenderMode) => setConfig((c) => ({ ...c, mode }))}
            onMusicControlChange={(val: number) => setConfig((c) => ({ ...c, musicControl: val }))}
            onLyricsControlChange={(val: number) => setConfig((c) => ({ ...c, lyricsControl: val }))}
            onModelChange={(model: string) => setConfig((c) => ({ ...c, model }))}
            onQualityChange={(quality: string) => setConfig((c) => ({ ...c, quality }))}
            onAspectRatioChange={(aspectRatio: string) => setConfig((c) => ({ ...c, aspectRatio }))}
            onGenerate={nextStep}
          />
        )
      case 'analysis':
        return <AnalysisStep trackIndex={config.trackIndex ?? 0} selectedConceptId={config.selectedConceptId} onConceptSelect={(id: string) => setConfig((c) => ({ ...c, selectedConceptId: id }))} onAnalysisComplete={nextStep} />
      case 'storyboard':
        return <StoryboardStep trackIndex={config.trackIndex ?? 0} onContinue={nextStep} model={config.model} quality={config.quality} />
      case 'vfx_export':
        return <VfxExportStep trackIndex={config.trackIndex ?? 0} model={config.model} quality={config.quality} />
      default: return null
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <FlowStepIndicator
        currentStep={currentStep} onStepClick={goToStep} onBack={prevStep} isFirstStep={isFirstStep}
        estimatedCost={estimatedCost.total} costBreakdown={estimatedCost} projectName={projectName} onProjectNameChange={setProjectName}
        onSettingsClick={() => setShowSettings(true)} onAssetsClick={() => setShowAssets(true)}
      />
      <EditProjectModal projectName={projectName} onSave={(data) => setProjectName(data.name)} open={showSettings} onOpenChange={setShowSettings} />
      <ProjectAssetsDrawer open={showAssets} onOpenChange={setShowAssets} scenes={drawerScenes} />
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div key={currentStep} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25, ease: 'easeInOut' }} className="absolute inset-0">
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

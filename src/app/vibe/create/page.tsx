'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SwipeWizard } from '@/components/vibe/swipe-wizard'
import { VibePresetGrid } from '@/components/vibe/vibe-preset-grid'
import { SceneCarousel } from '@/components/vibe/scene-carousel'
import { GenerationLoading } from '@/components/shared/generation-loading'
import { vibePresets } from '@/lib/mock/presets'
import { mockProjects } from '@/lib/mock/projects'
import { simulateGeneration } from '@/lib/utils/generation-simulator'
import { cn } from '@/lib/utils'

const AUDIO_OPTIONS = [
  { id: 'cosmic', title: 'Cosmic Love Story', artist: 'Aurora Synthwave', bpm: 128 },
  { id: 'neon', title: 'Neon City Nights', artist: 'Volt Collective', bpm: 140 },
  { id: 'ocean', title: 'Ocean Dreams', artist: 'Tide & Wave', bpm: 96 },
]

const SUGGESTION_CHIPS = [
  'Abstract colors flowing',
  'Dreamy landscapes',
  'Urban energy',
  'Nature journey',
]

type GenState = 'idle' | 'generating' | 'done'

export default function VibCreatePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedAudio, setSelectedAudio] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('')
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [genState, setGenState] = useState<GenState>('idle')
  const [progress, setProgress] = useState(0)
  const [activeScene, setActiveScene] = useState(0)

  const scenes = mockProjects[0].scenes.slice(0, 4)

  async function handleGenerate() {
    setGenState('generating')
    setProgress(0)
    await simulateGeneration(4000, setProgress)
    setGenState('done')
  }

  const steps = [
    {
      title: 'Pick a Soundtrack',
      content: (
        <div className="flex flex-col gap-3 p-4">
          {AUDIO_OPTIONS.map((audio) => (
            <button
              key={audio.id}
              onClick={() => setSelectedAudio(audio.id)}
              className={cn(
                'flex items-center justify-between rounded-2xl border p-4 text-left transition-all',
                selectedAudio === audio.id
                  ? 'border-pink-500 bg-pink-500/10 ring-1 ring-pink-400'
                  : 'border-border bg-card hover:border-pink-200'
              )}
            >
              <div>
                <p className="text-sm font-semibold text-foreground">{audio.title}</p>
                <p className="text-xs text-muted-foreground">{audio.artist}</p>
              </div>
              <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                {audio.bpm} BPM
              </span>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: 'Describe Your Vision',
      content: (
        <div className="flex flex-col gap-4 p-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the visual story you want to tell..."
            className="min-h-[140px] w-full resize-none rounded-2xl border border-border p-4 text-sm text-foreground placeholder-muted-foreground bg-card transition-all focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200"
          />
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Suggestions
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTION_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => setPrompt(chip)}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground/80 transition-all hover:border-pink-300 hover:bg-pink-500/10 hover:text-pink-500 active:scale-95"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Choose Your Vibe',
      content: (
        <VibePresetGrid
          presets={vibePresets}
          selected={selectedPreset}
          onSelect={setSelectedPreset}
        />
      ),
    },
    {
      title: 'Generate',
      content: (
        <div className="flex h-full flex-col items-center justify-center p-6">
          {genState === 'idle' && (
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="text-6xl">🎬</div>
              <div>
                <h3
                  className="text-2xl font-extrabold text-foreground"
                  style={{ fontFamily: 'var(--font-plus-jakarta-sans, sans-serif)' }}
                >
                  Ready to Create!
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your AI music video is about to come to life
                </p>
              </div>
              <button
                onClick={handleGenerate}
                className="w-full rounded-full py-4 text-base font-bold text-white shadow-lg transition-transform active:scale-95"
                style={{ background: 'linear-gradient(135deg, #EC4899, #8B5CF6)' }}
              >
                Generate Video
              </button>
            </div>
          )}

          {genState === 'generating' && (
            <div className="flex flex-col items-center gap-4">
              <GenerationLoading
                progress={progress}
                message="Crafting your scenes..."
                variant="minimal"
              />
              <p className="text-xs text-muted-foreground">This usually takes a few seconds</p>
            </div>
          )}

          {genState === 'done' && (
            <div className="flex h-full w-full flex-col gap-4">
              <div className="flex-1 overflow-hidden rounded-2xl">
                <SceneCarousel
                  scenes={scenes}
                  activeIndex={activeScene}
                  onIndexChange={setActiveScene}
                />
              </div>
              <button
                onClick={() => router.push('/vibe/preview')}
                className="w-full rounded-full py-3 text-sm font-bold text-white shadow-lg transition-transform active:scale-95"
                style={{ background: 'linear-gradient(135deg, #EC4899, #8B5CF6)' }}
              >
                Preview Full Video
              </button>
            </div>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="flex h-screen flex-col bg-background">
      <SwipeWizard
        steps={steps}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
      />
    </div>
  )
}

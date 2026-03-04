'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { NeonPanel } from '@/components/neon/neon-panel'
import { ChromeText } from '@/components/neon/chrome-text'
import { CommandPalette } from '@/components/neon/command-palette'
import { MockVideoPlayer } from '@/components/shared/mock-video-player'
import { GenerationLoading } from '@/components/shared/generation-loading'
import { simulateGeneration } from '@/lib/utils/generation-simulator'
import { mockProjects } from '@/lib/mock/projects'
import type { MockScene } from '@/lib/mock/types'
import { cn } from '@/lib/utils'

const COLOR_PRESETS = ['Vivid', 'Muted', 'Cold', 'Warm', 'B&W', 'Neon'] as const
const TRANSITIONS = ['Cut', 'Dissolve', 'Wipe', 'Flash'] as const

function WorkspaceInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const projectId = searchParams.get('id') ?? 'project-neon'

  const project = mockProjects.find((p) => p.id === projectId) ?? mockProjects[0]

  const [activeScene, setActiveScene] = useState<MockScene>(project.scenes[0])
  const [editFields, setEditFields] = useState({ subject: '', action: '', environment: '', cameraAngle: '' })
  const [colorPreset, setColorPreset] = useState('Vivid')
  const [motionIntensity, setMotionIntensity] = useState(50)
  const [transition, setTransition] = useState('Cut')
  const [generating, setGenerating] = useState(false)
  const [genProgress, setGenProgress] = useState(0)
  const [paletteOpen, setPaletteOpen] = useState(false)

  useEffect(() => {
    setActiveScene(project.scenes[0])
  }, [project.id])

  useEffect(() => {
    setEditFields({
      subject: activeScene.subject,
      action: activeScene.action,
      environment: activeScene.environment,
      cameraAngle: activeScene.cameraAngle,
    })
  }, [activeScene.id])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setPaletteOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleGenerate = useCallback(async () => {
    setGenerating(true)
    setGenProgress(0)
    await simulateGeneration(4000, setGenProgress)
    setGenerating(false)
  }, [])

  function handleAction(action: string) {
    if (action === 'new-project') router.push('/neon/workspace?id=project-neon')
  }

  return (
    <div className="min-h-screen p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/neon')}
          className="text-[#888899] text-sm hover:text-[#FF006E] transition-colors"
        >
          ← Launchpad
        </button>
        <ChromeText as="h2" className="text-xl">{project.title}</ChromeText>
        <button
          onClick={() => router.push('/neon/showcase')}
          className="text-sm px-4 py-1.5 rounded-full transition-all"
          style={{
            border: '1px solid rgba(0,245,212,0.4)',
            color: '#00F5D4',
            background: 'rgba(0,245,212,0.05)',
          }}
        >
          Publish →
        </button>
      </div>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1">
        {/* Center: Preview + Scene strip */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Preview monitor */}
          <NeonPanel glowColor="pink" title="Preview Monitor" className="flex-1">
            <div className="p-4">
              {generating ? (
                <div className="aspect-video flex items-center justify-center bg-[rgba(255,0,110,0.03)] rounded-lg">
                  <GenerationLoading
                    progress={genProgress}
                    message="Generating scene..."
                    variant="neon"
                  />
                </div>
              ) : (
                <MockVideoPlayer
                  thumbnailUrl={activeScene.thumbnailUrl}
                  duration={activeScene.duration}
                  aspectRatio="16:9"
                />
              )}
            </div>
          </NeonPanel>

          {/* Scene strip */}
          <NeonPanel glowColor="cyan" title="Scenes">
            <div className="p-3 flex gap-3 overflow-x-auto pb-2">
              {project.scenes.map((scene) => (
                <SceneThumb
                  key={scene.id}
                  scene={scene}
                  selected={activeScene.id === scene.id}
                  onClick={() => setActiveScene(scene)}
                />
              ))}
            </div>
          </NeonPanel>
        </div>

        {/* Right: Style controls */}
        <div className="w-full lg:w-72 flex flex-col gap-4">
          {/* Style controls */}
          <NeonPanel glowColor="cyan" title="Style Controls">
            <div className="p-4 space-y-5">
              {/* Color grading */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#888899] mb-2">Color Grading</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setColorPreset(preset)}
                      className="py-1.5 rounded text-xs transition-all"
                      style={{
                        background: colorPreset === preset ? 'rgba(0,245,212,0.15)' : 'rgba(255,255,255,0.04)',
                        color: colorPreset === preset ? '#00F5D4' : '#888899',
                        border: `1px solid ${colorPreset === preset ? 'rgba(0,245,212,0.4)' : 'rgba(255,255,255,0.06)'}`,
                      }}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Motion intensity */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#888899] mb-2">
                  Motion Intensity: {motionIntensity}%
                </p>
                <div className="relative h-2 rounded-full bg-[rgba(255,255,255,0.08)]">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full"
                    style={{
                      width: `${motionIntensity}%`,
                      background: 'linear-gradient(90deg, #FF006E, #00F5D4)',
                      boxShadow: '0 0 8px rgba(0,245,212,0.5)',
                    }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={motionIntensity}
                    onChange={(e) => setMotionIntensity(Number(e.target.value))}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
                  />
                </div>
              </div>

              {/* Transition */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#888899] mb-2">Transition</p>
                <div className="flex gap-1.5">
                  {TRANSITIONS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTransition(t)}
                      className="flex-1 py-1.5 rounded text-[11px] transition-all"
                      style={{
                        background: transition === t ? 'rgba(254,228,64,0.1)' : 'rgba(255,255,255,0.04)',
                        color: transition === t ? '#FEE440' : '#888899',
                        border: `1px solid ${transition === t ? 'rgba(254,228,64,0.3)' : 'rgba(255,255,255,0.06)'}`,
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </NeonPanel>

          {/* Active scene editor */}
          <NeonPanel glowColor="yellow" title="Scene Editor">
            <div className="p-4 space-y-3">
              {(['subject', 'action', 'environment', 'cameraAngle'] as const).map((field) => (
                <div key={field}>
                  <label className="block text-[10px] uppercase tracking-widest text-[#888899] mb-1">
                    {field === 'cameraAngle' ? 'Camera Angle' : field}
                  </label>
                  <input
                    value={editFields[field]}
                    onChange={(e) => setEditFields((prev) => ({ ...prev, [field]: e.target.value }))}
                    className="w-full bg-[rgba(255,255,255,0.04)] rounded px-3 py-2 text-sm text-[#EEEEF0] outline-none transition-all"
                    style={{
                      border: '1px solid rgba(254,228,64,0.15)',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(254,228,64,0.5)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(254,228,64,0.15)')}
                  />
                </div>
              ))}

              <motion.button
                className="w-full py-2.5 rounded-lg text-sm font-semibold mt-2 transition-all"
                style={{
                  background: 'linear-gradient(135deg, #FF006E, #00F5D4)',
                  color: '#fff',
                  boxShadow: '0 0 20px rgba(255,0,110,0.3)',
                }}
                whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(255,0,110,0.5)' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? 'Generating...' : 'Generate Scene'}
              </motion.button>
            </div>
          </NeonPanel>
        </div>
      </div>

      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onAction={handleAction}
      />
    </div>
  )
}

function SceneThumb({ scene, selected, onClick }: { scene: MockScene; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative shrink-0 w-28 rounded-lg overflow-hidden transition-all duration-200',
        selected ? 'ring-2' : 'opacity-60 hover:opacity-90'
      )}
      style={{
        boxShadow: selected ? '0 0 16px rgba(255,0,110,0.4)' : 'none',
        outline: selected ? '2px solid #FF006E' : '2px solid transparent',
      }}
    >
      <img src={scene.thumbnailUrl} alt={`Scene ${scene.index + 1}`} className="w-full aspect-video object-cover" />
      <div className="absolute bottom-0 left-0 right-0 px-1.5 py-1 bg-gradient-to-t from-black/80 to-transparent text-left">
        <span className="text-[9px] text-[#888899] block">Scene {scene.index + 1}</span>
        <span className="text-[9px] text-[#EEEEF0] line-clamp-1">{scene.subject}</span>
      </div>
    </button>
  )
}

export default function WorkspacePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#888899]">Loading...</div>}>
      <WorkspaceInner />
    </Suspense>
  )
}

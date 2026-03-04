'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { mockProjects } from '@/lib/mock/projects'
import { useProjectStore } from '@/lib/stores/project-store'
import { simulateGeneration } from '@/lib/utils/generation-simulator'
import { BreadcrumbNav } from '@/components/zen/breadcrumb-nav'
import { FocusContainer } from '@/components/zen/focus-container'
import { CollapsiblePhase } from '@/components/zen/collapsible-phase'
import { PromptCanvas } from '@/components/zen/prompt-canvas'
import { MockVideoPlayer } from '@/components/shared/mock-video-player'
import { GenerationLoading } from '@/components/shared/generation-loading'

interface PageProps {
  searchParams: Promise<{ id?: string }>
}

export default function ZenProjectPage({ searchParams }: PageProps) {
  const resolvedParams = use(searchParams)
  const router = useRouter()
  const { activeProject, setActiveProject, isGenerating, generationProgress, startGeneration, completeGeneration, setGenerationProgress } = useProjectStore()

  const [activePhase, setActivePhase] = useState<number | null>(0)
  const [visionPrompt, setVisionPrompt] = useState('')
  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number | null>(null)
  const [scenePrompts, setScenePrompts] = useState<Record<string, string>>({})
  const [exportQuality, setExportQuality] = useState<'1080p' | '4K'>('1080p')
  const [exportFormat, setExportFormat] = useState<'mp4' | 'webm'>('mp4')
  const [generated, setGenerated] = useState(false)

  useEffect(() => {
    const project = mockProjects.find((p) => p.id === resolvedParams.id)
    if (project) {
      setActiveProject(project)
      setVisionPrompt(project.description)
      const prompts: Record<string, string> = {}
      project.scenes.forEach((s) => { prompts[s.id] = s.prompt })
      setScenePrompts(prompts)
    }
  }, [resolvedParams.id, setActiveProject])

  const project = activeProject ?? mockProjects.find((p) => p.id === resolvedParams.id)

  if (!project) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-6">
        <p className="text-[var(--muted-foreground)]">Project not found.</p>
      </div>
    )
  }

  async function handleGenerate() {
    startGeneration()
    await simulateGeneration(3000, (p) => setGenerationProgress(p))
    completeGeneration()
    setGenerated(true)
  }

  const audio = project.audio
  const firstScene = project.scenes[0]

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <BreadcrumbNav
        items={[
          { label: 'Projects', href: '/zen' },
          { label: project.title },
        ]}
      />

      <FocusContainer
        focusedIndex={activePhase}
        onFocusChange={(index) => setActivePhase(index)}
      >
        {/* Phase 1: Audio */}
        <CollapsiblePhase
          title="Audio"
          index={1}
          isActive={activePhase === 0}
          isComplete={true}
          onActivate={() => setActivePhase(activePhase === 0 ? null : 0)}
        >
          <div className="pl-7 space-y-2">
            <p className="text-[18px] leading-[1.75] text-[var(--foreground)]">{audio.title}</p>
            <p className="text-[14px] text-[var(--muted-foreground)]">
              {audio.bpm} BPM &middot; {Math.floor(audio.duration / 60)}:{String(audio.duration % 60).padStart(2, '0')}
            </p>
          </div>
        </CollapsiblePhase>

        {/* Phase 2: Vision */}
        <CollapsiblePhase
          title="Vision"
          index={2}
          isActive={activePhase === 1}
          isComplete={visionPrompt.length > 0}
          onActivate={() => setActivePhase(activePhase === 1 ? null : 1)}
        >
          <div className="pl-7">
            <PromptCanvas
              label="Vision"
              value={visionPrompt}
              onChange={setVisionPrompt}
              placeholder="Describe the overall vision for this video..."
            />
          </div>
        </CollapsiblePhase>

        {/* Phase 3: Scenes */}
        <CollapsiblePhase
          title="Scenes"
          index={3}
          isActive={activePhase === 2}
          isComplete={generated}
          onActivate={() => setActivePhase(activePhase === 2 ? null : 2)}
        >
          <div className="pl-7 space-y-6">
            <div className="flex flex-col gap-1">
              {project.scenes.map((scene, i) => (
                <button
                  key={scene.id}
                  onClick={() => setSelectedSceneIndex(selectedSceneIndex === i ? null : i)}
                  className="flex items-center justify-between py-2 text-left transition-opacity duration-200 hover:opacity-70 cursor-pointer border-b border-[var(--border)]"
                >
                  <span className="text-[14px] text-[var(--muted-foreground)] tabular-nums mr-3">
                    {i + 1}
                  </span>
                  <span className="text-[14px] text-[var(--foreground)] flex-1 truncate">
                    {scene.prompt.slice(0, 60)}{scene.prompt.length > 60 ? '...' : ''}
                  </span>
                </button>
              ))}
            </div>

            {selectedSceneIndex !== null && (
              <div className="border-t border-[var(--border)] pt-4 space-y-4">
                <p className="text-[14px] text-[var(--muted-foreground)]">
                  Scene {selectedSceneIndex + 1}
                </p>
                <PromptCanvas
                  label="Subject"
                  value={scenePrompts[project.scenes[selectedSceneIndex].id] ?? ''}
                  onChange={(v) => setScenePrompts((prev) => ({
                    ...prev,
                    [project.scenes[selectedSceneIndex].id]: v,
                  }))}
                  placeholder="Describe this scene..."
                />
              </div>
            )}

            {isGenerating ? (
              <div className="flex justify-center py-8">
                <GenerationLoading
                  progress={generationProgress}
                  message="Generating scenes..."
                  variant="minimal"
                />
              </div>
            ) : (
              <button
                onClick={handleGenerate}
                className="text-[14px] text-[var(--accent)] transition-opacity duration-200 hover:opacity-70"
              >
                Generate
              </button>
            )}
          </div>
        </CollapsiblePhase>

        {/* Phase 4: Preview */}
        <CollapsiblePhase
          title="Preview"
          index={4}
          isActive={activePhase === 3}
          isComplete={false}
          onActivate={() => setActivePhase(activePhase === 3 ? null : 3)}
        >
          <div className="pl-7">
            <MockVideoPlayer
              thumbnailUrl={firstScene?.thumbnailUrl ?? project.thumbnailUrl}
              duration={firstScene?.duration ?? 30}
            />
            <div className="mt-4">
              <button
                onClick={() => router.push(`/zen/preview?id=${project.id}`)}
                className="text-[14px] text-[var(--accent)] transition-opacity duration-200 hover:opacity-70"
              >
                Full screen preview
              </button>
            </div>
          </div>
        </CollapsiblePhase>

        {/* Phase 5: Export */}
        <CollapsiblePhase
          title="Export"
          index={5}
          isActive={activePhase === 4}
          isComplete={false}
          onActivate={() => setActivePhase(activePhase === 4 ? null : 4)}
        >
          <div className="pl-7 space-y-6">
            <div>
              <p className="text-[14px] text-[var(--muted-foreground)] mb-3">Quality</p>
              <div className="flex gap-6">
                {(['1080p', '4K'] as const).map((q) => (
                  <label key={q} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="quality"
                      value={q}
                      checked={exportQuality === q}
                      onChange={() => setExportQuality(q)}
                      className="accent-[var(--accent)]"
                    />
                    <span className="text-[14px] text-[var(--foreground)]">{q}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[14px] text-[var(--muted-foreground)] mb-3">Format</p>
              <div className="flex gap-6">
                {(['mp4', 'webm'] as const).map((f) => (
                  <label key={f} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      value={f}
                      checked={exportFormat === f}
                      onChange={() => setExportFormat(f)}
                      className="accent-[var(--accent)]"
                    />
                    <span className="text-[14px] text-[var(--foreground)]">{f}</span>
                  </label>
                ))}
              </div>
            </div>

            <button className="text-[14px] text-[var(--accent)] transition-opacity duration-200 hover:opacity-70">
              Export {exportQuality} {exportFormat.toUpperCase()}
            </button>
          </div>
        </CollapsiblePhase>
      </FocusContainer>
    </div>
  )
}

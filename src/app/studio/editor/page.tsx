'use client'

import { useEffect, useState, useRef, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { mockProjects } from '@/lib/mock/projects'
import type { MockProject, MockScene } from '@/lib/mock/types'
import { PreviewMonitor } from '@/components/studio/preview-monitor'
import { PropertyInspector } from '@/components/studio/property-inspector'
import { GenerationLoading } from '@/components/shared/generation-loading'
import { EditorTopBar } from '@/components/studio/editor-top-bar'
import { EditorDock } from '@/components/studio/editor-dock'
import { simulateGeneration } from '@/lib/utils/generation-simulator'

const MONO = 'JetBrains Mono, monospace'

function totalDur(scenes: MockScene[]) {
  return scenes.reduce((a, s) => a + s.duration, 0)
}

function EditorContent() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get('id')
  const baseProject = mockProjects.find((p) => p.id === projectId) ?? mockProjects[0]

  const [project, setProject] = useState<MockProject>(baseProject)
  const [activeSceneId, setActiveSceneId] = useState<string | null>(project.scenes[0]?.id ?? null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playheadPos, setPlayheadPos] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [genProgress, setGenProgress] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const duration = totalDur(project.scenes)
  const activeScene = project.scenes.find((s) => s.id === activeSceneId) ?? null

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setPlayheadPos((prev) => {
          const next = prev + 0.1
          if (next >= duration) {
            setIsPlaying(false)
            return 0
          }
          return next
        })
      }, 100)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying, duration])

  const handleSeek = useCallback(
    (time: number) => setPlayheadPos(Math.max(0, Math.min(time, duration))),
    [duration]
  )

  const handleSceneClick = useCallback(
    (id: string) => {
      setActiveSceneId(id)
      let offset = 0
      for (const s of project.scenes) {
        if (s.id === id) break
        offset += s.duration
      }
      setPlayheadPos(offset)
    },
    [project.scenes]
  )

  const handleUpdate = useCallback(
    (field: string, value: string) => {
      if (!activeSceneId) return
      setProject((prev) => ({
        ...prev,
        scenes: prev.scenes.map((s) => (s.id === activeSceneId ? { ...s, [field]: value } : s)),
      }))
    },
    [activeSceneId]
  )

  const handleGenerate = useCallback(async () => {
    if (!activeSceneId) return
    setIsGenerating(true)
    setGenProgress(0)
    await simulateGeneration(3000, setGenProgress)
    setIsGenerating(false)
    setProject((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) =>
        s.id === activeSceneId ? { ...s, status: 'completed' } : s
      ),
    }))
  }, [activeSceneId])

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <EditorTopBar project={project} totalDuration={duration} />

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Preview */}
        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
          <div className="w-full max-w-3xl">
            {isGenerating ? (
              <div
                className="relative rounded border border-white/10 flex items-center justify-center bg-card"
                style={{ aspectRatio: '16/9' }}
              >
                <GenerationLoading progress={genProgress} message="Generating scene..." />
              </div>
            ) : (
              <PreviewMonitor
                scene={activeScene}
                isPlaying={isPlaying}
                onTogglePlay={() => setIsPlaying((p) => !p)}
              />
            )}
          </div>
        </div>

        {/* Property Inspector */}
        <div
          className="flex-shrink-0 border-l border-border overflow-hidden flex flex-col bg-secondary"
          style={{
            width: 280,
          }}
        >
          <div
            className="px-3 py-2 border-b text-[10px] uppercase tracking-widest opacity-50 flex-shrink-0"
            style={{ fontFamily: MONO, borderColor: 'rgba(255,255,255,0.08)' }}
          >
            Inspector
          </div>
          <div className="flex-1 overflow-hidden">
            <PropertyInspector
              scene={activeScene}
              onUpdate={handleUpdate}
              onGenerate={handleGenerate}
            />
          </div>
        </div>
      </div>

      <EditorDock
        scenes={project.scenes}
        beatMarkers={project.audio.beatMarkers}
        bpm={project.audio.bpm}
        totalDuration={duration}
        playheadPosition={playheadPos}
        isPlaying={isPlaying}
        activeSceneId={activeSceneId}
        onSeek={handleSeek}
        onSceneClick={handleSceneClick}
        onTogglePlay={() => setIsPlaying((p) => !p)}
      />
    </div>
  )
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-background">
          <span className="text-[11px] opacity-30" style={{ fontFamily: MONO }}>
            Loading...
          </span>
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  )
}

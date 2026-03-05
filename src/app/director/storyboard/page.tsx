'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { mockProjects } from '@/lib/mock/projects'
import type { MockScene } from '@/lib/mock/types'
import { FilmGrainOverlay } from '@/components/director/film-grain-overlay'
import { DirectorsSlate } from '@/components/director/directors-slate'
import { StoryboardFilmstrip } from '@/components/director/storyboard-filmstrip'
import { ScreeningRoom } from '@/components/director/screening-room'
import { Film, Clock, Layers, ChevronLeft } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ id?: string }>
}

function formatTotalDuration(scenes: { duration: number }[]): string {
  const total = scenes.reduce((a, s) => a + s.duration, 0)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}m ${s}s`
}

export default function StoryboardPage({ searchParams }: PageProps) {
  const params = use(searchParams)
  const router = useRouter()

  const projectId = params.id
  const baseProject = mockProjects.find((p) => p.id === projectId) ?? mockProjects[0]

  // Local scene state for edits
  const [scenes, setScenes] = useState<MockScene[]>(baseProject.scenes)
  const [flippedId, setFlippedId] = useState<string | null>(null)
  const [screeningOpen, setScreeningOpen] = useState(false)
  const [activeSceneIndex, setActiveSceneIndex] = useState(0)

  function handleFlip(sceneId: string) {
    setFlippedId((prev) => (prev === sceneId ? null : sceneId))
  }

  function handleSceneUpdate(sceneId: string, updates: Partial<MockScene>) {
    setScenes((prev) => prev.map((s) => (s.id === sceneId ? { ...s, ...updates } : s)))
  }

  const project = { ...baseProject, scenes }
  const totalDuration = formatTotalDuration(scenes)

  return (
    <div className="relative min-h-screen flex flex-col">
      <FilmGrainOverlay />

      {/* Top nav */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-border">
        <button
          onClick={() => router.push('/director')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Productions
        </button>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-amber-500" />
          <span
            className="text-foreground/70 font-semibold"
            style={{ fontFamily: 'var(--font-playfair-display, serif)' }}
          >
            Storyboard
          </span>
        </div>
      </div>

      {/* Slate */}
      <div className="px-6 py-6">
        <DirectorsSlate
          projectTitle={baseProject.title}
          sceneCount={scenes.length}
          totalDuration={totalDuration}
          status={baseProject.status}
        />
      </div>

      {/* Filmstrip */}
      <div className="flex-1 overflow-hidden py-2">
        <StoryboardFilmstrip
          scenes={scenes}
          flippedId={flippedId}
          onFlip={handleFlip}
          onSceneUpdate={handleSceneUpdate}
        />
      </div>

      {/* Fixed bottom bar */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t border-border px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4" />
            <span className="text-foreground/80 font-semibold">{scenes.length}</span> scenes
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span className="text-foreground/80 font-semibold">{totalDuration}</span> total
          </span>
        </div>

        <button
          onClick={() => setScreeningOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-amber-900/40"
        >
          <Film className="w-4 h-4" />
          Enter Screening Room
        </button>
      </div>

      {/* Screening room overlay */}
      {screeningOpen && (
        <ScreeningRoom
          project={project}
          activeSceneIndex={activeSceneIndex}
          onSceneChange={setActiveSceneIndex}
          onClose={() => setScreeningOpen(false)}
        />
      )}
    </div>
  )
}

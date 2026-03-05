'use client'

import { useRouter } from 'next/navigation'
import { mockProjects } from '@/lib/mock/projects'
import type { MockProject } from '@/lib/mock/types'
import { FilmGrainOverlay } from '@/components/director/film-grain-overlay'
import { Film, Plus, Clock, Layers } from 'lucide-react'

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-amber-600 text-white' },
  rendering: { label: 'Rendering', className: 'bg-red-600 text-white' },
  complete: { label: 'Complete', className: 'bg-emerald-600 text-white' },
}

function totalDuration(project: MockProject): string {
  const secs = project.scenes.reduce((a, s) => a + s.duration, 0)
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function ProjectClapperCard({ project, onClick }: { project: MockProject; onClick: () => void }) {
  const badge = STATUS_BADGE[project.status] ?? STATUS_BADGE.draft
  const firstFour = project.scenes.slice(0, 4)

  return (
    <button
      onClick={onClick}
      className="group text-left w-full rounded-lg overflow-hidden border border-border hover:border-amber-600/60 bg-card transition-all duration-300 hover:shadow-[0_0_24px_rgba(217,119,6,0.15)]"
    >
      {/* Clapperboard stripe */}
      <div
        className="h-6 w-full"
        style={{
          background:
            'repeating-linear-gradient(135deg, #000 0px, #000 10px, hsl(var(--card)) 10px, hsl(var(--card)) 20px)',
        }}
      />

      {/* 2x2 thumbnail grid */}
      <div className="grid grid-cols-2 grid-rows-2 h-40 border-b border-border">
        {firstFour.map((scene, i) => (
          <div key={scene.id} className="relative overflow-hidden">
            <img
              src={scene.thumbnailUrl}
              alt={`Scene ${i + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        ))}
        {firstFour.length < 4 &&
          Array.from({ length: 4 - firstFour.length }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-muted flex items-center justify-center">
              <Film className="w-6 h-6 text-muted-foreground" />
            </div>
          ))}
      </div>

      {/* Card body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3
            className="text-lg font-bold text-foreground leading-tight"
            style={{ fontFamily: 'var(--font-playfair-display, serif)' }}
          >
            {project.title}
          </h3>
          <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${badge.className}`}>
            {badge.label}
          </span>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{project.description}</p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Layers className="w-3 h-3" />
            {project.scenes.length} scenes
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {totalDuration(project)}
          </span>
          <span className="flex items-center gap-1">
            <Film className="w-3 h-3" />
            {project.audio.bpm} BPM
          </span>
        </div>
      </div>
    </button>
  )
}

export default function DirectorProductionsPage() {
  const router = useRouter()

  return (
    <div className="relative min-h-screen">
      <FilmGrainOverlay />

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center">
              <Film className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs text-amber-500 uppercase tracking-widest font-semibold">
              Director&apos;s Workspace
            </span>
          </div>
          <h1
            className="text-5xl font-bold text-foreground"
            style={{ fontFamily: 'var(--font-playfair-display, serif)' }}
          >
            Productions
          </h1>
          <p className="mt-2 text-muted-foreground text-lg">
            Select a production to open the storyboard canvas.
          </p>
        </div>

        {/* Project grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockProjects.map((project) => (
            <ProjectClapperCard
              key={project.id}
              project={project}
              onClick={() => router.push(`/director/storyboard?id=${project.id}`)}
            />
          ))}

          {/* New Production card */}
          <button className="group text-left w-full rounded-lg overflow-hidden border-2 border-dashed border-border hover:border-amber-500 bg-card/50 hover:bg-card transition-all duration-300 min-h-[280px] flex flex-col items-center justify-center gap-4 p-8">
            <div className="w-14 h-14 rounded-full border-2 border-dashed border-border group-hover:border-amber-500 flex items-center justify-center transition-colors">
              <Plus className="w-6 h-6 text-muted-foreground group-hover:text-amber-400 transition-colors" />
            </div>
            <div className="text-center">
              <p
                className="text-lg font-bold text-foreground/70 group-hover:text-foreground transition-colors"
                style={{ fontFamily: 'var(--font-playfair-display, serif)' }}
              >
                New Production
              </p>
              <p className="text-sm text-muted-foreground mt-1">Start a new music video project</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { mockProjects } from '@/lib/mock/projects'
import type { ProjectStatus } from '@/lib/mock/types'

const MONO = 'JetBrains Mono, monospace'

function formatDuration(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

function totalDuration(scenes: { duration: number }[]) {
  return scenes.reduce((a, s) => a + s.duration, 0)
}

const statusBadge: Record<ProjectStatus, { label: string; color: string }> = {
  draft: { label: 'DRAFT', color: '#7C3AED' },
  rendering: { label: 'RENDERING', color: '#22D3EE' },
  complete: { label: 'COMPLETE', color: '#10B981' },
}

export default function StudioPage() {
  return (
    <div className="min-h-screen flex flex-col p-6" style={{ background: '#0D0D0D' }}>
      {/* Header */}
      <div className="mb-8 flex items-baseline gap-4">
        <h1
          className="text-lg tracking-widest uppercase"
          style={{ fontFamily: MONO, color: '#7C3AED' }}
        >
          STUDIO
        </h1>
        <span className="text-[11px] opacity-30" style={{ fontFamily: MONO }}>
          AI Music Video Editor
        </span>
      </div>

      {/* Project grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
        {mockProjects.map((project) => {
          const badge = statusBadge[project.status]
          const dur = totalDuration(project.scenes)
          const thumb = project.scenes[0]?.thumbnailUrl ?? project.thumbnailUrl

          return (
            <Link
              key={project.id}
              href={`/studio/editor?id=${project.id}`}
              className="group block"
            >
              <div
                className="rounded border transition-all duration-150 overflow-hidden hover:border-violet-600"
                style={{
                  background: '#1E1E2E',
                  borderColor: 'rgba(255,255,255,0.1)',
                }}
              >
                {/* Thumbnail */}
                <div
                  className="relative w-full overflow-hidden"
                  style={{ aspectRatio: '16/9' }}
                >
                  <img
                    src={thumb}
                    alt={project.title}
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-150"
                  />
                  {/* Status badge */}
                  <div
                    className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide"
                    style={{
                      fontFamily: MONO,
                      background: `${badge.color}22`,
                      color: badge.color,
                      border: `1px solid ${badge.color}44`,
                    }}
                  >
                    {badge.label}
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <h2
                    className="text-[13px] mb-1 truncate"
                    style={{ fontFamily: MONO, color: '#E5E7EB' }}
                  >
                    {project.title}
                  </h2>
                  <div
                    className="flex gap-3 text-[10px] opacity-50"
                    style={{ fontFamily: MONO }}
                  >
                    <span>{project.scenes.length} scenes</span>
                    <span>{formatDuration(dur)}</span>
                    <span>{project.audio.bpm} BPM</span>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}

        {/* New Project card */}
        <div
          className="rounded border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors duration-150 hover:border-violet-500"
          style={{
            borderColor: 'rgba(124,58,237,0.4)',
            minHeight: 180,
            background: 'transparent',
          }}
        >
          <div className="text-center opacity-40">
            <div className="text-3xl mb-2">+</div>
            <div className="text-[11px] uppercase tracking-widest" style={{ fontFamily: MONO }}>
              New Project
            </div>
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div
        className="mt-8 text-center text-[10px] opacity-20 uppercase tracking-widest"
        style={{ fontFamily: MONO }}
      >
        Press any project to open editor
      </div>
    </div>
  )
}

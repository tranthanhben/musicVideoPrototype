'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { VibePresetGrid } from '@/components/vibe/vibe-preset-grid'
import { BottomTabBar } from '@/components/vibe/bottom-tab-bar'
import { vibePresets } from '@/lib/mock/presets'
import { mockProjects } from '@/lib/mock/projects'
import { useState } from 'react'
import type { ProjectStatus } from '@/lib/mock/types'

const statusBadge: Record<ProjectStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-slate-100 text-slate-600' },
  rendering: { label: 'Rendering', className: 'bg-violet-100 text-violet-600' },
  complete: { label: 'Complete', className: 'bg-green-100 text-green-600' },
}

export default function VibePage() {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)

  return (
    <div className="flex min-h-screen flex-col bg-white pb-24">
      {/* Header */}
      <div className="px-4 pb-2 pt-10">
        <h1
          className="text-3xl font-extrabold text-slate-900"
          style={{ fontFamily: 'var(--font-plus-jakarta-sans, sans-serif)' }}
        >
          Create Something
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(135deg, #EC4899, #8B5CF6)' }}
          >
            Amazing
          </span>
        </h1>
        <p className="mt-1 text-sm text-slate-500">Choose a vibe to get started</p>
      </div>

      {/* Preset grid */}
      <VibePresetGrid
        presets={vibePresets}
        selected={selectedPreset}
        onSelect={setSelectedPreset}
      />

      {/* CTA if preset selected */}
      {selectedPreset && (
        <div className="px-4 pb-2">
          <Link
            href="/vibe/create"
            className="block w-full rounded-full py-3 text-center text-sm font-semibold text-white shadow-lg transition-transform active:scale-95"
            style={{ background: 'linear-gradient(135deg, #EC4899, #8B5CF6)' }}
          >
            Start Creating
          </Link>
        </div>
      )}

      {/* Recent Projects */}
      <div className="mt-4 px-4">
        <h2 className="mb-3 text-base font-bold text-slate-900">Recent Projects</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {mockProjects.map((project) => {
            const badge = statusBadge[project.status]
            return (
              <div
                key={project.id}
                className="w-48 flex-shrink-0 overflow-hidden rounded-2xl bg-[var(--card)] shadow-sm"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={project.thumbnailUrl}
                    alt={project.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <p className="line-clamp-1 text-xs font-semibold text-slate-900">
                    {project.title}
                  </p>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      {project.scenes.length} scenes
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <BottomTabBar />
    </div>
  )
}

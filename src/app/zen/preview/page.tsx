'use client'

import { use } from 'react'
import { mockProjects } from '@/lib/mock/projects'
import { BreadcrumbNav } from '@/components/zen/breadcrumb-nav'
import { MockVideoPlayer } from '@/components/shared/mock-video-player'

interface PageProps {
  searchParams: Promise<{ id?: string }>
}

export default function ZenPreviewPage({ searchParams }: PageProps) {
  const resolvedParams = use(searchParams)
  const project = mockProjects.find((p) => p.id === resolvedParams.id)

  if (!project) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-6">
        <p className="text-[var(--muted-foreground)]">Project not found.</p>
      </div>
    )
  }

  const firstScene = project.scenes[0]

  return (
    <div className="max-w-2xl mx-auto py-12 px-6 flex flex-col min-h-screen">
      <BreadcrumbNav
        items={[
          { label: 'Projects', href: '/zen' },
          { label: project.title, href: `/zen/project?id=${project.id}` },
          { label: 'Preview' },
        ]}
      />

      <div className="flex-1 flex items-center">
        <div className="w-full">
          <MockVideoPlayer
            thumbnailUrl={firstScene?.thumbnailUrl ?? project.thumbnailUrl}
            duration={firstScene?.duration ?? 30}
          />
        </div>
      </div>

      <div className="mt-8">
        <a
          href={`/zen/project?id=${project.id}`}
          className="text-[14px] text-[var(--muted-foreground)] transition-opacity duration-200 hover:opacity-70"
        >
          Back to project
        </a>
      </div>
    </div>
  )
}

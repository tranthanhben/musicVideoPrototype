'use client'

import { useRouter } from 'next/navigation'
import { mockProjects } from '@/lib/mock/projects'

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function ZenProjectsPage() {
  const router = useRouter()

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <h1 className="text-2xl font-medium text-[var(--foreground)] mb-8">
        Projects
      </h1>

      <div className="flex flex-col">
        {mockProjects.map((project, i) => (
          <button
            key={project.id}
            onClick={() => router.push(`/zen/project?id=${project.id}`)}
            className="flex items-center justify-between py-4 text-left transition-opacity duration-200 hover:opacity-70 cursor-pointer"
            style={{
              borderTop: i === 0 ? '1px solid var(--border)' : undefined,
              borderBottom: '1px solid var(--border)',
            }}
          >
            <span className="text-[18px] leading-[1.75] text-[var(--foreground)]">
              {project.title}
            </span>
            <span className="text-[14px] text-[var(--muted-foreground)] ml-4 shrink-0">
              {formatDate(project.createdAt)}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-8">
        <button
          className="text-[14px] text-[var(--accent)] transition-opacity duration-200 hover:opacity-70"
          onClick={() => {}}
        >
          New Project
        </button>
      </div>
    </div>
  )
}

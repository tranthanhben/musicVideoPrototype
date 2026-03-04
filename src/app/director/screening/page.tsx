'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { mockProjects } from '@/lib/mock/projects'
import { FilmGrainOverlay } from '@/components/director/film-grain-overlay'
import { ScreeningRoom } from '@/components/director/screening-room'

interface PageProps {
  searchParams: Promise<{ id?: string }>
}

export default function ScreeningPage({ searchParams }: PageProps) {
  const params = use(searchParams)
  const router = useRouter()

  const projectId = params.id
  const project = mockProjects.find((p) => p.id === projectId) ?? mockProjects[0]
  const [activeSceneIndex, setActiveSceneIndex] = useState(0)

  function handleClose() {
    router.push(`/director/storyboard?id=${project.id}`)
  }

  return (
    <div className="relative">
      <FilmGrainOverlay />
      <ScreeningRoom
        project={project}
        activeSceneIndex={activeSceneIndex}
        onSceneChange={setActiveSceneIndex}
        onClose={handleClose}
      />
    </div>
  )
}

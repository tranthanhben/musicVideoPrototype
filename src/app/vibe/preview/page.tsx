'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Download, Share2 } from 'lucide-react'
import { MockVideoPlayer } from '@/components/shared/mock-video-player'
import { mockProjects } from '@/lib/mock/projects'
import { cn } from '@/lib/utils'

export default function VibePreviewPage() {
  const router = useRouter()
  const project = mockProjects[0]
  const scenes = project.scenes.slice(0, 4)
  const [activeScene, setActiveScene] = useState(0)

  const scene = scenes[activeScene]
  const totalDuration = scenes.reduce((acc, s) => acc + s.duration, 0)

  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm"
        aria-label="Go back"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      {/* Video player - 9:16 full width */}
      <div className="flex flex-1 items-center justify-center bg-slate-950 pt-14">
        <div className="w-full">
          <MockVideoPlayer
            thumbnailUrl={scene.thumbnailUrl}
            duration={totalDuration}
            aspectRatio="9:16"
            className="w-full"
          />
        </div>
      </div>

      {/* Scene dots */}
      <div className="flex items-center justify-center gap-3 py-4">
        {scenes.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveScene(i)}
            className={cn(
              'rounded-full transition-all duration-200',
              i === activeScene
                ? 'h-2.5 w-8 bg-pink-500'
                : 'h-2.5 w-2.5 bg-white/30 hover:bg-white/50'
            )}
            aria-label={`Scene ${i + 1}`}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 px-4 pb-8">
        <button
          className="flex flex-1 items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold text-white shadow-lg"
          style={{ background: 'linear-gradient(135deg, #EC4899, #8B5CF6)' }}
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
        <button className="flex flex-1 items-center justify-center gap-2 rounded-full border border-white/20 py-3.5 text-sm font-semibold text-white">
          <Download className="h-4 w-4" />
          Download
        </button>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import { MockVideoPlayer } from '@/components/shared/mock-video-player'
import { SimpleTimeline } from '@/components/editor/simple-timeline'
import { mockProjects } from '@/lib/mock/projects'
import { cn } from '@/lib/utils'
import { Settings } from 'lucide-react'
import { EditingVfxPanel, EditingExportPanel } from './editing-view-panels'

const project = mockProjects[0]
const PREVIEW_IMAGE = '/assets/export/final-preview.jpg'
const QUALITY_OPTIONS = ['4K Ultra HD', '1080p Full HD', '720p HD']

export function EditingView() {
  const [activeSceneId, setActiveSceneId] = useState<string>(project.scenes[0].id)
  const [selectedPreset, setSelectedPreset] = useState<string>('Cosmic Cinema')
  const [selectedQuality, setSelectedQuality] = useState('1080p Full HD')
  const [exportedPlatforms, setExportedPlatforms] = useState<Set<string>>(new Set())
  const [playhead, setPlayhead] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const totalDuration = project.scenes.reduce((sum, s) => sum + s.duration, 0)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setPlayhead((p) => (p + 0.5) % totalDuration)
    }, 200)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [totalDuration])

  function handleExport(platform: string) {
    setExportedPlatforms((prev) => new Set([...prev, platform]))
  }

  return (
    <div className="flex h-full flex-col p-5 gap-3">
      <div className="shrink-0">
        <h2 className="text-sm font-bold text-foreground">Post-Production</h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">Final assembly and color grading</p>
      </div>

      {/* Video player with real preview image */}
      <div className="shrink-0">
        <MockVideoPlayer
          thumbnailUrl={PREVIEW_IMAGE}
          duration={totalDuration}
          className="w-full"
          aspectRatio="16:9"
        />
      </div>

      {/* Timeline */}
      <div className="shrink-0">
        <p className="text-[9px] text-muted-foreground mb-1.5 font-mono uppercase tracking-widest">
          Timeline · {project.scenes.length} scenes
        </p>
        <SimpleTimeline
          scenes={project.scenes}
          activeSceneId={activeSceneId}
          playheadPosition={playhead}
          onSceneClick={setActiveSceneId}
        />
      </div>

      <EditingVfxPanel selectedPreset={selectedPreset} onSelect={setSelectedPreset} />

      {/* Quality selector */}
      <div className="shrink-0">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Settings className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest">Resolution</p>
        </div>
        <div className="flex gap-1.5">
          {QUALITY_OPTIONS.map((q) => (
            <button key={q} onClick={() => setSelectedQuality(q)}
              className={cn(
                'flex-1 py-1.5 rounded-lg border text-[10px] font-semibold transition-all cursor-pointer',
                selectedQuality === q
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/40',
              )}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <EditingExportPanel exportedPlatforms={exportedPlatforms} onExport={handleExport} />
    </div>
  )
}

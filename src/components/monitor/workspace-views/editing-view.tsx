'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { MockVideoPlayer } from '@/components/shared/mock-video-player'
import { SimpleTimeline } from '@/components/editor/simple-timeline'
import { EditingExportRow } from './editing-export-row'
import { mockProjects } from '@/lib/mock/projects'
import { cn } from '@/lib/utils'
import { Sparkles, Check } from 'lucide-react'

const project = mockProjects[0]
const previewScene = project.scenes[0]

interface EffectPreset {
  label: string
  from: string
  to: string
}

const EFFECT_PRESETS: EffectPreset[] = [
  { label: 'Cosmic Cinema', from: '#7C3AED', to: '#22D3EE' },
  { label: 'Film Noir', from: '#374151', to: '#111827' },
  { label: 'Warm Vintage', from: '#F97316', to: '#CA8A04' },
  { label: 'Clean Pop', from: '#EC4899', to: '#8B5CF6' },
]

export function EditingView() {
  const [activeSceneId, setActiveSceneId] = useState<string>(previewScene.id)
  const [selectedPreset, setSelectedPreset] = useState<string>('Cosmic Cinema')
  const [playhead, setPlayhead] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const activeScene = project.scenes.find((s) => s.id === activeSceneId) ?? previewScene
  const totalDuration = project.scenes.reduce((sum, s) => sum + s.duration, 0)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setPlayhead((p) => (p + 0.5) % totalDuration)
    }, 200)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [totalDuration])

  return (
    <div className="flex h-full flex-col p-5 gap-3">
      {/* Header */}
      <div className="shrink-0">
        <h2 className="text-sm font-bold text-foreground">Post-Production</h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">Final assembly and color grading</p>
      </div>

      {/* Video player */}
      <div className="shrink-0">
        <MockVideoPlayer
          thumbnailUrl={activeScene.thumbnailUrl}
          duration={activeScene.duration}
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

      {/* Effects presets */}
      <div className="shrink-0">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest">Effects Preset</p>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {EFFECT_PRESETS.map((preset) => {
            const isSelected = preset.label === selectedPreset
            return (
              <button
                key={preset.label}
                onClick={() => setSelectedPreset(preset.label)}
                className={cn(
                  'relative rounded-xl border overflow-hidden text-left transition-all cursor-pointer',
                  isSelected ? 'border-primary shadow-md' : 'border-border hover:border-primary/40',
                )}
              >
                <div className="h-8 w-full"
                  style={{ background: `linear-gradient(135deg, ${preset.from}, ${preset.to})` }} />
                <div className="px-1.5 py-1.5">
                  <p className="text-[9px] font-bold text-foreground leading-tight">{preset.label}</p>
                </div>
                {isSelected && (
                  <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-2.5 w-2.5 text-white" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Export row */}
      <EditingExportRow onDownloadAll={() => {}} />
    </div>
  )
}

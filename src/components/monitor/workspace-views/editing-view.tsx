'use client'

import { useState } from 'react'
import { MockVideoPlayer } from '@/components/shared/mock-video-player'
import { SimpleTimeline } from '@/components/editor/simple-timeline'
import { mockProjects } from '@/lib/mock/projects'
import { cn } from '@/lib/utils'

const project = mockProjects[0]
const previewScene = project.scenes[0]

interface EffectPreset {
  label: string
}

const EFFECT_PRESETS: EffectPreset[] = [
  { label: 'Cosmic Cinema' },
  { label: 'Film Noir' },
  { label: 'Warm Vintage' },
  { label: 'Clean Pop' },
]

interface ExportCard {
  platform: string
  format: string
  aspectLabel: string
  ratio: [number, number] // [w, h] relative units
}

const EXPORT_CARDS: ExportCard[] = [
  { platform: 'YouTube', format: '16:9 Full Length', aspectLabel: '16:9', ratio: [32, 18] },
  { platform: 'TikTok', format: '9:16 Vertical 60s', aspectLabel: '9:16', ratio: [18, 32] },
  { platform: 'Instagram', format: '9:16 Reels 30s', aspectLabel: '9:16', ratio: [18, 32] },
]

function AspectIcon({ ratio }: { ratio: [number, number] }) {
  const [w, h] = ratio
  const scale = 32 / Math.max(w, h)
  const pw = Math.round(w * scale)
  const ph = Math.round(h * scale)
  return (
    <div className="flex items-center justify-center" style={{ width: 32, height: 32 }}>
      <div
        className="rounded-sm border border-border bg-muted"
        style={{ width: pw, height: ph }}
      />
    </div>
  )
}

export function EditingView() {
  const [activeSceneId, setActiveSceneId] = useState<string>(previewScene.id)
  const [selectedPreset, setSelectedPreset] = useState<string>('Cosmic Cinema')

  const activeScene = project.scenes.find((s) => s.id === activeSceneId) ?? previewScene
  const totalDuration = project.scenes.reduce((sum, s) => sum + s.duration, 0)

  void totalDuration

  return (
    <div className="flex h-full flex-col p-6 gap-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground">Post-Production</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Final assembly and color grading</p>
      </div>

      {/* Video player */}
      <div className="flex-1 min-h-0">
        <MockVideoPlayer
          thumbnailUrl={activeScene.thumbnailUrl}
          duration={activeScene.duration}
          className="h-full w-full"
        />
      </div>

      {/* Timeline */}
      <div className="shrink-0">
        <p className="text-[10px] text-muted-foreground mb-2 font-mono uppercase tracking-wider">
          Timeline · {project.scenes.length} scenes
        </p>
        <SimpleTimeline
          scenes={project.scenes}
          activeSceneId={activeSceneId}
          playheadPosition={0}
          onSceneClick={setActiveSceneId}
        />
      </div>

      {/* Effects preset row */}
      <div className="shrink-0">
        <p className="text-[10px] text-muted-foreground mb-2 font-mono uppercase tracking-wider">Effects Preset</p>
        <div className="flex gap-2 flex-wrap">
          {EFFECT_PRESETS.map((preset) => {
            const isSelected = preset.label === selectedPreset
            return (
              <button
                key={preset.label}
                onClick={() => setSelectedPreset(preset.label)}
                className={cn(
                  'rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer',
                  isSelected
                    ? 'bg-primary/20 border-primary text-foreground'
                    : 'bg-transparent border-border text-muted-foreground hover:border-border/80 hover:text-foreground',
                )}
              >
                {preset.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Export format cards */}
      <div className="shrink-0">
        <p className="text-[10px] text-muted-foreground mb-2 font-mono uppercase tracking-wider">Export For</p>
        <div className="flex gap-2">
          {EXPORT_CARDS.map((card) => (
            <div
              key={card.platform}
              className="flex-1 flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card p-3 cursor-pointer hover:border-border/60 transition-colors"
            >
              <AspectIcon ratio={card.ratio} />
              <p className="text-[11px] font-semibold text-foreground">{card.platform}</p>
              <p className="text-[9px] text-muted-foreground text-center leading-tight">{card.format}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

'use client'

import { cn } from '@/lib/utils'
import { mockProjects } from '@/lib/mock/projects'
import type { BayTab } from './bay-top-bar'

interface BayPropertiesProps {
  activeTab: BayTab
  selectedSceneId: string | null
  className?: string
  onAction?: (action: string) => void
}

const project = mockProjects[0]

function PropRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">{label}</p>
      <p className="text-xs text-foreground bg-muted/60 rounded-md px-2.5 py-1.5 leading-relaxed">{value}</p>
    </div>
  )
}

function SliderRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{label}</span><span>{value}%</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary/60 rounded-full" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function SegmentDot({ color }: { color: string }) {
  return <div className="h-2 w-2 rounded-full shrink-0" style={{ background: color }} />
}

const VFX_SWATCHES = [
  { name: 'Cosmic Cinema', colors: ['#7C3AED', '#22D3EE'] },
  { name: 'Neon Pulse', colors: ['#EC4899', '#F59E0B'] },
  { name: 'Ocean Drift', colors: ['#06B6D4', '#10B981'] },
  { name: 'Warm Analog', colors: ['#F59E0B', '#EF4444'] },
]

export function BayProperties({ activeTab, selectedSceneId, className, onAction }: BayPropertiesProps) {
  const scene = project.scenes.find((s) => s.id === selectedSceneId) ?? project.scenes[0]
  const peakCount = project.audio.energyCurve.filter((p) => p.isPeak).length

  return (
    <div className={cn('w-72 shrink-0 flex flex-col border-l border-border bg-background overflow-y-auto', className)}>
      <div className="px-3 py-2.5 border-b border-border">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Properties</span>
      </div>

      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        {activeTab === 'input' && (
          <>
            <PropRow label="Track Title" value={project.audio.title} />
            <PropRow label="Artist" value={project.audio.artist} />
            <PropRow label="BPM" value={String(project.audio.bpm)} />
            <PropRow label="Key" value={project.audio.key} />
            <PropRow label="Duration" value={`${Math.floor(project.audio.duration / 60)}:${String(project.audio.duration % 60).padStart(2, '0')}`} />
            <PropRow label="Energy Peaks" value={`${peakCount} peaks detected`} />
            <PropRow label="Beat Markers" value={`${project.audio.beatMarkers.length} detected`} />
            {/* Segments list */}
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Segments</p>
              {project.audio.segments.map((seg) => (
                <div key={seg.id} className="flex items-center gap-2 px-2 py-1.5 bg-muted/60 rounded-md">
                  <SegmentDot color={seg.color} />
                  <span className="text-xs text-foreground flex-1">{seg.label}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {String(Math.floor(seg.startTime / 60))}:{String(Math.floor(seg.startTime % 60)).padStart(2, '0')}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'creative' && (
          <>
            <PropRow label="Genre" value="Cinematic Space Opera" />
            <PropRow label="Mood" value="Epic · Intimate · Euphoric" />
            <PropRow label="Visual Style" value="Slow burn ethereal, lens flares, anamorphic" />
            <PropRow label="Pacing" value="Builds with the beat, slow burn" />
            <PropRow label="Storyline Options" value="3 concepts generated" />
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Palette</p>
              <div className="flex gap-1.5 flex-wrap">
                {['#7C3AED', '#22D3EE', '#EC4899', '#F59E0B', '#A855F7', '#06B6D4'].map((c) => (
                  <div key={c} className="h-6 w-6 rounded-md border border-border/50" style={{ background: c }} />
                ))}
              </div>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Style Seed</p>
              <p className="text-xs font-mono text-purple-400 bg-muted/60 rounded-md px-2.5 py-1.5">CREMI-7C3A-COSMIC</p>
            </div>
          </>
        )}

        {activeTab === 'storyboard' && (
          <>
            <PropRow label="Subject" value={scene.subject} />
            <PropRow label="Action" value={scene.action} />
            <PropRow label="Environment" value={scene.environment} />
            <PropRow label="Camera Angle" value={scene.cameraAngle} />
            <PropRow label="Camera Movement" value={scene.cameraMovement} />
            <PropRow label="Duration" value={`${scene.duration}s`} />
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Prompt</p>
              <p className="text-xs text-muted-foreground bg-muted/60 rounded-md px-2.5 py-2 leading-relaxed">{scene.prompt}</p>
            </div>
            {/* Takes thumbnails */}
            {scene.takes.length > 1 && (
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Takes</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {scene.takes.map((take, ti) => (
                    <div
                      key={take.id}
                      className={cn(
                        'aspect-video rounded-md overflow-hidden border-2 transition-all cursor-pointer',
                        take.selected ? 'border-primary' : 'border-border/40 opacity-70 hover:opacity-100'
                      )}
                    >
                      <img src={take.thumbnailUrl} alt={`Take ${ti + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'generate' && (
          <>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Model</p>
              <select className="w-full text-xs bg-muted/60 rounded-md px-2.5 py-1.5 text-foreground border-none outline-none">
                <option>Kling 2.6</option>
                <option>Runway Gen-4</option>
                <option>Sora</option>
                <option>Pika 2.0</option>
              </select>
            </div>
            <div className="space-y-2">
              <SliderRow label="Quality" value={85} />
              <SliderRow label="Consistency" value={72} />
              <SliderRow label="Motion Intensity" value={60} />
            </div>
            <PropRow label="Resolution" value="1920 × 1080" />
            <PropRow label="Frame Rate" value="24 fps" />
            <PropRow label="Estimated Time" value="~4 min per scene" />
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Motion Strategy</p>
              <div className="bg-muted/60 rounded-md px-2.5 py-1.5">
                <p className="text-xs text-foreground">Music-Aware</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Dynamic for chorus, gentle for verse</p>
              </div>
            </div>
          </>
        )}

        {activeTab === 'edit' && (
          <>
            {/* VFX presets with visual swatches */}
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">VFX Preset</p>
              <div className="grid grid-cols-2 gap-1.5">
                {VFX_SWATCHES.map((preset, i) => (
                  <button
                    key={preset.name}
                    onClick={() => onAction?.(`apply_vfx_${preset.name.toLowerCase().replace(/\s+/g, '_')}`)}
                    className={cn(
                      'flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] border transition-all',
                      i === 0
                        ? 'border-primary bg-primary/15 text-foreground'
                        : 'border-border/40 bg-muted/40 text-muted-foreground hover:border-border'
                    )}
                  >
                    <div
                      className="h-3.5 w-3.5 rounded shrink-0"
                      style={{ background: `linear-gradient(135deg, ${preset.colors[0]}, ${preset.colors[1]})` }}
                    />
                    <span className="truncate">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Transition type selector */}
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Transition</p>
              <select className="w-full text-xs bg-muted/60 rounded-md px-2.5 py-1.5 text-foreground border-none outline-none">
                <option>Cut</option>
                <option>Dissolve</option>
                <option>Fade to Black</option>
                <option>Wipe</option>
                <option>Zoom Blur</option>
              </select>
            </div>

            {/* Export quality selector */}
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Export Quality</p>
              <select className="w-full text-xs bg-muted/60 rounded-md px-2.5 py-1.5 text-foreground border-none outline-none">
                <option>4K Ultra HD</option>
                <option>1080p Full HD</option>
                <option>720p HD</option>
                <option>480p</option>
              </select>
            </div>

            {/* Estimated file sizes per format */}
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Export Formats</p>
              {[
                { label: 'YouTube 16:9', size: '~320 MB' },
                { label: 'TikTok 9:16', size: '~180 MB' },
                { label: 'Instagram 1:1', size: '~220 MB' },
              ].map((fmt) => (
                <div key={fmt.label} className="flex items-center justify-between px-2 py-1.5 rounded-md bg-muted/60">
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 rounded-sm bg-primary/70 flex items-center justify-center shrink-0">
                      <div className="h-1.5 w-1.5 rounded-sm bg-primary-foreground" />
                    </div>
                    <span className="text-xs text-foreground">{fmt.label}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">{fmt.size}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

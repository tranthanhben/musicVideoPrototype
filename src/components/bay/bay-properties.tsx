'use client'

import { cn } from '@/lib/utils'
import { mockProjects } from '@/lib/mock/projects'
import type { BayTab } from './bay-top-bar'

interface BayPropertiesProps {
  activeTab: BayTab
  selectedSceneId: string | null
  className?: string
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

function Swatch({ color }: { color: string }) {
  return <div className="h-6 w-6 rounded-md border border-border/50" style={{ background: color }} />
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

export function BayProperties({ activeTab, selectedSceneId, className }: BayPropertiesProps) {
  const scene = project.scenes.find((s) => s.id === selectedSceneId) ?? project.scenes[0]

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
            <PropRow label="Duration" value={`${Math.floor(project.audio.duration / 60)}:${String(project.audio.duration % 60).padStart(2, '0')}`} />
            <PropRow label="Key" value="A minor" />
            <PropRow label="Sections" value="Intro · Verse · Chorus · Bridge · Outro" />
            <PropRow label="Beat Markers" value={`${project.audio.beatMarkers.length} detected`} />
          </>
        )}

        {activeTab === 'creative' && (
          <>
            <PropRow label="Genre" value="Cinematic Space Opera" />
            <PropRow label="Mood" value="Epic · Intimate · Euphoric" />
            <PropRow label="Visual Style" value="Slow burn ethereal, lens flares, anamorphic" />
            <PropRow label="Pacing" value="Builds with the beat, slow burn" />
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Palette</p>
              <div className="flex gap-1.5 flex-wrap">
                {['#7C3AED', '#22D3EE', '#EC4899', '#F59E0B', '#A855F7', '#06B6D4'].map((c) => (
                  <Swatch key={c} color={c} />
                ))}
              </div>
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
              <SliderRow label="Motion Strength" value={60} />
            </div>
            <PropRow label="Resolution" value="1920 × 1080" />
            <PropRow label="Frame Rate" value="24 fps" />
            <PropRow label="Duration" value={`${scene.duration}s`} />
          </>
        )}

        {activeTab === 'edit' && (
          <>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Transition</p>
              <select className="w-full text-xs bg-muted/60 rounded-md px-2.5 py-1.5 text-foreground border-none outline-none">
                <option>Cut</option>
                <option>Dissolve</option>
                <option>Fade to Black</option>
                <option>Wipe</option>
              </select>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Color Grading</p>
              <div className="space-y-2">
                <SliderRow label="Exposure" value={50} />
                <SliderRow label="Contrast" value={65} />
                <SliderRow label="Saturation" value={55} />
                <SliderRow label="Temperature" value={48} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Effects</p>
              {['Film Grain', 'Lens Flare', 'Vignette'].map((e) => (
                <div key={e} className="flex items-center gap-2 px-2 py-1 rounded-md bg-muted/60">
                  <div className="h-3 w-3 rounded-sm bg-primary/60" />
                  <span className="text-xs text-foreground">{e}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

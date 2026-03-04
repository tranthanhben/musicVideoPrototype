'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Download } from 'lucide-react'
import { MockVideoPlayer } from '@/components/shared/mock-video-player'
import { SimpleTimeline } from '@/components/editor/simple-timeline'
import { mockProjects } from '@/lib/mock/projects'
import { cn } from '@/lib/utils'

const project = mockProjects[0]
const scenes = project.scenes

const SLIDERS = [
  { label: 'Exposure', value: 50 },
  { label: 'Contrast', value: 65 },
  { label: 'Saturation', value: 55 },
]

const EFFECTS = ['Film Grain', 'Lens Flare', 'Vignette']

export function ForgeStepPolish() {
  const [sliders, setSliders] = useState(SLIDERS.map((s) => s.value))
  const [effects, setEffects] = useState<Record<string, boolean>>({
    'Film Grain': true,
    'Lens Flare': false,
    Vignette: true,
  })
  const [activeSceneId, setActiveSceneId] = useState<string | undefined>()

  return (
    <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto px-6">
      <div className="grid grid-cols-3 gap-4">
        {/* Left: Video player */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="col-span-2 flex flex-col gap-3"
        >
          <MockVideoPlayer
            thumbnailUrl={project.thumbnailUrl}
            duration={project.audio.duration}
            className="w-full"
          />
          <SimpleTimeline
            scenes={scenes}
            activeSceneId={activeSceneId}
            onSceneClick={setActiveSceneId}
          />
        </motion.div>

        {/* Right: Color grading + effects */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col gap-4"
        >
          {/* Color grading */}
          <div className="rounded-lg border border-border bg-card/40 p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Color Grading
            </p>
            <div className="flex flex-col gap-3">
              {SLIDERS.map((s, idx) => (
                <div key={s.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground/80">{s.label}</span>
                    <span className="text-muted-foreground font-mono">{sliders[idx]}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={sliders[idx]}
                    onChange={(e) => {
                      const next = [...sliders]
                      next[idx] = Number(e.target.value)
                      setSliders(next)
                    }}
                    className="w-full h-1.5 rounded-full accent-primary cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Effects */}
          <div className="rounded-lg border border-border bg-card/40 p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Effects
            </p>
            <div className="flex flex-col gap-2">
              {EFFECTS.map((effect) => (
                <label key={effect} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={effects[effect]}
                    onChange={() =>
                      setEffects((prev) => ({ ...prev, [effect]: !prev[effect] }))
                    }
                    className="rounded accent-primary h-3.5 w-3.5 cursor-pointer"
                  />
                  <span className="text-sm text-foreground/80">{effect}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Export (visual only) */}
          <button
            disabled
            className={cn(
              'flex items-center justify-center gap-2 rounded-lg px-4 py-2.5',
              'bg-muted text-muted-foreground text-sm font-medium cursor-not-allowed opacity-60',
            )}
          >
            <Download className="h-4 w-4" />
            Export Final Cut
          </button>
        </motion.div>
      </div>
    </div>
  )
}

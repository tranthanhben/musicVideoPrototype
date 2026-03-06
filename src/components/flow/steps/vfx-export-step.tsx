'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Sparkles, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockProjects } from '@/lib/mock/projects'
import { MockVideoPlayer } from '@/components/shared/mock-video-player'
import { SimpleTimeline } from '@/components/editor/simple-timeline'
import { VFX_FILTERS, ExportPlatformCard, ConfettiParticle, generateParticles, VfxControls } from './vfx-export-sub'

interface VfxExportStepProps {
  trackIndex: number
}

const EXPORT_FORMATS = [
  { platform: 'YouTube', format: '16:9 Full Length', aspectLabel: '16:9', ratio: [32, 18] as [number, number] },
  { platform: 'TikTok', format: '9:16 Vertical 60s', aspectLabel: '9:16', ratio: [18, 32] as [number, number] },
  { platform: 'Instagram', format: '9:16 Reels 30s', aspectLabel: '9:16', ratio: [18, 32] as [number, number] },
]

export function VfxExportStep({ trackIndex }: VfxExportStepProps) {
  const project = mockProjects[trackIndex] ?? mockProjects[0]
  const [activeSceneId, setActiveSceneId] = useState(project.scenes[0].id)
  const [selectedVfx, setSelectedVfx] = useState('cosmic-cinema')
  const [selectedTransition, setSelectedTransition] = useState('beat-sync')
  const [rendering, setRendering] = useState(false)
  const [renderProgress, setRenderProgress] = useState(0)
  const [exported, setExported] = useState(false)
  const [particles, setParticles] = useState<ReturnType<typeof generateParticles>>([])

  const activeScene = project.scenes.find((s) => s.id === activeSceneId) ?? project.scenes[0]
  const videoFilter = VFX_FILTERS[selectedVfx] ?? 'none'

  function startRender() {
    if (rendering || exported) return
    setRendering(true)
    setRenderProgress(0)
  }

  useEffect(() => {
    if (!rendering || exported) return
    const start = Date.now()
    const duration = 3000
    const raf = requestAnimationFrame(function tick() {
      const elapsed = Date.now() - start
      const pct = Math.min(elapsed / duration, 1)
      setRenderProgress(pct)
      if (pct < 1) {
        requestAnimationFrame(tick)
      } else {
        setRendering(false)
        setExported(true)
        setParticles(generateParticles())
      }
    })
    return () => cancelAnimationFrame(raf)
  }, [rendering, exported])

  return (
    <div className="flex h-full flex-col overflow-hidden p-6 gap-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between shrink-0"
      >
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-bold text-foreground">VFX & Export</h2>
          </div>
          <p className="text-xs text-muted-foreground">Apply visual effects, transitions, and export your video</p>
        </div>
      </motion.div>

      {/* Video preview with live VFX filter */}
      <div className="shrink-0 max-h-[200px]" style={{ filter: videoFilter, transition: 'filter 0.4s ease' }}>
        <MockVideoPlayer
          thumbnailUrl={activeScene.thumbnailUrl}
          duration={activeScene.duration}
          className="h-full w-full"
        />
      </div>

      {/* Timeline */}
      <div className="shrink-0">
        <p className="text-[10px] text-muted-foreground mb-1.5 font-mono uppercase tracking-wider">
          Timeline | {project.scenes.length} scenes
        </p>
        <SimpleTimeline
          scenes={project.scenes}
          activeSceneId={activeSceneId}
          playheadPosition={0}
          onSceneClick={setActiveSceneId}
        />
      </div>

      {/* VFX + Transitions + Export formats */}
      <div className="flex-1 overflow-y-auto space-y-3">
        <VfxControls
          selectedVfx={selectedVfx}
          selectedTransition={selectedTransition}
          onVfxChange={setSelectedVfx}
          onTransitionChange={setSelectedTransition}
        />

        {/* Export formats */}
        <div>
          <p className="text-[10px] text-muted-foreground mb-1.5 font-mono uppercase tracking-wider">Export For</p>
          <div className="grid grid-cols-3 gap-2">
            {EXPORT_FORMATS.map((fmt) => (
              <ExportPlatformCard key={fmt.platform} fmt={fmt} exported={exported} />
            ))}
          </div>
        </div>
      </div>

      {/* Render progress bar */}
      <AnimatePresence>
        {rendering && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="shrink-0">
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                style={{ width: `${renderProgress * 100}%`, transition: 'width 0.1s linear' }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 text-center">
              Rendering… {Math.round(renderProgress * 100)}%
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export done message */}
      <AnimatePresence>
        {exported && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="shrink-0 flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-500/30 px-3 py-2"
          >
            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
            <p className="text-xs font-semibold text-green-500">
              Your music video is ready! &mdash; <span className="font-normal text-muted-foreground">{project.title}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export button + confetti */}
      <div className="shrink-0 relative">
        {/* Confetti particles */}
        <AnimatePresence>
          {exported && particles.map((p) => (
            <ConfettiParticle key={p.id} color={p.color} x={p.x} delay={p.delay} duration={p.duration} size={p.size} xOffset={p.xOffset} />
          ))}
        </AnimatePresence>

        <motion.button
          onClick={startRender}
          disabled={rendering || exported}
          animate={exported ? { backgroundColor: 'rgba(34,197,94,0.15)', color: 'rgb(34,197,94)' } : {}}
          className={cn(
            'w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2',
            exported
              ? 'border border-green-500/30'
              : rendering
              ? 'bg-primary/50 text-primary-foreground cursor-not-allowed'
              : 'bg-primary text-primary-foreground hover:bg-primary/90',
          )}
        >
          {exported ? (
            <><CheckCircle2 className="h-4 w-4" /> Export Ready! Download All Formats</>
          ) : (
            <><Download className="h-4 w-4" /> Render & Export</>
          )}
        </motion.button>
      </div>
    </div>
  )
}

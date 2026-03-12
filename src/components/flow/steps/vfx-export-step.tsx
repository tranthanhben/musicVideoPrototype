'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Sparkles, CheckCircle2, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockProjects } from '@/lib/mock/projects'
import { MockVideoPlayer } from '@/components/shared/mock-video-player'
import { SimpleTimeline } from '@/components/editor/simple-timeline'
import { VFX_FILTERS, ExportPlatformCard, ConfettiParticle, generateParticles, VfxControls } from './vfx-export-sub'

interface VfxExportStepProps {
  trackIndex: number
}

const EXPORT_FORMATS = [
  { platform: 'YouTube', format: '16:9 Full Length', aspectLabel: '16:9', ratio: [32, 18] as [number, number], dimensions: '3840×2160 4K', fileFormat: 'MP4 H.264' },
  { platform: 'TikTok',  format: '9:16 Vertical 60s', aspectLabel: '9:16', ratio: [18, 32] as [number, number], dimensions: '1080×1920 FHD', fileFormat: 'MP4 H.265' },
  { platform: 'Instagram', format: '9:16 Reels 30s', aspectLabel: '9:16', ratio: [18, 32] as [number, number], dimensions: '1080×1920 FHD', fileFormat: 'MP4 H.265' },
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
    const duration = 3200
    const raf = requestAnimationFrame(function tick() {
      const elapsed = Date.now() - start
      const pct = Math.min(elapsed / duration, 1)
      // Ease out for more dramatic feel
      const eased = 1 - Math.pow(1 - pct, 2.5)
      setRenderProgress(eased)
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
      {/* Header — full width always */}
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

        {exported && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 rounded-full bg-green-500/15 border border-green-500/30 px-3 py-1.5"
          >
            <Trophy className="h-3.5 w-3.5 text-green-500" />
            <span className="text-xs font-semibold text-green-500">Export Ready</span>
          </motion.div>
        )}
      </motion.div>

      {/* Body: flex-col on mobile, flex-row on lg+ */}
      <div className="flex-1 min-h-0 flex flex-col gap-4 overflow-y-auto lg:overflow-hidden lg:flex-row lg:gap-5">

        {/* ---- LEFT col: video + timeline [+ desktop: status + button] ---- */}
        <div className="flex flex-col gap-3 lg:w-[56%] lg:flex-none lg:overflow-hidden">

          {/* Video preview with live VFX */}
          <div
            className="shrink-0 rounded-xl overflow-hidden transition-all duration-500"
            style={{ filter: videoFilter }}
          >
            <MockVideoPlayer
              thumbnailUrl={activeScene.thumbnailUrl}
              duration={activeScene.duration}
              className="w-full"
            />
          </div>

          {/* Timeline */}
          <div className="shrink-0">
            <p className="text-[10px] text-muted-foreground mb-1.5 font-mono uppercase tracking-wider">
              Timeline · {project.scenes.length} scenes
            </p>
            <SimpleTimeline
              scenes={project.scenes}
              activeSceneId={activeSceneId}
              playheadPosition={0}
              onSceneClick={setActiveSceneId}
            />
          </div>

          {/* Spacer (desktop only) — pushes status + button to bottom */}
          <div className="hidden lg:flex flex-1" />

          {/* Desktop: render progress */}
          <AnimatePresence>
            {rendering && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="hidden lg:block shrink-0 space-y-1.5"
              >
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Rendering final export…</span>
                  <span className="font-mono">{Math.round(renderProgress * 100)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full relative overflow-hidden"
                    style={{
                      width: `${renderProgress * 100}%`,
                      background: 'linear-gradient(90deg, #7C3AED, #06B6D4, #EC4899)',
                      transition: 'width 0.1s linear',
                    }}
                  >
                    <motion.div
                      className="absolute inset-y-0 w-12 bg-white/30 skew-x-[-20deg]"
                      animate={{ x: ['-300%', '400%'] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'linear', repeatDelay: 0.2 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Desktop: export complete */}
          <AnimatePresence>
            {exported && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="hidden lg:flex shrink-0 items-center gap-3 rounded-xl bg-green-500/10 border border-green-500/30 px-3 py-2.5"
              >
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-green-500">Your music video is ready!</p>
                  <p className="text-[10px] text-muted-foreground">{project.title} · 3 formats exported</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Desktop: export button + confetti */}
          <div className="hidden lg:block shrink-0 relative">
            <AnimatePresence>
              {exported && particles.map((p) => (
                <ConfettiParticle
                  key={p.id}
                  color={p.color}
                  x={p.x}
                  delay={p.delay}
                  duration={p.duration}
                  size={p.size}
                  xOffset={p.xOffset}
                  shape={p.shape}
                />
              ))}
            </AnimatePresence>
            <motion.button
              onClick={startRender}
              disabled={rendering || exported}
              whileHover={!rendering && !exported ? { scale: 1.01 } : {}}
              whileTap={!rendering && !exported ? { scale: 0.99 } : {}}
              animate={exported ? { backgroundColor: 'rgba(34,197,94,0.15)', color: 'rgb(34,197,94)' } : {}}
              className={cn(
                'w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2',
                exported
                  ? 'border border-green-500/40'
                  : rendering
                  ? 'bg-primary/50 text-primary-foreground cursor-not-allowed'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90',
              )}
            >
              {exported ? (
                <><CheckCircle2 className="h-4 w-4" /> Download All Formats</>
              ) : rendering ? (
                <><span className="animate-spin">&#9696;</span> Rendering…</>
              ) : (
                <><Download className="h-4 w-4" /> Render & Export</>
              )}
            </motion.button>
          </div>

        </div>{/* end LEFT col */}

        {/* ---- RIGHT col: VFX controls + export platforms ---- */}
        <div className="lg:flex-1 lg:overflow-y-auto space-y-3">
          <VfxControls
            selectedVfx={selectedVfx}
            selectedTransition={selectedTransition}
            onVfxChange={setSelectedVfx}
            onTransitionChange={setSelectedTransition}
          />

          {/* Export platforms */}
          <div>
            <p className="text-[10px] text-muted-foreground mb-2 font-mono uppercase tracking-wider">Export For</p>
            <div className="grid grid-cols-3 gap-2">
              {EXPORT_FORMATS.map((fmt) => (
                <ExportPlatformCard key={fmt.platform} fmt={fmt} exported={exported} />
              ))}
            </div>
          </div>
        </div>{/* end RIGHT col */}

      </div>{/* end body */}

      {/* Mobile only: render progress + export complete + export button */}
      <div className="lg:hidden shrink-0 space-y-3">
        <AnimatePresence>
          {rendering && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1.5"
            >
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Rendering final export…</span>
                <span className="font-mono">{Math.round(renderProgress * 100)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full relative overflow-hidden"
                  style={{
                    width: `${renderProgress * 100}%`,
                    background: 'linear-gradient(90deg, #7C3AED, #06B6D4, #EC4899)',
                    transition: 'width 0.1s linear',
                  }}
                >
                  <motion.div
                    className="absolute inset-y-0 w-12 bg-white/30 skew-x-[-20deg]"
                    animate={{ x: ['-300%', '400%'] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'linear', repeatDelay: 0.2 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {exported && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 rounded-xl bg-green-500/10 border border-green-500/30 px-3 py-2.5"
            >
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-green-500">Your music video is ready!</p>
                <p className="text-[10px] text-muted-foreground">{project.title} · 3 formats exported</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative">
          <AnimatePresence>
            {exported && particles.map((p) => (
              <ConfettiParticle
                key={p.id}
                color={p.color}
                x={p.x}
                delay={p.delay}
                duration={p.duration}
                size={p.size}
                xOffset={p.xOffset}
                shape={p.shape}
              />
            ))}
          </AnimatePresence>
          <motion.button
            onClick={startRender}
            disabled={rendering || exported}
            whileHover={!rendering && !exported ? { scale: 1.01 } : {}}
            whileTap={!rendering && !exported ? { scale: 0.99 } : {}}
            animate={exported ? { backgroundColor: 'rgba(34,197,94,0.15)', color: 'rgb(34,197,94)' } : {}}
            className={cn(
              'w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2',
              exported
                ? 'border border-green-500/40'
                : rendering
                ? 'bg-primary/50 text-primary-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary/90',
            )}
          >
            {exported ? (
              <><CheckCircle2 className="h-4 w-4" /> Download All Formats</>
            ) : rendering ? (
              <><span className="animate-spin">&#9696;</span> Rendering…</>
            ) : (
              <><Download className="h-4 w-4" /> Render & Export</>
            )}
          </motion.button>
        </div>
      </div>{/* end mobile-only section */}

    </div>
  )
}

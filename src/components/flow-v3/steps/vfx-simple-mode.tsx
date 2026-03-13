'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, CheckCircle2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { VFX_PRESETS, TRANSITION_TYPES } from '@/lib/flow-v3/mock-data'
import { VFX_FILTERS, ConfettiParticle, generateParticles } from './vfx-export-sub'
import type { MockScene } from '@/lib/mock/types'

const RESOLUTIONS = [
  { id: '4k', label: '4K Ultra HD', sub: '3840 × 2160' },
  { id: '1080p', label: '1080p Full HD', sub: '1920 × 1080' },
  { id: '720p', label: '720p HD', sub: '1280 × 720' },
]

const EXPORT_PLATFORMS = [
  { id: 'youtube', label: 'YouTube', aspect: '16:9', icon: '▶', color: '#EF4444' },
  { id: 'tiktok', label: 'TikTok', aspect: '9:16', icon: '♪', color: '#EC4899' },
  { id: 'instagram', label: 'Instagram', aspect: '1:1', icon: '◈', color: '#A855F7' },
]

interface VfxSimpleModeProps {
  scenes: MockScene[]
  activeSceneId: string
}

export function VfxSimpleMode({ scenes, activeSceneId }: VfxSimpleModeProps) {
  const [selectedVfx, setSelectedVfx] = useState('cosmic-cinema')
  const [selectedTransition, setSelectedTransition] = useState('beat-sync')
  const [selectedResolution, setSelectedResolution] = useState('1080p')
  const [rendering, setRendering] = useState(false)
  const [renderProgress, setRenderProgress] = useState(0)
  const [exported, setExported] = useState(false)
  const [particles, setParticles] = useState<ReturnType<typeof generateParticles>>([])

  const activeScene = scenes.find((s) => s.id === activeSceneId) ?? scenes[0]
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
    <div className="flex h-full flex-col overflow-hidden p-4 gap-4">
      {/* Top: Preview + Controls */}
      <div className="flex flex-1 min-h-0 gap-4">
        {/* Video preview */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <div
            className="relative w-full rounded-xl overflow-hidden shadow-2xl shadow-black/50 bg-zinc-950"
            style={{ filter: videoFilter, transition: 'filter 0.4s ease', aspectRatio: '16/9' }}
          >
            <img
              src={activeScene.thumbnailUrl ?? '/assets/export/final-preview.jpg'}
              alt={`Scene ${activeScene.index + 1}`}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="rounded-md bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[10px] font-mono text-white/80">
                S{activeScene.index + 1} / {scenes.length}
              </span>
            </div>
            <div className="absolute top-3 right-3">
              <span className="rounded-md bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5" />
                {selectedVfx.replace(/-/g, ' ')}
              </span>
            </div>
            <div className="absolute bottom-3 left-3">
              <span className="rounded-md bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[10px] font-mono text-zinc-400">
                {selectedTransition.replace(/-/g, ' ')} · {selectedResolution}
              </span>
            </div>
          </div>

          {/* VFX Presets grid */}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">VFX Preset</p>
            <div className="grid grid-cols-3 gap-1.5">
              {VFX_PRESETS.map((vfx) => (
                <button
                  key={vfx.id}
                  onClick={() => setSelectedVfx(vfx.id)}
                  className={cn(
                    'rounded-lg border p-2 text-left transition-all cursor-pointer',
                    selectedVfx === vfx.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card text-muted-foreground hover:border-border/60 hover:text-foreground',
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: vfx.accentColor }} />
                    <span className="text-[10px] font-semibold truncate">{vfx.label}</span>
                  </div>
                  <p className="text-[8px] text-muted-foreground leading-tight">{vfx.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right controls */}
        <div className="w-56 shrink-0 flex flex-col gap-3">
          {/* Transition */}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Transition</p>
            <div className="flex flex-col gap-1">
              {TRANSITION_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTransition(t.id)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-[11px] font-medium text-left transition-colors cursor-pointer border',
                    selectedTransition === t.id
                      ? 'bg-primary/15 border-primary/30 text-primary'
                      : 'bg-card border-border text-muted-foreground hover:text-foreground',
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Resolution */}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Resolution</p>
            <div className="flex flex-col gap-1">
              {RESOLUTIONS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedResolution(r.id)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-left transition-colors cursor-pointer border',
                    selectedResolution === r.id
                      ? 'bg-primary/15 border-primary/30 text-primary'
                      : 'bg-card border-border text-muted-foreground hover:text-foreground',
                  )}
                >
                  <p className="text-[11px] font-medium">{r.label}</p>
                  <p className="text-[9px] text-muted-foreground font-mono">{r.sub}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Export platforms row */}
      <div className="shrink-0">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Export</p>
        <div className="flex gap-2">
          {EXPORT_PLATFORMS.map((p) => (
            <motion.button
              key={p.id}
              onClick={startRender}
              disabled={rendering}
              whileHover={!rendering && !exported ? { scale: 1.02 } : {}}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-colors cursor-pointer border',
                exported
                  ? 'border-green-500/30 bg-green-500/10 text-green-400'
                  : rendering
                    ? 'bg-muted border-border text-muted-foreground cursor-not-allowed'
                    : 'bg-card border-border text-foreground hover:bg-primary hover:border-primary hover:text-primary-foreground',
              )}
            >
              {exported ? (
                <><CheckCircle2 className="h-3.5 w-3.5" /> {p.label}</>
              ) : rendering ? (
                <>{Math.round(renderProgress * 100)}%</>
              ) : (
                <><Download className="h-3.5 w-3.5" /> {p.label} <span className="text-[10px] opacity-60">{p.aspect}</span></>
              )}
            </motion.button>
          ))}
        </div>

        {/* Confetti */}
        <div className="relative h-0">
          <AnimatePresence>
            {exported && particles.map((pt) => (
              <ConfettiParticle key={pt.id} color={pt.color} x={pt.x} delay={pt.delay} duration={pt.duration} size={pt.size} xOffset={pt.xOffset} />
            ))}
          </AnimatePresence>
        </div>

        {/* Render progress bar */}
        {rendering && (
          <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${renderProgress * 100}%` }} />
          </div>
        )}
        <p className="text-center text-[10px] text-muted-foreground mt-2">
          {exported ? 'Export ready — download above' : 'Estimated cost: 0 credits'}
        </p>
      </div>
    </div>
  )
}

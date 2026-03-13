'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Download, CheckCircle2, Sparkles, ArrowLeftRight, SlidersHorizontal, Type, Captions } from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockProjects } from '@/lib/mock/projects'
import type { MockScene } from '@/lib/mock/types'
import { MediaLibrary } from './media-library'
import { DirectorChat } from './director-chat'
import { EditorTimeline } from './editor-timeline'
import { VFX_FILTERS, ConfettiParticle, generateParticles } from './vfx-export-sub'
import { VfxSimpleMode } from './vfx-simple-mode'
import { VFX_PRESETS, TRANSITION_TYPES } from '@/lib/flow-v3/mock-data'

// ─── Types ──────────────────────────────────────────────────

interface VfxExportStepProps {
  trackIndex: number
}

const TOOLBAR_TABS = [
  { id: 'effects', label: 'Effects', icon: Sparkles },
  { id: 'transitions', label: 'Transitions', icon: ArrowLeftRight },
  { id: 'filters', label: 'Filters', icon: SlidersHorizontal },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'sub', label: 'Sub', icon: Captions },
] as const

const FILTER_PRESETS = [
  { id: 'normal', label: 'Normal', color: '#71717A' },
  { id: 'warm', label: 'Warm', color: '#F59E0B' },
  { id: 'cool', label: 'Cool', color: '#06B6D4' },
  { id: 'vivid', label: 'Vivid', color: '#EC4899' },
  { id: 'muted', label: 'Muted', color: '#78716C' },
  { id: 'bw', label: 'B&W', color: '#A1A1AA' },
  { id: 'teal-orange', label: 'Teal & Orange', color: '#0D9488' },
  { id: 'cinematic', label: 'Cinematic', color: '#7C3AED' },
]

const TEXT_OPTIONS = [
  { id: 'title', label: 'Title Card' },
  { id: 'lower-third', label: 'Lower Third' },
  { id: 'lyrics', label: 'Lyrics' },
  { id: 'custom', label: 'Custom Text' },
]

const SUB_OPTIONS = [
  { id: 'auto', label: 'Auto-generated' },
  { id: 'karaoke', label: 'Karaoke Style' },
  { id: 'srt', label: 'Import SRT' },
]

// ─── Real scene image URLs ───────────────────────────────────

const SCENE_IMAGE_URLS = [
  '/assets/scenes/scene-01-the-void.jpg',
  '/assets/scenes/scene-02-aria-reaching.jpg',
  '/assets/scenes/scene-03-crystal-ship.jpg',
  '/assets/scenes/scene-04-moon-dance.jpg',
  '/assets/scenes/scene-05-supernova-voice.jpg',
  '/assets/scenes/scene-06-saturn-embrace.jpg',
  '/assets/scenes/scene-07-comet-guitar.jpg',
  '/assets/scenes/scene-08-edge-of-universe.jpg',
]

const SCENE_TEMPLATES: { subject: string; action: string; environment: string }[] = [
  { subject: 'Singer', action: 'walking through golden mist', environment: 'ethereal fog' },
  { subject: 'Couple', action: 'silhouetted against sunset', environment: 'beach shoreline' },
  { subject: 'Dancer', action: 'spinning in slow motion', environment: 'empty warehouse' },
  { subject: 'Band', action: 'performing under spotlights', environment: 'dark stage' },
  { subject: 'Woman', action: 'running through rain', environment: 'city street at night' },
  { subject: 'Man', action: 'looking out a car window', environment: 'highway at dusk' },
  { subject: 'Crowd', action: 'jumping in unison', environment: 'festival main stage' },
  { subject: 'Singer', action: 'close-up emotional performance', environment: 'spotlight beam' },
  { subject: 'Couple', action: 'slow dance under string lights', environment: 'garden patio' },
  { subject: 'Dancer', action: 'leaping through laser grid', environment: 'neon club' },
  { subject: 'Woman', action: 'floating in water', environment: 'crystal-clear pool' },
  { subject: 'Singer', action: 'screaming into the void', environment: 'cliff edge at storm' },
  { subject: 'Group', action: 'walking in formation', environment: 'empty desert road' },
  { subject: 'Man', action: 'playing piano in ruins', environment: 'abandoned cathedral' },
  { subject: 'Couple', action: 'faces inches apart', environment: 'dim candlelit room' },
  { subject: 'Singer', action: 'surrounded by floating petals', environment: 'cherry blossom grove' },
  { subject: 'Dancer', action: 'krumping with energy', environment: 'graffiti alleyway' },
  { subject: 'Band', action: 'backstage getting ready', environment: 'mirror-lined dressing room' },
  { subject: 'Woman', action: 'driving a vintage convertible', environment: 'coastal highway' },
  { subject: 'Singer', action: 'reflected in shattered mirror', environment: 'dark studio' },
  { subject: 'Crowd', action: 'holding up phone lights', environment: 'arena from above' },
  { subject: 'Couple', action: 'kissing in the rain', environment: 'empty parking lot' },
  { subject: 'Dancer', action: 'contemporary floor work', environment: 'white void studio' },
  { subject: 'Man', action: 'boxing in slow motion', environment: 'old gym, sweat and dust' },
  { subject: 'Singer', action: 'whispering to camera', environment: 'extreme macro lens' },
  { subject: 'Group', action: 'laughing around bonfire', environment: 'beach night' },
  { subject: 'Woman', action: 'emerging from underwater', environment: 'dark ocean surface' },
  { subject: 'Dancer', action: 'freeze frame mid-air', environment: 'rooftop at dawn' },
  { subject: 'Singer', action: 'performing with passion', environment: 'fireworks behind' },
  { subject: 'Couple', action: 'walking away from camera', environment: 'misty forest path' },
  { subject: 'Band', action: 'smashing instruments', environment: 'rooftop at sunset' },
  { subject: 'Woman', action: 'spinning with fabric veil', environment: 'wind-swept field' },
  { subject: 'Singer', action: 'tears rolling down face', environment: 'single overhead light' },
  { subject: 'Dancer', action: 'tutting with precision', environment: 'LED cube installation' },
  { subject: 'Man', action: 'walking through crowd', environment: 'busy market, golden hour' },
  { subject: 'Crowd', action: 'moshing with energy', environment: 'underground venue' },
  { subject: 'Couple', action: 'staring at the stars', environment: 'rooftop blanket' },
  { subject: 'Singer', action: 'singing with choir behind', environment: 'grand hall' },
  { subject: 'Dancer', action: 'voguing with attitude', environment: 'ballroom with mirrors' },
  { subject: 'Woman', action: 'looking back over shoulder', environment: 'train platform' },
  { subject: 'Band', action: 'riding in a van', environment: 'highway through mountains' },
  { subject: 'Singer', action: 'unraveling bandages', environment: 'clinical white room' },
  { subject: 'Dancer', action: 'popping and locking', environment: 'subway platform' },
  { subject: 'Couple', action: 'arguing passionately', environment: 'apartment kitchen' },
  { subject: 'Man', action: 'painting a large canvas', environment: 'art loft, paint splatter' },
  { subject: 'Singer', action: 'finale pose with band', environment: 'confetti falling' },
  { subject: 'Group', action: 'running toward camera', environment: 'open field, golden light' },
  { subject: 'Woman', action: 'hand reaching for light', environment: 'dark void, single ray' },
  { subject: 'Dancer', action: 'body rolling in smoke', environment: 'haze-filled stage' },
  { subject: 'Singer', action: 'final note, eyes closed', environment: 'fade to black' },
]

const CAMERA_ANGLES = ['wide shot', 'medium shot', 'close-up', 'extreme close-up', 'low angle', 'high angle', 'aerial', 'POV', 'over-the-shoulder']
const CAMERA_MOVEMENTS = ['slow dolly in', 'slow pan', 'tracking shot', 'crane up', 'handheld', 'steadicam orbit', 'whip pan', 'push in', 'pullback reveal', 'static']

function generateScenes(targetCount: number): MockScene[] {
  const result: MockScene[] = []
  for (let i = 0; i < targetCount; i++) {
    const template = SCENE_TEMPLATES[i % SCENE_TEMPLATES.length]
    const duration = 2 + (i * 7 + 3) % 5
    const angle = CAMERA_ANGLES[(i * 3 + 5) % CAMERA_ANGLES.length]
    const movement = CAMERA_MOVEMENTS[(i * 4 + 2) % CAMERA_MOVEMENTS.length]
    result.push({
      id: `scene-${i}`,
      index: i,
      subject: template.subject,
      action: template.action,
      environment: template.environment,
      cameraAngle: angle,
      cameraMovement: movement,
      prompt: `${template.subject} ${template.action} in ${template.environment}, ${angle}, ${movement}, cinematic`,
      thumbnailUrl: SCENE_IMAGE_URLS[i % SCENE_IMAGE_URLS.length],
      duration,
      status: 'completed',
      takes: [],
    })
  }
  return result
}

type VfxMode = 'simple' | 'advanced'

// ─── Component ──────────────────────────────────────────────

export function VfxExportStep({ trackIndex }: VfxExportStepProps) {
  const project = mockProjects[trackIndex] ?? mockProjects[0]
  const audio = project.audio
  const [vfxMode, setVfxMode] = useState<VfxMode>('simple')
  const [scenes] = useState<MockScene[]>(() => generateScenes(39))

  const [activeSceneId, setActiveSceneId] = useState(scenes[0].id)
  const [selectedVfx, setSelectedVfx] = useState('cosmic-cinema')
  const [selectedTransition, setSelectedTransition] = useState('beat-sync')
  const [rendering, setRendering] = useState(false)
  const [renderProgress, setRenderProgress] = useState(0)
  const [exported, setExported] = useState(false)
  const [particles, setParticles] = useState<ReturnType<typeof generateParticles>>([])
  const [currentTime, setCurrentTime] = useState(0)
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [selectedFilter, setSelectedFilter] = useState('normal')
  const [selectedText, setSelectedText] = useState<string | null>(null)
  const [selectedSub, setSelectedSub] = useState<string | null>(null)

  const [leftWidth, setLeftWidth] = useState(220)
  const [rightWidth, setRightWidth] = useState(300)

  const activeScene = scenes.find((s) => s.id === activeSceneId) ?? scenes[0]
  const videoFilter = VFX_FILTERS[selectedVfx] ?? 'none'

  // ─── Render logic ─────────────────────────────────────────

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

  // ─── Scene time mapping ────────────────────────────────────

  const sceneTimeRanges = useMemo(() => {
    const total = scenes.reduce((sum, s) => sum + s.duration, 0)
    let elapsed = 0
    return scenes.map((scene) => {
      const start = (elapsed / total) * audio.duration
      elapsed += scene.duration
      const end = (elapsed / total) * audio.duration
      return { sceneId: scene.id, audioStart: start, audioEnd: end }
    })
  }, [scenes, audio.duration])

  const handleTimeChange = useCallback(
    (time: number) => {
      setCurrentTime(time)
      const range = sceneTimeRanges.find((r) => time >= r.audioStart && time < r.audioEnd)
      if (range && range.sceneId !== activeSceneId) {
        setActiveSceneId(range.sceneId)
      }
    },
    [sceneTimeRanges, activeSceneId],
  )

  const handleSeekToScene = useCallback(
    (sceneId: string) => {
      setActiveSceneId(sceneId)
    },
    [],
  )

  // ─── Resize handlers ─────────────────────────────────────

  const handleLeftResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = leftWidth
    const onMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX
      setLeftWidth(Math.max(160, Math.min(350, startWidth + delta)))
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [leftWidth])

  const handleRightResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = rightWidth
    const onMove = (ev: MouseEvent) => {
      const delta = startX - ev.clientX
      setRightWidth(Math.max(240, Math.min(420, startWidth + delta)))
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [rightWidth])

  return (
    <div className="flex h-full flex-col overflow-hidden bg-zinc-950">
      {/* ─── Mode toggle ───────────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 pt-3 shrink-0">
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Mode:</span>
        {(['simple', 'advanced'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setVfxMode(mode)}
            className={cn(
              'rounded-full px-3 py-1 text-[11px] font-medium transition-colors cursor-pointer capitalize',
              vfxMode === mode
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:text-zinc-200',
            )}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* ─── Simple mode ───────────────────────────────────── */}
      {vfxMode === 'simple' && (
        <div className="flex-1 min-h-0">
          <VfxSimpleMode scenes={scenes} activeSceneId={activeSceneId} />
        </div>
      )}

      {/* ─── Advanced mode: 3-column layout ─────────────────── */}
      {vfxMode === 'advanced' && (
        <>
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* LEFT: Media Library */}
        <div className="shrink-0 overflow-hidden" style={{ width: leftWidth }}>
          <MediaLibrary
            scenes={scenes}
            audio={audio}
            activeSceneId={activeSceneId}
            onSceneClick={setActiveSceneId}
          />
        </div>

        {/* Left resize handle */}
        <div
          className="w-1 shrink-0 bg-white/5 hover:bg-primary/30 cursor-col-resize transition-colors"
          onMouseDown={handleLeftResize}
        />

        {/* CENTER: Video Preview */}
        <div className="flex-1 flex flex-col overflow-hidden bg-zinc-900/50 min-w-0">
          <div className="flex-1 flex items-center justify-center p-4 relative min-h-0">
            <div
              className="relative w-full max-w-4xl rounded-lg overflow-hidden shadow-2xl shadow-black/50"
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
                <span className="rounded-md bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[10px] font-mono text-white/60">
                  {activeScene.subject}
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
                  Trans: {selectedTransition.replace(/-/g, ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Editor Toolbar */}
          <div className="shrink-0 border-t border-white/5 bg-zinc-950/80">
            <div className="flex items-center gap-0.5 px-3 py-1.5">
              {TOOLBAR_TABS.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(isActive ? null : tab.id)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors cursor-pointer',
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5',
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    {tab.label}
                  </button>
                )
              })}
              <span className="ml-auto text-[10px] font-mono text-zinc-600">
                {scenes.length} scenes
              </span>
            </div>

            <AnimatePresence>
              {activeTab && (
                <motion.div
                  key={activeTab}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden border-t border-white/5"
                >
                  <div className="px-3 py-2 flex gap-1.5 flex-wrap">
                    {activeTab === 'effects' &&
                      VFX_PRESETS.map((vfx) => (
                        <button
                          key={vfx.id}
                          onClick={() => setSelectedVfx(vfx.id)}
                          className={cn(
                            'flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[10px] font-medium transition-colors cursor-pointer',
                            selectedVfx === vfx.id
                              ? 'bg-primary/15 border-primary/30 text-primary'
                              : 'border-white/8 bg-white/3 text-zinc-400 hover:text-zinc-200 hover:bg-white/5',
                          )}
                        >
                          <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: vfx.accentColor }} />
                          {vfx.label}
                        </button>
                      ))}
                    {activeTab === 'transitions' &&
                      TRANSITION_TYPES.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setSelectedTransition(t.id)}
                          className={cn(
                            'rounded-md border px-2.5 py-1 text-[10px] font-medium transition-colors cursor-pointer',
                            selectedTransition === t.id
                              ? 'bg-primary/15 border-primary/30 text-primary'
                              : 'border-white/8 bg-white/3 text-zinc-400 hover:text-zinc-200 hover:bg-white/5',
                          )}
                        >
                          {t.label}
                        </button>
                      ))}
                    {activeTab === 'filters' &&
                      FILTER_PRESETS.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setSelectedFilter(f.id)}
                          className={cn(
                            'flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[10px] font-medium transition-colors cursor-pointer',
                            selectedFilter === f.id
                              ? 'bg-white/10 border-white/20 text-white'
                              : 'border-white/8 bg-white/3 text-zinc-400 hover:text-zinc-200 hover:bg-white/5',
                          )}
                        >
                          <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: f.color }} />
                          {f.label}
                        </button>
                      ))}
                    {activeTab === 'text' &&
                      TEXT_OPTIONS.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setSelectedText(selectedText === t.id ? null : t.id)}
                          className={cn(
                            'rounded-md border px-2.5 py-1 text-[10px] font-medium transition-colors cursor-pointer',
                            selectedText === t.id
                              ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                              : 'border-white/8 bg-white/3 text-zinc-400 hover:text-zinc-200 hover:bg-white/5',
                          )}
                        >
                          {t.label}
                        </button>
                      ))}
                    {activeTab === 'sub' &&
                      SUB_OPTIONS.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setSelectedSub(selectedSub === s.id ? null : s.id)}
                          className={cn(
                            'rounded-md border px-2.5 py-1 text-[10px] font-medium transition-colors cursor-pointer',
                            selectedSub === s.id
                              ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
                              : 'border-white/8 bg-white/3 text-zinc-400 hover:text-zinc-200 hover:bg-white/5',
                          )}
                        >
                          {s.label}
                        </button>
                      ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right resize handle */}
        <div
          className="w-1 shrink-0 bg-white/5 hover:bg-primary/30 cursor-col-resize transition-colors"
          onMouseDown={handleRightResize}
        />

        {/* RIGHT: Director Chat + Render button */}
        <div className="shrink-0 overflow-hidden flex flex-col gap-2" style={{ width: rightWidth }}>
          <div className="flex-1 min-h-0">
            <DirectorChat
              scenes={scenes}
              selectedVfx={selectedVfx}
              selectedTransition={selectedTransition}
              onVfxChange={setSelectedVfx}
              onTransitionChange={setSelectedTransition}
              onSeekToScene={handleSeekToScene}
            />
          </div>
          <div className="shrink-0 space-y-1.5 px-2 pb-2">
            <div className="relative">
              <AnimatePresence>
                {exported &&
                  particles.map((p) => (
                    <ConfettiParticle
                      key={p.id}
                      color={p.color}
                      x={p.x}
                      delay={p.delay}
                      duration={p.duration}
                      size={p.size}
                      xOffset={p.xOffset}
                    />
                  ))}
              </AnimatePresence>

              {rendering && (
                <div className="absolute -top-1 left-0 right-0 h-0.5 rounded-full overflow-hidden bg-zinc-800">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${renderProgress * 100}%` }}
                  />
                </div>
              )}

              <button
                onClick={startRender}
                disabled={rendering || exported}
                className={cn(
                  'w-full rounded-xl py-3 text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5',
                  exported
                    ? 'border border-green-500/30 bg-green-500/10 text-green-400'
                    : rendering
                      ? 'bg-primary/50 text-primary-foreground cursor-not-allowed'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90',
                )}
              >
                {exported ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Export Ready
                  </>
                ) : rendering ? (
                  <>Rendering… {Math.round(renderProgress * 100)}%</>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5" /> Render & Export
                  </>
                )}
              </button>
            </div>
            <p className="text-center text-[10px] text-muted-foreground">
              Estimated cost: 0 credit
            </p>
          </div>
        </div>
      </div>

      {/* ─── Bottom: Multi-track Timeline ─────────────────── */}
      <EditorTimeline
        scenes={scenes}
        audio={audio}
        activeSceneId={activeSceneId}
        onSceneClick={setActiveSceneId}
        onTimeChange={handleTimeChange}
      />
        </>
      )}
    </div>
  )
}

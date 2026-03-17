'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Download, CheckCircle2, MessageSquare, SlidersHorizontal, GripHorizontal, Film, Play, Pause, Wand2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockProjects } from '@/lib/mock/projects'
import type { MockScene } from '@/lib/mock/types'
import { DirectorChat } from './director-chat'
import { EditorTimeline } from './editor-timeline'
import { VFX_FILTERS, ConfettiParticle, generateParticles } from './vfx-export-sub'
import { SceneEditToolbar } from './scene-edit-toolbar'
import { SceneGenShowcase } from './scene-gen-showcase'

// ─── Types ──────────────────────────────────────────────────

interface VfxExportStepProps {
  trackIndex: number
}

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
      prompt: buildScenePrompt({ subject: template.subject, action: template.action, environment: template.environment, cameraAngle: angle, cameraMovement: movement }),
      thumbnailUrl: SCENE_IMAGE_URLS[i % SCENE_IMAGE_URLS.length],
      duration,
      status: 'completed',
      takes: [],
    })
  }
  return result
}

type VfxMode = 'simple' | 'advanced'
type RightPanelView = 'chat' | 'properties'

function buildScenePrompt(s: Pick<MockScene, 'subject' | 'action' | 'environment' | 'cameraAngle' | 'cameraMovement'>) {
  return `${s.subject} ${s.action} in ${s.environment}, ${s.cameraAngle}, ${s.cameraMovement}, cinematic`
}

// ─── Editable Scene Properties Panel ────────────────────────

function ScenePropertyInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[9px] uppercase tracking-wide text-zinc-500 font-semibold">{label}</p>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-[11px] text-zinc-200 bg-zinc-800/60 rounded-md px-2.5 py-1.5 leading-relaxed border border-transparent focus:border-primary/40 focus:outline-none transition-colors"
      />
    </div>
  )
}

function ScenePropertiesPanel({ scene, onUpdate }: { scene: MockScene; onUpdate: (sceneId: string, updates: Partial<MockScene>) => void }) {
  const [subject, setSubject] = useState(scene.subject)
  const [action, setAction] = useState(scene.action)
  const [environment, setEnvironment] = useState(scene.environment)
  const [cameraAngle, setCameraAngle] = useState(scene.cameraAngle)
  const [cameraMovement, setCameraMovement] = useState(scene.cameraMovement)

  // Reset form when switching to a different scene
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setSubject(scene.subject)
    setAction(scene.action)
    setEnvironment(scene.environment)
    setCameraAngle(scene.cameraAngle)
    setCameraMovement(scene.cameraMovement)
  }, [scene.id])

  const hasChanges =
    subject !== scene.subject ||
    action !== scene.action ||
    environment !== scene.environment ||
    cameraAngle !== scene.cameraAngle ||
    cameraMovement !== scene.cameraMovement

  const handleRegen = () => {
    onUpdate(scene.id, { subject, action, environment, cameraAngle, cameraMovement })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {/* Header */}
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
          <Film className="h-4 w-4 text-primary" />
          <div>
            <p className="text-xs font-semibold text-zinc-200">Scene {scene.index + 1}</p>
            <p className="text-[9px] text-zinc-500">{scene.duration}s</p>
          </div>
        </div>

        {/* Thumbnail */}
        <div className="aspect-video rounded-lg overflow-hidden bg-zinc-900">
          <img src={scene.thumbnailUrl} alt={`Scene ${scene.index + 1}`} className="w-full h-full object-cover" />
        </div>

        {/* Editable fields */}
        <ScenePropertyInput label="Subject" value={subject} onChange={setSubject} />
        <ScenePropertyInput label="Action" value={action} onChange={setAction} />
        <ScenePropertyInput label="Environment" value={environment} onChange={setEnvironment} />
        <ScenePropertyInput label="Camera Angle" value={cameraAngle} onChange={setCameraAngle} />
        <ScenePropertyInput label="Camera Movement" value={cameraMovement} onChange={setCameraMovement} />

        {/* Prompt (read-only) */}
        <div className="space-y-0.5">
          <p className="text-[9px] uppercase tracking-wide text-zinc-500 font-semibold">Full Prompt</p>
          <p className="text-[10px] text-zinc-400 bg-zinc-800/60 rounded-md px-2.5 py-2 leading-relaxed font-mono">
            {scene.prompt}
          </p>
        </div>
      </div>

      {/* Regen button — sticky at bottom */}
      <div className="shrink-0 p-3 border-t border-zinc-800">
        <button
          onClick={handleRegen}
          disabled={!hasChanges}
          className={cn(
            'w-full flex items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-semibold transition-all cursor-pointer',
            hasChanges
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed',
          )}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {hasChanges ? 'Regen Scene' : 'Edit properties to regen'}
        </button>
      </div>
    </div>
  )
}

// ─── Component ──────────────────────────────────────────────

export function VfxExportStep({ trackIndex }: VfxExportStepProps) {
  const project = mockProjects[trackIndex] ?? mockProjects[0]
  const audio = project.audio
  const [vfxMode, setVfxMode] = useState<VfxMode>('simple')
  const [scenes, setScenes] = useState<MockScene[]>(() => generateScenes(39))

  // ── Scene generation simulation ──────────────────
  const [sceneStatuses, setSceneStatuses] = useState<Record<string, 'pending' | 'rendering' | 'done'>>(() => {
    const map: Record<string, 'pending' | 'rendering' | 'done'> = {}
    scenes.forEach((s, i) => { map[s.id] = i === 0 ? 'rendering' : 'pending' })
    return map
  })

  const doneCount = Object.values(sceneStatuses).filter((s) => s === 'done').length
  const allDone = doneCount === scenes.length

  useEffect(() => {
    if (allDone) return
    const interval = setInterval(() => {
      setSceneStatuses((prev) => {
        const updated = { ...prev }
        const renderingId = Object.keys(updated).find((id) => updated[id] === 'rendering')
        if (renderingId) {
          updated[renderingId] = 'done'
          const nextPendingId = Object.keys(updated).find((id) => updated[id] === 'pending')
          if (nextPendingId) updated[nextPendingId] = 'rendering'
        }
        return updated
      })
    }, 400)
    return () => clearInterval(interval)
  }, [allDone])

  // ── Core state ──────────────────────────────────
  const [activeSceneId, setActiveSceneId] = useState(scenes[0].id)
  const [selectedVfx, setSelectedVfx] = useState('cosmic-cinema')
  const [selectedTransition, setSelectedTransition] = useState('beat-sync')
  const [selectedFilter, setSelectedFilter] = useState('normal')
  const [activeTool, setActiveTool] = useState<string | null>(null)
  const [rendering, setRendering] = useState(false)
  const [renderProgress, setRenderProgress] = useState(0)
  const [exported, setExported] = useState(false)
  const [particles, setParticles] = useState<ReturnType<typeof generateParticles>>([])
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const playRafRef = useRef<number | null>(null)
  const lastFrameRef = useRef<number>(0)

  // ── Unified playback loop (drives both video preview & timeline) ──
  useEffect(() => {
    if (!isPlaying) {
      if (playRafRef.current) cancelAnimationFrame(playRafRef.current)
      return
    }
    lastFrameRef.current = performance.now()
    const tick = (now: number) => {
      const delta = (now - lastFrameRef.current) / 1000
      lastFrameRef.current = now
      setCurrentTime((prev) => {
        const next = prev + delta
        if (next >= audio.duration) {
          setIsPlaying(false)
          return 0
        }
        return next
      })
      playRafRef.current = requestAnimationFrame(tick)
    }
    playRafRef.current = requestAnimationFrame(tick)
    return () => {
      if (playRafRef.current) cancelAnimationFrame(playRafRef.current)
    }
  }, [isPlaying, audio.duration])

  const togglePlay = useCallback(() => {
    setIsPlaying((p) => !p)
  }, [])

  // ── Panel state (storyboard pattern) ──────────────
  const [chatWidth, setChatWidth] = useState(320)
  const [rightPanelView, setRightPanelView] = useState<RightPanelView>('chat')
  const containerRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)

  // ── Drag-to-reorder ──────────────────────────────
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)

  const activeScene = scenes.find((s) => s.id === activeSceneId) ?? scenes[0]
  const activeSceneIndex = scenes.findIndex((s) => s.id === activeSceneId)
  const videoFilter = VFX_FILTERS[selectedVfx] ?? 'none'

  // ─── Render logic ─────────────────────────────────────────

  function startRender() {
    if (rendering || exported || !allDone) return
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

  // ── Sync active scene from currentTime ────────────────
  useEffect(() => {
    const range = sceneTimeRanges.find((r) => currentTime >= r.audioStart && currentTime < r.audioEnd)
    if (range && range.sceneId !== activeSceneId && sceneStatuses[range.sceneId] === 'done') {
      setActiveSceneId(range.sceneId)
    }
  }, [currentTime, sceneTimeRanges, activeSceneId, sceneStatuses])

  const handleTimeChange = useCallback(
    (time: number) => {
      // Only sync from timeline when we're NOT driving playback ourselves
      if (!isPlaying) {
        setCurrentTime(time)
      }
    },
    [isPlaying],
  )

  // ─── Scene click from timeline → switch to advanced ────────

  const handleTimelineSceneClick = useCallback((sceneId: string) => {
    if (sceneId === activeSceneId && vfxMode === 'advanced') {
      // Same scene clicked again in advanced → toggle right panel
      setRightPanelView((rpv) => rpv === 'properties' ? 'chat' : 'properties')
    } else {
      setVfxMode('advanced')
      setRightPanelView('properties')
      setActiveSceneId(sceneId)
      // Seek to the clicked scene's start so the sync useEffect doesn't override
      const range = sceneTimeRanges.find((r) => r.sceneId === sceneId)
      if (range) setCurrentTime(range.audioStart)
    }
  }, [activeSceneId, vfxMode, sceneTimeRanges])

  // ─── Resize handler (storyboard pattern) ────────────────────

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const newChatWidth = rect.right - e.clientX
      setChatWidth(Math.max(240, Math.min(newChatWidth, rect.width * 0.5)))
    }
    const handleMouseUp = () => {
      isDraggingRef.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  const startResize = useCallback(() => {
    isDraggingRef.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  // ─── Drag-to-reorder handlers ──────────────────────────────

  const handleSceneDragStart = useCallback((idx: number) => { setDraggedIdx(idx) }, [])
  const handleSceneDragOver = useCallback((_e: React.DragEvent, idx: number) => { setDragOverIdx(idx) }, [])
  const handleSceneDragEnd = useCallback(() => { setDraggedIdx(null); setDragOverIdx(null) }, [])
  const handleSceneDrop = useCallback((targetIdx: number) => {
    if (draggedIdx === null || draggedIdx === targetIdx) return
    setScenes((prev) => {
      const updated = [...prev]
      const [moved] = updated.splice(draggedIdx, 1)
      updated.splice(targetIdx, 0, moved)
      return updated.map((s, i) => ({ ...s, index: i }))
    })
    setDraggedIdx(null)
    setDragOverIdx(null)
  }, [draggedIdx])

  // ─── Tool click handler ────────────────────────────────────

  const handleToolClick = useCallback((toolId: string) => {
    setActiveTool((prev) => prev === toolId ? null : toolId)
  }, [])

  // ─── Render ────────────────────────────────────────────────

  return (
    <div className="flex h-full flex-col overflow-hidden bg-zinc-950">
      {/* ─── Top bar ──────────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-1 shrink-0">
        {/* Mode toggle (advanced mode) or generation status (simple mode) */}
        {vfxMode === 'advanced' ? (
          <>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Mode:</span>
            {(['simple', 'advanced'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => { setVfxMode(mode); if (mode === 'simple') { setActiveTool(null); setIsPlaying(false) } }}
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
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Film className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-zinc-200">Preview</span>
          </div>
        )}

        {/* Generation progress inline — compact badge when generating */}
        {!allDone && (
          <div className="flex items-center gap-1.5 ml-auto">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-medium text-zinc-400">
              Generating <span className="text-primary font-semibold tabular-nums">{doneCount}/{scenes.length}</span>
            </span>
          </div>
        )}
      </div>

      {/* ─── Body: Video Preview + Right Panel ───────────── */}
      <div ref={containerRef} className="flex flex-1 overflow-hidden min-h-0 px-4 py-2 gap-0">
        {/* Left column: video preview + optional toolbar */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Video preview / Generation showcase */}
          <div className="flex-1 flex items-center justify-center min-h-0 p-2 overflow-hidden" style={{ containerType: 'size' }}>
            {!allDone ? (
              /* ── Scene generation showcase ── */
              <div className="w-full h-full">
                <SceneGenShowcase
                  scenes={scenes}
                  sceneStatuses={sceneStatuses}
                  doneCount={doneCount}
                  total={scenes.length}
                />
              </div>
            ) : (
              /* ── Normal video preview ── */
              <div
                className="relative aspect-video rounded-xl overflow-hidden bg-black shadow-2xl shadow-black/50 group/video cursor-pointer"
                style={{ width: 'min(100%, 177.78cqh)' }}
                onClick={() => {
                  if (sceneStatuses[activeSceneId] === 'done') togglePlay()
                }}
              >
                <img
                  src={activeScene.thumbnailUrl}
                  alt={`Scene ${activeScene.index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ filter: videoFilter }}
                />
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

                {/* Top-left: scene info */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="rounded-md bg-black/60 backdrop-blur-sm px-2 py-1 text-[11px] font-mono font-bold text-white">
                    S{activeScene.index + 1} / {scenes.length}
                  </span>
                  <span className="text-[10px] text-white/70">{activeScene.subject}</span>
                </div>

                {/* Top-right: VFX label */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <span className="rounded-md bg-primary/20 backdrop-blur-sm border border-primary/30 px-2 py-1 text-[10px] font-medium text-primary">
                    ✦ {selectedVfx.replace('-', ' ')}
                  </span>
                </div>

                {/* Center play/pause button */}
                <div className={cn(
                  'absolute inset-0 flex items-center justify-center transition-opacity duration-200',
                  isPlaying ? 'opacity-0 group-hover/video:opacity-100' : 'opacity-100',
                )}>
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black/40 backdrop-blur-xl border border-white/20 shadow-2xl transition-transform hover:scale-110 hover:bg-black/50">
                    {isPlaying ? (
                      <Pause className="h-9 w-9 text-white" />
                    ) : (
                      <Play className="h-9 w-9 text-white ml-1" />
                    )}
                  </div>
                </div>

                {/* Bottom bar: transition + metadata + progress */}
                <div className="absolute bottom-0 left-0 right-0 px-3 pb-2.5 pt-6 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/60 font-mono">
                      {selectedTransition.replace('-', ' ')} · {activeScene.cameraAngle}
                    </span>
                    {vfxMode === 'simple' && (
                      <span className="text-[10px] text-white/50 font-mono">
                        {activeSceneIndex + 1} / {scenes.length}
                      </span>
                    )}
                  </div>
                  {/* Simple mode: thin progress bar at video bottom */}
                  {vfxMode === 'simple' && (
                    <div className="mt-1.5 h-0.5 rounded-full bg-white/20 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-white/70"
                        animate={{ width: `${((activeSceneIndex + 1) / scenes.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Scene edit toolbar (advanced mode only) */}
          {vfxMode === 'advanced' && (
            <SceneEditToolbar
              activeSceneIndex={activeSceneIndex}
              activeTool={activeTool}
              onToolClick={handleToolClick}
              selectedVfx={selectedVfx}
              selectedTransition={selectedTransition}
              selectedFilter={selectedFilter}
              onVfxChange={setSelectedVfx}
              onTransitionChange={setSelectedTransition}
              onFilterChange={setSelectedFilter}
            />
          )}
        </div>

        {/* Resize handle */}
        <div
          onMouseDown={startResize}
          className="shrink-0 w-3 flex items-center justify-center cursor-col-resize group/handle hover:bg-zinc-800/50 transition-colors rounded"
        >
          <GripHorizontal className="h-4 w-4 text-zinc-600 group-hover/handle:text-zinc-400 transition-colors rotate-90" />
        </div>

        {/* Right panel */}
        <div className="shrink-0 min-w-0 flex flex-col gap-2" style={{ width: chatWidth }}>
          {/* Toggle: Chat / Properties */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setRightPanelView('chat')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors cursor-pointer',
                rightPanelView === 'chat'
                  ? 'bg-primary/15 text-primary border border-primary/30'
                  : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800',
              )}
            >
              <MessageSquare className="h-3 w-3" /> Director
            </button>
            <button
              onClick={() => setRightPanelView('properties')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors cursor-pointer',
                rightPanelView === 'properties'
                  ? 'bg-primary/15 text-primary border border-primary/30'
                  : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800',
              )}
            >
              <SlidersHorizontal className="h-3 w-3" /> Properties
            </button>
          </div>

          {/* Panel content */}
          <div className="flex-1 min-h-0 rounded-xl border border-zinc-800 overflow-hidden">
            <AnimatePresence mode="wait">
              {rightPanelView === 'chat' ? (
                <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="h-full">
                  <DirectorChat
                    scenes={scenes}
                    selectedVfx={selectedVfx}
                    selectedTransition={selectedTransition}
                    onVfxChange={setSelectedVfx}
                    onTransitionChange={setSelectedTransition}
                    onSeekToScene={(sceneId) => setActiveSceneId(sceneId)}
                  />
                </motion.div>
              ) : (
                <motion.div key="properties" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="h-full">
                  <ScenePropertiesPanel
                    scene={activeScene}
                    onUpdate={(sceneId, updates) => {
                      setScenes((prev) =>
                        prev.map((s) => {
                          if (s.id !== sceneId) return s
                          const merged = { ...s, ...updates }
                          return { ...merged, prompt: buildScenePrompt(merged) }
                        }),
                      )
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action buttons */}
          <div className="shrink-0 space-y-2">
            {/* Confetti container */}
            {particles.length > 0 && (
              <div className="relative h-0">
                <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden" style={{ height: 200 }}>
                  {particles.map((p, i) => (
                    <ConfettiParticle key={i} {...p} />
                  ))}
                </div>
              </div>
            )}

            {/* Edit Studio button (simple mode only) */}
            {vfxMode === 'simple' && (
              <button
                onClick={() => setVfxMode('advanced')}
                className="w-full rounded-xl py-2.5 text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 border border-zinc-700 bg-zinc-800/80 text-zinc-200 hover:bg-zinc-700 hover:border-zinc-600 hover:text-white"
              >
                <Wand2 className="h-4 w-4 text-primary" />
                Open Edit Studio
              </button>
            )}

            {/* Progress bar */}
            {rendering && (
              <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400"
                  animate={{ width: `${renderProgress * 100}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            )}

            <button
              onClick={startRender}
              disabled={rendering || exported || !allDone}
              className={cn(
                'w-full rounded-xl py-3 text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5',
                exported
                  ? 'border border-green-500/30 bg-green-500/10 text-green-400'
                  : rendering
                    ? 'bg-primary/50 text-primary-foreground cursor-not-allowed'
                    : !allDone
                      ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90',
              )}
            >
              {exported ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" /> Export Ready
                </>
              ) : rendering ? (
                <>Rendering... {Math.round(renderProgress * 100)}%</>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" /> Render & Export
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-zinc-500">
              {exported ? 'Your video is ready to download' : 'Estimated cost: 0 credits'}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Bottom: Editor Timeline (advanced mode only) ─── */}
      {vfxMode === 'advanced' && (
      <div className="shrink-0">
        <EditorTimeline
          scenes={scenes}
          audio={audio}
          activeSceneId={activeSceneId}
          onSceneClick={handleTimelineSceneClick}
          onTimeChange={handleTimeChange}
          playing={isPlaying}
          onTogglePlay={togglePlay}
          draggable={vfxMode === 'advanced'}
          onSceneDragStart={handleSceneDragStart}
          onSceneDragOver={handleSceneDragOver}
          onSceneDrop={handleSceneDrop}
          onSceneDragEnd={handleSceneDragEnd}
          draggedIdx={draggedIdx}
          dragOverIdx={dragOverIdx}
          sceneStatuses={allDone ? undefined : sceneStatuses}
        />
      </div>
      )}
    </div>
  )
}

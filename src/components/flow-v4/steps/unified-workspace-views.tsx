'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GripVertical, Pencil, Trash2, Plus, X, Check, Layers,
  Film, Play, Pause, Wand2, Download, CheckCircle2, RefreshCw,
  SlidersHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MockScene, MockAudio } from '@/lib/mock/types'
import { AnalysisLoading } from './analysis-loading'
import { AnalysisResults } from './analysis-results'
import { StorylineConceptsSection } from './storyline-concepts'
import { StoryboardWaveform, computeSceneTimeRanges } from './storyboard-waveform'
import { StoryboardProperties } from './storyboard-properties'
import { EditorTimeline } from './editor-timeline'
import { VFX_FILTERS, ConfettiParticle, generateParticles } from './vfx-export-sub'
import { SceneEditToolbar } from './scene-edit-toolbar'
import { SceneGenShowcase } from './scene-gen-showcase'

// ─── Shared helpers ─────────────────────────────────────────

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${String(Math.floor(s) % 60).padStart(2, '0')}`
}

function buildScenePrompt(s: Pick<MockScene, 'subject' | 'action' | 'environment' | 'cameraAngle' | 'cameraMovement'>) {
  return `${s.subject} ${s.action} in ${s.environment}, ${s.cameraAngle}, ${s.cameraMovement}, cinematic`
}

// ═══════════════════════════════════════════════════════════
// ─── Analysis View (analysis results only, no ideation) ──
// ═══════════════════════════════════════════════════════════

interface AnalysisViewProps {
  trackIndex: number
  progress: number
  stage: 'analyzing' | 'analysis_done' | 'ideation'
  audio: MockAudio
  onContinue: () => void
}

export function AnalysisWorkspaceView({
  progress, stage, audio, onContinue,
}: AnalysisViewProps) {
  if (stage === 'analyzing') {
    return <AnalysisLoading progress={progress} />
  }
  // Show analysis results without the ideation section —
  // pass a no-op concept select since ideation is a separate step
  return (
    <AnalysisResults
      audio={audio}
      selectedConceptId={null}
      onConceptSelect={() => {}}
      onContinue={onContinue}
      hideIdeation
    />
  )
}

// ═══════════════════════════════════════════════════════════
// ─── Ideation View (storyline + concept cards) ───────────
// ═══════════════════════════════════════════════════════════

interface IdeationViewProps {
  selectedConceptId: string | null
  onConceptSelect: (id: string) => void
  onContinue: () => void
}

export function IdeationWorkspaceView({
  selectedConceptId, onConceptSelect, onContinue,
}: IdeationViewProps) {
  return (
    <div className="h-full overflow-y-auto px-6 py-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <StorylineConceptsSection
          selectedConceptId={selectedConceptId}
          onConceptSelect={onConceptSelect}
          onContinue={onContinue}
          durationRatio={1}
          hideContinueButton
        />
      </motion.div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// ─── Storyboard View ──────────────────────────────────────
// ═══════════════════════════════════════════════════════════

interface StoryboardViewProps {
  scenes: MockScene[]
  audio: MockAudio
  onEditScene: (sceneId: string, updates: Partial<MockScene>) => void
  onDeleteScene: (sceneId: string) => void
  onInsertScene: (afterIndex: number) => void
  highlightedSceneId: string | null
  onHighlightScene: (id: string | null) => void
  onContinue: () => void
}

export function StoryboardWorkspaceView({
  scenes, audio, onEditScene, onDeleteScene, onInsertScene,
  highlightedSceneId, onHighlightScene, onContinue,
}: StoryboardViewProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editSubject, setEditSubject] = useState('')
  const [editAction, setEditAction] = useState('')
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null)
  const [showProperties, setShowProperties] = useState(false)
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!highlightedSceneId) return
    if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current)
    highlightTimeoutRef.current = setTimeout(() => onHighlightScene(null), 2000)
    return () => { if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current) }
  }, [highlightedSceneId, onHighlightScene])

  const sceneTimeRanges = computeSceneTimeRanges(scenes, audio.duration)

  const lipsyncSceneIds = useMemo(() => {
    const ids = new Set<string>()
    scenes.forEach((scene) => {
      if (scene.subject === 'Singer' || scene.subject === 'Band') ids.add(scene.id)
    })
    return ids
  }, [scenes])

  const startEdit = useCallback((scene: MockScene) => {
    setEditingId(scene.id)
    setEditSubject(scene.subject)
    setEditAction(scene.action)
  }, [])

  const saveEdit = useCallback(() => {
    if (!editingId) return
    onEditScene(editingId, { subject: editSubject, action: editAction })
    setEditingId(null)
  }, [editingId, editSubject, editAction, onEditScene])

  const handleSceneClick = useCallback((scene: MockScene) => {
    setSelectedSceneId(scene.id)
    setShowProperties(true)
  }, [])

  const handleTimelineSceneClick = useCallback((sceneId: string) => {
    onHighlightScene(sceneId)
    const el = document.querySelector(`[data-scene-id="${sceneId}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [onHighlightScene])

  const handleResizeScenes = useCallback((leftIdx: number, rightIdx: number, leftDur: number, rightDur: number) => {
    onEditScene(scenes[leftIdx]?.id, { duration: leftDur })
    onEditScene(scenes[rightIdx]?.id, { duration: rightDur })
  }, [scenes, onEditScene])

  const handleDragStart = useCallback((idx: number) => setDraggedIdx(idx), [])
  const handleDragOver = useCallback((_e: React.DragEvent, idx: number) => { setDragOverIdx(idx) }, [])
  const handleDragEnd = useCallback(() => { setDraggedIdx(null); setDragOverIdx(null) }, [])

  const selectedScene = scenes.find((s) => s.id === selectedSceneId)
  const selectedSceneTimeRange = selectedScene ? sceneTimeRanges[scenes.indexOf(selectedScene)] : null

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0"
      >
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <div>
            <h2 className="text-sm font-bold text-foreground">Storyboard</h2>
            <p className="text-[10px] text-muted-foreground">
              {scenes.length} scenes | Drag to reorder, click to edit
            </p>
          </div>
        </div>
      </motion.div>

      {/* Body: scene grid + optional properties overlay */}
      <div className="flex-1 overflow-hidden min-h-0 relative">
        {/* Scene grid */}
        <div className="h-full overflow-y-auto px-4 pb-2">
          <div className="grid gap-2.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {scenes.map((scene, idx) => {
              const isEditing = editingId === scene.id
              const isDragged = draggedIdx === idx
              const isDragOver = dragOverIdx === idx
              const isHighlighted = highlightedSceneId === scene.id
              const isSelected = selectedSceneId === scene.id
              const timeRange = sceneTimeRanges[idx]
              return (
                <div key={scene.id} data-scene-id={scene.id}>
                  <motion.div animate={isHighlighted ? { scale: [1, 1.02, 1] } : {}} transition={{ duration: 0.4 }}>
                    <div
                      draggable={!isEditing}
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e) => { e.preventDefault(); handleDragOver(e, idx) }}
                      onDrop={() => { setDraggedIdx(null); setDragOverIdx(null) }}
                      onDragEnd={handleDragEnd}
                      onClick={() => !isEditing && handleSceneClick(scene)}
                      className={cn(
                        'relative rounded-lg border overflow-hidden transition-all group cursor-pointer',
                        isDragged && 'opacity-40',
                        isDragOver && 'ring-2 ring-primary ring-offset-1 ring-offset-background',
                        isHighlighted && 'ring-2 ring-primary shadow-lg shadow-primary/20',
                        isSelected && !isHighlighted && 'ring-2 ring-primary/50',
                        isEditing ? 'border-primary' : 'border-border',
                      )}
                    >
                      <div className="aspect-[4/3] relative bg-muted">
                        <img src={scene.thumbnailUrl} alt={`Scene ${scene.index + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute top-1 left-1 flex items-center gap-0.5">
                          <GripVertical className="h-3 w-3 text-white/60 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
                          <span className="rounded bg-black/60 px-1 py-0.5 text-[8px] font-bold text-white">S{scene.index + 1}</span>
                          {timeRange && (
                            <span className="rounded bg-black/50 px-1 py-0.5 text-[7px] font-mono text-white/70">
                              {fmt(timeRange.audioStart)}–{fmt(timeRange.audioEnd)}
                            </span>
                          )}
                          {lipsyncSceneIds.has(scene.id) && (
                            <span className="rounded bg-emerald-500/90 px-1 py-0.5 text-[7px] font-bold text-white tracking-wide">Lipsync</span>
                          )}
                        </div>
                        {!isEditing && (
                          <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); startEdit(scene) }} className="flex h-5 w-5 items-center justify-center rounded bg-black/60 text-white cursor-pointer hover:bg-black/80">
                              <Pencil className="h-2.5 w-2.5" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); onDeleteScene(scene.id) }} className="flex h-5 w-5 items-center justify-center rounded bg-red-500/80 text-white cursor-pointer hover:bg-red-600">
                              <Trash2 className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 px-1.5 py-1 bg-gradient-to-t from-black/70 to-transparent">
                          <p className="text-[8px] font-medium text-white truncate">{scene.subject} — {scene.action}</p>
                        </div>
                      </div>
                      {isEditing && (
                        <div className="p-2 space-y-1.5 bg-card">
                          <input value={editSubject} onChange={(e) => setEditSubject(e.target.value)} className="w-full rounded border border-border bg-background px-1.5 py-1 text-[10px] text-foreground focus:outline-none focus:border-primary/50" placeholder="Subject" />
                          <input value={editAction} onChange={(e) => setEditAction(e.target.value)} className="w-full rounded border border-border bg-background px-1.5 py-1 text-[10px] text-foreground focus:outline-none focus:border-primary/50" placeholder="Action" />
                          <div className="flex gap-1">
                            <button onClick={(e) => { e.stopPropagation(); saveEdit() }} className="flex-1 flex items-center justify-center gap-1 rounded bg-primary py-1 text-[9px] font-semibold text-primary-foreground cursor-pointer">
                              <Check className="h-2.5 w-2.5" /> Save
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setEditingId(null) }} className="flex-1 flex items-center justify-center gap-1 rounded border border-border py-1 text-[9px] font-medium text-muted-foreground cursor-pointer">
                              <X className="h-2.5 w-2.5" /> Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Properties slide-over */}
        <AnimatePresence>
          {showProperties && selectedScene && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute top-0 right-0 bottom-0 w-80 z-20 shadow-2xl"
            >
              <StoryboardProperties
                scene={selectedScene}
                sceneIndex={selectedScene.index}
                timestamp={selectedSceneTimeRange ? `${fmt(selectedSceneTimeRange.audioStart)}–${fmt(selectedSceneTimeRange.audioEnd)}` : ''}
                onClose={() => { setShowProperties(false); setSelectedSceneId(null) }}
                onUpdate={onEditScene}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Waveform timeline */}
      <div className="shrink-0">
        <StoryboardWaveform
          audio={audio}
          scenes={scenes}
          highlightedSceneId={highlightedSceneId}
          onSceneClick={handleTimelineSceneClick}
          onResizeScenes={handleResizeScenes}
          lipsyncSceneIds={lipsyncSceneIds}
        />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// ─── VFX / Export View ────────────────────────────────────
// ═══════════════════════════════════════════════════════════

interface VfxViewProps {
  scenes: MockScene[]
  audio: MockAudio
  sceneStatuses: Record<string, 'pending' | 'rendering' | 'done'>
  doneCount: number
  allDone: boolean
  activeSceneId: string
  onActiveSceneChange: (id: string) => void
  selectedVfx: string
  selectedTransition: string
  selectedFilter: string
  onVfxChange: (id: string) => void
  onTransitionChange: (id: string) => void
  onFilterChange: (id: string) => void
  onSceneUpdate: (sceneId: string, updates: Partial<MockScene>) => void
  onScenesReorder: (scenes: MockScene[]) => void
}

export function VfxWorkspaceView({
  scenes, audio, sceneStatuses, doneCount, allDone,
  activeSceneId, onActiveSceneChange,
  selectedVfx, selectedTransition, selectedFilter,
  onVfxChange, onTransitionChange, onFilterChange,
  onSceneUpdate, onScenesReorder,
}: VfxViewProps) {
  const [vfxMode, setVfxMode] = useState<'simple' | 'advanced'>('simple')
  const [activeTool, setActiveTool] = useState<string | null>(null)
  const [rendering, setRendering] = useState(false)
  const [renderProgress, setRenderProgress] = useState(0)
  const [exported, setExported] = useState(false)
  const [particles, setParticles] = useState<ReturnType<typeof generateParticles>>([])
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showProperties, setShowProperties] = useState(false)
  const playRafRef = useRef<number | null>(null)
  const lastFrameRef = useRef<number>(0)

  // Drag state
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)

  const activeScene = scenes.find((s) => s.id === activeSceneId) ?? scenes[0]
  const activeSceneIndex = scenes.findIndex((s) => s.id === activeSceneId)
  const videoFilter = VFX_FILTERS[selectedVfx] ?? 'none'

  // ── Playback loop ──
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
        if (next >= audio.duration) { setIsPlaying(false); return 0 }
        return next
      })
      playRafRef.current = requestAnimationFrame(tick)
    }
    playRafRef.current = requestAnimationFrame(tick)
    return () => { if (playRafRef.current) cancelAnimationFrame(playRafRef.current) }
  }, [isPlaying, audio.duration])

  const togglePlay = useCallback(() => setIsPlaying((p) => !p), [])

  // ── Scene time mapping ──
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

  // ── Sync active scene from currentTime ──
  useEffect(() => {
    const range = sceneTimeRanges.find((r) => currentTime >= r.audioStart && currentTime < r.audioEnd)
    if (range && range.sceneId !== activeSceneId && sceneStatuses[range.sceneId] === 'done') {
      onActiveSceneChange(range.sceneId)
    }
  }, [currentTime, sceneTimeRanges, activeSceneId, sceneStatuses, onActiveSceneChange])

  const handleTimeChange = useCallback((time: number) => {
    if (!isPlaying) setCurrentTime(time)
  }, [isPlaying])

  // ── Render logic ──
  const startRender = useCallback(() => {
    if (rendering || exported || !allDone) return
    setRendering(true)
    setRenderProgress(0)
  }, [rendering, exported, allDone])

  useEffect(() => {
    if (!rendering || exported) return
    const start = Date.now()
    const duration = 3000
    const raf = requestAnimationFrame(function tick() {
      const pct = Math.min((Date.now() - start) / duration, 1)
      setRenderProgress(pct)
      if (pct < 1) requestAnimationFrame(tick)
      else { setRendering(false); setExported(true); setParticles(generateParticles()) }
    })
    return () => cancelAnimationFrame(raf)
  }, [rendering, exported])

  // ── Timeline scene click ──
  const handleTimelineSceneClick = useCallback((sceneId: string) => {
    if (sceneId === activeSceneId && vfxMode === 'advanced') {
      setShowProperties((v) => !v)
    } else {
      setVfxMode('advanced')
      setShowProperties(true)
      onActiveSceneChange(sceneId)
      const range = sceneTimeRanges.find((r) => r.sceneId === sceneId)
      if (range) setCurrentTime(range.audioStart)
    }
  }, [activeSceneId, vfxMode, sceneTimeRanges, onActiveSceneChange])

  // ── Drag handlers ──
  const handleSceneDragStart = useCallback((idx: number) => setDraggedIdx(idx), [])
  const handleSceneDragOver = useCallback((_e: React.DragEvent, idx: number) => setDragOverIdx(idx), [])
  const handleSceneDragEnd = useCallback(() => { setDraggedIdx(null); setDragOverIdx(null) }, [])
  const handleSceneDrop = useCallback((targetIdx: number) => {
    if (draggedIdx === null || draggedIdx === targetIdx) return
    const updated = [...scenes]
    const [moved] = updated.splice(draggedIdx, 1)
    updated.splice(targetIdx, 0, moved)
    onScenesReorder(updated.map((s, i) => ({ ...s, index: i })))
    setDraggedIdx(null)
    setDragOverIdx(null)
  }, [draggedIdx, scenes, onScenesReorder])

  const handleToolClick = useCallback((toolId: string) => {
    setActiveTool((prev) => prev === toolId ? null : toolId)
  }, [])

  return (
    <div className="flex h-full flex-col overflow-hidden bg-zinc-950 relative">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-1 shrink-0">
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
        {!allDone && (
          <div className="flex items-center gap-1.5 ml-auto">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-medium text-zinc-400">
              Generating <span className="text-primary font-semibold tabular-nums">{doneCount}/{scenes.length}</span>
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0 px-4 py-2">
        {/* Video preview */}
        <div className="flex-1 flex items-center justify-center min-h-0 p-2 overflow-hidden" style={{ containerType: 'size' }}>
          {!allDone ? (
            <div className="w-full h-full">
              <SceneGenShowcase scenes={scenes} sceneStatuses={sceneStatuses} doneCount={doneCount} total={scenes.length} />
            </div>
          ) : (
            <div
              className="relative aspect-video rounded-xl overflow-hidden bg-black shadow-2xl shadow-black/50 group/video cursor-pointer"
              style={{ width: 'min(100%, 177.78cqh)' }}
              onClick={() => { if (sceneStatuses[activeSceneId] === 'done') togglePlay() }}
            >
              <img src={activeScene.thumbnailUrl} alt={`Scene ${activeScene.index + 1}`} className="absolute inset-0 w-full h-full object-cover" style={{ filter: videoFilter }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="rounded-md bg-black/60 backdrop-blur-sm px-2 py-1 text-[11px] font-mono font-bold text-white">S{activeScene.index + 1} / {scenes.length}</span>
                <span className="text-[10px] text-white/70">{activeScene.subject}</span>
              </div>
              <div className="absolute top-3 right-3">
                <span className="rounded-md bg-primary/20 backdrop-blur-sm border border-primary/30 px-2 py-1 text-[10px] font-medium text-primary">
                  ✦ {selectedVfx.replace('-', ' ')}
                </span>
              </div>
              <div className={cn('absolute inset-0 flex items-center justify-center transition-opacity duration-200', isPlaying ? 'opacity-0 group-hover/video:opacity-100' : 'opacity-100')}>
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black/40 backdrop-blur-xl border border-white/20 shadow-2xl transition-transform hover:scale-110">
                  {isPlaying ? <Pause className="h-9 w-9 text-white" /> : <Play className="h-9 w-9 text-white ml-1" />}
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 px-3 pb-2.5 pt-6 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/60 font-mono">{selectedTransition.replace('-', ' ')} · {activeScene.cameraAngle}</span>
                  {vfxMode === 'simple' && <span className="text-[10px] text-white/50 font-mono">{activeSceneIndex + 1} / {scenes.length}</span>}
                </div>
                {vfxMode === 'simple' && (
                  <div className="mt-1.5 h-0.5 rounded-full bg-white/20 overflow-hidden">
                    <motion.div className="h-full rounded-full bg-white/70" animate={{ width: `${((activeSceneIndex + 1) / scenes.length) * 100}%` }} transition={{ duration: 0.3 }} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Toolbar */}
        {vfxMode === 'advanced' && (
          <SceneEditToolbar
            activeSceneIndex={activeSceneIndex}
            activeTool={activeTool}
            onToolClick={handleToolClick}
            selectedVfx={selectedVfx}
            selectedTransition={selectedTransition}
            selectedFilter={selectedFilter}
            onVfxChange={onVfxChange}
            onTransitionChange={onTransitionChange}
            onFilterChange={onFilterChange}
          />
        )}
      </div>

      {/* Action buttons */}
      <div className="shrink-0 px-4 pb-2 space-y-2">
        {particles.length > 0 && (
          <div className="relative h-0">
            <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden" style={{ height: 200 }}>
              {particles.map((p, i) => <ConfettiParticle key={i} {...p} />)}
            </div>
          </div>
        )}
        {vfxMode === 'simple' && (
          <button
            onClick={() => setVfxMode('advanced')}
            className="w-full rounded-xl py-2.5 text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 border border-zinc-700 bg-zinc-800/80 text-zinc-200 hover:bg-zinc-700"
          >
            <Wand2 className="h-4 w-4 text-primary" /> Open Edit Studio
          </button>
        )}
        {rendering && (
          <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400" animate={{ width: `${renderProgress * 100}%` }} transition={{ duration: 0.1 }} />
          </div>
        )}
        <button
          onClick={startRender}
          disabled={rendering || exported || !allDone}
          className={cn(
            'w-full rounded-xl py-3 text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5',
            exported ? 'border border-green-500/30 bg-green-500/10 text-green-400'
              : rendering ? 'bg-primary/50 text-primary-foreground cursor-not-allowed'
              : !allDone ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
              : 'bg-primary text-primary-foreground hover:bg-primary/90',
          )}
        >
          {exported ? (<><CheckCircle2 className="h-3.5 w-3.5" /> Export Ready</>)
            : rendering ? (<>Rendering... {Math.round(renderProgress * 100)}%</>)
            : (<><Download className="h-3.5 w-3.5" /> Render & Export</>)}
        </button>
        <p className="text-center text-[10px] text-zinc-500">
          {exported ? 'Your video is ready to download' : 'Estimated cost: 0 credits'}
        </p>
      </div>

      {/* Properties slide-over */}
      <AnimatePresence>
        {showProperties && activeScene && vfxMode === 'advanced' && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute top-0 right-0 bottom-0 w-72 z-20 bg-zinc-900 border-l border-zinc-800 shadow-2xl"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-800 shrink-0">
                <div className="flex items-center gap-2">
                  <Film className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[11px] font-semibold text-zinc-200">Scene {activeScene.index + 1}</span>
                </div>
                <button onClick={() => setShowProperties(false)} className="flex h-5 w-5 items-center justify-center rounded hover:bg-zinc-800 text-zinc-400 cursor-pointer">
                  <X className="h-3 w-3" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                <div className="aspect-video rounded-lg overflow-hidden bg-zinc-900">
                  <img src={activeScene.thumbnailUrl} alt={`Scene ${activeScene.index + 1}`} className="w-full h-full object-cover" />
                </div>
                <PropertyField label="Subject" value={activeScene.subject} onSave={(v) => onSceneUpdate(activeScene.id, { subject: v })} />
                <PropertyField label="Action" value={activeScene.action} onSave={(v) => onSceneUpdate(activeScene.id, { action: v })} />
                <PropertyField label="Environment" value={activeScene.environment} onSave={(v) => onSceneUpdate(activeScene.id, { environment: v })} />
                <PropertyField label="Camera Angle" value={activeScene.cameraAngle} onSave={(v) => onSceneUpdate(activeScene.id, { cameraAngle: v })} />
                <PropertyField label="Camera Movement" value={activeScene.cameraMovement} onSave={(v) => onSceneUpdate(activeScene.id, { cameraMovement: v })} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor timeline */}
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
            draggable
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

// ─── Small helper ────────────────────────────────────────────

function PropertyField({ label, value, onSave }: { label: string; value: string; onSave: (v: string) => void }) {
  const [val, setVal] = useState(value)
  useEffect(() => setVal(value), [value])
  return (
    <div className="space-y-0.5">
      <p className="text-[9px] uppercase tracking-wide text-zinc-500 font-semibold">{label}</p>
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => { if (val !== value) onSave(val) }}
        className="w-full text-[11px] text-zinc-200 bg-zinc-800/60 rounded-md px-2.5 py-1.5 leading-relaxed border border-transparent focus:border-primary/40 focus:outline-none transition-colors"
      />
    </div>
  )
}

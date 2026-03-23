'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GripVertical, Pencil, Trash2, Plus, X, Check, Layers, GripHorizontal, SlidersHorizontal, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockProjects } from '@/lib/mock/projects'
import type { MockScene } from '@/lib/mock/types'
import { StoryboardWaveform, computeSceneTimeRanges } from './storyboard-waveform'
import { StoryboardChat } from './storyboard-chat'
import { StoryboardProperties } from './storyboard-properties'

// ─── Types ──────────────────────────────────────────────────

interface StoryboardStepProps {
  trackIndex: number
  onContinue: () => void
}

interface EditableScene extends MockScene {
  isNew?: boolean
  videoStatus?: 'pending' | 'rendering' | 'done'
}

type RightPanelView = 'chat' | 'properties'

// ─── Scene image URLs ────────────────────────────────────────

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
]

const CAMERA_ANGLES = ['wide shot', 'medium shot', 'close-up', 'extreme close-up', 'low angle', 'high angle', 'aerial', 'POV', 'over-the-shoulder']
const CAMERA_MOVEMENTS = ['slow dolly in', 'slow pan', 'tracking shot', 'crane up', 'handheld', 'steadicam orbit', 'whip pan', 'push in', 'pullback reveal', 'static']

function generateScenes(baseScenes: MockScene[], targetCount: number): EditableScene[] {
  const result: EditableScene[] = []
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
      status: i < 20 ? 'completed' : 'init',
      takes: [],
      videoStatus: 'pending',
    })
  }
  return result
}

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${String(Math.floor(s) % 60).padStart(2, '0')}`
}

// ─── Component ──────────────────────────────────────────────

export function StoryboardStep({ trackIndex, onContinue }: StoryboardStepProps) {
  const project = mockProjects[trackIndex] ?? mockProjects[0]
  const audio = project.audio

  const [scenes, setScenes] = useState<EditableScene[]>(() => generateScenes(project.scenes, 39))
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editSubject, setEditSubject] = useState('')
  const [editAction, setEditAction] = useState('')
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const [highlightedSceneId, setHighlightedSceneId] = useState<string | null>(null)
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Right panel state ────────────────────────────
  const [rightPanelView, setRightPanelView] = useState<RightPanelView>('chat')
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null)

  // ── Resizable panel ─────────────────────────────
  const [chatWidth, setChatWidth] = useState(320)
  const isDraggingRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

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

  // Auto-clear highlight after 2s
  useEffect(() => {
    if (!highlightedSceneId) return
    if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current)
    highlightTimeoutRef.current = setTimeout(() => setHighlightedSceneId(null), 2000)
    return () => {
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current)
    }
  }, [highlightedSceneId])

  const sceneTimeRanges = computeSceneTimeRanges(scenes, audio.duration)

  const lipsyncSceneIds = useMemo(() => {
    const ids = new Set<string>()
    scenes.forEach((scene) => {
      if (scene.subject === 'Singer' || scene.subject === 'Band') ids.add(scene.id)
    })
    return ids
  }, [scenes])

  // ── Scene CRUD ──────────────────────────────────

  const startEdit = useCallback((scene: EditableScene) => {
    setEditingId(scene.id)
    setEditSubject(scene.subject)
    setEditAction(scene.action)
  }, [])

  function saveEdit() {
    if (!editingId) return
    setScenes((prev) => prev.map((s) => s.id === editingId ? { ...s, subject: editSubject, action: editAction } : s))
    setEditingId(null)
  }

  function deleteScene(id: string) {
    setScenes((prev) => prev.filter((s) => s.id !== id).map((s, i) => ({ ...s, index: i })))
    if (selectedSceneId === id) setSelectedSceneId(null)
  }

  function insertScene(afterIndex: number) {
    const newId = `new-scene-${Date.now()}`
    const newScene: EditableScene = {
      id: newId, index: afterIndex + 1, subject: 'New Scene', action: 'describe action here',
      environment: 'environment', cameraAngle: 'medium shot', cameraMovement: 'slow pan', prompt: '',
      thumbnailUrl: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="%2327272a"/><text x="200" y="150" fill="%23a1a1aa" font-size="14" text-anchor="middle" dominant-baseline="middle">New Scene</text></svg>`,
      duration: 20, status: 'init', takes: [], isNew: true, videoStatus: 'pending',
    }
    setScenes((prev) => { const copy = [...prev]; copy.splice(afterIndex + 1, 0, newScene); return copy.map((s, i) => ({ ...s, index: i })) })
    startEdit(newScene)
  }

  // ── Drag & Drop ─────────────────────────────────

  function handleDragStart(idx: number) { setDraggedIdx(idx) }
  function handleDragOver(e: React.DragEvent, idx: number) { e.preventDefault(); setDragOverIdx(idx) }
  function handleDrop(idx: number) {
    if (draggedIdx === null || draggedIdx === idx) { setDraggedIdx(null); setDragOverIdx(null); return }
    setScenes((prev) => { const copy = [...prev]; const [moved] = copy.splice(draggedIdx, 1); copy.splice(idx, 0, moved); return copy.map((s, i) => ({ ...s, index: i })) })
    setDraggedIdx(null); setDragOverIdx(null)
  }

  // ── Scene interactions ───────────────────────────

  const handleSceneClick = useCallback((scene: EditableScene) => {
    setSelectedSceneId(scene.id)
    setRightPanelView('properties')
  }, [])

  const handleSceneClickFromTimeline = useCallback((sceneId: string) => {
    setHighlightedSceneId(sceneId)
    const el = document.querySelector(`[data-scene-id="${sceneId}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [])

  const handleChatEditScene = useCallback((sceneId: string, updates: Partial<EditableScene>) => {
    setScenes((prev) => prev.map((s) => s.id === sceneId ? { ...s, ...updates } : s))
  }, [])

  const handleChatDeleteScene = useCallback((sceneId: string) => { deleteScene(sceneId) }, [])
  const handleChatInsertScene = useCallback((afterIndex: number) => { insertScene(afterIndex) }, [])

  const handleResizeScenes = useCallback((leftIdx: number, rightIdx: number, leftDur: number, rightDur: number) => {
    setScenes((prev) => prev.map((s, i) => {
      if (i === leftIdx) return { ...s, duration: leftDur }
      if (i === rightIdx) return { ...s, duration: rightDur }
      return s
    }))
  }, [])

  const selectedScene = scenes.find((s) => s.id === selectedSceneId)
  const selectedSceneTimeRange = selectedScene ? sceneTimeRanges[scenes.indexOf(selectedScene)] : null

  // ── Render ──────────────────────────────────────

  return (
    <div className="flex h-full flex-col overflow-hidden pt-4 px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-3 shrink-0"
      >
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <div>
            <h2 className="text-base font-bold text-foreground">Storyboard</h2>
            <p className="text-[10px] text-muted-foreground">
              {scenes.length} scenes | Drag to reorder, click to edit or inspect
            </p>
          </div>
        </div>
      </motion.div>

      {/* Body */}
      <div ref={containerRef} className="flex flex-1 overflow-hidden min-h-0">
        {/* Left column */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 pr-1">
          <div className="flex-1 overflow-y-auto">
            <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(245px, 1fr))' }}>
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
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDrop={() => handleDrop(idx)}
                        onDragEnd={() => { setDraggedIdx(null); setDragOverIdx(null) }}
                        onClick={() => !isEditing && handleSceneClick(scene)}
                        className={cn(
                          'relative rounded-xl border overflow-hidden transition-all group cursor-pointer',
                          isDragged && 'opacity-40',
                          isDragOver && 'ring-2 ring-primary ring-offset-1 ring-offset-background',
                          isHighlighted && 'ring-2 ring-primary shadow-lg shadow-primary/20',
                          isSelected && !isHighlighted && 'ring-2 ring-primary/50',
                          isEditing ? 'border-primary' : 'border-white/[0.08]',
                        )}
                      >
                        <div className="aspect-[4/3] relative bg-muted">
                          <img src={scene.thumbnailUrl} alt={`Scene ${scene.index + 1}`} className="absolute inset-0 w-full h-full object-cover" />

                          {/* Top-left badges */}
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

                          {/* Action buttons */}
                          {!isEditing && (
                            <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleSceneClick(scene) }}
                                className="flex h-5 w-5 items-center justify-center rounded bg-black/60 text-white cursor-pointer hover:bg-black/80"
                              >
                                <Pencil className="h-2.5 w-2.5" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteScene(scene.id) }}
                                className="flex h-5 w-5 items-center justify-center rounded bg-red-500/80 text-white cursor-pointer hover:bg-red-600"
                              >
                                <Trash2 className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          )}

                          <div className="absolute bottom-0 left-0 right-0 px-1.5 py-1 bg-gradient-to-t from-black/70 to-transparent">
                            <p className="text-[8px] font-medium text-white truncate">{scene.subject} — {scene.action}</p>
                          </div>
                        </div>

                        {isEditing && (
                          <div className="p-2 space-y-1.5 glass-surface">
                            <input value={editSubject} onChange={(e) => setEditSubject(e.target.value)} className="w-full rounded glass-input px-1.5 py-1 text-[10px] text-foreground focus:outline-none" placeholder="Subject" />
                            <input value={editAction} onChange={(e) => setEditAction(e.target.value)} className="w-full rounded glass-input px-1.5 py-1 text-[10px] text-foreground focus:outline-none" placeholder="Action" />
                            <div className="flex gap-1">
                              <button onClick={(e) => { e.stopPropagation(); saveEdit() }} className="flex-1 flex items-center justify-center gap-1 rounded glass-button py-1 text-[9px] font-semibold text-primary-foreground cursor-pointer">
                                <Check className="h-2.5 w-2.5" /> Save
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); setEditingId(null) }} className="flex-1 flex items-center justify-center gap-1 rounded border border-white/[0.08] py-1 text-[9px] font-medium text-muted-foreground cursor-pointer">
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
        </div>

        {/* Resize handle */}
        <div
          onMouseDown={startResize}
          className="shrink-0 w-3 flex items-center justify-center cursor-col-resize group/handle hover:bg-muted/50 transition-colors rounded"
        >
          <GripHorizontal className="h-4 w-4 text-muted-foreground/30 group-hover/handle:text-muted-foreground/60 transition-colors rotate-90" />
        </div>

        {/* Right panel */}
        <div className="shrink-0 min-w-0 flex flex-col gap-2" style={{ width: chatWidth }}>
          {/* Toggle: Chat / Properties */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setRightPanelView('chat')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors cursor-pointer',
                rightPanelView === 'chat' ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-muted/30 text-muted-foreground hover:bg-muted/50',
              )}
            >
              <MessageSquare className="h-3 w-3" /> AI Assistant
            </button>
            <button
              onClick={() => setRightPanelView('properties')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors cursor-pointer',
                rightPanelView === 'properties' ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-muted/30 text-muted-foreground hover:bg-muted/50',
              )}
            >
              <SlidersHorizontal className="h-3 w-3" /> Properties
            </button>
          </div>

          {/* Panel content */}
          <div className="flex-1 min-h-0 rounded-2xl glass-surface overflow-hidden">
            <AnimatePresence mode="wait">
              {rightPanelView === 'chat' ? (
                <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="h-full">
                  <StoryboardChat
                    scenes={scenes}
                    onEditScene={handleChatEditScene}
                    onDeleteScene={handleChatDeleteScene}
                    onInsertScene={handleChatInsertScene}
                    onHighlightScene={setHighlightedSceneId}
                  />
                </motion.div>
              ) : (
                <motion.div key="properties" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="h-full">
                  {selectedScene ? (
                    <StoryboardProperties
                      scene={selectedScene}
                      sceneIndex={selectedScene.index}
                      timestamp={selectedSceneTimeRange ? `${fmt(selectedSceneTimeRange.audioStart)}–${fmt(selectedSceneTimeRange.audioEnd)}` : ''}
                      onClose={() => { setSelectedSceneId(null); setRightPanelView('chat') }}
                      onUpdate={handleChatEditScene}
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-2 text-center p-6">
                      <SlidersHorizontal className="h-6 w-6 text-muted-foreground/40" />
                      <p className="text-[11px] text-muted-foreground">Click any scene to view its properties</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Generate button */}
          <div className="shrink-0 space-y-1.5">
            <button onClick={onContinue} className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer">
              Generate Videos
            </button>
            <p className="text-center text-[10px] text-muted-foreground">
              Estimated cost: 2,550 credits for Video Scenes
            </p>
          </div>
        </div>
      </div>

      {/* Bottom timeline — same position as Step 5 */}
      <div className="shrink-0">
        <StoryboardWaveform
          audio={audio} scenes={scenes} highlightedSceneId={highlightedSceneId}
          onSceneClick={handleSceneClickFromTimeline} onResizeScenes={handleResizeScenes}
          lipsyncSceneIds={lipsyncSceneIds}
        />
      </div>
    </div>
  )
}

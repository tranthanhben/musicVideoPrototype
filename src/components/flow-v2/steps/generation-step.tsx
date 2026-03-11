'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GripVertical, Pencil, Trash2, Play, Check, X, Film, GripHorizontal, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockProjects } from '@/lib/mock/projects'
import type { MockScene } from '@/lib/mock/types'
import { StoryboardWaveform, computeSceneTimeRanges } from './storyboard-waveform'
import { GenerationChat } from './generation-chat'

// ─── Types ──────────────────────────────────────────────────

interface GenerationStepProps {
  trackIndex: number
  onComplete: () => void
}

interface VideoScene extends MockScene {
  isNew?: boolean
  videoStatus: 'pending' | 'rendering' | 'done'
}

// ─── Scene generator (reuse from storyboard) ────────────────

function svgThumb(from: string, to: string): string {
  const f = from.replace(/#/g, '%23')
  const t = to.replace(/#/g, '%23')
  return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${f}"/><stop offset="100%" style="stop-color:${t}"/></linearGradient></defs><rect width="400" height="300" fill="url(%23g)"/></svg>`
}

const SCENE_TEMPLATES: { subject: string; action: string; environment: string; colors: [string, string] }[] = [
  { subject: 'Singer', action: 'walking through golden mist', environment: 'ethereal fog', colors: ['#F59E0B', '#FDE68A'] },
  { subject: 'Couple', action: 'silhouetted against sunset', environment: 'beach shoreline', colors: ['#F97316', '#EC4899'] },
  { subject: 'Dancer', action: 'spinning in slow motion', environment: 'empty warehouse', colors: ['#8B5CF6', '#06B6D4'] },
  { subject: 'Band', action: 'performing under spotlights', environment: 'dark stage', colors: ['#EF4444', '#7C3AED'] },
  { subject: 'Woman', action: 'running through rain', environment: 'city street at night', colors: ['#0EA5E9', '#1E1B4B'] },
  { subject: 'Man', action: 'looking out a car window', environment: 'highway at dusk', colors: ['#F59E0B', '#78350F'] },
  { subject: 'Crowd', action: 'jumping in unison', environment: 'festival main stage', colors: ['#EC4899', '#F97316'] },
  { subject: 'Singer', action: 'close-up emotional performance', environment: 'spotlight beam', colors: ['#A855F7', '#EC4899'] },
  { subject: 'Couple', action: 'slow dance under string lights', environment: 'garden patio', colors: ['#FBBF24', '#D97706'] },
  { subject: 'Dancer', action: 'leaping through laser grid', environment: 'neon club', colors: ['#22D3EE', '#EC4899'] },
  { subject: 'Woman', action: 'floating in water', environment: 'crystal-clear pool', colors: ['#06B6D4', '#10B981'] },
  { subject: 'Singer', action: 'screaming into the void', environment: 'cliff edge at storm', colors: ['#1E1B4B', '#EF4444'] },
  { subject: 'Group', action: 'walking in formation', environment: 'empty desert road', colors: ['#D97706', '#78350F'] },
  { subject: 'Man', action: 'playing piano in ruins', environment: 'abandoned cathedral', colors: ['#78716C', '#F5F5F4'] },
  { subject: 'Couple', action: 'faces inches apart', environment: 'dim candlelit room', colors: ['#EC4899', '#F59E0B'] },
  { subject: 'Singer', action: 'surrounded by floating petals', environment: 'cherry blossom grove', colors: ['#F0ABFC', '#FBBF24'] },
  { subject: 'Dancer', action: 'krumping with energy', environment: 'graffiti alleyway', colors: ['#EF4444', '#F97316'] },
  { subject: 'Band', action: 'backstage getting ready', environment: 'mirror-lined dressing room', colors: ['#7C3AED', '#F0ABFC'] },
  { subject: 'Woman', action: 'driving a vintage convertible', environment: 'coastal highway', colors: ['#22D3EE', '#F59E0B'] },
  { subject: 'Singer', action: 'reflected in shattered mirror', environment: 'dark studio', colors: ['#1E1B4B', '#A855F7'] },
  { subject: 'Crowd', action: 'holding up phone lights', environment: 'arena from above', colors: ['#7C3AED', '#22D3EE'] },
  { subject: 'Couple', action: 'kissing in the rain', environment: 'empty parking lot', colors: ['#0EA5E9', '#EC4899'] },
  { subject: 'Dancer', action: 'contemporary floor work', environment: 'white void studio', colors: ['#F5F5F4', '#A855F7'] },
  { subject: 'Man', action: 'boxing in slow motion', environment: 'old gym, sweat and dust', colors: ['#78350F', '#EF4444'] },
  { subject: 'Singer', action: 'whispering to camera', environment: 'extreme macro lens', colors: ['#EC4899', '#A855F7'] },
  { subject: 'Group', action: 'laughing around bonfire', environment: 'beach night', colors: ['#F97316', '#D97706'] },
  { subject: 'Woman', action: 'emerging from underwater', environment: 'dark ocean surface', colors: ['#1E1B4B', '#06B6D4'] },
  { subject: 'Dancer', action: 'freeze frame mid-air', environment: 'rooftop at dawn', colors: ['#F59E0B', '#EC4899'] },
  { subject: 'Singer', action: 'performing with passion', environment: 'fireworks behind', colors: ['#EF4444', '#FBBF24'] },
  { subject: 'Couple', action: 'walking away from camera', environment: 'misty forest path', colors: ['#10B981', '#065F46'] },
  { subject: 'Band', action: 'smashing instruments', environment: 'rooftop at sunset', colors: ['#F97316', '#7C3AED'] },
  { subject: 'Woman', action: 'spinning with fabric veil', environment: 'wind-swept field', colors: ['#F0ABFC', '#22D3EE'] },
  { subject: 'Singer', action: 'tears rolling down face', environment: 'single overhead light', colors: ['#A855F7', '#1E1B4B'] },
  { subject: 'Dancer', action: 'tutting with precision', environment: 'LED cube installation', colors: ['#06B6D4', '#7C3AED'] },
  { subject: 'Man', action: 'walking through crowd', environment: 'busy market, golden hour', colors: ['#FBBF24', '#D97706'] },
  { subject: 'Crowd', action: 'moshing with energy', environment: 'underground venue', colors: ['#EF4444', '#0A0A0F'] },
  { subject: 'Couple', action: 'staring at the stars', environment: 'rooftop blanket', colors: ['#1E1B4B', '#7C3AED'] },
  { subject: 'Singer', action: 'singing with choir behind', environment: 'grand hall', colors: ['#D97706', '#7C3AED'] },
  { subject: 'Dancer', action: 'voguing with attitude', environment: 'ballroom with mirrors', colors: ['#EC4899', '#FBBF24'] },
  { subject: 'Woman', action: 'looking back over shoulder', environment: 'train platform', colors: ['#78716C', '#0EA5E9'] },
  { subject: 'Band', action: 'riding in a van', environment: 'highway through mountains', colors: ['#10B981', '#F59E0B'] },
  { subject: 'Singer', action: 'unraveling bandages', environment: 'clinical white room', colors: ['#F5F5F4', '#EF4444'] },
  { subject: 'Dancer', action: 'popping and locking', environment: 'subway platform', colors: ['#F97316', '#22D3EE'] },
  { subject: 'Couple', action: 'arguing passionately', environment: 'apartment kitchen', colors: ['#EF4444', '#F59E0B'] },
  { subject: 'Man', action: 'painting a large canvas', environment: 'art loft, paint splatter', colors: ['#7C3AED', '#EC4899'] },
  { subject: 'Singer', action: 'finale pose with band', environment: 'confetti falling', colors: ['#FBBF24', '#EC4899'] },
  { subject: 'Group', action: 'running toward camera', environment: 'open field, golden light', colors: ['#F59E0B', '#10B981'] },
  { subject: 'Woman', action: 'hand reaching for light', environment: 'dark void, single ray', colors: ['#A855F7', '#FBBF24'] },
  { subject: 'Dancer', action: 'body rolling in smoke', environment: 'haze-filled stage', colors: ['#1E1B4B', '#EC4899'] },
  { subject: 'Singer', action: 'final note, eyes closed', environment: 'fade to black', colors: ['#7C3AED', '#0A0A0F'] },
]

const CAMERA_ANGLES = ['wide shot', 'medium shot', 'close-up', 'extreme close-up', 'low angle', 'high angle', 'aerial', 'POV', 'over-the-shoulder']
const CAMERA_MOVEMENTS = ['slow dolly in', 'slow pan', 'tracking shot', 'crane up', 'handheld', 'steadicam orbit', 'whip pan', 'push in', 'pullback reveal', 'static']

function generateScenes(targetCount: number): VideoScene[] {
  const result: VideoScene[] = []
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
      thumbnailUrl: svgThumb(template.colors[0], template.colors[1]),
      duration,
      status: 'completed',
      takes: [],
      videoStatus: 'pending',
    })
  }
  return result
}

// ─── Utils ──────────────────────────────────────────────────

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${String(Math.floor(s) % 60).padStart(2, '0')}`
}

// ─── Component ──────────────────────────────────────────────

export function GenerationStep({ trackIndex, onComplete }: GenerationStepProps) {
  const project = mockProjects[trackIndex] ?? mockProjects[0]
  const audio = project.audio

  const [scenes, setScenes] = useState<VideoScene[]>(() => generateScenes(39))
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editSubject, setEditSubject] = useState('')
  const [editAction, setEditAction] = useState('')
  const [highlightedSceneId, setHighlightedSceneId] = useState<string | null>(null)
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  // ── Progressive rendering simulation ──────────────
  useEffect(() => {
    // Render scenes progressively: every 600ms, render the next pending scene
    const interval = setInterval(() => {
      setScenes((prev) => {
        const renderingIdx = prev.findIndex((s) => s.videoStatus === 'rendering')
        const nextPendingIdx = prev.findIndex((s) => s.videoStatus === 'pending')

        if (renderingIdx >= 0) {
          // Current rendering scene → done
          const updated = [...prev]
          updated[renderingIdx] = { ...updated[renderingIdx], videoStatus: 'done' }
          // Start next pending if exists
          const nextPending = updated.findIndex((s) => s.videoStatus === 'pending')
          if (nextPending >= 0) {
            updated[nextPending] = { ...updated[nextPending], videoStatus: 'rendering' }
          }
          return updated
        } else if (nextPendingIdx >= 0) {
          // No rendering scene, start the first pending
          const updated = [...prev]
          updated[nextPendingIdx] = { ...updated[nextPendingIdx], videoStatus: 'rendering' }
          return updated
        }
        // All done
        clearInterval(interval)
        return prev
      })
    }, 600)
    return () => clearInterval(interval)
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

  // Compute scene time ranges for display
  const sceneTimeRanges = computeSceneTimeRanges(scenes, audio.duration)

  // Lipsync scenes (~30%): Singer + Band subjects
  const lipsyncSceneIds = useMemo(() => {
    const ids = new Set<string>()
    scenes.forEach((scene) => {
      if (scene.subject === 'Singer' || scene.subject === 'Band') {
        ids.add(scene.id)
      }
    })
    return ids
  }, [scenes])

  // Progress stats
  const doneCount = scenes.filter((s) => s.videoStatus === 'done').length
  const renderingCount = scenes.filter((s) => s.videoStatus === 'rendering').length
  const isAllDone = doneCount === scenes.length

  // ── Scene CRUD ──────────────────────────────────

  const startEdit = useCallback((scene: VideoScene) => {
    setEditingId(scene.id)
    setEditSubject(scene.subject)
    setEditAction(scene.action)
  }, [])

  function saveEdit() {
    if (!editingId) return
    setScenes((prev) => prev.map((s) =>
      s.id === editingId ? { ...s, subject: editSubject, action: editAction } : s,
    ))
    setEditingId(null)
  }

  function deleteScene(id: string) {
    setScenes((prev) => {
      const filtered = prev.filter((s) => s.id !== id)
      return filtered.map((s, i) => ({ ...s, index: i }))
    })
  }

  // ── Interactions ────────────────────────────────

  const handleSceneClickFromTimeline = useCallback((sceneId: string) => {
    setHighlightedSceneId(sceneId)
    const el = document.querySelector(`[data-scene-id="${sceneId}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [])

  const handleChatEditScene = useCallback((sceneId: string, updates: Partial<VideoScene>) => {
    setScenes((prev) => prev.map((s) =>
      s.id === sceneId ? { ...s, ...updates } : s,
    ))
  }, [])

  const handleRegenerateScene = useCallback((sceneId: string) => {
    setScenes((prev) => prev.map((s) =>
      s.id === sceneId ? { ...s, videoStatus: 'pending' } : s,
    ))
  }, [])

  const handleResizeScenes = useCallback((leftIdx: number, rightIdx: number, leftDur: number, rightDur: number) => {
    setScenes((prev) => prev.map((s, i) => {
      if (i === leftIdx) return { ...s, duration: leftDur }
      if (i === rightIdx) return { ...s, duration: rightDur }
      return s
    }))
  }, [])

  // ── Render ──────────────────────────────────────

  return (
    <div className="flex h-full flex-col overflow-hidden p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-3 shrink-0"
      >
        <div className="flex items-center gap-2">
          <Film className="h-4 w-4 text-primary" />
          <div>
            <h2 className="text-base font-bold text-foreground">Video Scenes</h2>
            <p className="text-[10px] text-muted-foreground">
              {doneCount}/{scenes.length} rendered{renderingCount > 0 ? ` · ${renderingCount} rendering` : ''}{isAllDone ? ' · All complete!' : ''}
            </p>
          </div>
        </div>
        {/* Progress bar */}
        {!isAllDone && (
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-muted-foreground">{Math.round((doneCount / scenes.length) * 100)}%</span>
            <div className="h-1.5 w-28 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #7C3AED, #06B6D4)' }}
                animate={{ width: `${(doneCount / scenes.length) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Body: resizable two-column layout */}
      <div ref={containerRef} className="flex flex-1 overflow-hidden">
        {/* Left column — takes remaining space */}
        <div className="flex-1 flex flex-col overflow-hidden gap-3 min-w-0 pr-1">
          {/* Audio waveform timeline */}
          <div className="shrink-0">
            <StoryboardWaveform
              audio={audio}
              scenes={scenes}
              highlightedSceneId={highlightedSceneId}
              onSceneClick={handleSceneClickFromTimeline}
              onResizeScenes={handleResizeScenes}
              lipsyncSceneIds={lipsyncSceneIds}
            />
          </div>

          {/* Scene grid — responsive auto-fill */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(245px, 1fr))' }}>
              {scenes.map((scene, idx) => {
                const isEditing = editingId === scene.id
                const isHighlighted = highlightedSceneId === scene.id
                const timeRange = sceneTimeRanges[idx]
                const isDone = scene.videoStatus === 'done'
                const isRendering = scene.videoStatus === 'rendering'

                return (
                  <div key={scene.id} data-scene-id={scene.id}>
                    <motion.div
                      animate={isHighlighted ? { scale: [1, 1.02, 1] } : {}}
                      transition={{ duration: 0.4 }}
                    >
                      <div
                        className={cn(
                          'relative rounded-lg border overflow-hidden transition-all group',
                          isHighlighted && 'ring-2 ring-primary shadow-lg shadow-primary/20',
                          isEditing ? 'border-primary' : isRendering ? 'border-blue-500/50' : 'border-border',
                        )}
                      >
                        {/* Thumbnail / Video preview */}
                        <div className="aspect-[4/3] relative bg-muted">
                          <img
                            src={scene.thumbnailUrl}
                            alt={`Scene ${scene.index + 1}`}
                            className="absolute inset-0 w-full h-full object-cover"
                          />

                          {/* Video status overlay */}
                          {isDone ? (
                            <>
                              {/* Play button overlay for completed videos */}
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg">
                                  <Play className="h-5 w-5 text-black ml-0.5" />
                                </div>
                              </div>
                              {/* Done checkmark */}
                              <div className="absolute bottom-1 right-1">
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/90">
                                  <Check className="h-3 w-3 text-white" />
                                </div>
                              </div>
                            </>
                          ) : isRendering ? (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <div className="flex flex-col items-center gap-1.5">
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                >
                                  <RefreshCw className="h-5 w-5 text-blue-400" />
                                </motion.div>
                                <span className="text-[8px] font-mono text-blue-300">Rendering...</span>
                              </div>
                            </div>
                          ) : (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="text-[8px] font-mono text-white/50">Queued</span>
                            </div>
                          )}

                          {/* Scene number + time range + lipsync */}
                          <div className="absolute top-1 left-1 flex items-center gap-0.5">
                            <span className="rounded bg-black/60 px-1 py-0.5 text-[8px] font-bold text-white">
                              S{scene.index + 1}
                            </span>
                            {timeRange && (
                              <span className="rounded bg-black/50 px-1 py-0.5 text-[7px] font-mono text-white/70">
                                {fmt(timeRange.audioStart)}–{fmt(timeRange.audioEnd)}
                              </span>
                            )}
                            {lipsyncSceneIds.has(scene.id) && (
                              <span className="rounded bg-emerald-500/90 px-1 py-0.5 text-[7px] font-bold text-white tracking-wide">
                                Lipsync
                              </span>
                            )}
                          </div>

                          {/* Action buttons (edit / delete) */}
                          {!isEditing && (
                            <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => startEdit(scene)}
                                className="flex h-5 w-5 items-center justify-center rounded bg-black/60 text-white cursor-pointer hover:bg-black/80"
                              >
                                <Pencil className="h-2.5 w-2.5" />
                              </button>
                              <button
                                onClick={() => deleteScene(scene.id)}
                                className="flex h-5 w-5 items-center justify-center rounded bg-red-500/80 text-white cursor-pointer hover:bg-red-600"
                              >
                                <Trash2 className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          )}

                          {/* Bottom label */}
                          <div className="absolute bottom-0 left-0 right-0 px-1.5 py-1 bg-gradient-to-t from-black/70 to-transparent">
                            <p className="text-[8px] font-medium text-white truncate">
                              {scene.subject} — {scene.action}
                            </p>
                          </div>
                        </div>

                        {/* Edit form */}
                        {isEditing && (
                          <div className="p-2 space-y-1.5 bg-card">
                            <input
                              value={editSubject}
                              onChange={(e) => setEditSubject(e.target.value)}
                              className="w-full rounded border border-border bg-background px-1.5 py-1 text-[10px] text-foreground focus:outline-none focus:border-primary/50"
                              placeholder="Subject"
                            />
                            <input
                              value={editAction}
                              onChange={(e) => setEditAction(e.target.value)}
                              className="w-full rounded border border-border bg-background px-1.5 py-1 text-[10px] text-foreground focus:outline-none focus:border-primary/50"
                              placeholder="Action"
                            />
                            <div className="flex gap-1">
                              <button onClick={saveEdit} className="flex-1 flex items-center justify-center gap-1 rounded bg-primary py-1 text-[9px] font-semibold text-primary-foreground cursor-pointer">
                                <Check className="h-2.5 w-2.5" /> Save
                              </button>
                              <button onClick={() => setEditingId(null)} className="flex-1 flex items-center justify-center gap-1 rounded border border-border py-1 text-[9px] font-medium text-muted-foreground cursor-pointer">
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

        {/* Right column — agent chat + continue button, resizable width */}
        <div className="shrink-0 min-w-0 flex flex-col gap-2" style={{ width: chatWidth }}>
          <div className="flex-1 min-h-0">
            <GenerationChat
              scenes={scenes}
              onEditScene={handleChatEditScene}
              onRegenerateScene={handleRegenerateScene}
              onHighlightScene={setHighlightedSceneId}
            />
          </div>
          {isAllDone && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="shrink-0 space-y-1.5"
            >
              <button
                onClick={onComplete}
                className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer"
              >
                Final Edit & Export
              </button>
              <p className="text-center text-[10px] text-muted-foreground">
                Estimated cost: 0 credit
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

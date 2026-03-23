'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bot } from 'lucide-react'
import { mockProjects } from '@/lib/mock/projects'
import type { MockScene } from '@/lib/mock/types'
import type { WorkPhase } from '@/lib/flow-v5/types'
import { UnifiedChatPanel, type UnifiedChatMessage } from './unified-chat-panel'
import { AnalysisWorkspaceView, IdeationWorkspaceView, StoryboardWorkspaceView, VfxWorkspaceView } from './unified-workspace-views'

// ─── Phase navigation ─────────────────────────────────────────

type ViewablePhase = 'analysis' | 'ideation' | 'storyboard' | 'vfx_export'

function getActiveViewablePhase(phase: WorkPhase, analysisStage: string): ViewablePhase {
  if (phase === 'analysis') {
    return analysisStage === 'ideation' ? 'ideation' : 'analysis'
  }
  return phase as ViewablePhase
}

// ─── Fixed bottom action bar ──────────────────────────────────

const CREDITS_PER_SECOND = 15

const PHASE_ACTION_CONFIG: Record<ViewablePhase, { label: string; actionId: string } | null> = {
  analysis: { label: 'Continue to Ideation', actionId: 'approve-analysis' },
  ideation: { label: 'Generate Storyboard', actionId: 'approve-ideation' },
  storyboard: null, // Storyboard has custom dual-button UI
  vfx_export: null, // VFX has its own render/export buttons
}

const PHASE_DESCRIPTIONS: Partial<Record<ViewablePhase, string>> = {
  ideation: 'Estimated cost: 400 for Storyboard & 2,550 for Video Scenes. Total 2,950 credits',
}

function BottomActionBar({
  activePhase,
  onAction,
  isGenerating,
  allDone,
  doneCount,
  totalScenes,
  totalDuration,
  genMode,
  sceneByScenePaused,
  remainingCredits,
  remainingScenes,
}: {
  activePhase: ViewablePhase
  onAction: (actionId: string) => void
  isGenerating?: boolean
  allDone?: boolean
  doneCount?: number
  totalScenes?: number
  totalDuration?: number
  genMode?: 'all' | 'scene-by-scene' | null
  sceneByScenePaused?: boolean
  remainingCredits?: number
  remainingScenes?: number
}) {
  // During generation: show progress or "Continue to VFX Studio"
  if (activePhase === 'storyboard' && isGenerating) {
    // Scene-by-scene paused — waiting for user
    if (genMode === 'scene-by-scene' && sceneByScenePaused && !allDone) {
      return (
        <div className="shrink-0 border-t border-border bg-background/80 backdrop-blur-sm px-4 py-3 space-y-1.5">
          <div className="flex gap-2">
            <button
              onClick={() => onAction('gen-next-scene')}
              className="flex-1 rounded-xl glass-surface py-2.5 px-3 cursor-pointer hover:bg-muted/80 transition-all text-center"
            >
              <p className="text-base font-bold text-foreground">Generate Next Scene</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{CREDITS_PER_SECOND} credits/sec</p>
            </button>
            <button
              onClick={() => onAction('gen-remaining-scenes')}
              className="flex-1 rounded-xl glass-button py-2.5 px-3 cursor-pointer text-center"
            >
              <p className="text-base font-bold text-white">Generate Remaining</p>
              <p className="text-[11px] text-white/60 mt-0.5">{remainingScenes} scenes · {(remainingCredits ?? 0).toLocaleString()} credits</p>
            </button>
          </div>
          <p className="text-center text-[10px] text-muted-foreground">{doneCount}/{totalScenes} scenes generated</p>
        </div>
      )
    }
    if (allDone) {
      return (
        <div className="shrink-0 border-t border-border bg-background/80 backdrop-blur-sm px-4 py-3 space-y-1.5">
          <div className="flex gap-2">
            <button
              onClick={() => onAction('continue-to-vfx')}
              className="flex-1 rounded-xl glass-surface py-2.5 text-sm font-semibold text-foreground cursor-pointer hover:bg-muted/80 transition-colors"
            >
              Edit & VFX
            </button>
            <button
              onClick={() => onAction('render-download')}
              className="flex-1 rounded-xl glass-button py-2.5 text-sm font-semibold text-white cursor-pointer"
            >
              Render & Download
            </button>
          </div>
          <p className="text-center text-[10px] text-emerald-500">All {totalScenes} scenes generated ✓</p>
        </div>
      )
    }
    return (
      <div className="shrink-0 border-t border-border bg-background/80 backdrop-blur-sm px-4 py-3 space-y-1.5">
        <div className="w-full rounded-xl bg-muted/50 py-2.5 text-center">
          <p className="text-sm font-semibold text-muted-foreground">
            Generating... <span className="text-primary tabular-nums">{doneCount}/{totalScenes}</span>
          </p>
        </div>
        <div className="h-1 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${((doneCount ?? 0) / (totalScenes ?? 1)) * 100}%` }} />
        </div>
      </div>
    )
  }

  // Storyboard: dual generate options
  if (activePhase === 'storyboard') {
    const allCost = Math.round((totalDuration ?? 0) * CREDITS_PER_SECOND)
    const perSceneCost = totalScenes ? Math.round(allCost / totalScenes) : 0

    return (
      <div className="shrink-0 border-t border-border bg-background/80 backdrop-blur-sm px-4 py-2">
        <div className="flex gap-2">
          <button
            onClick={() => onAction('generate-scene-by-scene')}
            className="flex-1 rounded-lg glass-surface py-1.5 px-3 cursor-pointer hover:bg-muted/80 transition-all text-center"
          >
            <p className="text-sm font-semibold text-foreground">Generate Scene by Scene</p>
            <p className="text-[10px] text-muted-foreground">{CREDITS_PER_SECOND} credits/sec</p>
          </button>
          <button
            onClick={() => onAction('approve-storyboard')}
            className="flex-1 rounded-lg glass-button py-1.5 px-3 cursor-pointer text-center"
          >
            <p className="text-sm font-semibold text-white">Generate All Scenes</p>
            <p className="text-[10px] text-white/60">{allCost.toLocaleString()} credits</p>
          </button>
        </div>
      </div>
    )
  }

  const config = PHASE_ACTION_CONFIG[activePhase]
  if (!config) return null

  const description = PHASE_DESCRIPTIONS[activePhase]

  return (
    <div className="shrink-0 border-t border-border bg-background/80 backdrop-blur-sm px-4 py-3 space-y-1.5">
      <button
        onClick={() => onAction(config.actionId)}
        className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-lg shadow-primary/25"
      >
        {config.label}
      </button>
      {description && (
        <p className="text-center text-[10px] text-muted-foreground">{description}</p>
      )}
    </div>
  )
}

// ─── Scene generation ────────────────────────────────────────

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

const SCENE_TEMPLATES = [
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

function generateScenes(targetCount: number): MockScene[] {
  const result: MockScene[] = []
  for (let i = 0; i < targetCount; i++) {
    const t = SCENE_TEMPLATES[i % SCENE_TEMPLATES.length]
    const duration = 2 + (i * 7 + 3) % 5
    const angle = CAMERA_ANGLES[(i * 3 + 5) % CAMERA_ANGLES.length]
    const movement = CAMERA_MOVEMENTS[(i * 4 + 2) % CAMERA_MOVEMENTS.length]
    result.push({
      id: `scene-${i}`,
      index: i,
      subject: t.subject,
      action: t.action,
      environment: t.environment,
      cameraAngle: angle,
      cameraMovement: movement,
      prompt: `${t.subject} ${t.action} in ${t.environment}, ${angle}, ${movement}, cinematic`,
      thumbnailUrl: SCENE_IMAGE_URLS[i % SCENE_IMAGE_URLS.length],
      duration,
      status: 'completed',
      takes: [],
    })
  }
  return result
}

// ─── Chat helpers ────────────────────────────────────────────

function makeTimestamp() {
  return new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// ─── Chat response generators ────────────────────────────────

function generateAnalysisResponse(input: string): { agentMsg: string; systemMsg?: string } {
  const lower = input.toLowerCase()
  if (lower.match(/energy|curve|peak/)) {
    return { agentMsg: 'The energy curve shows a gradual build through the verses, peaking during the chorus at 0:45 and 1:32. There are 4 emotional peaks total — great anchor points for your most dramatic scenes.' }
  }
  if (lower.match(/mood|feel|vibe|emotion/)) {
    return { agentMsg: 'The track conveys a euphoric, romantic, and uplifting mood. The verses have an intimate, yearning quality while the choruses explode with cosmic energy. Perfect for a narrative about connection across distance.' }
  }
  if (lower.match(/key|chord|harmony/)) {
    return { agentMsg: 'The track is in A minor with modulations to C major during the chorus. The harmonic progression creates a "darkness to light" arc that maps beautifully to visual storytelling.' }
  }
  return { agentMsg: 'I can tell you about the energy curve, mood analysis, key changes, and structural sections. What would you like to know more about?' }
}

function generateStoryboardResponse(
  input: string,
  scenes: MockScene[],
  callbacks: {
    onEditScene: (id: string, updates: Partial<MockScene>) => void
    onDeleteScene: (id: string) => void
    onInsertScene: (afterIdx: number) => void
    onHighlightScene: (id: string | null) => void
  },
): { agentMsg: string; systemMsg?: string } {
  const lower = input.toLowerCase()

  const dramaticMatch = lower.match(/scene\s*(\d+).*(?:dramatic|intense|emotional|powerful|dark|bright)/)
  if (dramaticMatch) {
    const num = parseInt(dramaticMatch[1])
    const scene = scenes[num - 1]
    if (scene) {
      const adj = lower.includes('dramatic') ? 'dramatically' : lower.includes('intense') ? 'intensely' : 'emotionally'
      callbacks.onEditScene(scene.id, { action: `${scene.action} — ${adj} reimagined` })
      callbacks.onHighlightScene(scene.id)
      return { agentMsg: `Done! Updated Scene ${num} to be more ${adj.replace(' reimagined', '')}.`, systemMsg: `Scene ${num} updated` }
    }
  }

  const deleteMatch = lower.match(/(?:delete|remove).*scene\s*(\d+)/)
  if (deleteMatch) {
    const num = parseInt(deleteMatch[1])
    const scene = scenes[num - 1]
    if (scene) {
      callbacks.onDeleteScene(scene.id)
      return { agentMsg: `Removed Scene ${num}. Remaining scenes reindexed.`, systemMsg: `Scene ${num} deleted` }
    }
  }

  if (lower.match(/(?:add|insert).*scene/)) {
    const afterMatch = lower.match(/after.*scene\s*(\d+)/)
    const afterIdx = afterMatch?.[1] ? parseInt(afterMatch[1]) - 1 : Math.floor(scenes.length / 2)
    callbacks.onInsertScene(Math.min(afterIdx, scenes.length - 1))
    return { agentMsg: `Added a new scene after position ${afterIdx + 1}. Click to edit its details.`, systemMsg: `Scene inserted at ${afterIdx + 2}` }
  }

  const swapMatch = lower.match(/swap.*scene\s*(\d+).*scene\s*(\d+)/)
  if (swapMatch) {
    const a = parseInt(swapMatch[1]) - 1
    const b = parseInt(swapMatch[2]) - 1
    if (scenes[a] && scenes[b]) {
      callbacks.onHighlightScene(scenes[a].id)
      return { agentMsg: `Noted the swap between Scene ${a + 1} and Scene ${b + 1}. Drag them in the grid to reorder.`, systemMsg: `Swap: ${a + 1} ↔ ${b + 1}` }
    }
  }

  if (lower.match(/regenerat|regen/)) {
    const sceneMatch = lower.match(/scene\s*(\d+)/)
    if (sceneMatch) {
      const num = parseInt(sceneMatch[1])
      const scene = scenes[num - 1]
      if (scene) {
        callbacks.onHighlightScene(scene.id)
        return { agentMsg: `Regenerating thumbnail for Scene ${num}...`, systemMsg: `Scene ${num} regenerating` }
      }
    }
    return { agentMsg: `Starting thumbnail regeneration for all ${scenes.length} scenes.`, systemMsg: 'All thumbnails regenerating' }
  }

  if (lower.match(/camera|angle|shot|close.?up|wide|aerial/)) {
    const sceneMatch = lower.match(/scene\s*(\d+)/)
    if (sceneMatch) {
      const num = parseInt(sceneMatch[1])
      const scene = scenes[num - 1]
      if (scene) {
        const newAngle = lower.includes('close') ? 'extreme close-up' : lower.includes('wide') ? 'wide establishing shot' : lower.includes('aerial') ? 'aerial drone shot' : 'cinematic medium shot'
        callbacks.onEditScene(scene.id, { cameraAngle: newAngle })
        callbacks.onHighlightScene(scene.id)
        return { agentMsg: `Updated Scene ${num} camera to "${newAngle}".`, systemMsg: `Scene ${num}: ${newAngle}` }
      }
    }
  }

  return { agentMsg: 'I can edit scene descriptions, change camera angles, reorder scenes, add/remove scenes, and regenerate thumbnails. Try "Make Scene 3 more dramatic" or "Delete Scene 5".' }
}

function generateVfxResponse(
  input: string,
  scenes: MockScene[],
  callbacks: {
    onVfxChange: (id: string) => void
    onTransitionChange: (id: string) => void
    onSeekToScene: (id: string) => void
  },
): { agentMsg: string; systemMsg?: string } {
  const lower = input.toLowerCase()

  if (lower.match(/film.?noir|noir/)) { callbacks.onVfxChange('film-noir'); return { agentMsg: 'Applied Film Noir — high contrast, vignette, desaturation.', systemMsg: 'VFX → Film Noir' } }
  if (lower.match(/neon|glow|bloom/)) { callbacks.onVfxChange('neon-glow'); return { agentMsg: 'Switched to Neon Glow — bloom, color bleeding, chromatic aberration.', systemMsg: 'VFX → Neon Glow' } }
  if (lower.match(/cosmic|cinema/)) { callbacks.onVfxChange('cosmic-cinema'); return { agentMsg: 'Applied Cosmic Cinema — film grain, lens flares, subtle glow.', systemMsg: 'VFX → Cosmic Cinema' } }
  if (lower.match(/dream|soft|warm/)) { callbacks.onVfxChange('dreamy-soft'); return { agentMsg: 'Applied Dreamy Soft — soft focus, warm tint, light leaks.', systemMsg: 'VFX → Dreamy Soft' } }
  if (lower.match(/vintage|16mm|retro/)) { callbacks.onVfxChange('vintage-16mm'); return { agentMsg: 'Applied Vintage 16mm — heavy grain, jitter, faded colors.', systemMsg: 'VFX → Vintage 16mm' } }
  if (lower.match(/clean|pop|bright|sharp/)) { callbacks.onVfxChange('clean-pop'); return { agentMsg: 'Switched to Clean Pop — saturated, sharp, bright.', systemMsg: 'VFX → Clean Pop' } }

  if (lower.match(/crossfade|fade|dissolve/)) { callbacks.onTransitionChange('crossfade'); return { agentMsg: 'Crossfade transitions applied.', systemMsg: 'Trans → Crossfade' } }
  if (lower.match(/whip.?pan|whip/)) { callbacks.onTransitionChange('whip-pan'); return { agentMsg: 'Whip pan transitions applied.', systemMsg: 'Trans → Whip Pan' } }
  if (lower.match(/beat.?sync|beat|sync/)) { callbacks.onTransitionChange('beat-sync'); return { agentMsg: 'Beat-synced transitions activated.', systemMsg: 'Trans → Beat-Synced' } }
  if (lower.match(/morph|ai.?morph/)) { callbacks.onTransitionChange('morph'); return { agentMsg: 'AI Morph transitions enabled.', systemMsg: 'Trans → AI Morph' } }
  if (lower.match(/hard.?cut|cut/)) { callbacks.onTransitionChange('cut'); return { agentMsg: 'Set to hard cuts — clean, instant transitions.', systemMsg: 'Trans → Hard Cut' } }

  const sceneMatch = lower.match(/scene\s*(\d+)/)
  if (sceneMatch) {
    const num = parseInt(sceneMatch[1])
    const scene = scenes[num - 1]
    if (scene) {
      callbacks.onSeekToScene(scene.id)
      return { agentMsg: `Jumped to Scene ${num} — "${scene.subject}: ${scene.action}".`, systemMsg: `Playhead → Scene ${num}` }
    }
  }

  if (lower.match(/speed.?ramp|ramp|slow.?mo/)) {
    const sMatch = lower.match(/scene\s*(\d+)/)
    if (sMatch) return { agentMsg: `Speed ramp applied to Scene ${sMatch[1]}.`, systemMsg: `Scene ${sMatch[1]}: speed ramp` }
    return { agentMsg: 'I can add speed ramps to any scene. Which scene number?' }
  }

  if (lower.match(/lens.?flare|flare|light.?leak/)) return { agentMsg: 'Lens flare effect added, synced with camera movement.', systemMsg: 'Effect: Lens Flare' }
  if (lower.match(/color.?grad|grade/)) return { agentMsg: 'I can apply teal & orange, desaturated, vibrant pop, or monochrome. What style?' }
  if (lower.match(/export|render|download/)) return { agentMsg: 'Ready to export! Hit the Render & Export button when you\'re satisfied.' }

  return { agentMsg: 'I can help with VFX presets, transitions, speed ramps, color grading, and export. What would you like?' }
}

// ─── View transition variants ────────────────────────────────

const viewVariants = {
  enter: { opacity: 0, y: 12, scale: 0.99 },
  center: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.99 },
}

// ─── Component ──────────────────────────────────────────────

interface UnifiedWorkspaceProps {
  trackIndex: number
  selectedConceptId: string | null
  onConceptSelect: (id: string) => void
  onPhaseChange?: (phase: string) => void
  /** External request to navigate to a sub-phase (from nav bar clicks) */
  navigateToPhase?: string | null
  onNavigateToPhaseHandled?: () => void
}

export function UnifiedWorkspace({ trackIndex, selectedConceptId, onConceptSelect, onPhaseChange, navigateToPhase, onNavigateToPhaseHandled }: UnifiedWorkspaceProps) {
  const project = mockProjects[trackIndex] ?? mockProjects[0]
  const audio = project.audio

  // ── Phase ──
  const [phase, setPhase] = useState<WorkPhase>('analysis')

  // ── Analysis ──
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisStage, setAnalysisStage] = useState<'analyzing' | 'analysis_done' | 'ideation'>('analyzing')

  // ── Scenes ──
  const [scenes, setScenes] = useState<MockScene[]>(() => generateScenes(39))

  // ── Scene generation ──
  const [sceneStatuses, setSceneStatuses] = useState<Record<string, 'pending' | 'rendering' | 'done'>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [genMode, setGenMode] = useState<'all' | 'scene-by-scene' | null>(null)
  const sceneByScenePausedRef = useRef(false) // pause after each scene in scene-by-scene mode

  // ── Edit toolbar (shown in storyboard view after generation) ──
  const [showEditToolbar, setShowEditToolbar] = useState(false)

  // ── VFX selections ──
  const [activeSceneId, setActiveSceneId] = useState(scenes[0]?.id ?? '')
  const [selectedVfx, setSelectedVfx] = useState('cosmic-cinema')
  const [selectedTransition, setSelectedTransition] = useState('beat-sync')
  const [selectedFilter, setSelectedFilter] = useState('normal')
  const [highlightedSceneId, setHighlightedSceneId] = useState<string | null>(null)

  // ── Viewing phase (for breadcrumb navigation) ──
  const activePhase = getActiveViewablePhase(phase, analysisStage)
  const [viewingPhase, setViewingPhase] = useState<ViewablePhase>(activePhase)
  // Chat panel — draggable width (px), min 0, default 28% of container
  const [chatWidth, setChatWidth] = useState<number | null>(null) // null = use default 28%
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const lastChatWidth = useRef<number>(0) // remember width before collapse for double-click restore

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isDragging.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    const onMove = (ev: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return
      const containerRect = containerRef.current.getBoundingClientRect()
      const newWidth = Math.max(0, Math.min(ev.clientX - containerRect.left, containerRect.width * 0.5))
      // Snap to 0 if below 200px
      if (newWidth < 200) {
        lastChatWidth.current = containerRect.width * 0.28
        setChatWidth(0)
      } else {
        setChatWidth(newWidth)
      }
    }
    const onUp = () => {
      isDragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [])

  const restoreChat = useCallback(() => {
    if (!containerRef.current) return
    const containerWidth = containerRef.current.getBoundingClientRect().width
    setChatWidth(lastChatWidth.current > 200 ? lastChatWidth.current : containerWidth * 0.28)
  }, [])

  const handleDividerDoubleClick = useCallback(() => {
    if (!containerRef.current) return
    const containerWidth = containerRef.current.getBoundingClientRect().width
    const currentWidth = chatWidth ?? containerWidth * 0.28
    if (currentWidth < 200) {
      restoreChat()
    } else {
      lastChatWidth.current = currentWidth
      setChatWidth(0)
    }
  }, [chatWidth, restoreChat])

  // Report phase changes to parent (moved after allDone is computed)
  // See useEffect below near allDone definition

  // Auto-advance viewingPhase when the real phase changes
  const prevActivePhase = useRef(activePhase)
  useEffect(() => {
    if (activePhase !== prevActivePhase.current) {
      setViewingPhase(activePhase)
      prevActivePhase.current = activePhase
    }
  }, [activePhase])

  // Handle external navigation from nav bar
  useEffect(() => {
    if (navigateToPhase) {
      const validPhases: ViewablePhase[] = ['analysis', 'ideation', 'storyboard', 'vfx_export']
      if (validPhases.includes(navigateToPhase as ViewablePhase)) {
        setViewingPhase((prev) => {
          // "Video" in nav maps to vfx_export, but keep storyboard view when generating/done in storyboard
          if (navigateToPhase === 'vfx_export' && (isGenerating || allDone)) return 'storyboard'
          return navigateToPhase as ViewablePhase
        })
      }
      onNavigateToPhaseHandled?.()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigateToPhase, onNavigateToPhaseHandled])

  const PHASE_LABEL_MAP: Record<string, ViewablePhase> = {
    'Phase → Analysis': 'analysis',
    'Phase → Ideation': 'ideation',
    'Phase → Storyboard': 'storyboard',
    'Phase → Video & Edit': 'vfx_export',
  }

  const handleSystemMsgClick = useCallback((text: string) => {
    const target = PHASE_LABEL_MAP[text]
    if (target) setViewingPhase(target)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Chat ──
  const [messages, setMessages] = useState<UnifiedChatMessage[]>([
    {
      id: -1,
      role: 'system',
      text: 'Phase → Analysis',
      timestamp: makeTimestamp(),
    },
    {
      id: 0,
      role: 'agent',
      text: "I'm analyzing your track now. I'll have the full breakdown — BPM, key, energy curve, and emotional peaks — ready in a moment.",
      timestamp: makeTimestamp(),
    },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const idRef = useRef(1)
  const analysisCompletePosted = useRef(false)

  // ── Analysis progress ──
  useEffect(() => {
    if (analysisStage !== 'analyzing') return
    const interval = setInterval(() => {
      setAnalysisProgress((p) => {
        if (p >= 100) { clearInterval(interval); setAnalysisStage('analysis_done'); return 100 }
        return p + 4
      })
    }, 80)
    return () => clearInterval(interval)
  }, [analysisStage])

  // Post analysis complete message — prompt user to approve before ideation
  useEffect(() => {
    if (analysisStage === 'analysis_done' && !analysisCompletePosted.current) {
      analysisCompletePosted.current = true
      setMessages((prev) => [
        ...prev,
        {
          id: idRef.current++,
          role: 'agent',
          text: "Analysis complete! I've mapped the BPM, key, energy curve, and emotional peaks. Take a look at the results, then approve to move on to ideation where you'll choose a visual concept.",
          timestamp: makeTimestamp(),
          actions: [{ label: 'Approve & Continue to Ideation', id: 'approve-analysis', variant: 'primary' as const }],
        },
      ])
    }
  }, [analysisStage])

  // ── Scene generation simulation (starts in storyboard, continues in vfx) ──
  useEffect(() => {
    if (!isGenerating || Object.keys(sceneStatuses).length > 0) return
    const map: Record<string, 'pending' | 'rendering' | 'done'> = {}
    scenes.forEach((s, i) => { map[s.id] = i === 0 ? 'rendering' : 'pending' })
    setSceneStatuses(map)
    sceneByScenePausedRef.current = false
  }, [isGenerating, scenes, sceneStatuses])

  const doneCount = Object.values(sceneStatuses).filter((s) => s === 'done').length
  const allDone = Object.values(sceneStatuses).length > 0 && Object.values(sceneStatuses).every((s) => s === 'done')

  // Report phase to parent — show "Video" when generating/done
  const reportedPhase = (isGenerating || allDone || genMode !== null) && activePhase === 'storyboard' ? 'vfx_export' : activePhase
  useEffect(() => {
    onPhaseChange?.(reportedPhase)
  }, [reportedPhase, onPhaseChange])

  useEffect(() => {
    if (!isGenerating || allDone || Object.keys(sceneStatuses).length === 0) return
    if (sceneByScenePausedRef.current) return // paused — waiting for user to pick next scene
    const interval = setInterval(() => {
      setSceneStatuses((prev) => {
        const updated = { ...prev }
        const renderingId = Object.keys(updated).find((id) => updated[id] === 'rendering')
        if (renderingId) {
          updated[renderingId] = 'done'
          if (genMode === 'scene-by-scene') {
            // Scene-by-scene: don't auto-start next scene
            sceneByScenePausedRef.current = true
          } else {
            // All mode: auto-start next scene
            const nextPendingId = Object.keys(updated).find((id) => updated[id] === 'pending')
            if (nextPendingId) updated[nextPendingId] = 'rendering'
          }
        }
        return updated
      })
    }, 400)
    return () => clearInterval(interval)
  }, [isGenerating, allDone, sceneStatuses, genMode])

  // ── Scene-by-scene: prompt user after each scene completes ──
  const lastDoneCountRef = useRef(0)
  useEffect(() => {
    if (genMode !== 'scene-by-scene' || !sceneByScenePausedRef.current) return
    if (doneCount <= lastDoneCountRef.current) return
    lastDoneCountRef.current = doneCount
    const pendingCount = Object.values(sceneStatuses).filter((s) => s === 'pending').length
    if (pendingCount === 0) return // all done, no need to prompt
    const justDoneId = Object.keys(sceneStatuses).find((id) => sceneStatuses[id] === 'done' && !scenes.find(s => s.id === id && sceneStatuses[id] === 'done'))
    const justDoneIndex = Object.keys(sceneStatuses).filter(id => sceneStatuses[id] === 'done').length
    const remainingDuration = scenes.filter(s => sceneStatuses[s.id] === 'pending').reduce((sum, s) => sum + (s.duration || 0), 0)
    const remainingCredits = Math.round(remainingDuration * CREDITS_PER_SECOND)

    setMessages((prev) => [
      ...prev,
      {
        id: idRef.current++,
        role: 'agent' as const,
        text: `Scene ${justDoneIndex} is done! Preview it in the storyboard. ${pendingCount} scene${pendingCount > 1 ? 's' : ''} remaining. Which scene would you like to generate next?`,
        timestamp: makeTimestamp(),
        actions: [
          { label: `Generate Next Scene`, id: 'gen-next-scene', variant: 'primary' as const },
          { label: `Generate Remaining (${remainingCredits.toLocaleString()} credits)`, id: 'gen-remaining-scenes' },
        ],
      },
    ])
  }, [doneCount, genMode, sceneStatuses, scenes])

  // ── Scene callbacks ──
  const handleEditScene = useCallback((sceneId: string, updates: Partial<MockScene>) => {
    setScenes((prev) => prev.map((s) => s.id === sceneId ? { ...s, ...updates } : s))
  }, [])

  const handleDeleteScene = useCallback((sceneId: string) => {
    setScenes((prev) => prev.filter((s) => s.id !== sceneId).map((s, i) => ({ ...s, index: i })))
  }, [])

  const handleInsertScene = useCallback((afterIndex: number) => {
    const newId = `new-scene-${Date.now()}`
    setScenes((prev) => {
      const newScene: MockScene = {
        id: newId, index: afterIndex + 1, subject: 'New Scene', action: 'describe action here',
        environment: 'environment', cameraAngle: 'medium shot', cameraMovement: 'slow pan', prompt: '',
        thumbnailUrl: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="%2327272a"/><text x="200" y="150" fill="%23a1a1aa" font-size="14" text-anchor="middle" dominant-baseline="middle">New Scene</text></svg>`,
        duration: 20, status: 'init', takes: [],
      }
      const copy = [...prev]
      copy.splice(afterIndex + 1, 0, newScene)
      return copy.map((s, i) => ({ ...s, index: i }))
    })
  }, [])

  // ── Chat send handler ──
  const handleSend = useCallback((text: string) => {
    const userMsg: UnifiedChatMessage = {
      id: idRef.current++,
      role: 'user',
      text,
      timestamp: makeTimestamp(),
    }
    setMessages((prev) => [...prev, userMsg])
    setIsTyping(true)

    const delay = 800 + Math.random() * 700
    setTimeout(() => {
      let response: { agentMsg: string; systemMsg?: string }

      switch (phase) {
        case 'analysis':
          response = generateAnalysisResponse(text)
          break
        case 'storyboard':
          response = generateStoryboardResponse(text, scenes, {
            onEditScene: handleEditScene,
            onDeleteScene: handleDeleteScene,
            onInsertScene: handleInsertScene,
            onHighlightScene: setHighlightedSceneId,
          })
          break
        case 'vfx_export':
          response = generateVfxResponse(text, scenes, {
            onVfxChange: setSelectedVfx,
            onTransitionChange: setSelectedTransition,
            onSeekToScene: setActiveSceneId,
          })
          break
      }

      const newMessages: UnifiedChatMessage[] = [
        { id: idRef.current++, role: 'agent', text: response.agentMsg, timestamp: makeTimestamp() },
      ]
      if (response.systemMsg) {
        newMessages.push({ id: idRef.current++, role: 'system', text: response.systemMsg, timestamp: makeTimestamp() })
      }

      setMessages((prev) => [...prev, ...newMessages])
      setIsTyping(false)
    }, delay)
  }, [phase, scenes, handleEditScene, handleDeleteScene, handleInsertScene])

  // ── Chat action handler ──
  const removeAction = (prev: UnifiedChatMessage[], actionId: string) =>
    prev.map((m) => m.actions?.some((a) => a.id === actionId) ? { ...m, actions: undefined } : m)

  const handleAction = useCallback((actionId: string) => {
    if (actionId === 'approve-analysis') {
      // Analysis approved → transition to Ideation (storyline + concept cards)
      setAnalysisStage('ideation')
      setMessages((prev) => [
        ...removeAction(prev, 'approve-analysis'),
        { id: idRef.current++, role: 'system' as const, text: 'Phase → Ideation', timestamp: makeTimestamp() },
        {
          id: idRef.current++,
          role: 'agent' as const,
          text: "Great! Now let's shape your music video's creative direction. I've generated a storyline and 3 visual concepts based on the analysis. Browse them, pick the one that resonates, then approve to start storyboarding.",
          timestamp: makeTimestamp(),
          actions: [
            { label: 'Approve & Continue to Storyboard', id: 'approve-ideation', variant: 'primary' as const },
            { label: 'Edit', id: 'edit-ideation' },
          ],
        },
      ])
    }

    if (actionId === 'approve-ideation') {
      // Ideation approved → transition to Storyboard phase
      setPhase('storyboard')
      setMessages((prev) => [
        ...removeAction(prev, 'approve-ideation'),
        { id: idRef.current++, role: 'system' as const, text: 'Phase → Storyboard', timestamp: makeTimestamp() },
        {
          id: idRef.current++,
          role: 'agent' as const,
          text: `I've created a ${scenes.length}-scene storyboard based on your track's structure and the selected concept. Drag scenes to reorder, click to edit details, or ask me to make changes. When you're happy, approve to start generating videos.`,
          timestamp: makeTimestamp(),
          actions: [
            { label: 'Generate Scene by Scene', id: 'generate-scene-by-scene' },
            { label: 'Generate All Scenes', id: 'approve-storyboard', variant: 'primary' as const },
            { label: 'Edit', id: 'edit-storyboard' },
          ],
        },
      ])
    }

    if (actionId === 'edit-ideation') {
      // Remove the edit action buttons, then AI asks follow-up questions
      setMessages((prev) => [
        ...removeAction(prev, 'edit-ideation'),
        { id: idRef.current++, role: 'system' as const, text: 'Editing Ideation', timestamp: makeTimestamp() },
        {
          id: idRef.current++,
          role: 'agent' as const,
          text: "What would you like to change — different theme, visual style, or entirely new concepts?",
          timestamp: makeTimestamp(),
        },
      ])
    }

    if (actionId === 'edit-storyboard') {
      // Remove the edit action buttons, then AI asks follow-up questions
      setMessages((prev) => [
        ...removeAction(prev, 'edit-storyboard'),
        { id: idRef.current++, role: 'system' as const, text: 'Editing Storyboard', timestamp: makeTimestamp() },
        {
          id: idRef.current++,
          role: 'agent' as const,
          text: "What would you like to adjust — reorder scenes, change camera angles, or modify descriptions?",
          timestamp: makeTimestamp(),
        },
      ])
    }

    if (actionId === 'approve-storyboard') {
      setGenMode('all')
      setIsGenerating(true)
      setMessages((prev) => [
        ...removeAction(prev, 'approve-storyboard'),
        { id: idRef.current++, role: 'system' as const, text: 'Generating videos...', timestamp: makeTimestamp() },
        {
          id: idRef.current++,
          role: 'agent' as const,
          text: "Generating all scene videos now! You can watch the progress right here. Once all scenes are ready, you can continue to the VFX studio for filters, transitions, and color grading.",
          timestamp: makeTimestamp(),
        },
      ])
    }

    if (actionId === 'generate-scene-by-scene') {
      setMessages((prev) => [
        ...removeAction(prev, 'generate-scene-by-scene'),
        {
          id: idRef.current++,
          role: 'agent' as const,
          text: `Great choice! You have ${scenes.length} scenes in your storyboard. Which scene would you like to generate first? You can also give me any direction for that scene before we generate it.`,
          timestamp: makeTimestamp(),
          actions: [
            { label: 'Start with Scene 1', id: 'gen-single-s1', variant: 'primary' as const },
            { label: 'Let me pick a scene', id: 'gen-single-pick' },
          ],
        },
      ])
    }

    if (actionId === 'gen-single-s1') {
      setGenMode('scene-by-scene')
      setIsGenerating(true)
      lastDoneCountRef.current = 0
      setMessages((prev) => [
        ...removeAction(prev, 'gen-single-s1'),
        { id: idRef.current++, role: 'system' as const, text: 'Generating Scene 1...', timestamp: makeTimestamp() },
        {
          id: idRef.current++,
          role: 'agent' as const,
          text: "Generating Scene 1 now. Once it's done, you can preview it and decide — regenerate with different direction, or move on to the next scene.",
          timestamp: makeTimestamp(),
        },
      ])
    }

    if (actionId === 'gen-single-pick') {
      setMessages((prev) => [
        ...removeAction(prev, 'gen-single-pick'),
        {
          id: idRef.current++,
          role: 'agent' as const,
          text: "Sure! Click on any scene in the storyboard to select it, or tell me the scene number you'd like to generate first. You can also give me any specific direction — for example: \"Generate Scene 5 with a warmer color palette\" or \"Make Scene 3 more cinematic\".",
          timestamp: makeTimestamp(),
        },
      ])
    }

    if (actionId === 'gen-next-scene') {
      // Resume scene-by-scene: start the next pending scene
      sceneByScenePausedRef.current = false
      setSceneStatuses((prev) => {
        const updated = { ...prev }
        const nextPendingId = Object.keys(updated).find((id) => updated[id] === 'pending')
        if (nextPendingId) updated[nextPendingId] = 'rendering'
        return updated
      })
      const nextIdx = Object.values(sceneStatuses).filter((s) => s === 'done').length + 1
      setMessages((prev) => [
        ...removeAction(prev, 'gen-next-scene'),
        { id: idRef.current++, role: 'system' as const, text: `Generating Scene ${nextIdx}...`, timestamp: makeTimestamp() },
      ])
    }

    if (actionId === 'gen-remaining-scenes') {
      // Switch to generate-all mode for remaining scenes
      setGenMode('all')
      sceneByScenePausedRef.current = false
      setSceneStatuses((prev) => {
        const updated = { ...prev }
        const nextPendingId = Object.keys(updated).find((id) => updated[id] === 'pending')
        if (nextPendingId) updated[nextPendingId] = 'rendering'
        return updated
      })
      const remaining = Object.values(sceneStatuses).filter((s) => s === 'pending').length
      setMessages((prev) => [
        ...removeAction(prev, 'gen-remaining-scenes'),
        { id: idRef.current++, role: 'system' as const, text: `Generating remaining ${remaining} scenes...`, timestamp: makeTimestamp() },
        {
          id: idRef.current++,
          role: 'agent' as const,
          text: `Generating all remaining scenes now. You can watch the progress in the storyboard.`,
          timestamp: makeTimestamp(),
        },
      ])
    }

    if (actionId === 'continue-to-vfx') {
      setShowEditToolbar((prev) => !prev)
    }

    if (actionId === 'render-download') {
      // Stay in storyboard — show render confirmation in chat
      setMessages((prev) => [
        ...prev,
        { id: idRef.current++, role: 'system' as const, text: 'Rendering & Exporting...', timestamp: makeTimestamp() },
        {
          id: idRef.current++,
          role: 'agent' as const,
          text: "Rendering your final video now! All 39 scenes will be stitched together with your selected transitions and effects. This may take a few minutes. You'll be notified when it's ready to download.",
          timestamp: makeTimestamp(),
        },
      ])
    }
  }, [scenes.length])

  const handleAnalysisApprove = useCallback(() => handleAction('approve-analysis'), [handleAction])
  const handleIdeationApprove = useCallback(() => handleAction('approve-ideation'), [handleAction])
  const handleStoryboardApprove = useCallback(() => handleAction('approve-storyboard'), [handleAction])
  const handleContinueToVfx = useCallback(() => handleAction('continue-to-vfx'), [handleAction])

  // ─── Render ────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="flex h-full w-full flex-row overflow-hidden">
      {/* Chat panel — draggable width */}
      <div
        className="shrink-0 flex flex-col overflow-hidden border-r border-border"
        style={{ width: chatWidth !== null ? `${chatWidth}px` : '28%' }}
      >
        {(chatWidth === null || chatWidth > 0) && (
          <UnifiedChatPanel
            phase={activePhase}
            messages={messages}
            isTyping={isTyping}
            onSend={handleSend}
            onAction={handleAction}
            onSystemMsgClick={handleSystemMsgClick}
            isVideoStage={isGenerating || allDone || genMode !== null}
          />
        )}
      </div>

      {/* Divider: drag handle when open, chat icon when collapsed */}
      {chatWidth === 0 ? (
        <div className="shrink-0 flex flex-col items-center pt-3" style={{ width: '48px' }}>
          <button
            onClick={restoreChat}
            className="group/chat relative flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 cursor-pointer hover:bg-primary/20 hover:border-primary/30 transition-all"
          >
            <Bot className="h-5 w-5 text-primary" />
            {/* Status dot */}
            <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background" />
            {/* Tooltip */}
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-foreground text-background px-2.5 py-1.5 text-[11px] font-medium opacity-0 pointer-events-none group-hover/chat:opacity-100 transition-opacity duration-150 shadow-lg z-50">
              Chat with AI Director
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-foreground" />
            </div>
          </button>
        </div>
      ) : (
        <div
          className="relative shrink-0 group cursor-col-resize select-none"
          style={{ width: '6px' }}
          onMouseDown={handleDragStart}
          onDoubleClick={handleDividerDoubleClick}
          title="Drag to resize · Double-click to collapse"
        >
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-primary/5 via-primary/30 to-primary/5 group-hover:via-primary/60 transition-colors" />
          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors rounded-sm" />
        </div>
      )}

      {/* Workspace (64%) */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Workspace content */}
        <div className="flex-1 overflow-hidden relative min-h-0">
          <AnimatePresence mode="wait">
            {viewingPhase === 'analysis' && (
              <motion.div
                key="analysis"
                variants={viewVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="absolute inset-0"
              >
                <AnalysisWorkspaceView
                  trackIndex={trackIndex}
                  progress={analysisProgress}
                  stage={analysisStage}
                  audio={audio}
                  onContinue={handleAnalysisApprove}
                />
              </motion.div>
            )}
            {viewingPhase === 'ideation' && (
              <motion.div
                key="ideation"
                variants={viewVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="absolute inset-0"
              >
                <IdeationWorkspaceView
                  selectedConceptId={selectedConceptId}
                  onConceptSelect={onConceptSelect}
                  onContinue={handleIdeationApprove}
                />
              </motion.div>
            )}
            {viewingPhase === 'storyboard' && (
              <motion.div
                key="storyboard"
                variants={viewVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="absolute inset-0"
              >
                <StoryboardWorkspaceView
                  scenes={scenes}
                  audio={audio}
                  onEditScene={handleEditScene}
                  onDeleteScene={handleDeleteScene}
                  onInsertScene={handleInsertScene}
                  highlightedSceneId={highlightedSceneId}
                  onHighlightScene={setHighlightedSceneId}
                  onContinue={handleStoryboardApprove}
                  sceneStatuses={isGenerating ? sceneStatuses : undefined}
                  isGenerating={isGenerating}
                  doneCount={doneCount}
                  allDone={allDone}
                  onContinueToVfx={handleContinueToVfx}
                  showEditToolbar={showEditToolbar}
                  activeSceneIndex={scenes.findIndex((s) => s.id === activeSceneId)}
                  selectedVfx={selectedVfx}
                  selectedTransition={selectedTransition}
                  selectedFilter={selectedFilter}
                  onVfxChange={setSelectedVfx}
                  onTransitionChange={setSelectedTransition}
                  onFilterChange={setSelectedFilter}
                  onActiveSceneChange={setActiveSceneId}
                />
              </motion.div>
            )}
            {viewingPhase === 'vfx_export' && (
              <motion.div
                key="vfx_export"
                variants={viewVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="absolute inset-0"
              >
                <VfxWorkspaceView
                  scenes={scenes}
                  audio={audio}
                  sceneStatuses={sceneStatuses}
                  doneCount={doneCount}
                  allDone={allDone}
                  activeSceneId={activeSceneId}
                  onActiveSceneChange={setActiveSceneId}
                  selectedVfx={selectedVfx}
                  selectedTransition={selectedTransition}
                  selectedFilter={selectedFilter}
                  onVfxChange={setSelectedVfx}
                  onTransitionChange={setSelectedTransition}
                  onFilterChange={setSelectedFilter}
                  onSceneUpdate={handleEditScene}
                  onScenesReorder={setScenes}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fixed bottom action bar */}
        {analysisStage !== 'analyzing' && (
          <BottomActionBar
            activePhase={activePhase}
            onAction={handleAction}
            isGenerating={isGenerating}
            allDone={allDone}
            doneCount={doneCount}
            totalScenes={scenes.length}
            totalDuration={scenes.reduce((sum, s) => sum + (s.duration ?? 0), 0)}
            genMode={genMode}
            sceneByScenePaused={sceneByScenePausedRef.current}
            remainingScenes={Object.values(sceneStatuses).filter(s => s === 'pending').length}
            remainingCredits={Math.round(scenes.filter(s => sceneStatuses[s.id] === 'pending').reduce((sum, s) => sum + (s.duration ?? 0), 0) * CREDITS_PER_SECOND)}
          />
        )}
      </div>
    </div>
  )
}

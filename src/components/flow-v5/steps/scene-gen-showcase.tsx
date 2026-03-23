'use client'

import { useId, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { MockScene } from '@/lib/mock/types'

// ─── Film production phrases that rotate ────────────────────

const PRODUCTION_PHASES = [
  'Setting the stage',
  'Rolling camera',
  'Lighting the scene',
  'Composing the shot',
  'Adjusting the lens',
  'Directing the talent',
  'Capturing the moment',
  'Framing the action',
  'Fine-tuning exposure',
  'Syncing the rhythm',
]

// ─── Sprocket holes for the film strip ──────────────────────

function SprocketHole() {
  return <div className="h-2 w-2 rounded-full bg-zinc-900 border border-zinc-700/50 shrink-0" />
}

function SprocketColumn({ side, count = 6 }: { side: 'left' | 'right'; count?: number }) {
  return (
    <div className={cn('absolute top-0 bottom-0 flex flex-col justify-between py-2', side === 'left' ? '-left-5' : '-right-5')}>
      {Array.from({ length: count }).map((_, i) => (
        <SprocketHole key={i} />
      ))}
    </div>
  )
}

function FilmStripEdge({ side }: { side: 'left' | 'right' }) {
  return (
    <div className={cn('absolute inset-y-0 w-3 bg-zinc-800 z-10 flex flex-col justify-around items-center py-0.5', side === 'left' ? 'left-0' : 'right-0')}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-1 w-1 rounded-full bg-zinc-600" />
      ))}
    </div>
  )
}

// ─── Circular progress ring ─────────────────────────────────

function ProgressRing({ progress, size = 120, strokeWidth = 4 }: { progress: number; size?: number; strokeWidth?: number }) {
  const gradientId = useId()
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - progress * circumference

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(113, 113, 122, 0.15)"
        strokeWidth={strokeWidth}
      />
      {/* Progress arc */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="50%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#C084FC" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// ─── Currently rendering scene "hero" ───────────────────────

function RenderingHero({ scene, doneCount, total, progress, pct }: { scene: MockScene | undefined; doneCount: number; total: number; progress: number; pct: number }) {
  const phaseLabel = PRODUCTION_PHASES[doneCount % PRODUCTION_PHASES.length]

  return (
    <div className="relative flex flex-col items-center gap-3 w-full">
      {/* Film gate frame around the scene — nearly full width */}
      <div className="relative w-full max-w-5xl mx-auto">
        {/* Sprocket columns on sides */}
        <SprocketColumn side="left" />
        <SprocketColumn side="right" />

        {/* The scene image with film-gate styling */}
        <div className="relative w-full aspect-video rounded-sm overflow-hidden border-2 border-zinc-700/60 bg-zinc-900 shadow-xl shadow-black/40">
          {scene && (
            <>
              <img
                src={scene.thumbnailUrl}
                alt={`Rendering scene ${scene.index + 1}`}
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
              {/* Scanning line shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/15 to-transparent"
                animate={{ y: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
              {/* Film grain overlay */}
              <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.4\'/%3E%3C/svg%3E")' }} />
            </>
          )}
          {!scene && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          )}

          {/* Scene number badge */}
          <div className="absolute top-2 left-2">
            <span className="bg-black/70 backdrop-blur-sm text-[10px] font-mono font-bold text-white px-2 py-1 rounded">
              S{scene ? scene.index + 1 : '?'}
            </span>
          </div>

          {/* ── Progress ring overlay centered on scene ── */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="relative flex items-center justify-center">
              <ProgressRing progress={progress} size={140} strokeWidth={4} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  key={doneCount}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="text-3xl font-bold text-white tabular-nums leading-none drop-shadow-lg"
                >
                  {doneCount}
                </motion.span>
                <span className="text-[9px] text-zinc-300 font-medium mt-0.5 drop-shadow">of {total} scenes</span>
                <span className="text-[10px] text-primary font-semibold mt-0.5 drop-shadow">{pct}%</span>
              </div>
            </div>

            {/* Phase label below ring */}
            <AnimatePresence mode="wait">
              <motion.p
                key={phaseLabel}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
                className="text-[11px] text-zinc-300 font-medium tracking-wide mt-2 drop-shadow"
              >
                {phaseLabel}...
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Film strip of completed thumbnails ─────────────────────

function CompletedFilmStrip({ scenes, sceneStatuses }: { scenes: MockScene[]; sceneStatuses: Record<string, string> }) {
  const doneScenes = useMemo(
    () => scenes.filter((s) => sceneStatuses[s.id] === 'done'),
    [scenes, sceneStatuses],
  )

  if (doneScenes.length === 0) return null

  return (
    <div className="relative w-full overflow-hidden">
      {/* Film strip edges */}
      <FilmStripEdge side="left" />
      <FilmStripEdge side="right" />

      {/* Scrolling strip */}
      <div className="bg-zinc-900/80 border-y border-zinc-700/40 py-1.5 px-4">
        <motion.div
          className="flex gap-1"
          animate={{ x: doneScenes.length > 10 ? [0, -(doneScenes.length - 10) * 36] : 0 }}
          transition={{ duration: doneScenes.length > 10 ? doneScenes.length * 0.3 : 0, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
        >
          {doneScenes.map((scene, i) => (
            <motion.div
              key={scene.id}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="relative h-10 w-[42px] shrink-0 rounded-[3px] overflow-hidden border border-zinc-700/50 bg-zinc-800"
            >
              <img src={scene.thumbnailUrl} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <span className="absolute bottom-0 left-0 right-0 text-center text-[6px] font-mono font-bold text-white/80 pb-0.5">
                {scene.index + 1}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

// ─── Main Showcase ──────────────────────────────────────────

interface SceneGenShowcaseProps {
  scenes: MockScene[]
  sceneStatuses: Record<string, 'pending' | 'rendering' | 'done'>
  doneCount: number
  total: number
}

export function SceneGenShowcase({ scenes, sceneStatuses, doneCount, total }: SceneGenShowcaseProps) {
  const progress = total > 0 ? doneCount / total : 0
  const renderingScene = scenes.find((s) => sceneStatuses[s.id] === 'rendering')
  const pct = Math.round(progress * 100)

  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-3 select-none px-6">
      {/* Scene preview with progress ring overlay */}
      <div className="flex-1 flex items-center justify-center min-h-0 w-full">
        <RenderingHero scene={renderingScene} doneCount={doneCount} total={total} progress={progress} pct={pct} />
      </div>

      {/* Bottom: completed film strip */}
      <div className="w-full shrink-0 max-w-3xl">
        <CompletedFilmStrip scenes={scenes} sceneStatuses={sceneStatuses} />
      </div>
    </div>
  )
}

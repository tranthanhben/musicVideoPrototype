'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import { mockProjects } from '@/lib/mock/projects'
import { GenerationActivityFeed } from './generation-activity-feed'
import { GenerationSceneCard } from './generation-scene-card'

interface GenerationStepProps {
  trackIndex: number
  onComplete: () => void
}

const PARALLEL_WINDOW = 3
const HIGH_ENERGY_TYPES = ['chorus', 'bridge', 'drop']

function useEtaCountdown(progress: number, isComplete: boolean) {
  const [secs, setSecs] = useState(() => Math.round(Math.round((100 - progress) / 1.5) * 0.12 + 90))
  useEffect(() => {
    if (isComplete) return
    const t = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [isComplete])
  if (isComplete) return 'Done'
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `~${m}:${String(s).padStart(2, '0')} remaining`
}

export function GenerationStep({ trackIndex, onComplete }: GenerationStepProps) {
  const project = mockProjects[trackIndex] ?? mockProjects[0]
  const scenes = project.scenes
  const segments = project.audio.segments
  const audioDuration = project.audio.duration

  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [justCompleted, setJustCompleted] = useState<Set<number>>(new Set())
  const prevCompleted = useRef(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(interval); setIsComplete(true); return 100 }
        return p + 1.5
      })
    }, 120)
    return () => clearInterval(interval)
  }, [])

  const sceneCount = scenes.length
  const progressPerScene = 100 / sceneCount
  const completedCount = Math.min(Math.floor(progress / progressPerScene), sceneCount)

  // Derive consistency deterministically from completedCount
  const consistency = completedCount === 0 ? 90 : 88 + ((completedCount * 7 + 3) % 9)

  // Detect newly completed scenes for sparkle
  useEffect(() => {
    if (completedCount > prevCompleted.current) {
      const newIdx = completedCount - 1
      prevCompleted.current = completedCount
      const tAdd = setTimeout(() => {
        setJustCompleted((prev) => new Set(prev).add(newIdx))
      }, 0)
      const tRemove = setTimeout(() => {
        setJustCompleted((prev) => { const s = new Set(prev); s.delete(newIdx); return s })
      }, 600)
      return () => { clearTimeout(tAdd); clearTimeout(tRemove) }
    }
  }, [completedCount])

  const activeIndices = new Set<number>()
  for (let i = 0; i < PARALLEL_WINDOW; i++) {
    const idx = completedCount + i
    if (idx < sceneCount && !isComplete) activeIndices.add(idx)
  }

  const highEnergyIndices = new Set<number>()

  function getSegmentForScene(sceneIndex: number) {
    const totalVideoDuration = scenes.reduce((sum, s) => sum + s.duration, 0)
    let elapsed = 0
    for (let i = 0; i < sceneIndex; i++) elapsed += scenes[i].duration
    const mid = elapsed + scenes[sceneIndex].duration / 2
    const audioTime = (mid / totalVideoDuration) * audioDuration
    return segments.find((seg) => audioTime >= seg.startTime && audioTime < seg.endTime)
  }

  const eta = useEtaCountdown(progress, isComplete)

  return (
    <div className="flex h-full flex-col overflow-hidden p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-3 shrink-0 gap-4"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Zap className="h-4 w-4 text-primary shrink-0" />
          <h2 className="text-base font-bold text-foreground truncate">
            {isComplete ? 'Generation Complete' : 'Generating Videos'}
          </h2>
          <span className="shrink-0 inline-flex items-center rounded-full border border-purple-500/40 bg-purple-500/10 px-2 py-0.5 text-[9px] font-mono font-medium text-purple-400 tracking-wide">
            CREMI-7C3A-FLOW
          </span>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          {/* Style consistency */}
          <div className="text-right">
            <span className="text-[9px] text-muted-foreground font-mono uppercase tracking-wide">Consistency</span>
            <motion.div
              key={consistency}
              initial={{ scale: 1.15, color: '#4ade80' }}
              animate={{ scale: 1, color: '#a1a1aa' }}
              transition={{ duration: 0.4 }}
              className="text-sm font-bold font-mono tabular-nums text-zinc-400"
            >
              {consistency}%
            </motion.div>
          </div>
          {/* ETA + progress bar */}
          <div className="text-right">
            <div className="flex items-center justify-end gap-2 mb-1">
              <span className="text-[9px] font-mono text-muted-foreground">{completedCount}/{sceneCount}</span>
              <span className="text-[9px] font-mono text-zinc-500">{eta}</span>
            </div>
            {/* Shimmer progress bar */}
            <div className="h-1.5 w-36 rounded-full bg-muted overflow-hidden">
              <div
                className="relative h-full rounded-full transition-all duration-300 overflow-hidden"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #7C3AED, #06B6D4)',
                }}
              >
                <motion.div
                  className="absolute inset-y-0 w-8 bg-white/30 skew-x-[-20deg]"
                  animate={{ x: ['-200%', '400%'] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'linear', repeatDelay: 0.6 }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Body: scene grid + activity feed */}
      <div className="flex flex-1 gap-3 overflow-hidden">
        {/* Scene grid — 65% */}
        <div className="flex-[65] overflow-y-auto">
          <div className="grid grid-cols-3 gap-2.5">
            {scenes.map((scene, idx) => {
              const seg = getSegmentForScene(idx)
              const highEnergy = seg ? HIGH_ENERGY_TYPES.includes(seg.type) : false
              if (highEnergy) highEnergyIndices.add(idx)

              const isDone = idx < completedCount || isComplete
              const isActive = activeIndices.has(idx)
              const isSparkle = justCompleted.has(idx)

              const parallelOffset = idx - completedCount
              const baseProgress = isActive
                ? ((progress % progressPerScene) / progressPerScene) * 100
                : isDone ? 100 : 0
              const sceneProgress = isActive ? Math.max(0, baseProgress - parallelOffset * 15) : baseProgress

              return (
                <GenerationSceneCard
                  key={scene.id}
                  scene={scene}
                  isDone={isDone}
                  isActive={isActive}
                  isSparkle={isSparkle}
                  sceneProgress={sceneProgress}
                  highEnergy={highEnergy}
                />
              )
            })}
          </div>
        </div>

        {/* Activity feed — 35% */}
        <div className="flex-[35] min-w-0">
          <GenerationActivityFeed
            sceneCount={sceneCount}
            completedCount={completedCount}
            isComplete={isComplete}
            highEnergyIndices={highEnergyIndices}
          />
        </div>
      </div>

      {/* Continue button */}
      {isComplete && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 shrink-0">
          <button
            onClick={onComplete}
            className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer"
          >
            Continue to VFX & Export
          </button>
        </motion.div>
      )}
    </div>
  )
}

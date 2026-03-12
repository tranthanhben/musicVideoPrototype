'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { mockProjects } from '@/lib/mock/projects'
import { GenerationActivityFeed } from './generation-activity-feed'
import { GenerationSceneCard } from './generation-scene-card'
import { GenerationHeader, useEtaCountdown } from './generation-header'

interface GenerationStepProps {
  trackIndex: number
  onComplete: () => void
}

const PARALLEL_WINDOW = 3
const HIGH_ENERGY_TYPES = ['chorus', 'bridge', 'drop']

export function GenerationStep({ trackIndex, onComplete }: GenerationStepProps) {
  const project = mockProjects[trackIndex] ?? mockProjects[0]
  const scenes = project.scenes
  const segments = project.audio.segments
  const audioDuration = project.audio.duration

  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [justCompleted, setJustCompleted] = useState<Set<number>>(new Set())
  const [showCelebration, setShowCelebration] = useState(false)
  const prevCompleted = useRef(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval)
          setIsComplete(true)
          setTimeout(() => setShowCelebration(true), 200)
          return 100
        }
        return p + 1.5
      })
    }, 120)
    return () => clearInterval(interval)
  }, [])

  const sceneCount = scenes.length
  const progressPerScene = 100 / sceneCount
  const completedCount = Math.min(Math.floor(progress / progressPerScene), sceneCount)
  const consistency = completedCount === 0 ? 90 : 88 + ((completedCount * 7 + 3) % 9)

  useEffect(() => {
    if (completedCount > prevCompleted.current) {
      const newIdx = completedCount - 1
      prevCompleted.current = completedCount
      const tAdd = setTimeout(() => setJustCompleted((p) => new Set(p).add(newIdx)), 0)
      const tRemove = setTimeout(() => setJustCompleted((p) => { const s = new Set(p); s.delete(newIdx); return s }), 600)
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
      <GenerationHeader
        isComplete={isComplete}
        completedCount={completedCount}
        sceneCount={sceneCount}
        consistency={consistency}
        eta={eta}
        progress={progress}
      />

      {/* Shimmer progress bar */}
      <div className="mb-3 shrink-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] font-mono text-muted-foreground">{completedCount}/{sceneCount} scenes</span>
          <span className="text-[9px] font-mono text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="relative h-full rounded-full transition-all duration-300 overflow-hidden"
            style={{
              width: `${progress}%`,
              background: isComplete
                ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                : 'linear-gradient(90deg, #7C3AED, #06B6D4, #EC4899)',
            }}
          >
            {!isComplete && (
              <motion.div
                className="absolute inset-y-0 w-10 bg-white/30 skew-x-[-20deg]"
                animate={{ x: ['-200%', '400%'] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'linear', repeatDelay: 0.5 }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 gap-3 overflow-hidden">
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
              const baseProgress = isActive ? ((progress % progressPerScene) / progressPerScene) * 100 : isDone ? 100 : 0
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

        <div className="flex-[35] min-w-0">
          <GenerationActivityFeed
            sceneCount={sceneCount}
            completedCount={completedCount}
            isComplete={isComplete}
            highEnergyIndices={highEnergyIndices}
          />
        </div>
      </div>

      {/* Completion */}
      <AnimatePresence>
        {isComplete && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 shrink-0 space-y-2">
            {showCelebration && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 rounded-xl bg-green-500/10 border border-green-500/30 px-4 py-2.5"
              >
                <Trophy className="h-4 w-4 text-green-500 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-green-500">All {sceneCount} scenes generated!</p>
                  <p className="text-[10px] text-muted-foreground">Avg consistency: {consistency}% · Ready for VFX & Export</p>
                </div>
              </motion.div>
            )}
            <button
              onClick={onComplete}
              className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer"
            >
              Continue to VFX & Export
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

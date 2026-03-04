'use client'

import { motion } from 'framer-motion'
import { ScenePreviewCard } from '@/components/shared/scene-preview-card'
import { mockProjects } from '@/lib/mock/projects'

const project = mockProjects[0]
const scenes = project.scenes
const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0)
const totalMin = Math.floor(totalDuration / 60)
const totalSec = totalDuration % 60

export function ForgeStepPlan() {
  return (
    <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto px-6">
      {/* Grid of scene cards */}
      <div className="grid grid-cols-4 gap-3">
        {scenes.map((scene, idx) => (
          <motion.div
            key={scene.id}
            initial={{ opacity: 0, y: 20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.4,
              delay: idx * 0.08,
              type: 'spring',
              stiffness: 260,
              damping: 24,
            }}
          >
            <ScenePreviewCard scene={scene} />
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: scenes.length * 0.08 + 0.1 }}
        className="flex items-center gap-4 rounded-lg border border-border bg-card/40 px-4 py-2.5"
      >
        <span className="text-sm text-muted-foreground">
          <span className="text-foreground font-semibold">{scenes.length} scenes</span> planned
        </span>
        <span className="text-muted-foreground">·</span>
        <span className="text-sm text-muted-foreground">
          <span className="text-foreground font-semibold">
            {totalMin}:{String(totalSec).padStart(2, '0')}
          </span>{' '}
          total duration
        </span>
        <span className="text-muted-foreground">·</span>
        <span className="text-sm text-muted-foreground">
          <span className="text-foreground font-semibold">{project.audio.bpm} BPM</span> sync enabled
        </span>
      </motion.div>
    </div>
  )
}

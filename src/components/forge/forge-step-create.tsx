'use client'

import { motion } from 'framer-motion'
import { usePipelineStore } from '@/lib/pipeline/store'
import { SceneGrid } from '@/components/editor/scene-grid'
import { GenerationLoading } from '@/components/shared/generation-loading'
import { mockProjects } from '@/lib/mock/projects'
import { useState } from 'react'

const scenes = mockProjects[0].scenes

export function ForgeStepCreate() {
  const layers = usePipelineStore((s) => s.layers)
  const l4 = layers['L4_PRODUCTION']
  const progress = l4?.progress ?? 0
  const isActive = l4?.status === 'active'
  const [activeSceneId, setActiveSceneId] = useState<string | undefined>()

  // Estimate which scene is being generated
  const sceneIdx = Math.min(Math.floor((progress / 100) * scenes.length), scenes.length - 1)
  const currentScene = scenes[sceneIdx]

  return (
    <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="relative"
      >
        <SceneGrid
          scenes={scenes}
          activeSceneId={activeSceneId}
          onSelect={setActiveSceneId}
          columns={4}
        />

        {/* Overlay generation indicator */}
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-lg"
          >
            <GenerationLoading
              progress={progress}
              message={`Generating scene ${sceneIdx + 1} of ${scenes.length}`}
            />
          </motion.div>
        )}
      </motion.div>

      {/* Status bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="flex items-center justify-between rounded-lg border border-border bg-card/40 px-4 py-2.5"
      >
        <span className="text-sm text-muted-foreground">
          Generating with{' '}
          <span className="text-foreground font-semibold">Kling 2.6</span>
        </span>
        <span className="text-sm text-foreground font-mono">
          {isActive
            ? `Scene ${sceneIdx + 1} of ${scenes.length} · ${progress}%`
            : l4?.status === 'complete'
            ? 'All scenes complete'
            : 'Awaiting start...'}
        </span>
        {currentScene && isActive && (
          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
            {currentScene.subject} — {currentScene.cameraAngle}
          </span>
        )}
      </motion.div>
    </div>
  )
}

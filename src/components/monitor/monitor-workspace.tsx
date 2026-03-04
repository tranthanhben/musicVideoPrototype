'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { usePipelineStore } from '@/lib/pipeline/store'
import type { PipelineLayerId } from '@/lib/pipeline/types'
import { InputView } from './workspace-views/input-view'
import { CreativeView } from './workspace-views/creative-view'
import { StoryboardView } from './workspace-views/storyboard-view'
import { GenerationView } from './workspace-views/generation-view'
import { EditingView } from './workspace-views/editing-view'

const VIEW_CONFIG: Record<PipelineLayerId, { component: React.ComponentType; label: string }> = {
  L1_INPUT: { component: InputView, label: 'Input Analysis' },
  L2_CREATIVE: { component: CreativeView, label: 'Creative Direction' },
  L3_PREPRODUCTION: { component: StoryboardView, label: 'Storyboard' },
  L4_PRODUCTION: { component: GenerationView, label: 'Generation' },
  L5_POSTPRODUCTION: { component: EditingView, label: 'Post-Production' },
}

const variants = {
  enter: { opacity: 0, y: 10 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

export function MonitorWorkspace() {
  const currentLayerId = usePipelineStore((s) => s.currentLayerId)

  const viewConfig = currentLayerId ? VIEW_CONFIG[currentLayerId] : null
  const ViewComponent = viewConfig?.component

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-muted/20">
      {/* Layer label badge */}
      {viewConfig && (
        <div className="absolute top-4 right-4 z-10">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary border border-primary/20">
            {viewConfig.label}
          </span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {ViewComponent ? (
          <motion.div
            key={currentLayerId}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="flex h-full w-full flex-col"
          >
            <ViewComponent />
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
            className="flex h-full items-center justify-center"
          >
            <div className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
                <span className="text-2xl">🎬</span>
              </div>
              <p className="text-sm font-medium text-foreground">Waiting to start...</p>
              <p className="mt-1 text-xs text-muted-foreground">Send a message to begin the pipeline</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

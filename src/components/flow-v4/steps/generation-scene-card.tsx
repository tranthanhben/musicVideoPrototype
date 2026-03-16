'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { GenerationLoading } from '@/components/shared/generation-loading'
import type { MockScene } from '@/lib/mock/types'

interface SceneCardProps {
  scene: MockScene
  isDone: boolean
  isActive: boolean
  isSparkle: boolean
  sceneProgress: number
  highEnergy: boolean
}

export function GenerationSceneCard({ scene, isDone, isActive, isSparkle, sceneProgress, highEnergy }: SceneCardProps) {
  const modelBadge = highEnergy ? 'Kling 2.6' : 'Runway Gen-4'
  const motionLabel = highEnergy ? 'Dynamic' : 'Gentle'
  const motionColor = highEnergy ? 'text-orange-400 bg-orange-500/15' : 'text-blue-400 bg-blue-500/15'
  const glowColor = highEnergy
    ? '0 0 0 2px rgba(251,146,60,0.7), 0 0 14px 4px rgba(251,146,60,0.35)'
    : '0 0 0 2px rgba(96,165,250,0.7), 0 0 14px 4px rgba(96,165,250,0.35)'
  const glowDim = highEnergy
    ? '0 0 0 2px rgba(251,146,60,0.3), 0 0 14px 4px rgba(251,146,60,0.1)'
    : '0 0 0 2px rgba(96,165,250,0.3), 0 0 14px 4px rgba(96,165,250,0.1)'

  return (
    <motion.div
      animate={
        isSparkle
          ? { scale: [1, 1.06, 1], filter: ['brightness(1)', 'brightness(1.8)', 'brightness(1)'] }
          : isActive
          ? { boxShadow: [glowColor, glowDim, glowColor] }
          : { boxShadow: 'none' }
      }
      transition={
        isSparkle
          ? { duration: 0.4, ease: 'easeOut' }
          : { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }
      }
      className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted"
    >
      <img src={scene.thumbnailUrl} alt={`Scene ${scene.index + 1}`} className="absolute inset-0 w-full h-full object-cover" />

      {isDone ? (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <AnimatePresence>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/90"
            >
              <Check className="h-4 w-4 text-white" />
            </motion.div>
          </AnimatePresence>
        </div>
      ) : isActive ? (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <GenerationLoading progress={sceneProgress} message={`Scene ${scene.index + 1}`} variant="minimal" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-black/50" />
      )}

      <div className="absolute top-1.5 left-1.5 rounded-md bg-black/70 px-1.5 py-0.5">
        <span className="text-[9px] font-mono font-medium text-white/80">{modelBadge}</span>
      </div>
      <div className={`absolute top-1.5 right-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${motionColor}`}>
        {motionLabel}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/70 to-transparent">
        <p className="text-[9px] font-medium text-white truncate">S{scene.index + 1} | {scene.subject}</p>
      </div>
    </motion.div>
  )
}

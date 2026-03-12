'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Check, Zap } from 'lucide-react'
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
  const motionColor = highEnergy ? 'text-orange-400 bg-orange-500/20 border border-orange-500/30' : 'text-blue-400 bg-blue-500/20 border border-blue-500/30'
  const glowActive = highEnergy
    ? '0 0 0 2px rgba(251,146,60,0.7), 0 0 20px 6px rgba(251,146,60,0.3)'
    : '0 0 0 2px rgba(96,165,250,0.7), 0 0 20px 6px rgba(96,165,250,0.2)'
  const glowDim = highEnergy
    ? '0 0 0 2px rgba(251,146,60,0.25), 0 0 14px 4px rgba(251,146,60,0.08)'
    : '0 0 0 2px rgba(96,165,250,0.25), 0 0 14px 4px rgba(96,165,250,0.08)'

  return (
    <motion.div
      animate={
        isSparkle
          ? { scale: [1, 1.08, 1], filter: ['brightness(1)', 'brightness(2)', 'brightness(1)'] }
          : isActive
          ? { boxShadow: [glowActive, glowDim, glowActive] }
          : { boxShadow: 'none', scale: 1 }
      }
      transition={
        isSparkle
          ? { duration: 0.45, ease: 'easeOut' }
          : isActive
          ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0.3 }
      }
      className="relative aspect-video rounded-xl overflow-hidden bg-muted"
    >
      <img
        src={scene.thumbnailUrl}
        alt={`Scene ${scene.index + 1}`}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* State overlay */}
      {isDone ? (
        <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
          <AnimatePresence>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 18 }}
              className="flex flex-col items-center gap-1"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500/90 shadow-lg shadow-green-500/30">
                <Check className="h-5 w-5 text-white" />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      ) : isActive ? (
        <div className="absolute inset-0 bg-black/65 flex items-center justify-center">
          <GenerationLoading progress={sceneProgress} message={`Scene ${scene.index + 1}`} variant="minimal" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-black/55" />
      )}

      {/* Model badge — more prominent */}
      <div className="absolute top-1.5 left-1.5 rounded-md bg-black/75 px-1.5 py-0.5 border border-white/10 backdrop-blur-sm">
        <span className="text-[9px] font-mono font-semibold text-white/90">{modelBadge}</span>
      </div>

      {/* Motion type badge */}
      <div className={`absolute top-1.5 right-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${motionColor}`}>
        {highEnergy && <Zap className="h-2 w-2 inline mr-0.5" />}
        {motionLabel}
      </div>

      {/* Scene info */}
      <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent">
        <p className="text-[9px] font-semibold text-white truncate">S{scene.index + 1} · {scene.subject}</p>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-0.5 rounded-full bg-primary/60 mt-1 overflow-hidden"
          >
            <motion.div
              className="h-full rounded-full bg-primary"
              style={{ width: `${sceneProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

'use client'

import { motion } from 'framer-motion'
import { mockProjects } from '@/lib/mock/projects'

const scenes = mockProjects[0].scenes
const PALETTE = ['#7C3AED', '#22D3EE', '#EC4899', '#F59E0B', '#A855F7', '#06B6D4']
const STYLE_PILLS = ['Cinematic', 'Ethereal', 'Anamorphic', 'Slow Burn', 'Epic']

export function ForgeStepEnvision() {
  return (
    <div className="flex flex-col gap-5 w-full max-w-3xl mx-auto px-6">
      {/* Genre label */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-2"
      >
        <span className="text-xs text-muted-foreground uppercase tracking-widest">Visual Direction</span>
        <span className="rounded-full bg-primary/20 border border-primary/30 px-3 py-0.5 text-xs text-primary font-semibold">
          Cosmic Space Opera
        </span>
      </motion.div>

      {/* Mood board 2x3 grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-3 gap-2"
      >
        {scenes.slice(0, 6).map((scene, idx) => (
          <motion.div
            key={scene.id}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.15 + idx * 0.07 }}
            className="relative aspect-video rounded-lg overflow-hidden border border-border"
          >
            <img src={scene.thumbnailUrl} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-1 left-1.5 text-[9px] text-white/70 font-mono">
              {scene.cameraAngle}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Color palette */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="flex items-center gap-3"
      >
        <span className="text-xs text-muted-foreground shrink-0">Palette</span>
        <div className="flex gap-2">
          {PALETTE.map((color, idx) => (
            <motion.div
              key={color}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: 0.65 + idx * 0.05 }}
              className="h-7 w-7 rounded-full border-2 border-white/20 shadow-md"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </motion.div>

      {/* Style pills */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.85 }}
        className="flex items-center gap-2 flex-wrap"
      >
        <span className="text-xs text-muted-foreground shrink-0">Style</span>
        {STYLE_PILLS.map((pill, idx) => (
          <motion.span
            key={pill}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: 0.9 + idx * 0.07 }}
            className="rounded-full bg-card border border-border px-3 py-1 text-xs font-medium text-foreground/80"
          >
            {pill}
          </motion.span>
        ))}
      </motion.div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChromeText } from '@/components/neon/chrome-text'
import { NeonPanel } from '@/components/neon/neon-panel'
import { CommandPalette } from '@/components/neon/command-palette'
import { mockProjects } from '@/lib/mock/projects'
import type { MockProject } from '@/lib/mock/types'

const GLOW_COLORS = ['pink', 'cyan', 'yellow'] as const

function statusLabel(status: MockProject['status']) {
  if (status === 'complete') return 'Complete'
  if (status === 'rendering') return 'Rendering'
  return 'Draft'
}

export default function NeonLaunchpad() {
  const router = useRouter()
  const [paletteOpen, setPaletteOpen] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setPaletteOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function handleAction(action: string) {
    if (action === 'new-project') router.push('/neon/workspace?id=project-neon')
  }

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } },
  }
  const cardVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.97 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 280, damping: 24 } },
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-16">
      {/* Header */}
      <motion.div
        className="text-center mb-14"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <ChromeText as="h1" className="text-8xl md:text-9xl tracking-tight mb-3">
          NEON
        </ChromeText>
        <p className="text-[#888899] text-lg tracking-widest uppercase">
          Creative Playground
        </p>
      </motion.div>

      {/* Project grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-5xl mb-10"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {mockProjects.map((project, idx) => {
          const glowColor = GLOW_COLORS[idx % GLOW_COLORS.length]
          return (
            <motion.div key={project.id} variants={cardVariants}>
              <NeonPanelCard
                project={project}
                glowColor={glowColor}
                onClick={() => router.push(`/neon/workspace?id=${project.id}`)}
              />
            </motion.div>
          )
        })}
      </motion.div>

      {/* Start from scratch */}
      <motion.button
        className="mb-16 px-8 py-3 rounded-full text-sm font-semibold tracking-wide transition-all"
        style={{
          border: '1px solid rgba(255,0,110,0.5)',
          color: '#FF006E',
          background: 'rgba(255,0,110,0.05)',
          boxShadow: '0 0 16px rgba(255,0,110,0.1)',
        }}
        whileHover={{
          scale: 1.04,
          boxShadow: '0 0 30px rgba(255,0,110,0.3)',
          background: 'rgba(255,0,110,0.12)',
        }}
        whileTap={{ scale: 0.98 }}
        onClick={() => router.push('/neon/workspace?id=project-neon')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Start from Scratch
      </motion.button>

      {/* Command palette hint */}
      <motion.p
        className="text-[#888899] text-xs tracking-widest"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        Press{' '}
        <kbd className="mx-1 px-1.5 py-0.5 rounded text-[10px] bg-[rgba(255,255,255,0.08)] border border-[rgba(255,0,110,0.2)] text-[#FF006E]">
          ⌘K
        </kbd>{' '}
        to search
      </motion.p>

      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onAction={handleAction}
      />
    </div>
  )
}

function NeonPanelCard({
  project,
  glowColor,
  onClick,
}: {
  project: MockProject
  glowColor: 'pink' | 'cyan' | 'yellow'
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)

  const glowIntensity = {
    pink: hovered ? '0 0 40px rgba(255,0,110,0.4)' : '0 0 16px rgba(255,0,110,0.12)',
    cyan: hovered ? '0 0 40px rgba(0,245,212,0.4)' : '0 0 16px rgba(0,245,212,0.12)',
    yellow: hovered ? '0 0 40px rgba(254,228,64,0.4)' : '0 0 16px rgba(254,228,64,0.12)',
  }

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="cursor-pointer transition-all duration-300"
      style={{ filter: `drop-shadow(${glowIntensity[glowColor]})` }}
    >
      <NeonPanel glowColor={glowColor}>
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={project.thumbnailUrl}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-500"
            style={{ transform: hovered ? 'scale(1.06)' : 'scale(1)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3">
            <span
              className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: '#888899',
                backdropFilter: 'blur(8px)',
              }}
            >
              {statusLabel(project.status)}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3
            className="font-semibold text-[#EEEEF0] mb-1"
            style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
          >
            {project.title}
          </h3>
          <p className="text-[#888899] text-xs mb-3 line-clamp-2">{project.description}</p>
          <div className="flex items-center gap-3 text-[10px] text-[#888899]">
            <span>{project.scenes.length} scenes</span>
            <span className="w-px h-3 bg-[rgba(255,255,255,0.1)]" />
            <span>{project.audio.bpm} BPM</span>
          </div>
        </div>
      </NeonPanel>
    </div>
  )
}

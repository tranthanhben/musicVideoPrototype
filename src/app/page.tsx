'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { SplitSquareVertical, Film, Workflow } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

const prototypes = [
  {
    id: 'prototype-1',
    name: 'PROTOTYPE #1',
    description: 'AI Director + Split Panel — Chat-driven workflow with AI analyzing BPM, key & emotion curve. Generates storyline options mapped to timestamps. Renders music-aware video in parallel.',
    metaphor: "Director's Monitor",
    ratio: '40/60 Split',
    accent: '#22D3EE',
    accentGlow: 'rgba(34, 211, 238, 0.3)',
    icon: SplitSquareVertical,
    href: '/monitor',
  },
  {
    id: 'prototype-2',
    name: 'PROTOTYPE #2',
    description: 'Pro NLE + AI Copilot — Full editing bay with segment-aware timeline, emotion curve overlay, properties panel, shared style seed, 1-click effect presets, and multi-platform export.',
    metaphor: 'Editing Bay',
    ratio: '15/85 Editor',
    accent: '#10B981',
    accentGlow: 'rgba(16, 185, 129, 0.3)',
    icon: Film,
    href: '/bay',
  },
  {
    id: 'prototype-3',
    name: 'PROTOTYPE #3',
    description: 'Guided Wizard — Step-by-step flow with real images, AI-assisted storyboarding, progressive video rendering, and professional VFX & export pipeline.',
    metaphor: 'Step-by-Step Flow',
    ratio: 'Wizard Flow',
    accent: '#A855F7',
    accentGlow: 'rgba(168, 85, 247, 0.3)',
    icon: Workflow,
    href: '/flow-v3',
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0, 0, 0.2, 1] as [number, number, number, number] } },
}

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <motion.div className="mb-10 text-center" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-6xl font-bold tracking-tight text-foreground mb-3">Cremi</h1>
        <p className="text-lg text-muted-foreground mb-1">Agentic Chat + Video Editor Prototypes</p>
        <p className="text-sm text-muted-foreground/60">3 interaction patterns — selected for development</p>
      </motion.div>

      <motion.div
        className="grid w-full max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {prototypes.map((proto) => {
          const Icon = proto.icon
          return (
            <motion.div key={proto.id} variants={cardVariants}>
              <Link href={proto.href} className="group block">
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ boxShadow: `inset 0 0 40px ${proto.accentGlow}` }}
                  />

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${proto.accent}22` }}>
                      <Icon className="h-5 w-5" style={{ color: proto.accent }} />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border" style={{ color: proto.accent, borderColor: `${proto.accent}40` }}>
                      {proto.ratio}
                    </span>
                  </div>

                  <h2 className="mb-1 text-lg font-bold tracking-wide" style={{ color: proto.accent }}>{proto.name}</h2>
                  <p className="text-xs text-muted-foreground italic mb-2">{proto.metaphor}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{proto.description}</p>

                  <div className="mt-4 flex items-center text-xs font-medium" style={{ color: proto.accent }}>
                    Explore prototype
                    <span className="ml-1.5 transition-transform duration-200 group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>

      <motion.p className="mt-8 text-xs text-muted-foreground/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
        Agentic UI prototypes — structure &amp; interaction, not visual style
      </motion.p>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { MessageSquare, SplitSquareVertical, Film, LayoutDashboard, Maximize2, Hammer, Terminal, Clapperboard } from 'lucide-react'

const concepts = [
  {
    id: 'screening',
    name: 'SCREENING ROOM',
    description: 'Full-screen chat. AI narrates the entire production. You react, approve, revise.',
    metaphor: 'Texting a video producer',
    ratio: '90/10 Chat',
    accent: '#7C3AED',
    accentGlow: 'rgba(124, 58, 237, 0.3)',
    icon: MessageSquare,
    href: '/screening',
  },
  {
    id: 'monitor',
    name: "DIRECTOR'S MONITOR",
    description: 'Chat + workspace split. Workspace transforms per pipeline layer. Quality gate checkpoints.',
    metaphor: 'Director on set',
    ratio: '40/60 Split',
    accent: '#22D3EE',
    accentGlow: 'rgba(34, 211, 238, 0.3)',
    icon: SplitSquareVertical,
    href: '/monitor',
  },
  {
    id: 'bay',
    name: 'EDITING BAY',
    description: 'Full video editor: timeline, preview, assets. Chat is a collapsible AI copilot panel.',
    metaphor: 'Pro NLE + AI copilot',
    ratio: '15/85 Editor',
    accent: '#10B981',
    accentGlow: 'rgba(16, 185, 129, 0.3)',
    icon: Film,
    href: '/bay',
  },
  {
    id: 'control',
    name: 'MISSION CONTROL',
    description: '5-column dashboard. Real-time agent activity. Per-layer chat inputs. Event log.',
    metaphor: 'NASA flight control',
    ratio: '30/70 Dashboard',
    accent: '#F59E0B',
    accentGlow: 'rgba(245, 158, 11, 0.3)',
    icon: LayoutDashboard,
    href: '/control',
  },
  {
    id: 'canvas',
    name: 'THE CANVAS',
    description: 'Zoomable infinite canvas. Pipeline as spatial zones. Chat threads on artifacts.',
    metaphor: 'Infinite whiteboard',
    ratio: 'Merged/Spatial',
    accent: '#EC4899',
    accentGlow: 'rgba(236, 72, 153, 0.3)',
    icon: Maximize2,
    href: '/canvas',
  },
  {
    id: 'forge',
    name: 'THE FORGE',
    description: 'Step-by-step guided NLE. Spotlight tooltips explain each stage. AI annotations narrate agent activity.',
    metaphor: 'Blacksmith refining',
    ratio: 'Guided/Steps',
    accent: '#F97316',
    accentGlow: 'rgba(249, 115, 22, 0.3)',
    icon: Hammer,
    href: '/forge',
  },
  {
    id: 'dock',
    name: 'THE DOCK',
    description: 'Live agent console narrates everything. Quality gates as inline banners. Editor auto-transitions per layer.',
    metaphor: 'Loading dock',
    ratio: '20/80 + Console',
    accent: '#06B6D4',
    accentGlow: 'rgba(6, 182, 212, 0.3)',
    icon: Terminal,
    href: '/dock',
  },
  {
    id: 'reel',
    name: 'THE REEL',
    description: 'Timeline-first with per-scene L1-L5 pipeline dots. Cmd+K command palette. Manual quality gate bar.',
    metaphor: 'Film reel',
    ratio: 'Timeline-First',
    accent: '#A855F7',
    accentGlow: 'rgba(168, 85, 247, 0.3)',
    icon: Clapperboard,
    href: '/reel',
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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16" style={{ background: '#0A0A0F' }}>
      <motion.div className="mb-14 text-center" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-6xl font-bold tracking-tight text-white mb-3">Cremi</h1>
        <p className="text-lg text-white/50 mb-1">Agentic Chat + Video Editor Prototypes</p>
        <p className="text-sm text-white/30">8 interaction patterns for AI music video production</p>
      </motion.div>

      <motion.div className="grid w-full max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" variants={containerVariants} initial="hidden" animate="visible">
        {concepts.map((concept) => {
          const Icon = concept.icon
          return (
            <motion.div key={concept.id} variants={cardVariants}>
              <Link href={concept.href} className="group block">
                <div className="relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
                  <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ boxShadow: `inset 0 0 40px ${concept.accentGlow}` }} />

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${concept.accent}22` }}>
                      <Icon className="h-5 w-5" style={{ color: concept.accent }} />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border" style={{ color: concept.accent, borderColor: `${concept.accent}40` }}>
                      {concept.ratio}
                    </span>
                  </div>

                  <h2 className="mb-1 text-lg font-bold tracking-wide" style={{ color: concept.accent }}>{concept.name}</h2>
                  <p className="text-xs text-white/40 italic mb-2">{concept.metaphor}</p>
                  <p className="text-sm leading-relaxed text-white/50">{concept.description}</p>

                  <div className="mt-4 flex items-center text-xs font-medium opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ color: concept.accent }}>
                    Explore prototype
                    <span className="ml-1.5 transition-transform duration-200 group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>

      <motion.p className="mt-12 text-xs text-white/20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
        Agentic UI prototypes — structure &amp; interaction, not visual style
      </motion.p>
    </div>
  )
}

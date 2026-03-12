'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { MessageSquare, SplitSquareVertical, Film, LayoutDashboard, Maximize2, Hammer, Terminal, Clapperboard, FlaskConical, Workflow, Star } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

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
    eliminated: true,
  },
  {
    id: 'monitor',
    name: "DIRECTOR'S MONITOR",
    description: 'AI analyzes BPM, key & emotion curve. Generates 3 storyline options mapped to timestamps. Renders music-aware video in parallel. Auto-assembles with beat-synced transitions.',
    metaphor: 'Director on set',
    ratio: '40/60 Split',
    accent: '#22D3EE',
    accentGlow: 'rgba(34, 211, 238, 0.3)',
    icon: SplitSquareVertical,
    href: '/monitor',
    eliminated: false,
  },
  {
    id: 'bay',
    name: 'EDITING BAY',
    description: 'Full NLE with segment-aware timeline, emotion curve overlay, shared style seed, 1-click effect presets, and multi-platform export.',
    metaphor: 'Pro NLE + AI copilot',
    ratio: '15/85 Editor',
    accent: '#10B981',
    accentGlow: 'rgba(16, 185, 129, 0.3)',
    icon: Film,
    href: '/bay',
    eliminated: false,
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
    eliminated: true,
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
    eliminated: true,
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
    eliminated: true,
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
    eliminated: true,
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
    eliminated: true,
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
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
        <p className="text-sm text-muted-foreground/60">9 interaction patterns evaluated — 2 selected + 2 wizard variants</p>
      </motion.div>

      {/* Active prototypes label */}
      <motion.div
        className="mb-3 flex items-center gap-2 w-full max-w-6xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Star className="h-3.5 w-3.5 text-emerald-400" />
        <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Selected prototypes</span>
        <div className="flex-1 h-px bg-emerald-500/20" />
        <span className="text-[10px] text-muted-foreground/50 italic">Reference-only: archived after evaluation</span>
      </motion.div>

      <motion.div
        className="grid w-full max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {concepts.map((concept) => {
          const Icon = concept.icon
          return (
            <motion.div key={concept.id} variants={cardVariants} className="relative">
              {/* Eliminated overlay badge */}
              {concept.eliminated && (
                <div className="absolute top-2.5 left-2.5 z-30 pointer-events-none">
                  <span className="rounded-full bg-muted/80 border border-border/60 px-2 py-0.5 text-[9px] font-semibold text-muted-foreground/70 backdrop-blur-sm uppercase tracking-wider">
                    Archived
                  </span>
                </div>
              )}

              {/* Selected badge */}
              {!concept.eliminated && (
                <div className="absolute top-2.5 right-2.5 z-30 pointer-events-none">
                  <span
                    className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1"
                    style={{ background: `${concept.accent}22`, color: concept.accent, border: `1px solid ${concept.accent}50` }}
                  >
                    <Star className="h-2.5 w-2.5" />
                    Selected
                  </span>
                </div>
              )}

              <Link
                href={concept.href}
                className={cn('group block', concept.eliminated && 'pointer-events-none')}
                tabIndex={concept.eliminated ? -1 : undefined}
              >
                <div
                  className={cn(
                    'relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300',
                    concept.eliminated
                      ? 'opacity-35 grayscale blur-[0.3px] saturate-50'
                      : 'hover:-translate-y-1 cursor-pointer',
                  )}
                >
                  {!concept.eliminated && (
                    <div
                      className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ boxShadow: `inset 0 0 40px ${concept.accentGlow}` }}
                    />
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${concept.accent}22` }}>
                      <Icon className="h-5 w-5" style={{ color: concept.accent }} />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border" style={{ color: concept.accent, borderColor: `${concept.accent}40` }}>
                      {concept.ratio}
                    </span>
                  </div>

                  <h2 className="mb-1 text-lg font-bold tracking-wide" style={{ color: concept.accent }}>{concept.name}</h2>
                  <p className="text-xs text-muted-foreground italic mb-2">{concept.metaphor}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{concept.description}</p>

                  {!concept.eliminated && (
                    <div className="mt-4 flex items-center text-xs font-medium" style={{ color: concept.accent }}>
                      Explore prototype
                      <span className="ml-1.5 transition-transform duration-200 group-hover:translate-x-1">→</span>
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Flow prototype link — selected */}
      <motion.div className="mt-5 w-full max-w-6xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}>
        <div className="relative">
          <div className="absolute top-3 right-3 z-10">
            <span className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/40">
              <Star className="h-2.5 w-2.5" />
              Selected
            </span>
          </div>
          <Link href="/flow" className="group block">
            <div className="relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(34,211,238,0.06))', borderColor: 'rgba(16,185,129,0.35)' }}>
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ boxShadow: 'inset 0 0 40px rgba(16,185,129,0.15)' }} />
              <div className="relative flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0" style={{ background: 'rgba(16,185,129,0.2)' }}>
                  <Workflow className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-bold text-emerald-400 tracking-wide">STEP-BY-STEP FLOW</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">8-step wizard: MV type, setup, analysis, storyline, mood board, storyboard, generation, VFX & export</p>
                </div>
                <span className="text-xs font-medium text-emerald-400 shrink-0 transition-transform duration-200 group-hover:translate-x-1">Explore →</span>
              </div>
            </div>
          </Link>
        </div>
      </motion.div>

      {/* Director Flow link */}
      <motion.div className="mt-3 w-full max-w-6xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.88 }}>
        <Link href="/flow-v2" className="group block">
          <div className="relative overflow-hidden rounded-2xl p-[1px] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-500/20" style={{ background: 'linear-gradient(135deg, #7C3AED, #22D3EE, #A855F7)' }}>
            <div className="relative overflow-hidden rounded-2xl px-6 py-5" style={{ background: 'linear-gradient(135deg, rgba(15,10,30,0.97), rgba(20,15,40,0.95))' }}>
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-40" style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }} />
              <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full opacity-15 blur-3xl transition-opacity duration-500 group-hover:opacity-30" style={{ background: 'radial-gradient(circle, #22D3EE, transparent)' }} />
              <div className="relative flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl shrink-0" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(34,211,238,0.2))' }}>
                  <Clapperboard className="h-6 w-6 text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-bold tracking-wide" style={{ background: 'linear-gradient(90deg, #A855F7, #22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>DIRECTOR FLOW</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">6-step wizard — from concept to final music video</p>
                </div>
                <span className="text-xs font-medium text-violet-400 shrink-0 transition-transform duration-200 group-hover:translate-x-1">Explore prototype →</span>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Flow V3 prototype link */}
      <motion.div className="mt-3 w-full max-w-6xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.92 }}>
        <Link href="/flow-v3" className="group block">
          <div className="relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(236,72,153,0.06))', borderColor: 'rgba(168,85,247,0.2)' }}>
            <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ boxShadow: 'inset 0 0 40px rgba(168,85,247,0.15)' }} />
            <div className="relative flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0" style={{ background: 'rgba(168,85,247,0.2)' }}>
                <Workflow className="h-5 w-5 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold text-purple-400 tracking-wide">STEP-BY-STEP FLOW V3</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Real images — storyline photos, mood board images, scene thumbnails replacing SVG gradient placeholders</p>
              </div>
              <span className="text-xs font-medium text-purple-400 shrink-0 transition-transform duration-200 group-hover:translate-x-1">Explore →</span>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Scenario Research link */}
      <motion.div className="mt-4 w-full max-w-6xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}>
        <Link href="/scenarios" className="group block">
          <div className="relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(34,211,238,0.06))', borderColor: 'rgba(139,92,246,0.2)' }}>
            <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ boxShadow: 'inset 0 0 40px rgba(139,92,246,0.15)' }} />
            <div className="relative flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0" style={{ background: 'rgba(139,92,246,0.2)' }}>
                <FlaskConical className="h-5 w-5 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold text-purple-400 tracking-wide">USER SCENARIO RESEARCH</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Manual AI orchestration (~8–15 hrs) vs Agentic system (~60–90 min) — side-by-side comparison</p>
              </div>
              <span className="text-xs font-medium text-purple-400 shrink-0 transition-transform duration-200 group-hover:translate-x-1">Explore →</span>
            </div>
          </div>
        </Link>
      </motion.div>

      <motion.p className="mt-8 text-xs text-muted-foreground/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
        Agentic UI prototypes — structure &amp; interaction, not visual style
      </motion.p>
    </div>
  )
}

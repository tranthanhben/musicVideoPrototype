'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Film, Clapperboard } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StorylineOption {
  title: string
  tone: string
  description: string
  sceneCount: number
  keyMoment: string
  matchPct: number
  gradientFrom: string
  gradientTo: string
  selected?: boolean
}

const STORYLINES: StorylineOption[] = [
  {
    title: 'Celestial Journey',
    tone: 'Ethereal',
    description: 'Sweeping cosmic vistas punctuated by intimate moments of connection — dreamlike transitions follow the energy peaks of the track.',
    sceneCount: 8,
    keyMoment: 'Chorus 1:00 — supernova climax',
    matchPct: 92,
    gradientFrom: '#7C3AED',
    gradientTo: '#22D3EE',
    selected: true,
  },
  {
    title: 'Neon Metropolis',
    tone: 'Cinematic',
    description: 'High-contrast urban landscapes with editorial-style cuts — every beat triggers a new environment, building to an electric finale.',
    sceneCount: 7,
    keyMoment: 'Bridge 2:15 — city lights climax',
    matchPct: 87,
    gradientFrom: '#EC4899',
    gradientTo: '#F59E0B',
  },
  {
    title: 'Abstract Emotion',
    tone: 'Experimental',
    description: 'Non-linear visual poem where color fields and motion blur translate emotional arcs directly — no narrative, pure sensation.',
    sceneCount: 6,
    keyMoment: 'Drop 1:45 — chromatic burst',
    matchPct: 78,
    gradientFrom: '#22D3EE',
    gradientTo: '#10B981',
  },
]

function CircleProgress({ pct, from, to }: { pct: number; from: string; to: string }) {
  const r = 20
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  const gradId = `cg-${from.replace('#', '')}`
  return (
    <svg width="52" height="52" viewBox="0 0 52 52">
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <circle cx="26" cy="26" r={r} fill="none" stroke="currentColor" strokeWidth={3} className="text-muted/50" />
      <motion.circle
        cx="26" cy="26" r={r}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth={3}
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
        strokeLinecap="round"
        transform="rotate(-90 26 26)"
      />
      <text x="26" y="30" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">{pct}%</text>
    </svg>
  )
}

function StorylineCard({ storyline, index }: { storyline: StorylineOption; index: number }) {
  const { title, tone, description, sceneCount, keyMoment, matchPct, gradientFrom, gradientTo, selected } = storyline
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'relative rounded-2xl border overflow-hidden transition-all cursor-pointer',
        selected
          ? 'border-primary/60 shadow-lg'
          : 'border-border hover:border-primary/30 hover:shadow-md',
      )}
    >
      {/* Cinematic gradient header */}
      <div
        className="relative h-20 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
      >
        <div className="absolute inset-0 bg-black/30" />
        {/* Shimmer */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: hovered ? ['−100%', '200%'] : '-100%' }}
          transition={{ duration: 0.8 }}
        />
        {/* Film icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <Film className="h-8 w-8 text-white/30" />
        </div>
        {/* Title overlay */}
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">{title}</h3>
            <span
              className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mt-1 text-white/90"
              style={{ backgroundColor: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              {tone}
            </span>
          </div>
          <CircleProgress pct={matchPct} from={gradientFrom} to={gradientTo} />
        </div>
        {selected && (
          <div className="absolute top-3 right-3 rounded-full px-2 py-0.5 text-[9px] font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${gradientFrom}cc, ${gradientTo}cc)`, backdropFilter: 'blur(4px)' }}
          >
            SELECTED
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3.5 bg-card">
        <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">{description}</p>

        {/* Meta row */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-2.5 py-1.5 flex-1">
            <Clapperboard className="h-3 w-3 shrink-0" style={{ color: gradientFrom }} />
            <p className="text-[10px] font-mono text-muted-foreground truncate">{keyMoment}</p>
          </div>
          <div
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 shrink-0 text-white text-[10px] font-bold"
            style={{ background: `linear-gradient(135deg, ${gradientFrom}33, ${gradientTo}33)`, border: `1px solid ${gradientFrom}40` }}
          >
            <span style={{ color: gradientFrom }}>{sceneCount}</span>
            <span className="text-muted-foreground">scenes</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function CreativeView() {
  return (
    <div className="flex h-full flex-col p-5 gap-3">
      {/* Header */}
      <div className="shrink-0">
        <h2 className="text-sm font-bold text-foreground">Storyline Options</h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">AI-generated creative directions matched to your track</p>
      </div>

      {/* Style seed badge */}
      <div className="shrink-0">
        <span className="inline-flex items-center rounded-full border border-purple-500/40 bg-purple-500/10 px-3 py-1 text-[10px] font-mono font-semibold text-purple-400 tracking-wide">
          Shared Style Seed: CREMI-7C3A-COSMIC
        </span>
      </div>

      {/* Storyline cards */}
      <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto min-h-0">
        {STORYLINES.map((s, i) => (
          <StorylineCard key={s.title} storyline={s} index={i} />
        ))}
      </div>
    </div>
  )
}

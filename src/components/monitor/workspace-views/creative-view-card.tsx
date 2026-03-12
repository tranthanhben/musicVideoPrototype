'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clapperboard, Clock, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StorylineView {
  title: string
  tone: string
  description: string
  sceneCount: number
  duration: string
  keyMoment: string
  emotionArc: string
  visualKeywords: string[]
  matchPct: number
  imageUrl: string
  gradientFrom: string
  gradientTo: string
  selected?: boolean
}

function CircleProgress({ pct, from, to }: { pct: number; from: string; to: string }) {
  const r = 20
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  const gradId = `cg2-${from.replace('#', '')}`
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
        cx="26" cy="26" r={r} fill="none"
        stroke={`url(#${gradId})`} strokeWidth={3}
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
        strokeLinecap="round" transform="rotate(-90 26 26)"
      />
      <text x="26" y="30" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">{pct}%</text>
    </svg>
  )
}

export function CreativeViewCard({ storyline, index }: { storyline: StorylineView; index: number }) {
  const { title, tone, description, sceneCount, duration, keyMoment, emotionArc, visualKeywords, matchPct, imageUrl, gradientFrom, gradientTo, selected } = storyline
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className={cn(
        'relative rounded-2xl border overflow-hidden transition-all cursor-pointer',
        selected ? 'border-primary/60 shadow-lg' : 'border-border hover:border-primary/30 hover:shadow-md',
      )}
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <img src={imageUrl} alt={title}
          className={cn('absolute inset-0 w-full h-full object-cover transition-transform duration-500', hovered ? 'scale-110' : 'scale-100')} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
        {selected && (
          <div className="absolute top-3 right-3 rounded-full px-2 py-0.5 text-[9px] font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${gradientFrom}cc, ${gradientTo}cc)`, backdropFilter: 'blur(4px)' }}>
            SELECTED
          </div>
        )}
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">{title}</h3>
            <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mt-1 text-white/90"
              style={{ backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)' }}>
              {tone}
            </span>
          </div>
          <CircleProgress pct={matchPct} from={gradientFrom} to={gradientTo} />
        </div>
      </div>

      <div className="p-3.5 bg-card">
        <p className="text-[11px] text-muted-foreground leading-relaxed mb-2.5">{description}</p>
        <div className="flex items-center gap-1.5 mb-2.5 rounded-lg bg-muted/30 px-2.5 py-1.5">
          <TrendingUp className="h-3 w-3 shrink-0" style={{ color: gradientFrom }} />
          <p className="text-[10px] text-muted-foreground font-medium">{emotionArc}</p>
        </div>
        <div className="flex flex-wrap gap-1 mb-2.5">
          {visualKeywords.map((kw) => (
            <span key={kw} className="text-[9px] px-1.5 py-0.5 rounded-full border"
              style={{ color: gradientFrom, borderColor: `${gradientFrom}40`, backgroundColor: `${gradientFrom}10` }}>
              {kw}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-2.5 py-1.5 flex-1">
            <Clapperboard className="h-3 w-3 shrink-0" style={{ color: gradientFrom }} />
            <p className="text-[10px] font-mono text-muted-foreground truncate">{keyMoment}</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-2.5 py-1.5">
            <Clock className="h-3 w-3 shrink-0 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground font-mono">{duration}</span>
          </div>
          <div className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 shrink-0 text-[10px] font-bold"
            style={{ background: `linear-gradient(135deg, ${gradientFrom}33, ${gradientTo}33)`, border: `1px solid ${gradientFrom}40` }}>
            <span style={{ color: gradientFrom }}>{sceneCount}</span>
            <span className="text-muted-foreground">scenes</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

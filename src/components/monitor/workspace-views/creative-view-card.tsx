'use client'

import { motion } from 'framer-motion'
import { Clapperboard, Clock, TrendingUp, Users, Film, ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

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
  characters?: string[]
  sceneSummaries?: string[]
  emotionBreakdown?: { label: string; pct: number }[]
}

export function CreativeViewCard({ storyline, index, onSelect }: { storyline: StorylineView; index: number; onSelect?: () => void }) {
  const {
    title, tone, description, sceneCount, duration, keyMoment, emotionArc,
    visualKeywords, matchPct, imageUrl, gradientFrom, gradientTo, selected,
    characters, sceneSummaries, emotionBreakdown,
  } = storyline
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}
      onClick={onSelect}
      className={cn(
        'relative rounded-xl border overflow-hidden transition-all cursor-pointer',
        selected
          ? 'border-primary/60 shadow-lg ring-2 ring-primary/20'
          : 'border-border/50 hover:border-primary/30 hover:shadow-md',
      )}
    >
      {/* Compact header: small image + title + match + meta */}
      <div className="flex gap-3 p-3 bg-card">
        {/* Small thumbnail */}
        <div className="relative h-20 w-28 shrink-0 rounded-lg overflow-hidden">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {selected && (
            <div className="absolute top-1 right-1 rounded-full px-1.5 py-0.5 text-[8px] font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${gradientFrom}cc, ${gradientTo}cc)` }}>
              SELECTED
            </div>
          )}
          <span
            className="absolute bottom-1 right-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
            style={{ background: `${gradientFrom}cc` }}
          >
            {matchPct}%
          </span>
        </div>

        {/* Title + description + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-sm font-bold text-foreground leading-tight truncate">{title}</h3>
            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full shrink-0"
              style={{ color: gradientFrom, backgroundColor: `${gradientFrom}15`, border: `1px solid ${gradientFrom}30` }}>
              {tone}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 mb-1.5">{description}</p>
          <div className="flex items-center gap-2 flex-wrap text-[10px]">
            <span className="flex items-center gap-1 text-muted-foreground">
              <TrendingUp className="h-2.5 w-2.5" style={{ color: gradientFrom }} />
              {emotionArc}
            </span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-2.5 w-2.5" />
              {duration}
            </span>
            <span className="text-border">·</span>
            <span className="font-medium" style={{ color: gradientFrom }}>{sceneCount} scenes</span>
          </div>
        </div>
      </div>

      {/* Gradient divider */}
      <div className="h-0.5" style={{ background: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})` }} />

      {/* Key moment + characters row */}
      <div className="px-3 py-2 bg-card/80 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Clapperboard className="h-3 w-3 shrink-0" style={{ color: gradientFrom }} />
          <p className="text-[10px] text-muted-foreground truncate">{keyMoment}</p>
        </div>

        {characters && characters.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Users className="h-3 w-3 shrink-0" style={{ color: gradientFrom }} />
            <p className="text-[10px] text-foreground/80 truncate">{characters.join(' · ')}</p>
          </div>
        )}

        {/* Visual keywords */}
        <div className="flex flex-wrap gap-1">
          {visualKeywords.map((kw) => (
            <span key={kw} className="text-[9px] px-1.5 py-0.5 rounded-full border"
              style={{ color: gradientFrom, borderColor: `${gradientFrom}30`, backgroundColor: `${gradientFrom}08` }}>
              {kw}
            </span>
          ))}
        </div>

        {/* Expand toggle for scenes + emotions */}
        {(sceneSummaries || emotionBreakdown) && (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
            className="flex items-center gap-1 text-[10px] text-primary/70 hover:text-primary font-medium transition-colors pt-0.5"
          >
            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            {expanded ? 'Hide details' : 'Show scenes & emotions'}
          </button>
        )}
      </div>

      {/* Expandable details */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="px-3 pb-3 bg-card/80 space-y-2"
        >
          {sceneSummaries && sceneSummaries.length > 0 && (
            <div className="rounded-lg bg-muted/20 px-2.5 py-2">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Film className="h-3 w-3 shrink-0" style={{ color: gradientFrom }} />
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Scene Breakdown</p>
              </div>
              <div className="space-y-1 max-h-28 overflow-y-auto">
                {sceneSummaries.map((summary, i) => (
                  <p key={i} className="text-[10px] text-muted-foreground leading-relaxed">
                    <span className="font-semibold" style={{ color: gradientFrom }}>S{i + 1}:</span> {summary}
                  </p>
                ))}
              </div>
            </div>
          )}

          {emotionBreakdown && emotionBreakdown.length > 0 && (
            <div className="rounded-lg bg-muted/20 px-2.5 py-2">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5">Emotion Breakdown</p>
              <div className="space-y-1">
                {emotionBreakdown.map((e) => (
                  <div key={e.label} className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground w-20 shrink-0">{e.label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${e.pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground w-7 text-right">{e.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

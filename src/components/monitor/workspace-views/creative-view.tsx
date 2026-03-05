'use client'

import { cn } from '@/lib/utils'

interface StorylineOption {
  title: string
  tone: string
  description: string
  sceneCallout: string
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
    sceneCallout: 'Scene 4 at Chorus 1:00 — supernova climax',
    matchPct: 92,
    gradientFrom: '#7C3AED',
    gradientTo: '#22D3EE',
    selected: true,
  },
  {
    title: 'Neon Metropolis',
    tone: 'Cinematic',
    description: 'High-contrast urban landscapes with editorial-style cuts — every beat triggers a new environment, building to an electric finale.',
    sceneCallout: 'Scene 4 at Chorus 1:00 — supernova climax',
    matchPct: 87,
    gradientFrom: '#EC4899',
    gradientTo: '#F59E0B',
  },
  {
    title: 'Abstract Emotion',
    tone: 'Experimental',
    description: 'Non-linear visual poem where color fields and motion blur translate emotional arcs directly — no narrative, pure sensation.',
    sceneCallout: 'Scene 4 at Chorus 1:00 — supernova climax',
    matchPct: 78,
    gradientFrom: '#22D3EE',
    gradientTo: '#10B981',
  },
]

function StorylineCard({ storyline }: { storyline: StorylineOption }) {
  const { title, tone, description, sceneCallout, matchPct, gradientFrom, gradientTo, selected } = storyline

  return (
    <div
      className={cn(
        'relative rounded-xl border bg-card p-4 transition-all',
        selected
          ? 'border-primary/60 bg-primary/5 shadow-md'
          : 'border-border hover:border-border/80',
      )}
    >
      {/* Gradient left border */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{
          background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})`,
        }}
      />

      <div className="pl-2">
        {/* Title row */}
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <span
            className={cn(
              'text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full',
              matchPct >= 90
                ? 'bg-green-500/20 text-green-400'
                : matchPct >= 85
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-muted text-muted-foreground',
            )}
          >
            {matchPct}% match
          </span>
        </div>

        {/* Tone tag */}
        <span
          className="inline-block mb-2 text-[10px] font-medium px-2 py-0.5 rounded-full border"
          style={{
            borderColor: gradientFrom + '80',
            color: gradientFrom,
            backgroundColor: gradientFrom + '18',
          }}
        >
          {tone}
        </span>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">{description}</p>

        {/* Key scene callout */}
        <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-2.5 py-1.5">
          <div
            className="h-1.5 w-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: gradientTo }}
          />
          <p className="text-[10px] font-medium text-muted-foreground font-mono">{sceneCallout}</p>
        </div>
      </div>
    </div>
  )
}

export function CreativeView() {
  return (
    <div className="flex h-full flex-col p-6 gap-4">
      {/* Header */}
      <div>
        <h2 className="text-sm font-semibold text-foreground">Storyline Options</h2>
        <p className="text-xs text-muted-foreground mt-0.5">AI-generated creative directions matched to your track</p>
      </div>

      {/* Style seed badge */}
      <div className="flex items-center">
        <span className="inline-flex items-center rounded-full border border-purple-500/40 bg-purple-500/10 px-3 py-1 text-[10px] font-mono font-medium text-purple-400 tracking-wide">
          Shared Style Seed: CREMI-7C3A-COSMIC
        </span>
      </div>

      {/* Storyline cards */}
      <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
        {STORYLINES.map((s) => (
          <StorylineCard key={s.title} storyline={s} />
        ))}
      </div>
    </div>
  )
}

'use client'

import { cn } from '@/lib/utils'

interface Storyline {
  title: string
  tone: string
  image: string
  matchPct: number
  gradient: [string, string]
  description: string
  keyScene: string
  sceneCount: number
}

const STORYLINES: Storyline[] = [
  {
    title: 'Celestial Journey',
    tone: 'Ethereal, intimate, soaring',
    image: '/assets/storylines/celestial-journey.jpg',
    matchPct: 94,
    gradient: ['#7C3AED', '#22D3EE'],
    description: 'An epic space voyage synced to verse/chorus arcs. Soft nebula visuals for verses, supernova bursts for choruses.',
    keyScene: 'Scene 4 at Chorus — dancing on a moonlit planet',
    sceneCount: 8,
  },
  {
    title: 'Neon Metropolis',
    tone: 'Cyberpunk, electric, driving',
    image: '/assets/storylines/urban-pulse.jpg',
    matchPct: 87,
    gradient: ['#EC4899', '#F59E0B'],
    description: 'High-energy city narrative with beat-driven cuts. Neon reflections and motion blur match the 128 BPM pulse.',
    keyScene: 'Scene 5 at Chorus — supernova explosion',
    sceneCount: 7,
  },
  {
    title: 'Ocean Memory',
    tone: 'Nostalgic, serene, flowing',
    image: '/assets/storylines/ocean-memory.jpg',
    matchPct: 81,
    gradient: ['#06B6D4', '#10B981'],
    description: 'Memories wash ashore like waves. Seaside landscapes and tender moments synced to the slow build.',
    keyScene: 'Scene 8 at Outro — cosmic reunion',
    sceneCount: 10,
  },
]

interface Props {
  selectedStoryline: number | null
  onAction: (action: string) => void
}

export function BayPreviewCreative({ selectedStoryline, onAction }: Props) {
  return (
    <div className="w-full max-w-lg space-y-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Choose a Storyline</p>
        <span className="text-[10px] font-mono text-purple-400 border border-purple-500/30 rounded-full px-2 py-0.5">
          CREMI-7C3A-COSMIC
        </span>
      </div>

      {STORYLINES.map((s, i) => (
        <button
          key={i}
          onClick={() => onAction(`select_storyline_${i}`)}
          className={cn(
            'w-full text-left rounded-xl border overflow-hidden transition-all',
            selectedStoryline === i
              ? 'border-primary ring-1 ring-primary/30'
              : 'border-border/40 hover:border-border'
          )}
        >
          {/* Image header */}
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(to top, ${s.gradient[0]}cc, transparent 50%)` }}
            />
            <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
              <div>
                <p className="font-semibold text-sm text-white drop-shadow">{s.title}</p>
                <p className="text-[10px] text-white/80 italic">{s.tone}</p>
              </div>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                style={{ background: `${s.gradient[0]}cc` }}
              >
                {s.matchPct}%
              </span>
            </div>
          </div>

          {/* Info row */}
          <div className="px-3 py-2 bg-zinc-900/80 space-y-1">
            <p className="text-xs text-muted-foreground/80 leading-relaxed">{s.description}</p>
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-primary/70">{s.keyScene}</p>
              <span className="text-[10px] text-muted-foreground">{s.sceneCount} scenes</span>
            </div>
            <div
              className="h-0.5 rounded-full"
              style={{ background: `linear-gradient(to right, ${s.gradient[0]}, ${s.gradient[1]})` }}
            />
          </div>
        </button>
      ))}
    </div>
  )
}

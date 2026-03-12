'use client'

import { CreativeViewCard, type StorylineView } from './creative-view-card'

const STORYLINES: StorylineView[] = [
  {
    title: 'Celestial Journey',
    tone: 'Ethereal',
    description: 'Sweeping cosmic vistas punctuated by intimate moments of connection — dreamlike transitions follow the energy peaks of the track.',
    sceneCount: 8,
    duration: '3:42',
    keyMoment: 'Chorus 1:00 — supernova climax',
    emotionArc: 'Wonder → Longing → Transcendence',
    visualKeywords: ['Deep space', 'Nebula colors', 'Zero gravity'],
    matchPct: 92,
    imageUrl: '/assets/storylines/celestial-journey.jpg',
    gradientFrom: '#7C3AED',
    gradientTo: '#22D3EE',
    selected: true,
  },
  {
    title: 'Urban Pulse',
    tone: 'Cinematic',
    description: 'High-contrast urban landscapes with editorial-style cuts — every beat triggers a new environment, building to an electric finale.',
    sceneCount: 7,
    duration: '3:28',
    keyMoment: 'Bridge 2:15 — city lights climax',
    emotionArc: 'Energy → Conflict → Release',
    visualKeywords: ['Neon streets', 'Motion blur', 'Night city'],
    matchPct: 87,
    imageUrl: '/assets/storylines/urban-pulse.jpg',
    gradientFrom: '#EC4899',
    gradientTo: '#F59E0B',
  },
  {
    title: 'Ocean Memory',
    tone: 'Experimental',
    description: 'Non-linear visual poem where color fields and motion blur translate emotional arcs directly — no narrative, pure sensation.',
    sceneCount: 6,
    duration: '3:15',
    keyMoment: 'Drop 1:45 — chromatic burst',
    emotionArc: 'Nostalgia → Loss → Acceptance',
    visualKeywords: ['Water reflections', 'Soft focus', 'Golden hour'],
    matchPct: 78,
    imageUrl: '/assets/storylines/ocean-memory.jpg',
    gradientFrom: '#22D3EE',
    gradientTo: '#10B981',
  },
]

export function CreativeView() {
  return (
    <div className="flex h-full flex-col p-5 gap-3">
      <div className="shrink-0">
        <h2 className="text-sm font-bold text-foreground">Storyline Options</h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">AI-generated creative directions matched to your track</p>
      </div>

      <div className="shrink-0">
        <span className="inline-flex items-center rounded-full border border-purple-500/40 bg-purple-500/10 px-3 py-1 text-[10px] font-mono font-semibold text-purple-400 tracking-wide">
          Shared Style Seed: CREMI-7C3A-COSMIC
        </span>
      </div>

      <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto min-h-0">
        {STORYLINES.map((s, i) => (
          <CreativeViewCard key={s.title} storyline={s} index={i} />
        ))}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
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
    characters: ['Aria (protagonist)', 'Kael (love interest)', 'The Signal (entity)'],
    sceneSummaries: [
      'Aria floats alone in a violet nebula — lost after the wormhole collapse',
      'Reaching toward a pulsing star through asteroid field — hope emerging',
      'Kael pilots the crystal ship into the spiraling wormhole — courage',
      'Moon dance — shared dream where Aria and Kael reunite as holograms',
      'Aria sings before an exploding supernova — raw emotional climax',
      'Reunion in freefall through Saturn ring particles — hands touching',
      'Kael plays guitar on a comet — triumph and release',
      'Embrace at the edge of the universe — new star born from love',
    ],
    emotionBreakdown: [
      { label: 'Wonder', pct: 35 },
      { label: 'Longing', pct: 28 },
      { label: 'Transcendence', pct: 22 },
      { label: 'Joy', pct: 15 },
    ],
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
    characters: ['The Dancer', 'The City'],
    sceneSummaries: [
      'Rooftop DJ set under neon rain — energy ignition',
      'Street dancer breaking in a rain-slicked alley',
      'Singer on a holographic stage, digital crowd watching',
      'Car drifting through LED tunnels — pulse of the city',
      'Group celebrating on an illuminated bridge — collective joy',
      'City montage — chaos becoming beauty through motion',
      'Singer fading into pixel rain — dissolution and rebirth',
    ],
    emotionBreakdown: [
      { label: 'Energy', pct: 40 },
      { label: 'Conflict', pct: 25 },
      { label: 'Release', pct: 35 },
    ],
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
    characters: ['Woman (unnamed)', 'The Ocean'],
    sceneSummaries: [
      'Walking alone on misty beach at dawn — solitude and memory',
      'Diver descends into bioluminescent deep — entering the subconscious',
      'Surfer riding giant wave in slow motion — surrendering to force',
      'Floating in turquoise lagoon from above — peace found in stillness',
      'Singer waist-deep in golden-hour ocean — catharsis',
      'Stars from night ocean surface — acceptance and wonder',
    ],
    emotionBreakdown: [
      { label: 'Nostalgia', pct: 38 },
      { label: 'Loss', pct: 30 },
      { label: 'Acceptance', pct: 32 },
    ],
  },
]

interface CreativeViewProps {
  onSelect?: (index: number) => void
  selectedIndex?: number | null
}

export function CreativeView({ onSelect, selectedIndex: controlledIndex }: CreativeViewProps) {
  const [localIndex, setLocalIndex] = useState<number | null>(null)
  const selectedIndex = controlledIndex ?? localIndex

  function handleSelect(index: number) {
    setLocalIndex(index)
    onSelect?.(index)
  }

  return (
    <div className="flex h-full flex-col p-5 gap-3">
      <div className="shrink-0 flex items-center justify-between pr-28">
        <div>
          <h2 className="text-sm font-bold text-foreground">Storyline Options</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Choose a creative direction for your music video</p>
        </div>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/25 px-3 py-1 text-[10px] font-semibold text-primary"
          >
            <Check className="h-3 w-3" />
            {STORYLINES[selectedIndex]?.title} selected
          </motion.div>
        )}
      </div>

      <div className="shrink-0">
        <span className="inline-flex items-center rounded-full border border-purple-500/40 bg-purple-500/10 px-3 py-1 text-[10px] font-mono font-semibold text-purple-400 tracking-wide">
          Shared Style Seed: CREMI-7C3A-COSMIC
        </span>
      </div>

      <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto min-h-0">
        {STORYLINES.map((s, i) => (
          <CreativeViewCard
            key={s.title}
            storyline={{ ...s, selected: selectedIndex === i }}
            index={i}
            onSelect={() => handleSelect(i)}
          />
        ))}
      </div>
    </div>
  )
}

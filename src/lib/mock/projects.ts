import type { MockProject, MockScene, MockTake } from './types'
import { cosmicLoveAudio, neonCityAudio, oceanDreamsAudio } from './audio'

function svgThumb(from: string, to: string): string {
  return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${from}"/><stop offset="100%" style="stop-color:${to}"/></linearGradient></defs><rect width="400" height="300" fill="url(%23g)"/></svg>`
}

function makeTakes(sceneId: string, colors: [string, string][]): MockTake[] {
  return colors.map((pair, i) => ({
    id: `${sceneId}-take-${i + 1}`,
    thumbnailUrl: svgThumb(pair[0], pair[1]),
    selected: i === 0,
  }))
}

// --- Project 1: Cosmic Love Story (8 scenes, complete, BPM 128) ---
const cosmicScenes: MockScene[] = [
  {
    id: 'cosmic-1', index: 0, subject: 'Aria', action: 'floating alone in zero gravity, eyes closed',
    environment: 'deep violet nebula, crystal debris from shattered ship', cameraAngle: 'ultra-wide anamorphic', cameraMovement: 'slow dolly in',
    prompt: 'Woman with silver hair floating in zero gravity inside a violet nebula, eyes closed in fetal position. Crystal debris from a shattered ship catches starlight. A faint cyan pulse glows from her chest. Ultra-cinematic, anamorphic lens flare.',
    thumbnailUrl: '/assets/scenes/scene-01-the-void.jpg',
    duration: 24, status: 'completed',
    takes: [
      { id: 'cosmic-1-take-1', thumbnailUrl: '/assets/scenes/scene-01-the-void.jpg', selected: true },
      { id: 'cosmic-1-take-2', thumbnailUrl: '/assets/takes/scene-01-take-2.jpg', selected: false },
      { id: 'cosmic-1-take-3', thumbnailUrl: '/assets/takes/scene-01-take-3.jpg', selected: false },
    ],
  },
  {
    id: 'cosmic-2', index: 1, subject: 'Aria', action: 'reaching toward a pulsing star through an asteroid field',
    environment: 'dense asteroid field, impossible colors', cameraAngle: 'low angle', cameraMovement: 'crane up',
    prompt: 'Woman in silver flowing dress unfurling in zero gravity, reaching toward a distant pulsing light through a dense asteroid field. Each asteroid reflects impossible colors. Backlit by the pulsing star, dramatic cinematic lighting.',
    thumbnailUrl: '/assets/scenes/scene-02-aria-reaching.jpg',
    duration: 20, status: 'completed',
    takes: [
      { id: 'cosmic-2-take-1', thumbnailUrl: '/assets/scenes/scene-02-aria-reaching.jpg', selected: true },
      { id: 'cosmic-2-take-2', thumbnailUrl: '/assets/takes/scene-02-take-2.jpg', selected: false },
    ],
  },
  {
    id: 'cosmic-3', index: 2, subject: 'Kael', action: 'piloting a crystal ship into a spiraling wormhole',
    environment: 'crystal ship cockpit, wormhole entrance', cameraAngle: 'cockpit POV', cameraMovement: 'handheld close-up',
    prompt: 'Man at controls of a translucent crystal ship, face lit by neon wormhole reflections and blue instrument glow. Wormhole spirals open ahead — a tunnel of distorted spacetime. Determination in his eyes. Cinematic, intense.',
    thumbnailUrl: '/assets/scenes/scene-03-crystal-ship.jpg',
    duration: 18, status: 'completed',
    takes: [
      { id: 'cosmic-3-take-1', thumbnailUrl: '/assets/scenes/scene-03-crystal-ship.jpg', selected: true },
      { id: 'cosmic-3-take-2', thumbnailUrl: svgThumb('%230891B2', '%236D28D9'), selected: false },
    ],
  },
  {
    id: 'cosmic-4', index: 3, subject: 'Aria & Kael', action: 'dancing together on an alien moon surface in a shared dream',
    environment: 'silver moon surface, twin suns setting in gold and magenta', cameraAngle: 'aerial overhead', cameraMovement: 'slow orbit',
    prompt: 'Two figures dancing on a silver alien moon surface, twin suns setting on the horizon in gold and magenta. They exist as half-transparent holograms — a shared dream. Intimate yet cosmic, vast landscape dwarfing the dancers. Aerial orbit camera.',
    thumbnailUrl: '/assets/scenes/scene-04-moon-dance.jpg',
    duration: 26, status: 'completed',
    takes: [
      { id: 'cosmic-4-take-1', thumbnailUrl: '/assets/scenes/scene-04-moon-dance.jpg', selected: true },
      { id: 'cosmic-4-take-2', thumbnailUrl: '/assets/takes/scene-04-take-2.jpg', selected: false },
      { id: 'cosmic-4-take-3', thumbnailUrl: '/assets/takes/scene-04-take-3.jpg', selected: false },
    ],
  },
  {
    id: 'cosmic-5', index: 4, subject: 'Aria', action: 'singing before an exploding supernova, hair whipping in shockwaves',
    environment: 'exploding star, fire and plasma eruption', cameraAngle: 'extreme close-up', cameraMovement: 'slow push in, then wide pullback',
    prompt: 'Close-up of woman singing before an exploding supernova. Fire, plasma, and blinding light erupt behind her in slow motion. Silver hair whips in stellar shockwaves. Raw emotion — longing channeled through the performance. Epic scale reveal on pullback.',
    thumbnailUrl: '/assets/scenes/scene-05-supernova-voice.jpg',
    duration: 22, status: 'completed',
    takes: [
      { id: 'cosmic-5-take-1', thumbnailUrl: '/assets/scenes/scene-05-supernova-voice.jpg', selected: true },
      { id: 'cosmic-5-take-2', thumbnailUrl: '/assets/takes/scene-05-take-2.jpg', selected: false },
    ],
  },
  {
    id: 'cosmic-6', index: 5, subject: 'Aria & Kael', action: 'reuniting in freefall among Saturn ring particles',
    environment: 'Saturn ring plane, golden ice and dust', cameraAngle: 'medium shot', cameraMovement: 'slow rotation tracking',
    prompt: 'Two figures drifting toward each other in freefall through Saturn ring particles. Golden ice and dust streams in spiral patterns. The moment their hands touch, a shockwave of light ripples outward through the rings. Natural bokeh from light particles.',
    thumbnailUrl: '/assets/scenes/scene-06-saturn-embrace.jpg',
    duration: 20, status: 'completed',
    takes: [
      { id: 'cosmic-6-take-1', thumbnailUrl: '/assets/scenes/scene-06-saturn-embrace.jpg', selected: true },
      { id: 'cosmic-6-take-2', thumbnailUrl: '/assets/takes/scene-06-take-2.jpg', selected: false },
    ],
  },
  {
    id: 'cosmic-7', index: 6, subject: 'Kael', action: 'playing electric guitar on a comet surface, tail blazing',
    environment: 'comet hurtling through space, brilliant tail', cameraAngle: 'dynamic tracking', cameraMovement: 'fast parallel pan',
    prompt: 'Man standing on a comet surface playing electric guitar, comet tail blazing in brilliant blues and whites behind him. Stars streak past in motion-blur lines. Cosmic wind whips his jacket. Pure euphoria and energy. Victory lap.',
    thumbnailUrl: '/assets/scenes/scene-07-comet-guitar.jpg',
    duration: 16, status: 'completed',
    takes: [
      { id: 'cosmic-7-take-1', thumbnailUrl: '/assets/scenes/scene-07-comet-guitar.jpg', selected: true },
      { id: 'cosmic-7-take-2', thumbnailUrl: '/assets/takes/scene-07-take-2.jpg', selected: false },
    ],
  },
  {
    id: 'cosmic-8', index: 7, subject: 'Aria & Kael', action: 'embracing at the edge of the observable universe',
    environment: 'cosmic horizon, billions of galaxies behind, void ahead', cameraAngle: 'wide establishing', cameraMovement: 'extremely slow pullback reveal',
    prompt: 'Couple embracing at the literal edge of the observable universe. Behind them: billions of galaxies spiraling. A warm golden glow emanates from their embrace, slowly expanding — becoming a new star. Camera pulls infinitely back until they are a point of light in creation.',
    thumbnailUrl: '/assets/scenes/scene-08-edge-of-universe.jpg',
    duration: 26, status: 'completed',
    takes: [
      { id: 'cosmic-8-take-1', thumbnailUrl: '/assets/scenes/scene-08-edge-of-universe.jpg', selected: true },
      { id: 'cosmic-8-take-2', thumbnailUrl: '/assets/takes/scene-08-take-2.jpg', selected: false },
      { id: 'cosmic-8-take-3', thumbnailUrl: '/assets/takes/scene-08-take-3.jpg', selected: false },
    ],
  },
]

// --- Project 2: Neon City Nights (6 scenes, draft, BPM 140) ---
const neonScenes: MockScene[] = [
  {
    id: 'neon-1', index: 0, subject: 'DJ', action: 'spinning records in a rooftop club',
    environment: 'cyberpunk rooftop, neon city skyline', cameraAngle: 'wide shot', cameraMovement: 'slow push in',
    prompt: 'DJ spinning records on neon-lit rooftop, cyberpunk city skyline glowing behind, rain falling',
    thumbnailUrl: svgThumb('%23FF006E', '%2300F5D4'),
    duration: 20, status: 'init',
    takes: makeTakes('neon-1', [['%23FF006E', '%2300F5D4']]),
  },
  {
    id: 'neon-2', index: 1, subject: 'Street dancer', action: 'breakdancing under neon signs',
    environment: 'rain-slicked alley, neon reflections', cameraAngle: 'low angle', cameraMovement: 'circle',
    prompt: 'Street dancer breakdancing in neon-lit rain-soaked alley, colorful reflections on wet pavement',
    thumbnailUrl: svgThumb('%2300F5D4', '%23FF006E'),
    duration: 18, status: 'init',
    takes: makeTakes('neon-2', [['%2300F5D4', '%23FF006E']]),
  },
  {
    id: 'neon-3', index: 2, subject: 'Singer', action: 'performing on holographic stage',
    environment: 'futuristic arena, holographic crowd', cameraAngle: 'medium shot', cameraMovement: 'dolly',
    prompt: 'Singer on transparent holographic stage surrounded by digital crowd avatars, laser beams crisscross',
    thumbnailUrl: svgThumb('%23A855F7', '%23FF006E'),
    duration: 24, status: 'init',
    takes: makeTakes('neon-3', [['%23A855F7', '%23FF006E']]),
  },
  {
    id: 'neon-4', index: 3, subject: 'Racer', action: 'drifting through neon tunnels',
    environment: 'underground racing circuit, LED tunnels', cameraAngle: 'chase cam', cameraMovement: 'fast track',
    prompt: 'Sports car drifting through LED tunnel at high speed, motion blur streaks of neon blue and pink',
    thumbnailUrl: svgThumb('%230A0A0F', '%23FF006E'),
    duration: 16, status: 'init',
    takes: makeTakes('neon-4', [['%230A0A0F', '%23FF006E']]),
  },
  {
    id: 'neon-5', index: 4, subject: 'Group', action: 'celebrating on a bridge',
    environment: 'illuminated suspension bridge, city below', cameraAngle: 'aerial drone', cameraMovement: 'ascend',
    prompt: 'Group dancing on lit suspension bridge, city lights below, drone pulling back to reveal full skyline',
    thumbnailUrl: svgThumb('%2300F5D4', '%23A855F7'),
    duration: 22, status: 'init',
    takes: makeTakes('neon-5', [['%2300F5D4', '%23A855F7']]),
  },
  {
    id: 'neon-6', index: 5, subject: 'Singer', action: 'fading into pixel rain',
    environment: 'black void, falling code rain', cameraAngle: 'straight on', cameraMovement: 'zoom out',
    prompt: 'Singer dissolving into cascading digital pixel rain, Matrix-style code in neon pink on black void',
    thumbnailUrl: svgThumb('%23FF006E', '%230A0A0F'),
    duration: 20, status: 'init',
    takes: makeTakes('neon-6', [['%23FF006E', '%230A0A0F']]),
  },
]

// --- Project 3: Ocean Dreams (10 scenes, rendering, BPM 96) ---
const oceanScenes: MockScene[] = [
  {
    id: 'ocean-1', index: 0, subject: 'Woman', action: 'walking on empty beach at dawn',
    environment: 'misty beach, golden sunrise', cameraAngle: 'wide shot', cameraMovement: 'slow pan',
    prompt: 'Woman walking alone on misty beach at dawn, golden light breaking the horizon, footprints in wet sand',
    thumbnailUrl: svgThumb('%230EA5E9', '%2306B6D4'),
    duration: 24, status: 'generating',
    takes: makeTakes('ocean-1', [['%230EA5E9', '%2306B6D4']]),
  },
  {
    id: 'ocean-2', index: 1, subject: 'Diver', action: 'descending into bioluminescent deep',
    environment: 'ocean deep, glowing sea creatures', cameraAngle: 'upward look', cameraMovement: 'slow descent',
    prompt: 'Diver descending into bioluminescent ocean, glowing jellyfish and fish surrounding them, dark blue abyss',
    thumbnailUrl: svgThumb('%231E3A8A', '%2306B6D4'),
    duration: 22, status: 'generating',
    takes: makeTakes('ocean-2', [['%231E3A8A', '%2306B6D4']]),
  },
  {
    id: 'ocean-3', index: 2, subject: 'Surfer', action: 'riding giant wave in slow motion',
    environment: 'open ocean, massive swell', cameraAngle: 'side tracking', cameraMovement: 'high speed',
    prompt: 'Surfer riding inside a massive barrel wave in slow motion, water crystal clear, spray frozen in time',
    thumbnailUrl: svgThumb('%2322D3EE', '%230369A1'),
    duration: 18, status: 'completed',
    takes: makeTakes('ocean-3', [['%2322D3EE', '%230369A1'], ['%2306B6D4', '%231E40AF']]),
  },
  {
    id: 'ocean-4', index: 3, subject: 'Woman', action: 'floating on still water',
    environment: 'turquoise lagoon, tropical island', cameraAngle: 'overhead aerial', cameraMovement: 'slow circle',
    prompt: 'Woman floating on perfectly still turquoise lagoon water, tropical palms on distant shore, aerial view',
    thumbnailUrl: svgThumb('%2310B981', '%2306B6D4'),
    duration: 26, status: 'completed',
    takes: makeTakes('ocean-4', [['%2310B981', '%2306B6D4'], ['%23059669', '%230EA5E9']]),
  },
  {
    id: 'ocean-5', index: 4, subject: 'Band', action: 'performing on a shipwreck',
    environment: 'partially sunken ship, ocean sunset', cameraAngle: 'medium wide', cameraMovement: 'crane sweep',
    prompt: 'Band performing on deck of shipwreck half-submerged at sunset, orange sky reflecting on water',
    thumbnailUrl: svgThumb('%23F97316', '%230EA5E9'),
    duration: 28, status: 'completed',
    takes: makeTakes('ocean-5', [['%23F97316', '%230EA5E9'], ['%23EA580C', '%2306B6D4']]),
  },
  {
    id: 'ocean-6', index: 5, subject: 'Mermaid figure', action: 'leaping through sea foam',
    environment: 'rocky sea cliffs, crashing waves', cameraAngle: 'close tracking', cameraMovement: 'fast follow',
    prompt: 'Mermaid-like dancer leaping through sea foam at base of rocky cliffs, ethereal fabric trailing',
    thumbnailUrl: svgThumb('%238B5CF6', '%2306B6D4'),
    duration: 16, status: 'generating',
    takes: makeTakes('ocean-6', [['%238B5CF6', '%2306B6D4']]),
  },
  {
    id: 'ocean-7', index: 6, subject: 'Couple', action: 'kissing on a rain-swept pier',
    environment: 'old wooden pier, stormy sea', cameraAngle: 'medium shot', cameraMovement: 'handheld',
    prompt: 'Couple kissing on weathered pier as storm rolls in, waves crashing below, dramatic clouds overhead',
    thumbnailUrl: svgThumb('%23475569', '%230EA5E9'),
    duration: 24, status: 'generating',
    takes: makeTakes('ocean-7', [['%23475569', '%230EA5E9']]),
  },
  {
    id: 'ocean-8', index: 7, subject: 'Singer', action: 'standing in ocean up to waist',
    environment: 'wide open ocean, golden hour', cameraAngle: 'front medium', cameraMovement: 'dolly in',
    prompt: 'Singer standing waist deep in golden-hour ocean, sun behind them, gentle waves, soulful expression',
    thumbnailUrl: svgThumb('%23F59E0B', '%2306B6D4'),
    duration: 22, status: 'completed',
    takes: makeTakes('ocean-8', [['%23F59E0B', '%2306B6D4'], ['%23D97706', '%230891B2']]),
  },
  {
    id: 'ocean-9', index: 8, subject: 'Children', action: 'running along shoreline',
    environment: 'wide sandy beach, clear sky', cameraAngle: 'low wide', cameraMovement: 'lateral track',
    prompt: 'Children running along sparkling shoreline, seagulls overhead, carefree joy, slow motion',
    thumbnailUrl: svgThumb('%23FDE68A', '%2306B6D4'),
    duration: 20, status: 'init',
    takes: makeTakes('ocean-9', [['%23FDE68A', '%2306B6D4']]),
  },
  {
    id: 'ocean-10', index: 9, subject: 'Woman', action: 'watching the stars from the ocean',
    environment: 'night ocean, milky way sky', cameraAngle: 'reverse angle tilt', cameraMovement: 'slow tilt up',
    prompt: 'Woman floating in night ocean gazing up at Milky Way, star reflections in the calm water below',
    thumbnailUrl: svgThumb('%231E1B4B', '%2306B6D4'),
    duration: 28, status: 'init',
    takes: makeTakes('ocean-10', [['%231E1B4B', '%2306B6D4']]),
  },
]

export const mockProjects: MockProject[] = [
  {
    id: 'project-cosmic',
    title: 'Cosmic Love Story',
    description: 'Aria and Kael — separated by a wormhole collapse, guided by a mysterious signal, reunited at the edge of the universe. An epic space romance in 8 scenes.',
    status: 'complete',
    scenes: cosmicScenes,
    audio: cosmicLoveAudio,
    createdAt: '2026-02-15T10:30:00Z',
    thumbnailUrl: '/assets/scenes/scene-04-moon-dance.jpg',
  },
  {
    id: 'project-neon',
    title: 'Neon City Nights',
    description: 'A high-energy cyberpunk adventure through electric city streets',
    status: 'draft',
    scenes: neonScenes,
    audio: neonCityAudio,
    createdAt: '2026-02-28T16:45:00Z',
    thumbnailUrl: svgThumb('%23FF006E', '%2300F5D4'),
  },
  {
    id: 'project-ocean',
    title: 'Ocean Dreams',
    description: 'A serene journey through the many moods of the ocean and sea',
    status: 'rendering',
    scenes: oceanScenes,
    audio: oceanDreamsAudio,
    createdAt: '2026-03-01T08:00:00Z',
    thumbnailUrl: svgThumb('%230EA5E9', '%2310B981'),
  },
]

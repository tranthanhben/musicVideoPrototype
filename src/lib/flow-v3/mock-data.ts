import type { Storyline, MoodImage, VfxPreset, VisualConcept } from './types'

function encode(color: string): string {
  return color.replace(/#/g, '%23')
}

function svgThumb(from: string, to: string): string {
  const f = encode(from)
  const t = encode(to)
  return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${f}"/><stop offset="100%" style="stop-color:${t}"/></linearGradient></defs><rect width="400" height="300" fill="url(%23g)"/></svg>`
}

export function makeSvgThumb(from: string, to: string): string {
  return svgThumb(from, to)
}

export const MV_TYPES = [
  { id: 'full_mv' as const, label: 'Full Music Video', description: 'Narrative and performance scenes combined.', vinylColors: ['#7C3AED', '#A855F7'] },
  { id: 'performance' as const, label: 'Performance', description: '100% lip-sync performance scenes.', vinylColors: ['#EF4444', '#F43F5E'] },
  { id: 'lyrics' as const, label: 'Lyrics Video', description: 'A lyric version of your song.', vinylColors: ['#F59E0B', '#EAB308'] },
  { id: 'dance' as const, label: 'Dance video', description: 'A dance version of your song.', vinylColors: ['#EC4899', '#F97316'] },
  { id: 'visualizer' as const, label: 'Visualizer', description: 'Looping visuals synced to the beat.', vinylColors: ['#10B981', '#22C55E'] },
]

export const RENDER_MODES = [
  { id: 'realistic' as const, label: 'Realistic', description: 'Real people & live-action scenes', gradientFrom: '#1E1B4B', gradientTo: '#7C3AED' },
  { id: '3d' as const, label: '3D Animation', description: 'Pixar/Blender-style 3D renders', gradientFrom: '#06B6D4', gradientTo: '#22D3EE' },
  { id: '2d' as const, label: '2D Animation', description: 'Flat art & cel-style animation', gradientFrom: '#F59E0B', gradientTo: '#F97316' },
  { id: 'anime' as const, label: 'Anime', description: 'Japanese animation aesthetic', gradientFrom: '#EC4899', gradientTo: '#A855F7' },
]

export const MOCK_STORYLINES: Storyline[] = [
  {
    id: 'celestial-journey',
    title: 'Celestial Journey',
    description: 'Aria and Kael — separated by a wormhole collapse, guided by a mysterious heartbeat signal across nebulae and star systems. Two souls reunited at the edge of the observable universe.',
    sceneCount: 8,
    tone: 'Ethereal & Romantic',
    thumbnailColors: ['#7C3AED', '#22D3EE'],
    thumbnailUrl: '/assets/storylines/celestial-journey.jpg',
  },
  {
    id: 'urban-pulse',
    title: 'Urban Pulse',
    description: 'A dancer channels the city\'s midnight energy through rain-slicked alleys, underground clubs, and neon-lit rooftops. The rhythm of the concrete jungle becomes her heartbeat.',
    sceneCount: 6,
    tone: 'Energetic & Bold',
    thumbnailColors: ['#EC4899', '#F97316'],
    thumbnailUrl: '/assets/storylines/urban-pulse.jpg',
  },
  {
    id: 'ocean-memory',
    title: 'Ocean Memory',
    description: 'A woman traces fading memories through seaside landscapes — misty dawn beaches, bioluminescent midnight waters, and the paper boats she once set adrift. The tide carries what was lost, and what remains.',
    sceneCount: 10,
    tone: 'Nostalgic & Serene',
    thumbnailColors: ['#0EA5E9', '#10B981'],
    thumbnailUrl: '/assets/storylines/ocean-memory.jpg',
  },
]

export const MOCK_STORYLINE_TEXT = `Aria floats alone in a violet nebula after their crystal ship shatters. A signal pulses from her chest — the same frequency Kael tracks from his cockpit. They chase each other through asteroid fields and spiraling wormholes, almost touching on a silver moon but passing through like holograms. Kael finally breaches Saturn's rings, their hands connect for real, and a shockwave of light ripples through the cosmos — their embrace creating a new star.`

export const MOCK_CONCEPTS: VisualConcept[] = [
  {
    id: 'vintage-romance',
    title: 'Vintage Romance',
    thumbnailColors: ['#D97706', '#78350F'],
    thumbnailUrl: '/assets/concepts/vintage-romance.jpg',
    details: {
      themes: ['New Romance', 'Infatuation', 'Daydreaming', 'Golden Nostalgia', 'First Love'],
      colorPalette: [
        { hex: '#D97706', name: 'Amber' },
        { hex: '#FBBF24', name: 'Golden' },
        { hex: '#78350F', name: 'Sepia' },
        { hex: '#FEF3C7', name: 'Cream' },
        { hex: '#92400E', name: 'Burnt Sienna' },
      ],
      characterStyle: ['Flowing linen outfits', 'Barefoot on sand', 'Wind-swept hair', 'Soft natural makeup'],
      lightingStyle: 'Warm golden hour light with soft lens flares, as seen in the Dream Dance scene. Backlit silhouettes during the supernova sequence. Film-like halation around the signal light creating a nostalgic, dreamlike quality.',
      cinematography: ['Slow dolly shots along the shoreline', 'Close-up details: hands intertwining, sand between toes', 'Wide establishing shots of the coastal town at magic hour', 'Handheld intimate moments with shallow depth of field', 'Slow-motion hair and fabric movement in wind'],
    },
  },
  {
    id: 'modern-euphoria',
    title: 'Modern Euphoria',
    thumbnailColors: ['#7C3AED', '#EC4899'],
    thumbnailUrl: '/assets/concepts/modern-euphoria.jpg',
    details: {
      themes: ['Energetic', 'Bold', 'Electric', 'Vibrant Youth', 'Ecstasy'],
      colorPalette: [
        { hex: '#7C3AED', name: 'Violet' },
        { hex: '#EC4899', name: 'Hot Pink' },
        { hex: '#06B6D4', name: 'Cyan' },
        { hex: '#F0ABFC', name: 'Lavender' },
        { hex: '#1E1B4B', name: 'Deep Indigo' },
      ],
      characterStyle: ['Metallic and iridescent fabrics', 'Bold editorial makeup', 'Geometric accessories', 'Avant-garde silhouettes'],
      lightingStyle: 'Saturated neon washes of violet and pink from the wormhole sequences. Hard directional light creating dramatic shadows as Kael navigates. Strobing during chorus energy peaks. Practical crystal ship reflections throughout.',
      cinematography: ['Fast-paced whip pans synced to beats', 'Dutch angles during emotional intensity', 'Drone ascending shots revealing the coastal town at night', 'Split-screen parallel moments', 'Smooth steadicam dance sequences'],
    },
  },
  {
    id: 'dreamy-pastoral',
    title: 'Dreamy Pastoral',
    thumbnailColors: ['#10B981', '#D97706'],
    thumbnailUrl: '/assets/concepts/dreamy-pastoral.jpg',
    details: {
      themes: ['Serenity', 'Nature', 'Reflection', 'Organic Beauty', 'Timelessness'],
      colorPalette: [
        { hex: '#10B981', name: 'Emerald' },
        { hex: '#D97706', name: 'Honey' },
        { hex: '#F5F5DC', name: 'Ivory' },
        { hex: '#065F46', name: 'Deep Green' },
        { hex: '#FDE68A', name: 'Buttercup' },
      ],
      characterStyle: ['Earth-toned flowing dresses', 'Flower crowns and natural elements', 'Minimal jewelry', 'Freckles and sun-kissed skin'],
      lightingStyle: 'Diffused cosmic light filtering through nebula gases. Dappled starlight through crystal debris. The golden glow emanating from the final embrace. Particle effects from comet tail creating a fairy-tale luminescence.',
      cinematography: ['Slow crane shots rising above wildflower fields', 'Macro inserts: dewdrops, petals, grass blades', 'Long lens compression of layered landscapes', 'Gentle tracking shots through meadows', 'Time-lapse clouds and shifting light'],
    },
  },
]

export const MOCK_CONCEPTS_ALT: VisualConcept[] = [
  {
    id: 'noir-cinematic',
    title: 'Noir Cinematic',
    thumbnailColors: ['#1E1B4B', '#78716C'],
    thumbnailUrl: '/assets/concepts/noir-cinematic.jpg',
    details: {
      themes: ['Mystery', 'Longing', 'Shadows', 'Unspoken Desire', 'Midnight Confessions'],
      colorPalette: [
        { hex: '#1E1B4B', name: 'Midnight' },
        { hex: '#78716C', name: 'Stone' },
        { hex: '#F5F5F4', name: 'Silver' },
        { hex: '#292524', name: 'Charcoal' },
        { hex: '#DC2626', name: 'Crimson Accent' },
      ],
      characterStyle: ['Tailored dark clothing', 'Rain-soaked trench coats', 'Dramatic collars and sharp lines', 'Smudged eyeliner'],
      lightingStyle: 'High-contrast chiaroscuro lighting. Single-source overhead lamps. Rain-streaked window shadows on faces. Occasional flashes of red neon cutting through monochrome scenes.',
      cinematography: ['Dutch angles in narrow alleyways', 'Reflection shots in puddles and glass', 'Slow zoom-ins on expressive eyes', 'Long static wide shots with subject movement', 'Smoke and fog diffusion layers'],
    },
  },
  {
    id: 'tropical-fever',
    title: 'Tropical Fever',
    thumbnailColors: ['#F97316', '#22D3EE'],
    thumbnailUrl: '/assets/concepts/tropical-fever.jpg',
    details: {
      themes: ['Paradise', 'Heat', 'Rhythm', 'Wild Freedom', 'Sun-Drunk'],
      colorPalette: [
        { hex: '#F97316', name: 'Tangerine' },
        { hex: '#22D3EE', name: 'Ocean Blue' },
        { hex: '#FACC15', name: 'Sunflower' },
        { hex: '#16A34A', name: 'Palm Green' },
        { hex: '#FF006E', name: 'Fuchsia' },
      ],
      characterStyle: ['Vibrant printed fabrics', 'Tropical flowers in hair', 'Body shimmer and bronzer', 'Barefoot with ankle bracelets'],
      lightingStyle: 'Blazing direct sunlight with strong lens flares. Warm color temperature throughout. Underwater caustic light patterns. Sunset backlighting creating orange-rimmed silhouettes.',
      cinematography: ['Sweeping aerial shots of turquoise coastline', 'Underwater slow-motion swimming sequences', 'Close-up water droplets on skin', 'Rhythmic editing synced to percussion', 'Crash zoom during chorus drops'],
    },
  },
  {
    id: 'ethereal-fantasy',
    title: 'Ethereal Fantasy',
    thumbnailColors: ['#A855F7', '#F0ABFC'],
    thumbnailUrl: '/assets/concepts/ethereal-fantasy.jpg',
    details: {
      themes: ['Otherworldly', 'Magic', 'Transcendence', 'Cosmic Love', 'Dreamwalking'],
      colorPalette: [
        { hex: '#A855F7', name: 'Amethyst' },
        { hex: '#F0ABFC', name: 'Orchid' },
        { hex: '#E0E7FF', name: 'Moonstone' },
        { hex: '#4338CA', name: 'Royal Blue' },
        { hex: '#FDE68A', name: 'Stardust' },
      ],
      characterStyle: ['Sheer layered gowns', 'Glowing body paint accents', 'Crystalline accessories', 'Hair with subtle sparkle effects'],
      lightingStyle: 'Soft diffused glow emanating from within subjects. Bioluminescent blues and purples in dark scenes. Floating particle lights. Prismatic rainbow refractions during climactic moments.',
      cinematography: ['Floating camera movements defying gravity', 'Mirror and kaleidoscope reflections', 'Extreme slow-motion fabric and particle movement', 'Vertigo-style dolly zoom at emotional peaks', 'Seamless morphing transitions between scenes'],
    },
  },
]

export const MOCK_MOOD_IMAGES: MoodImage[] = [
  { id: 'mood-1', label: 'Warm golden hour', category: 'color', colors: ['#F59E0B', '#EF4444'], approved: false, imageUrl: '/assets/mood-board/color-warm-golden.jpg' },
  { id: 'mood-2', label: 'Cool cosmic tones', category: 'color', colors: ['#7C3AED', '#06B6D4'], approved: false, imageUrl: '/assets/mood-board/color-cool-cosmic.jpg' },
  { id: 'mood-3', label: 'Deep ocean blues', category: 'color', colors: ['#1E3A8A', '#0EA5E9'], approved: false, imageUrl: '/assets/mood-board/color-ocean-blues.jpg' },
  { id: 'mood-4', label: 'Melancholic & dreamy', category: 'mood', colors: ['#8B5CF6', '#EC4899'], approved: false, imageUrl: '/assets/mood-board/mood-melancholic.jpg' },
  { id: 'mood-5', label: 'Euphoric & uplifting', category: 'mood', colors: ['#22D3EE', '#10B981'], approved: false, imageUrl: '/assets/mood-board/mood-euphoric.jpg' },
  { id: 'mood-6', label: 'Tense & cinematic', category: 'mood', colors: ['#1E1B4B', '#EF4444'], approved: false, imageUrl: '/assets/mood-board/mood-cinematic.jpg' },
  { id: 'mood-7', label: 'Urban nightscape', category: 'scene', colors: ['#0A0A0F', '#FF006E'], approved: false, imageUrl: '/assets/mood-board/scene-space-station.jpg' },
  { id: 'mood-8', label: 'Vast open landscape', category: 'scene', colors: ['#10B981', '#F59E0B'], approved: false, imageUrl: '/assets/mood-board/scene-vast-starfield.jpg' },
  { id: 'mood-9', label: 'Intimate close-up', category: 'scene', colors: ['#EC4899', '#A855F7'], approved: false, imageUrl: '/assets/mood-board/scene-intimate-portrait.jpg' },
]

export const VISUAL_PROPERTIES = [
  {
    id: 'lighting',
    label: 'Lighting Style',
    options: [
      { id: 'natural', label: 'Natural' },
      { id: 'dramatic', label: 'Dramatic' },
      { id: 'neon', label: 'Neon / LED' },
      { id: 'golden-hour', label: 'Golden Hour' },
    ],
  },
  {
    id: 'camera',
    label: 'Camera Style',
    options: [
      { id: 'cinematic', label: 'Cinematic' },
      { id: 'handheld', label: 'Handheld' },
      { id: 'drone', label: 'Drone / Aerial' },
      { id: 'steadicam', label: 'Steadicam' },
    ],
  },
  {
    id: 'grading',
    label: 'Color Grading',
    options: [
      { id: 'teal-orange', label: 'Teal & Orange' },
      { id: 'desaturated', label: 'Desaturated' },
      { id: 'vibrant', label: 'Vibrant Pop' },
      { id: 'monochrome', label: 'Monochrome' },
    ],
  },
]

export const VFX_PRESETS: VfxPreset[] = [
  { id: 'cosmic-cinema', label: 'Cosmic Cinema', description: 'Film grain + lens flares + subtle glow', accentColor: '#7C3AED' },
  { id: 'neon-glow', label: 'Neon Glow', description: 'Bloom + color bleeding + chromatic aberration', accentColor: '#EC4899' },
  { id: 'film-noir', label: 'Film Noir', description: 'High contrast + vignette + desaturation', accentColor: '#78716C' },
  { id: 'dreamy-soft', label: 'Dreamy Soft', description: 'Soft focus + warm tint + light leaks', accentColor: '#F59E0B' },
  { id: 'clean-pop', label: 'Clean Pop', description: 'Saturated + sharp + bright', accentColor: '#22D3EE' },
  { id: 'vintage-16mm', label: 'Vintage 16mm', description: 'Heavy grain + jitter + color fade', accentColor: '#92400E' },
]

export const TRANSITION_TYPES = [
  { id: 'cut', label: 'Hard Cut' },
  { id: 'crossfade', label: 'Crossfade' },
  { id: 'whip-pan', label: 'Whip Pan' },
  { id: 'beat-sync', label: 'Beat-Synced' },
  { id: 'morph', label: 'AI Morph' },
]

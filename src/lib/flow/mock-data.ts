import type { Storyline, MoodImage, VfxPreset } from './types'

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
  { id: 'dance' as const, label: 'Dance', icon: '💃', description: 'Choreography-driven visuals synced to beat and rhythm', accentColor: '#EC4899' },
  { id: 'performance' as const, label: 'Performance', icon: '🎤', description: 'Stage, concert, or live performance energy', accentColor: '#EF4444' },
  { id: 'lyrics' as const, label: 'Lyrics Video', icon: '📝', description: 'Typography-focused with lipsync and text animations', accentColor: '#F59E0B' },
  { id: 'visual' as const, label: 'Visual / Art', icon: '🎨', description: 'Abstract art, patterns, and experimental visuals', accentColor: '#06B6D4' },
  { id: 'narrative' as const, label: 'Narrative', icon: '🎬', description: 'Story-driven with characters, plot, and emotion arcs', accentColor: '#7C3AED' },
  { id: 'abstract' as const, label: 'Abstract', icon: '✨', description: 'Non-representational, shape-shifting, generative art', accentColor: '#10B981' },
]

export const RENDER_MODES = [
  { id: 'realistic' as const, label: 'Realistic', description: 'Photorealistic cinematic quality', gradientFrom: '#1E1B4B', gradientTo: '#7C3AED' },
  { id: '3d' as const, label: '3D Animation', description: 'Pixar/Blender-style 3D renders', gradientFrom: '#06B6D4', gradientTo: '#22D3EE' },
  { id: 'anime' as const, label: 'Anime', description: 'Japanese animation aesthetic', gradientFrom: '#EC4899', gradientTo: '#A855F7' },
  { id: 'stylized' as const, label: 'Stylized', description: 'Painterly, watercolor, or illustrated', gradientFrom: '#F59E0B', gradientTo: '#10B981' },
]

export const MOCK_STORYLINES: Storyline[] = [
  {
    id: 'celestial-journey',
    title: 'Celestial Journey',
    description: 'A cosmic love story unfolding across nebulae and star systems. Two souls connected by light, separated by gravity, reunited at the edge of the universe.',
    sceneCount: 8,
    tone: 'Ethereal & Romantic',
    thumbnailColors: ['#7C3AED', '#22D3EE'],
    thumbnailUrl: '/assets/storylines/celestial-journey.jpg',
  },
  {
    id: 'urban-pulse',
    title: 'Urban Pulse',
    description: 'Neon-soaked city streets come alive at night. A dancer moves through rain-slicked alleys, rooftops, and underground clubs, channeling the city\'s energy.',
    sceneCount: 6,
    tone: 'Energetic & Bold',
    thumbnailColors: ['#EC4899', '#F97316'],
    thumbnailUrl: '/assets/storylines/urban-pulse.jpg',
  },
  {
    id: 'ocean-memory',
    title: 'Ocean Memory',
    description: 'Memories wash ashore like waves. A woman traces her past through seaside landscapes — from misty dawn beaches to bioluminescent midnight waters.',
    sceneCount: 10,
    tone: 'Nostalgic & Serene',
    thumbnailColors: ['#0EA5E9', '#10B981'],
    thumbnailUrl: '/assets/storylines/ocean-memory.jpg',
  },
]

export const MOCK_MOOD_IMAGES: MoodImage[] = [
  { id: 'mood-1', label: 'Warm golden hour', category: 'color', colors: ['#F59E0B', '#EF4444'], approved: false, url: '/assets/mood-board/color-warm-golden.jpg' },
  { id: 'mood-2', label: 'Cool cosmic tones', category: 'color', colors: ['#7C3AED', '#06B6D4'], approved: false, url: '/assets/mood-board/color-cool-cosmic.jpg' },
  { id: 'mood-3', label: 'Deep ocean blues', category: 'color', colors: ['#1E3A8A', '#0EA5E9'], approved: false, url: '/assets/mood-board/color-ocean-blues.jpg' },
  { id: 'mood-4', label: 'Melancholic & dreamy', category: 'mood', colors: ['#8B5CF6', '#EC4899'], approved: false, url: '/assets/mood-board/mood-melancholic.jpg' },
  { id: 'mood-5', label: 'Euphoric & uplifting', category: 'mood', colors: ['#22D3EE', '#10B981'], approved: false, url: '/assets/mood-board/mood-euphoric.jpg' },
  { id: 'mood-6', label: 'Tense & cinematic', category: 'mood', colors: ['#1E1B4B', '#EF4444'], approved: false, url: '/assets/mood-board/mood-cinematic.jpg' },
  { id: 'mood-7', label: 'Urban nightscape', category: 'scene', colors: ['#0A0A0F', '#FF006E'], approved: false, url: '/assets/mood-board/scene-space-station.jpg' },
  { id: 'mood-8', label: 'Vast open landscape', category: 'scene', colors: ['#10B981', '#F59E0B'], approved: false, url: '/assets/mood-board/scene-vast-starfield.jpg' },
  { id: 'mood-9', label: 'Intimate close-up', category: 'scene', colors: ['#EC4899', '#A855F7'], approved: false, url: '/assets/mood-board/scene-intimate-portrait.jpg' },
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

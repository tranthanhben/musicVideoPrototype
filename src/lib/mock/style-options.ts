// Style, mood, genre, and palette options for creative direction

export interface StyleOption {
  id: string
  label: string
  description: string
  gradientFrom: string
  gradientTo: string
}

export interface PaletteOption {
  id: string
  label: string
  colors: string[]
}

export const VIDEO_STYLES: StyleOption[] = [
  { id: 'cinematic', label: 'Cinematic', description: 'Film-quality shots with dramatic lighting', gradientFrom: '#7C3AED', gradientTo: '#1E1B4B' },
  { id: 'anime', label: 'Anime', description: 'Japanese animation aesthetic', gradientFrom: '#EC4899', gradientTo: '#8B5CF6' },
  { id: 'abstract', label: 'Abstract', description: 'Non-representational visual poetry', gradientFrom: '#06B6D4', gradientTo: '#10B981' },
  { id: 'documentary', label: 'Documentary', description: 'Raw, authentic footage feel', gradientFrom: '#78716C', gradientTo: '#292524' },
  { id: 'performance', label: 'Performance', description: 'Stage & concert energy', gradientFrom: '#EF4444', gradientTo: '#F59E0B' },
  { id: 'surreal', label: 'Surreal', description: 'Dreamlike, impossible environments', gradientFrom: '#A855F7', gradientTo: '#22D3EE' },
]

export const MOOD_OPTIONS: StyleOption[] = [
  { id: 'dark', label: 'Dark & Moody', description: 'Shadows, tension, mystery', gradientFrom: '#1E1B4B', gradientTo: '#581C87' },
  { id: 'ethereal', label: 'Ethereal', description: 'Floating, dreamlike, celestial', gradientFrom: '#8B5CF6', gradientTo: '#22D3EE' },
  { id: 'energetic', label: 'Energetic', description: 'High-tempo, vibrant, explosive', gradientFrom: '#EF4444', gradientTo: '#F59E0B' },
  { id: 'romantic', label: 'Romantic', description: 'Warm, intimate, emotional', gradientFrom: '#EC4899', gradientTo: '#F97316' },
  { id: 'nostalgic', label: 'Nostalgic', description: 'Vintage warmth, faded memories', gradientFrom: '#D97706', gradientTo: '#92400E' },
  { id: 'futuristic', label: 'Futuristic', description: 'Sci-fi, neon, technology', gradientFrom: '#06B6D4', gradientTo: '#7C3AED' },
]

export const GENRE_OPTIONS: StyleOption[] = [
  { id: 'pop-mv', label: 'Pop MV', description: 'Clean edits, vibrant colors, choreography', gradientFrom: '#EC4899', gradientTo: '#F59E0B' },
  { id: 'hiphop', label: 'Hip-Hop Visual', description: 'Urban, bold, street culture', gradientFrom: '#EF4444', gradientTo: '#1E1B4B' },
  { id: 'indie-art', label: 'Indie Art Film', description: 'Artistic, slow-paced, symbolic', gradientFrom: '#10B981', gradientTo: '#6366F1' },
  { id: 'edm', label: 'EDM Visual', description: 'Strobes, particles, festival energy', gradientFrom: '#22D3EE', gradientTo: '#A855F7' },
  { id: 'lofi', label: 'Lo-fi Aesthetic', description: 'Cozy, warm grain, hand-drawn feel', gradientFrom: '#F59E0B', gradientTo: '#78716C' },
  { id: 'rock', label: 'Rock / Alt', description: 'Gritty, raw, band performance', gradientFrom: '#DC2626', gradientTo: '#292524' },
]

export const PALETTE_OPTIONS: PaletteOption[] = [
  { id: 'cosmic', label: 'Cosmic Violet', colors: ['#7C3AED', '#A855F7', '#22D3EE', '#06B6D4'] },
  { id: 'neon', label: 'Neon Night', colors: ['#EC4899', '#FF006E', '#00F5D4', '#06B6D4'] },
  { id: 'golden', label: 'Golden Hour', colors: ['#F59E0B', '#F97316', '#EF4444', '#92400E'] },
  { id: 'ocean', label: 'Ocean Deep', colors: ['#0EA5E9', '#06B6D4', '#10B981', '#1E3A8A'] },
  { id: 'monochrome', label: 'Monochrome', colors: ['#FFFFFF', '#A1A1AA', '#52525B', '#18181B'] },
  { id: 'pastel', label: 'Pastel Dream', colors: ['#F9A8D4', '#C4B5FD', '#A5F3FC', '#FDE68A'] },
]

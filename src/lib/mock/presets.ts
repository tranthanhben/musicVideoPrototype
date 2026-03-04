import type { VibePreset } from './types'

export const vibePresets: VibePreset[] = [
  {
    id: 'dreamy',
    name: 'Dreamy',
    description: 'Soft pastels, ethereal glows, and floating textures',
    gradient: 'linear-gradient(135deg, #a78bfa 0%, #f9a8d4 50%, #93c5fd 100%)',
    icon: '✨',
  },
  {
    id: 'energetic',
    name: 'Energetic',
    description: 'Bold colors, fast cuts, and explosive motion',
    gradient: 'linear-gradient(135deg, #f97316 0%, #ef4444 50%, #facc15 100%)',
    icon: '⚡',
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Deep shadows, high contrast, and moody atmosphere',
    gradient: 'linear-gradient(135deg, #18181b 0%, #3f3f46 50%, #1c1917 100%)',
    icon: '🌑',
  },
  {
    id: 'retro',
    name: 'Retro',
    description: 'Warm film grain, VHS vibes, and 80s color palettes',
    gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 30%, #78350f 60%, #92400e 100%)',
    icon: '📼',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Neon glitches, holographic surfaces, and electric energy',
    gradient: 'linear-gradient(135deg, #FF006E 0%, #8B5CF6 50%, #00F5D4 100%)',
    icon: '🤖',
  },
  {
    id: 'lo-fi',
    name: 'Lo-fi',
    description: 'Muted tones, soft textures, and chill atmosphere',
    gradient: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 40%, #d1d5db 100%)',
    icon: '🎧',
  },
]

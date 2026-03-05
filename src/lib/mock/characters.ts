// Mock character archetypes for the prototype

function svgAvatar(from: string, to: string): string {
  return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${from}"/><stop offset="100%" style="stop-color:${to}"/></linearGradient></defs><rect width="200" height="200" rx="20" fill="url(%23g)"/></svg>`
}

export interface CharacterArchetype {
  id: string
  name: string
  role: string
  description: string
  avatarUrl: string
  tags: string[]
  accentColor: string
}

export const CHARACTER_ARCHETYPES: CharacterArchetype[] = [
  {
    id: 'mysterious-singer', name: 'Mysterious Singer', role: 'Lead',
    description: 'Enigmatic vocalist surrounded by shadow and light',
    avatarUrl: svgAvatar('%237C3AED', '%231E1B4B'),
    tags: ['vocal', 'dramatic', 'solo'], accentColor: '#7C3AED',
  },
  {
    id: 'urban-dancer', name: 'Urban Dancer', role: 'Lead',
    description: 'Street-style performer with fluid choreography',
    avatarUrl: svgAvatar('%23EC4899', '%23F97316'),
    tags: ['dance', 'energy', 'urban'], accentColor: '#EC4899',
  },
  {
    id: 'space-explorer', name: 'Space Explorer', role: 'Lead',
    description: 'Astronaut discovering cosmic landscapes',
    avatarUrl: svgAvatar('%2306B6D4', '%237C3AED'),
    tags: ['sci-fi', 'adventure', 'solo'], accentColor: '#06B6D4',
  },
  {
    id: 'romantic-couple', name: 'Romantic Couple', role: 'Duo',
    description: 'Two lovers in an emotional journey together',
    avatarUrl: svgAvatar('%23EC4899', '%23A855F7'),
    tags: ['romance', 'duo', 'emotional'], accentColor: '#EC4899',
  },
  {
    id: 'band-group', name: 'Band / Group', role: 'Group',
    description: 'Musicians performing together on stage or location',
    avatarUrl: svgAvatar('%23EF4444', '%23F59E0B'),
    tags: ['performance', 'group', 'live'], accentColor: '#EF4444',
  },
  {
    id: 'abstract-figure', name: 'Abstract Figure', role: 'Conceptual',
    description: 'Non-human silhouette or shape-shifting form',
    avatarUrl: svgAvatar('%2322D3EE', '%2310B981'),
    tags: ['abstract', 'conceptual', 'art'], accentColor: '#22D3EE',
  },
  {
    id: 'anime-hero', name: 'Anime Hero', role: 'Lead',
    description: 'Stylized animated protagonist with expressive features',
    avatarUrl: svgAvatar('%23A855F7', '%23EC4899'),
    tags: ['anime', 'stylized', 'action'], accentColor: '#A855F7',
  },
  {
    id: 'nature-spirit', name: 'Nature Spirit', role: 'Conceptual',
    description: 'Elemental being connected to earth, water, or fire',
    avatarUrl: svgAvatar('%2310B981', '%23F59E0B'),
    tags: ['nature', 'ethereal', 'elemental'], accentColor: '#10B981',
  },
]

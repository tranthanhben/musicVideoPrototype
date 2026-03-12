# Phase 4: Style & Creative Preferences View

## Context
- Depends on: Phase 1, Phase 3
- After analysis approval, user picks style/mood/category/palette before AI generates storylines

## Overview
- **Priority**: P1
- **Status**: pending
- Full-screen style picker with 4 selection categories: Video Style, Mood/Tone, Category/Genre, Color Palette

## Requirements

### Functional
- **Video Style** (pick 1): Cinematic, Anime, Abstract, Documentary, Performance, Lyric Video
  - Each option: gradient thumbnail, title, short description
  - Selected state: ring highlight + check
- **Mood/Tone** (pick 1-2): Dark, Ethereal, Energetic, Romantic, Nostalgic, Futuristic, Dreamy, Raw
  - Tag/chip selection UI
- **Category/Genre** (pick 1): Pop MV, Hip-Hop Visual, Indie Art Film, EDM Visual, Lo-fi Aesthetic, Rock Performance
  - Horizontal scroll card row
- **Color Palette** (pick 1): 5 preset palettes shown as gradient swatches
  - Each swatch: 4-5 color circles + palette name
- "Continue" button at bottom (disabled until all 4 categories have selection)
- Selections stored in local component state (not persisted — prototype)

### Non-functional
- Smooth scroll, framer-motion stagger animations on mount
- Visual previews make each option immediately recognizable
- Under 200 lines — split into sub-components if needed

## Architecture

### Layout
```
┌──────────────────────────────┐
│  Style & Creative Direction  │
│  ─────────────────────────   │
│                              │
│  VIDEO STYLE                 │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ │
│  │🎬│ │🎌│ │🎨│ │📹│ │🎤│ │
│  └──┘ └──┘ └──┘ └──┘ └──┘ │
│                              │
│  MOOD / TONE                 │
│  [Dark] [Ethereal] [Energetic│
│   ] [Romantic] [Nostalgic]   │
│                              │
│  GENRE                       │
│  ┌────┐ ┌────┐ ┌────┐      │
│  │Pop │ │HipH│ │Indi│      │
│  └────┘ └────┘ └────┘      │
│                              │
│  COLOR PALETTE               │
│  ⚫⚫⚫⚫ Cosmic Violet    │
│  ⚫⚫⚫⚫ Neon Nights      │
│  ⚫⚫⚫⚫ Ocean Breeze     │
│                              │
│  [Continue →]                │
└──────────────────────────────┘
```

## Related Code Files

### Create
- `src/components/monitor/workspace-views/style-selection-view.tsx` — main view
- `src/lib/mock/style-options.ts` — mock data for all style/mood/category/palette options

### Modify
- `src/components/monitor/monitor-workspace.tsx` — import + register
- `src/app/monitor/page.tsx` — handle `confirm_style` action

## Implementation Steps

### 1. Create Mock Data File: `style-options.ts`
```typescript
export interface StyleOption {
  id: string
  label: string
  description: string
  gradientFrom: string
  gradientTo: string
}

export interface MoodOption {
  id: string
  label: string
  color: string  // pill bg color
}

export interface GenreOption {
  id: string
  label: string
  description: string
  gradientFrom: string
  gradientTo: string
}

export interface PaletteOption {
  id: string
  name: string
  colors: string[]  // 4-5 hex colors
}

export const VIDEO_STYLES: StyleOption[] = [
  { id: 'cinematic', label: 'Cinematic', description: 'Film-quality visuals with dramatic lighting', gradientFrom: '#7C3AED', gradientTo: '#1E1B4B' },
  { id: 'anime', label: 'Anime', description: 'Japanese animation style with vibrant colors', gradientFrom: '#EC4899', gradientTo: '#F59E0B' },
  { id: 'abstract', label: 'Abstract', description: 'Non-representational visual poetry', gradientFrom: '#06B6D4', gradientTo: '#10B981' },
  { id: 'documentary', label: 'Documentary', description: 'Raw, authentic, real-world footage feel', gradientFrom: '#78716C', gradientTo: '#44403C' },
  { id: 'performance', label: 'Performance', description: 'Artist-focused stage and studio shots', gradientFrom: '#EF4444', gradientTo: '#7C3AED' },
  { id: 'lyric', label: 'Lyric Video', description: 'Typography-driven with kinetic text', gradientFrom: '#F59E0B', gradientTo: '#EC4899' },
]

export const MOOD_OPTIONS: MoodOption[] = [...]
export const GENRE_OPTIONS: GenreOption[] = [...]
export const PALETTE_OPTIONS: PaletteOption[] = [...]
```

### 2. Create StyleSelectionView Component
- Use `useState` for each selection category
- 4 sections with headers, each with appropriate selection UI
- "Continue" button at bottom: `onAction('confirm_style')`
- Framer Motion `staggerChildren` on section mount

### 3. Style Grid (Video Style)
- 3-column grid of cards
- Each card: gradient thumbnail (SVG), title, description
- Selected: ring-2 ring-primary + check icon overlay

### 4. Mood Chips
- Flex-wrap row of rounded pills
- Click to toggle (max 2 selected)
- Selected: `bg-{color}/20 border-{color}` style

### 5. Genre Row
- Horizontal scrollable row of cards
- Similar to style cards but smaller

### 6. Palette Swatches
- Each palette: row of 4-5 colored circles + palette name
- Click to select, highlight selected row

### 7. Continue Button
- Disabled state when not all categories selected
- On click: `onAction('confirm_style')`

## Todo
- [ ] Create `src/lib/mock/style-options.ts` with all option data
- [ ] Create `style-selection-view.tsx` with 4-section layout
- [ ] Implement style grid with selection state
- [ ] Implement mood chips with multi-select (max 2)
- [ ] Implement genre row
- [ ] Implement palette swatches
- [ ] Add continue button with disabled logic
- [ ] Register in MonitorWorkspace
- [ ] Wire `confirm_style` action in MonitorPage

## Success Criteria
- All 4 categories render with visual previews
- Selections highlight correctly
- Continue button enables only when all categories have selection
- Clicking Continue advances to character setup

## Risk Assessment
- **File size**: 200-line limit — likely need to split style grid and palette components into sub-files
  - Mitigation: Extract `StyleGrid`, `MoodChips`, `PaletteSwatches` as separate small components if over limit

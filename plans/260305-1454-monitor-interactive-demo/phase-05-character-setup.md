# Phase 5: Character Setup View

## Context
- Depends on: Phase 1, Phase 4
- After style selection, user sets up 1-3 characters for the music video

## Overview
- **Priority**: P2
- **Status**: pending
- Character upload/selection screen: mock upload zones + preset character archetypes

## Requirements

### Functional
- Header: "Set Up Your Characters" with subtitle "Add 1-3 characters for your music video"
- **Upload Zone** (left/top): small drag-drop area labeled "Upload character reference" — mock only
- **Preset Characters** (main area): grid of 6-8 character archetype cards
  - Each card: gradient avatar thumbnail, character name, short description, style tags
  - Examples: "Mysterious Singer", "Urban Dancer", "Space Explorer", "Ethereal Spirit", "Neon Rider", "Ocean Wanderer"
- Click to select/deselect (toggle). Max 3 selected
- Selected characters shown in a "Selected Cast" row at bottom with remove buttons
- "Continue" button: enabled when 1+ characters selected
- Clicking Continue advances to storyline generation

### Non-functional
- Gradient SVG avatars (reuse `svgThumb` pattern)
- Framer Motion card animations
- Under 200 lines

## Architecture

### Layout
```
┌──────────────────────────────┐
│  Set Up Your Characters      │
│  Add 1-3 characters          │
│                              │
│  ┌──────────────────────┐    │
│  │  Upload reference     │    │
│  │  (drag & drop)        │    │
│  └──────────────────────┘    │
│                              │
│  Or choose from presets:     │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐   │
│  │🎤 │ │💃 │ │🚀 │ │✨ │   │
│  │Sin│ │Dan│ │Exp│ │Spi│   │
│  └───┘ └───┘ └───┘ └───┘   │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐   │
│  │🏍️ │ │🌊 │ │🎸 │ │👑 │   │
│  │Rid│ │Wan│ │Roc│ │Roy│   │
│  └───┘ └───┘ └───┘ └───┘   │
│                              │
│  Selected: [Singer ✕] [Dan ✕]│
│  [Continue →]                │
└──────────────────────────────┘
```

## Related Code Files

### Create
- `src/components/monitor/workspace-views/character-setup-view.tsx`
- `src/lib/mock/characters.ts` — mock character preset data

### Modify
- `src/components/monitor/monitor-workspace.tsx` — register view
- `src/app/monitor/page.tsx` — handle `confirm_characters` action

## Implementation Steps

### 1. Create Mock Character Data: `characters.ts`
```typescript
export interface CharacterPreset {
  id: string
  name: string
  description: string
  tags: string[]  // e.g., ['Vocalist', 'Dramatic']
  gradientFrom: string
  gradientTo: string
}

export const CHARACTER_PRESETS: CharacterPreset[] = [
  { id: 'singer', name: 'Mysterious Singer', description: 'Enigmatic vocalist with dramatic presence', tags: ['Vocalist', 'Dramatic'], gradientFrom: '#7C3AED', gradientTo: '#EC4899' },
  { id: 'dancer', name: 'Urban Dancer', description: 'Street-style performer with fluid movement', tags: ['Dancer', 'Dynamic'], gradientFrom: '#F59E0B', gradientTo: '#EF4444' },
  { id: 'explorer', name: 'Space Explorer', description: 'Astronaut discovering cosmic wonders', tags: ['Adventure', 'Sci-fi'], gradientFrom: '#06B6D4', gradientTo: '#7C3AED' },
  { id: 'spirit', name: 'Ethereal Spirit', description: 'Otherworldly being of light and energy', tags: ['Fantasy', 'Ethereal'], gradientFrom: '#A855F7', gradientTo: '#22D3EE' },
  { id: 'rider', name: 'Neon Rider', description: 'Cyberpunk motorcyclist in a neon city', tags: ['Action', 'Futuristic'], gradientFrom: '#FF006E', gradientTo: '#00F5D4' },
  { id: 'wanderer', name: 'Ocean Wanderer', description: 'Solitary figure at the edge of the sea', tags: ['Contemplative', 'Nature'], gradientFrom: '#0EA5E9', gradientTo: '#10B981' },
  { id: 'rocker', name: 'Guitar Hero', description: 'Rock performer with electric energy', tags: ['Musician', 'Energetic'], gradientFrom: '#EF4444', gradientTo: '#F59E0B' },
  { id: 'royal', name: 'Dark Royalty', description: 'Regal figure in a gothic palace', tags: ['Dramatic', 'Dark'], gradientFrom: '#1E1B4B', gradientTo: '#7C3AED' },
]
```

### 2. Create CharacterSetupView Component
- State: `selectedIds: string[]` (max 3)
- Toggle selection on card click
- Show selected cast at bottom with remove (x) buttons
- Upload zone at top (onClick: show mock "file selected" toast, add generic "Custom Character" to selected)
- Continue button

### 3. Character Card Design
```tsx
<div className={cn(
  'rounded-xl border p-3 cursor-pointer transition-all',
  isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-border/60'
)}>
  <div className="aspect-square rounded-lg mb-2" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }} />
  <h3 className="text-sm font-semibold">{name}</h3>
  <p className="text-xs text-muted-foreground">{description}</p>
  <div className="flex gap-1 mt-1.5">
    {tags.map(tag => <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-full">{tag}</span>)}
  </div>
</div>
```

### 4. Selected Cast Row
- Horizontal row of selected character mini-cards
- Each shows avatar gradient + name + remove (X) button
- Animate in/out with framer-motion `AnimatePresence`

### 5. Wire Actions
- `confirm_characters` → advance to `storyline_generation`, trigger L2 pipeline

## Todo
- [ ] Create `src/lib/mock/characters.ts` with 8 character presets
- [ ] Create `character-setup-view.tsx`
- [ ] Implement character card grid with toggle selection (max 3)
- [ ] Implement selected cast row with remove buttons
- [ ] Add mock upload zone
- [ ] Add continue button
- [ ] Register in MonitorWorkspace
- [ ] Wire `confirm_characters` action

## Success Criteria
- Character grid renders with 8 presets
- Can select 1-3, deselect by clicking again or remove button
- Cannot select more than 3 (4th click ignored or shows tooltip)
- Continue advances to storyline generation
- Mock upload zone shows visual feedback

## Risk Assessment
- **Low**: Straightforward selection UI with mock data

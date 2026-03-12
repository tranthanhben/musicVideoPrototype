# Phase 6: Storyline Generation View

## Context
- Depends on: Phase 1, Phase 5
- [creative-view.tsx](/Users/itscofield/code/songGen/prototypeMusicVideo/src/components/monitor/workspace-views/creative-view.tsx) — existing storyline options (137 lines)

## Overview
- **Priority**: P2
- **Status**: pending
- Enhance CreativeView: add generating state, scene-by-scene breakdown after selection, mix-and-match option

## Requirements

### Functional
- **Generating state** (`storyline_generation` journey state):
  - Show "Generating storylines based on your preferences..." with animated dots
  - After 2-3s delay (simulated L2 progress), transition to results
- **Results state** (`storyline_review` journey state):
  - Show 3 storyline cards (existing) — enhanced with:
    - Scene count
    - Estimated duration
    - Tone match % (already exists)
    - Key scene callout (already exists)
  - User clicks a card to select it (single select)
  - Selected card expands or highlights
- **After selection**: Show scene-by-scene breakdown panel
  - List: Scene #, timestamp range, description, mapped music segment
  - Each scene row has the segment color dot
- Approve/Continue button in chat (existing gate flow for QG2)

### Non-functional
- Build on existing `CreativeView` — enhance, don't replace
- Under 200 lines (extract scene breakdown if needed)

## Architecture

### Two-state View
1. **Generating**: Centered loading animation
2. **Review**: Storyline cards + scene breakdown

### Scene Breakdown Data
Derive from selected storyline + existing mock scenes:
```typescript
// Map each mock scene to a music timestamp range
const sceneBreakdown = mockProject.scenes.map((scene, i) => ({
  index: i + 1,
  description: `${scene.subject} ${scene.action}`,
  timeRange: `${formatTime(startTime)}-${formatTime(endTime)}`,
  segment: getSegmentForScene(i),
}))
```

## Related Code Files

### Modify
- `src/components/monitor/workspace-views/creative-view.tsx` — add generating state, scene breakdown, selection interactivity

### Optionally Create
- `src/components/monitor/workspace-views/scene-breakdown.tsx` — if creative-view gets too long

## Implementation Steps

### 1. Add Generating State
- Accept `isGenerating` prop or derive from journey state
- When generating: show centered card with "Crafting storylines..." + animated gradient shimmer
- After completion: crossfade to storyline cards

### 2. Make Storyline Cards Selectable
- Add `useState<number | null>(null)` for selected storyline index
- Click toggles selection (single select)
- Selected card: `border-primary`, scale slightly, check icon

### 3. Add Scene Count + Duration to Cards
- Each storyline card: add "8 scenes" and "~3:12" badges
- Use mockProject.scenes.length and audio.duration

### 4. Scene Breakdown Panel (after selection)
- Appears below storyline cards when one is selected
- Framer Motion `AnimatePresence` slide-in
- Header: "Scene Breakdown — {storyline.title}"
- List of scene rows:
```tsx
{scenes.map((scene, i) => (
  <div className="flex items-center gap-3 py-2 border-b border-border/50">
    <span className="text-xs font-mono text-muted-foreground w-6">S{i+1}</span>
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: segment.color }} />
    <div className="flex-1">
      <p className="text-xs text-foreground">{scene.subject} {scene.action}</p>
      <p className="text-[10px] text-muted-foreground">{timeRange} · {segment.label}</p>
    </div>
  </div>
))}
```

### 5. Wire Approve Action
- Existing QG2 approve flow handles this
- After approve → advance to `storyboard_building`

## Todo
- [ ] Add generating/loading state to CreativeView
- [ ] Make storyline cards interactive (click to select)
- [ ] Add scene count + duration badges to cards
- [ ] Add scene-by-scene breakdown panel on selection
- [ ] Wire with journey states (generating vs review)
- [ ] Keep under 200 lines

## Success Criteria
- Generating animation shows during L2
- 3 storyline cards appear after generation
- Clicking a card selects it and shows scene breakdown
- Approving advances to storyboard phase

## Risk Assessment
- **File size**: CreativeView is 137 lines + new features may exceed 200 — extract scene breakdown component

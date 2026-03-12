# Phase 1: Foundation — State Machine + View Routing

## Context
- [orchestrator.ts](/Users/itscofield/code/songGen/prototypeMusicVideo/src/lib/journey/orchestrator.ts)
- [monitor page](/Users/itscofield/code/songGen/prototypeMusicVideo/src/app/monitor/page.tsx)
- [monitor-workspace](/Users/itscofield/code/songGen/prototypeMusicVideo/src/components/monitor/monitor-workspace.tsx)
- [monitor-layout](/Users/itscofield/code/songGen/prototypeMusicVideo/src/components/monitor/monitor-layout.tsx)

## Overview
- **Priority**: P1 (everything depends on this)
- **Status**: pending
- Restructure journey state machine, decouple view switching from pipeline layer, stop auto-start

## Key Insights
- Current `MonitorWorkspace` uses `currentLayerId` (5 possible values) to pick views
- Need ~15 view states but only 5 pipeline layers
- Solution: pass `viewHint` string from journey state to workspace, route on that
- Pipeline simulator should NOT auto-start; user actions trigger each segment

## Requirements

### Functional
- New journey states: `upload`, `analyzing`, `analysis_review`, `style_selection`, `character_setup`, `storyline_generation`, `storyline_review`, `storyboard_building`, `storyboard_review`, `generating`, `generation_review`, `editing`, `editing_review`, `complete`
- Each state has a `viewHint` string matching a workspace view key
- `MonitorPage` does NOT call `sim.start()` on mount — only shows upload view
- User actions (button clicks, suggestion pills) advance states
- Pipeline simulator runs per-layer: `runLayer(layerId)` method added

### Non-functional
- Keep backward-compatible with existing chat/artifact system
- Minimal changes to pipeline store (add `viewHint` field to store or pass via props)

## Architecture

### New Journey State Flow
```
upload → analyzing → analysis_review (QG1)
  → style_selection → character_setup → storyline_generation → storyline_review (QG2)
  → storyboard_building → storyboard_review (QG3)
  → generating → generation_review (QG4)
  → editing → editing_review (QG5)
  → complete
```

### View Hint → Component Mapping
```
upload          → UploadView
analysis        → InputView (enhanced)
style           → StyleSelectionView
characters      → CharacterSetupView
storylines      → CreativeView (enhanced)
storyboard      → StoryboardView
generate        → GenerationView
edit            → EditingView
```

## Related Code Files

### Modify
- `src/lib/journey/orchestrator.ts` — new states, new `viewHint` values
- `src/app/monitor/page.tsx` — remove auto-start, add per-step action handling
- `src/components/monitor/monitor-workspace.tsx` — switch on `viewHint` not `currentLayerId`
- `src/components/monitor/monitor-layout.tsx` — pass `viewHint` prop
- `src/lib/pipeline/simulator.ts` — add `runLayer(layerId)` method
- `src/lib/pipeline/store.ts` — add `viewHint` field

### Create
- None in this phase (view components come in later phases)

## Implementation Steps

### 1. Extend Journey State Type
In `orchestrator.ts`:
```typescript
export type JourneyStateId =
  | 'upload'
  | 'analyzing' | 'analysis_review'
  | 'style_selection' | 'character_setup'
  | 'storyline_generation' | 'storyline_review'
  | 'storyboard_building' | 'storyboard_review'
  | 'generating' | 'generation_review'
  | 'editing' | 'editing_review'
  | 'complete'
```

### 2. Define All Journey States
Each state gets:
- `viewHint` matching workspace view key
- `suggestions` relevant to that step
- `gateToResolve` where applicable
- `nextStateOnApprove` for gate states

### 3. Add `viewHint` to Pipeline Store
```typescript
// In store.ts
viewHint: string // 'upload' | 'analysis' | 'style' | etc.
setViewHint: (hint: string) => void
```

### 4. Refactor MonitorPage
- Remove `useEffect` that calls `sim.start()`
- Initial state = `upload`, viewHint = `upload`
- `handleAction` maps actions to state transitions:
  - `select_track` / `upload_track` → start L1, advance to `analyzing`
  - `approve` at `analysis_review` → advance to `style_selection`
  - `confirm_style` → advance to `character_setup`
  - `confirm_characters` → advance to `storyline_generation`, run L2
  - etc.

### 5. Add `runLayer()` to PipelineSimulator
```typescript
async runLayer(layerId: PipelineLayerId): Promise<void> {
  // Run just one layer (same logic as current loop body)
  // Emit events, simulate progress, generate artifacts
  // Do NOT auto-advance to next layer
}
```

### 6. Refactor MonitorWorkspace
- Accept `viewHint` prop (from store or props)
- Switch on viewHint instead of currentLayerId:
```typescript
const VIEW_CONFIG: Record<string, { component: React.ComponentType; label: string }> = {
  upload: { component: UploadView, label: 'Upload Track' },
  analysis: { component: InputView, label: 'Music Analysis' },
  style: { component: StyleSelectionView, label: 'Style & Mood' },
  characters: { component: CharacterSetupView, label: 'Characters' },
  storylines: { component: CreativeView, label: 'Storyline Options' },
  storyboard: { component: StoryboardView, label: 'Storyboard' },
  generate: { component: GenerationView, label: 'Generation' },
  edit: { component: EditingView, label: 'Post-Production' },
}
```

## Todo
- [ ] Extend `JourneyStateId` type with new states
- [ ] Define all journey state objects with viewHint, suggestions, gates
- [ ] Add `viewHint` + `setViewHint` to pipeline store
- [ ] Add `runLayer()` to PipelineSimulator
- [ ] Refactor MonitorPage: remove auto-start, add step-by-step action routing
- [ ] Refactor MonitorWorkspace: switch on viewHint
- [ ] Update MonitorLayout to pass viewHint
- [ ] Verify existing chat streaming still works

## Success Criteria
- Page loads showing upload view (no auto-running pipeline)
- Clicking actions advances through states sequentially
- Views switch based on viewHint
- Pipeline only runs when user triggers a step
- No TypeScript errors

## Risk Assessment
- **Breaking existing flow**: Medium risk — mitigated by replacing states wholesale rather than patching
- **Prop drilling viewHint**: Low risk — using Zustand store avoids deep prop threading

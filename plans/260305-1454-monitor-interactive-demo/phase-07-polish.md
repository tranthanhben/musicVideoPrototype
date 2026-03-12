# Phase 7: Storyboard + Generation + Export Polish

## Context
- Depends on: Phase 1
- [storyboard-view.tsx](/Users/itscofield/code/songGen/prototypeMusicVideo/src/components/monitor/workspace-views/storyboard-view.tsx) — 116 lines
- [generation-view.tsx](/Users/itscofield/code/songGen/prototypeMusicVideo/src/components/monitor/workspace-views/generation-view.tsx) — 134 lines
- [editing-view.tsx](/Users/itscofield/code/songGen/prototypeMusicVideo/src/components/monitor/workspace-views/editing-view.tsx) — 131 lines

## Overview
- **Priority**: P2
- **Status**: pending
- Polish existing views for the new step-by-step flow. Add loading/building states and minor UX improvements.

## Requirements

### StoryboardView Enhancements
- **Building state** (`storyboard_building`): show "Building storyboard..." animation while L3 runs
- **Review state** (`storyboard_review`): existing grid + enhancements:
  - Click scene card → show detail popup/panel: camera angle, camera movement, prompt, timestamp
  - Scene detail panel slides in from right or appears as overlay
  - "Approve Storyboard" triggers QG3

### GenerationView Enhancements
- Already well-built with parallel progress
- Add generating animation before progress starts
- Add model assignment legend: "Kling 2.6 = Dynamic scenes | Runway Gen-4 = Gentle scenes"
- Review state after all scenes complete: show all thumbnails with scores

### EditingView Enhancements
- **Editing state** (`editing`): show "Assembling timeline..." during L5
- **Review state** (`editing_review`): existing view + enhancements:
  - Export cards should be clickable with visual feedback (pulse animation on click)
  - "Download" button triggers final completion
  - Show total video stats: duration, scene count, effects preset

## Implementation Steps

### StoryboardView
1. Add `isBuilding` prop → show building animation when true
2. Add `selectedScene` state → click card shows detail panel
3. Detail panel shows: scene.cameraAngle, scene.cameraMovement, scene.prompt, timestamp
4. Keep under 200 lines — detail panel can be inline conditional render

### GenerationView
1. Add initial "Dispatching render jobs..." state before progress starts
2. Add model legend row at top: two colored badges explaining Kling vs Runway assignment
3. Minor: show completion animation (confetti-like dots) when all scenes done

### EditingView
1. Add `isAssembling` prop → show assembly animation when true
2. Make export cards clickable with scale animation on click
3. Add video stats summary row: "3:12 | 8 scenes | Cosmic Cinema preset"
4. Download button → show "Preparing exports..." then "Ready!" state

## Related Code Files

### Modify
- `src/components/monitor/workspace-views/storyboard-view.tsx`
- `src/components/monitor/workspace-views/generation-view.tsx`
- `src/components/monitor/workspace-views/editing-view.tsx`

## Todo
- [ ] StoryboardView: add building animation state
- [ ] StoryboardView: add scene detail panel on click
- [ ] GenerationView: add initial dispatching state
- [ ] GenerationView: add model assignment legend
- [ ] EditingView: add assembling animation state
- [ ] EditingView: make export cards interactive
- [ ] EditingView: add video stats summary
- [ ] All views: accept dynamic project data (not hardcoded mockProjects[0])

## Success Criteria
- Each view shows appropriate loading/building state during pipeline layer execution
- Scene detail panel works in storyboard
- All views transition smoothly between states
- All views work with any of the 3 demo projects

## Risk Assessment
- **Low**: Small incremental changes to existing, working components
- **File size**: All views currently under 140 lines — additions should stay under 200

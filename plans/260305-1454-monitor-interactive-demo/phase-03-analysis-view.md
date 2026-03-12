# Phase 3: Enhanced Analysis View

## Context
- Depends on: Phase 1, Phase 2
- [input-view.tsx](/Users/itscofield/code/songGen/prototypeMusicVideo/src/components/monitor/workspace-views/input-view.tsx) — current analysis view (182 lines)

## Overview
- **Priority**: P2
- **Status**: pending
- Enhance existing InputView with more data: mood/emotion tags, richer waveform, detected patterns

## Requirements

### Functional
- Keep existing: BPM, key, duration, segments, waveform bars, energy curve, peak markers, segment pills
- Add: detected mood tags (e.g., "Melancholic", "Uplifting", "Intense") as colored badges
- Add: emotion labels on energy curve peaks (e.g., "Peak: Euphoric @1:18")
- Add: mini section showing "Musical Patterns Detected" — time signature, tempo changes, instrumentation hints
- Show an animated "analyzing..." state while L1 runs, then reveal results when complete
- Quality gate actions appear in chat (existing behavior) — user approves to continue

### Non-functional
- Reuse existing `InputView` — enhance, don't recreate
- Keep under 200 lines (may need to extract sub-components)

## Architecture

### Two-state View
1. **Analyzing state** (`analyzing` journey state): Show track title + spinning loader + progress %
2. **Results state** (`analysis_review` journey state): Show full analysis results with approve prompt

### Additional Data
Add to mock audio type or derive from existing segments:
```typescript
// Mood tags derived from segment types
const MOOD_MAP: Record<SegmentType, string[]> = {
  intro: ['Atmospheric', 'Building'],
  verse: ['Melodic', 'Narrative'],
  chorus: ['Euphoric', 'Intense'],
  bridge: ['Reflective', 'Transitional'],
  outro: ['Resolving', 'Fading'],
  drop: ['Explosive', 'Peak'],
  breakdown: ['Minimal', 'Atmospheric'],
}
```

## Related Code Files

### Modify
- `src/components/monitor/workspace-views/input-view.tsx` — add mood tags, analyzing state, patterns section

### Optionally Create
- `src/components/monitor/workspace-views/analysis-loading.tsx` — if InputView gets too long, extract loading state

## Implementation Steps

### 1. Add Analyzing State
- Accept `isAnalyzing` prop (derived from journey state)
- When analyzing: show centered card with track thumbnail gradient, track name, spinning animation, progress text
- When done: crossfade to full results

### 2. Add Mood Tags Section
- Below segment pills, add "Detected Moods" row
- Derive moods from segment types using MOOD_MAP
- Show as colored rounded pills: `<span className="bg-purple-500/15 text-purple-400 text-[10px] px-2 py-0.5 rounded-full">`

### 3. Add Musical Patterns Section
- Small card below waveform: "Patterns Detected"
- Show: Time Signature (4/4), Tempo Stability (Steady), Instrumentation (Synth, Vocals, Drums)
- Hardcoded mock data per project

### 4. Add Peak Labels on Energy Curve
- For each `isPeak` point, render a small text label above the circle marker
- Label: timestamp + mood (e.g., "1:18 Peak")

### 5. Accept Project Index
- Currently hardcoded to `mockProjects[0]`
- Accept project index or read from store to support all 3 demo tracks

## Todo
- [ ] Add analyzing/loading state to InputView
- [ ] Add mood tag pills section
- [ ] Add musical patterns section
- [ ] Add peak labels on energy curve
- [ ] Make InputView accept dynamic project (not hardcoded [0])
- [ ] Keep under 200 lines (extract if needed)

## Success Criteria
- While L1 runs: shows analyzing animation
- After L1 completes: shows full analysis with moods, patterns, enhanced waveform
- Quality gate in chat lets user approve to continue
- Works for all 3 demo tracks

## Risk Assessment
- **File size**: InputView is already 182 lines — may need to extract waveform into sub-component

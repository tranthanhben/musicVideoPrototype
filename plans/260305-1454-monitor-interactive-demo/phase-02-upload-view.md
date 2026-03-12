# Phase 2: Upload View

## Context
- Depends on: Phase 1
- [mock/projects.ts](/Users/itscofield/code/songGen/prototypeMusicVideo/src/lib/mock/projects.ts) — 3 demo projects exist
- [mock/audio.ts](/Users/itscofield/code/songGen/prototypeMusicVideo/src/lib/mock/audio.ts) — audio data for each

## Overview
- **Priority**: P1
- **Status**: pending
- Landing screen: drag-and-drop upload zone + 3 demo track cards

## Requirements

### Functional
- Drag-and-drop zone with dashed border, upload icon, "Upload your track" text
- On "drop" or click: show a mock file name + fake processing animation (1s), then advance
- Below upload zone: "Or try a demo track" section with 3 cards
- Demo track cards: gradient thumbnail, title, artist, BPM, duration, key
- Clicking a demo track immediately selects it and advances to `analyzing` state
- Selected track info stored in journey context (which mock project to use)

### Non-functional
- Responsive within the 60% workspace panel
- Framer Motion entrance animation
- Under 200 lines

## Architecture

### Component: `UploadView`
```
┌──────────────────────────────┐
│    ┌──────────────────┐      │
│    │   Upload icon     │      │
│    │  Drop your track  │      │
│    │  or click to      │      │
│    │  browse           │      │
│    └──────────────────┘      │
│                              │
│  ── Or try a demo track ──   │
│                              │
│  ┌────┐  ┌────┐  ┌────┐    │
│  │Cos │  │Neon│  │Ocea│    │
│  │mic │  │City│  │n   │    │
│  │128 │  │140 │  │96  │    │
│  │BPM │  │BPM │  │BPM │    │
│  └────┘  └────┘  └────┘    │
└──────────────────────────────┘
```

### Data Flow
- `UploadView` receives `onSelectTrack(projectIndex: number)` callback
- `MonitorPage` handles it: sets active project index, advances to `analyzing`, runs L1

## Related Code Files

### Create
- `src/components/monitor/workspace-views/upload-view.tsx`

### Modify
- `src/app/monitor/page.tsx` — handle `select_track_0`, `select_track_1`, `select_track_2`, `mock_upload` actions
- `src/components/monitor/monitor-workspace.tsx` — import + register UploadView

## Implementation Steps

### 1. Create UploadView Component
- Import `Upload` icon from lucide-react
- Import `mockProjects` for demo track data
- Drag zone: `div` with dashed border, hover effect, `onClick` triggers mock upload
- Demo tracks: 3 cards showing project thumbnail, title, artist, BPM badge, duration, key
- Each card calls `onAction('select_track_N')` on click
- Upload zone calls `onAction('mock_upload')` on click/drop

### 2. Mock Upload Behavior
- On `mock_upload` action: show file name "my_track.mp3" with a progress bar for 1.5s
- Then advance to `analyzing` using project index 0 (Cosmic Love Story) as default
- Can use `useState` for upload state: `idle | uploading | done`

### 3. Demo Track Card Design
```tsx
// Each card:
<div className="rounded-xl border bg-card p-3 cursor-pointer hover:border-primary/40 transition">
  <img src={project.thumbnailUrl} className="aspect-video rounded-lg" />
  <h3>{project.title}</h3>
  <p>{project.audio.artist}</p>
  <div className="flex gap-2">
    <Badge>{project.audio.bpm} BPM</Badge>
    <Badge>{formatDuration(project.audio.duration)}</Badge>
    <Badge>{project.audio.key}</Badge>
  </div>
</div>
```

### 4. Wire into MonitorPage
- In `handleAction`:
  - `select_track_0` → set activeProjectIndex=0, run L1 layer, advance to `analyzing`
  - `select_track_1` → same with index 1
  - `select_track_2` → same with index 2
  - `mock_upload` → show uploading state, after delay: same as select_track_0

### 5. Register in MonitorWorkspace
- Import UploadView
- Add to VIEW_CONFIG: `upload: { component: UploadView, label: 'Upload Track' }`

## Todo
- [ ] Create `upload-view.tsx` with drag zone + demo track cards
- [ ] Add mock upload animation state
- [ ] Wire `select_track_N` and `mock_upload` actions in MonitorPage
- [ ] Register UploadView in MonitorWorkspace VIEW_CONFIG
- [ ] Add welcome chat message for upload state
- [ ] Test: page loads showing upload view, clicking demo track advances

## Success Criteria
- Upload view displays on page load
- Clicking a demo track triggers analysis phase
- Mock upload shows progress then advances
- Framer Motion entrance animations

## Risk Assessment
- **Low**: Simple UI-only component with mock interactions

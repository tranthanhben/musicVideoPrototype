# Code Review: flow-v3 Prototype Integration

**Date:** 2026-03-16
**Reviewer:** code-reviewer agent
**Branch:** main

---

## Scope

- **Files reviewed:** 11 files (7 modified, 4 new)
- **Lines analyzed:** ~1,600
- **TypeScript check:** `npx tsc --noEmit` — **0 errors**
- **Plan file:** none provided

---

## Overall Assessment

The integration is solid — no TypeScript compile errors, logic flow is coherent, and the new components (modal, drawer, credits panel) are properly wired. Several medium-priority bugs and one high-priority regression exist. No security issues for a prototype context.

---

## Critical Issues

None.

---

## High Priority Findings

### 1. Bottom nav bar hidden for `analysis` step but "Back" button still needs to work — regression risk
**File:** `src/app/flow-v3/page.tsx:168`

The bottom bar is hidden for `['storyboard', 'vfx_export']` only. The `analysis` step is still shown (it's in `hasOwnContinue` but the bar still renders). However `canContinue()` for `analysis` returns `false` (line 66: `return false // auto-advances via callback`), so the Continue button is permanently disabled and shows as greyed-out — not hidden. Users on `analysis` see a disabled "Continue" with no explanation. Not a crash, but a UX regression from the intent of `hasOwnContinue`.

**Root cause:** Two separate conditional lists exist:
- Line 128: `hasOwnContinue = ['setup', 'analysis', 'storyboard', 'vfx_export']` — used to hide Continue button
- Line 168: `!['storyboard', 'vfx_export']` — used to hide the entire bottom bar

`analysis` is in `hasOwnContinue` but NOT in the bar-hide list, so the bar shows with only a back button and an invisible Continue placeholder (`<div className="w-20" />`). This is fine but the `hasOwnContinue` check at line 184 correctly hides Continue — this is actually working as designed. **No regression, but note:** Back button on `analysis` step navigates away mid-analysis, discarding state.

### 2. `handleChatDeleteScene` and `handleChatInsertScene` — stale closure
**File:** `src/components/flow-v3/steps/storyboard-step.tsx:238-239`

```ts
const handleChatDeleteScene = useCallback((sceneId: string) => { deleteScene(sceneId) }, [])
const handleChatInsertScene = useCallback((afterIndex: number) => { insertScene(afterIndex) }, [])
```

Both `deleteScene` and `insertScene` are plain functions (not `useCallback`) defined inside the component body (lines 195, 200). They capture `scenes`, `selectedSceneId`, and `editingId` via closure. Because the wrapping `useCallback` has `[]` deps, the stable callback wraps the *initial* version of `deleteScene`/`insertScene` only. Subsequent renders update the inner functions but the callbacks freeze on the first version.

**Impact:** If the chat assistant calls `onDeleteScene` or `onInsertScene` after scene state has changed (e.g., scenes reordered), the stale index/set could corrupt state or delete the wrong scene.

**Fix:** Either add deps, or convert `deleteScene`/`insertScene` to `useCallback` and include them in the deps array:
```ts
const deleteScene = useCallback((id: string) => { ... }, [selectedSceneId])
const handleChatDeleteScene = useCallback((id: string) => deleteScene(id), [deleteScene])
```

### 3. `SceneEditModal` — `useEffect` does not reset when modal re-opens for same scene
**File:** `src/components/flow-v3/steps/scene-edit-modal.tsx:51-60`

```ts
useEffect(() => {
  if (!scene) return
  setSubject(scene.subject)
  ...
  setHasChanges(false)
}, [scene])  // object reference dep
```

The dep is the `scene` object reference. `EditableScene` objects in `storyboard-step.tsx` are spread-replaced on every update (`{ ...s, ...updates }`), so the reference changes on edit — this is fine for resetting on scene switch. However if `onUpdate` in `StoryboardStep:469` sets `setEditModalScene(null)` immediately after update, and the user clicks the same scene again, a new object reference is passed, so the effect fires correctly. No bug here, but worth noting the dependency on reference equality.

### 4. `SceneEditModal` — `handleRegenerate` guard is too strict, can silently no-op
**File:** `src/components/flow-v3/steps/scene-edit-modal.tsx:80-85`

```ts
function handleRegenerate() {
  if (!scene || !hasChanges) return  // ← returns silently
  ...
}
```

The Regenerate button is visually disabled when `!hasChanges` (line 195), but the button's `disabled` attribute is set, not removed from the DOM. If a user somehow triggers this (e.g., programmatic click), the call silently exits without feedback. Minor, but the guard and the disabled state should be consistent — they are, so this is low severity. Calling it out for completeness.

---

## Medium Priority Improvements

### 5. Hardcoded `sceneCount: 39` in cost calculator calls — diverges from actual scene count
**Files:** `src/app/flow-v3/page.tsx:41`, `src/components/flow-v3/steps/setup-step.tsx:360`

Both pass `sceneCount: 39` directly. The actual storyboard (`storyboard-step.tsx:112`) also generates exactly 39 scenes, so the numbers happen to match. But if the scene count changes, these three sites will drift. The page-level `estimatedCost` and the `SetupStep` internal cost display will then show stale values.

**Fix:** Pass `sceneCount` as a prop from page → SetupStep, or derive it from a shared constant.

### 6. `CreditsSpendingPanel` receives hardcoded display strings for `model`/`quality`
**Files:** `src/components/flow-v3/steps/storyboard-step.tsx:279`, `src/components/flow-v3/steps/vfx-export-step.tsx:673`

```tsx
<CreditsSpendingPanel ... model="Cremi Signature" quality="SD 480p" />
```

Both pass display-format strings rather than the config values from `FlowConfig`. If the user selects a different model/quality in SetupStep, the breakdown panel still shows "Cremi Signature / SD 480p". The cost calculation also hardcodes `'cremi-signature'`/`'480p'` (lines 128, 259), so the breakdown total is also wrong for other selections.

**Fix:** Thread `model` and `quality` down from `FlowConfig` via props to these steps.

### 7. `ProjectInfoBar` — stale `draft` state when `name` prop changes externally
**File:** `src/components/flow-v3/product/project-info-bar.tsx:15`

```ts
const [draft, setDraft] = useState(name)
```

`draft` is initialized once from `name`. If the parent resets `projectName` (e.g., loading a saved project), `draft` won't update until `startEdit()` is called (line 19: `setDraft(name)`). Only affects the edit flow — the displayed `name` (line 55) always reads the prop. Low risk for a prototype.

### 8. `WaveformTrimSelector` — `setIsPlaying(false)` called inside `setPlayPosition` updater function
**File:** `src/components/flow-v3/steps/setup-step.tsx:626-632`

```ts
setPlayPosition((pos) => {
  const next = pos + 0.1
  if (next >= trimEnd) {
    if (playRef.current) clearInterval(playRef.current)
    playRef.current = null
    setIsPlaying(false)  // ← side effect inside state updater
    return trimStart
  }
  return next
})
```

Calling `setIsPlaying(false)` inside a state updater is a side effect inside a pure updater function. React's Strict Mode (dev) renders components twice and will invoke this updater twice, potentially causing double-call of `clearInterval` and `setIsPlaying`. In production this is benign, but in Strict Mode dev it may fire twice. Prefer moving the stop logic outside the updater.

### 9. `VfxExportStep` — `ScenePropertiesPanel` state not reset when active scene changes via playback
**File:** `src/components/flow-v3/steps/vfx-export-step.tsx:150-156`

```ts
useEffect(() => {
  setSubject(scene.subject)
  ...
}, [scene.id])
```

The local `ScenePropertiesPanel` resets on `scene.id` change. But `activeScene` (passed as `scene` prop) is derived as `scenes.find(s => s.id === activeSceneId) ?? scenes[0]` (line 316). During playback the `activeSceneId` auto-updates (lines 362-366), which changes `activeScene` reference and `scene.id` → the form does reset correctly. No bug, but worth noting the `eslint-disable-line react-hooks/exhaustive-deps` comment on line 149 — the actual dep is `scene.id` not the full `scene` object, and that is intentional.

---

## Low Priority Suggestions

### 10. DRY violation: `SCENE_TEMPLATES`, `CAMERA_ANGLES`, `CAMERA_MOVEMENTS` duplicated
**Files:** `storyboard-step.tsx:45-74`, `vfx-export-step.tsx:38-92`

Both files duplicate the full scene template arrays. Should live in a shared `mock-data` module.

### 11. `SceneEditModal` — `img` element missing `aria-label` fallback for absent thumbnail
**File:** `src/components/flow-v3/steps/scene-edit-modal.tsx:108`

```tsx
<img src={scene.thumbnailUrl} alt="scene thumbnail" ... />
```

`alt` is a static string, not scene-specific. Minor accessibility gap.

### 12. `ProjectAssetsDrawer` backdrop is `z-40`, drawer is `z-50` — correct stacking but `SceneEditModal` (via Dialog) uses `z-50` too
**File:** `src/components/flow-v3/product/project-assets-drawer.tsx:123`

Radix `Dialog` uses its own portal with high z-index. If both the drawer and a dialog are open simultaneously, visual layering could conflict. Not currently triggerable in the flow, but worth noting.

### 13. `VfxExportStep` — `startRender` is a plain function but refs `rendering`/`exported`/`allDone` from closure
**File:** `src/components/flow-v3/steps/vfx-export-step.tsx:322-326`

Safe because it's only called via button click (always fresh), but wrapping in `useCallback` would be consistent with the rest of the file's patterns.

---

## Positive Observations

- Clean TypeScript — `tsc --noEmit` passes with zero errors on all 11 files.
- `WaveformTrimSelector` drag logic uses `trimRef`/`callbackRef` pattern correctly to avoid stale closure on mouse events (lines 640-643) — good technique.
- `VfxExportStep` animation loop uses `requestAnimationFrame` + `cancelAnimationFrame` with proper cleanup — no leak.
- `ProjectAssetsDrawer` uses `AnimatePresence` for mount/unmount — no orphaned backdrop.
- `CreditsSpendingPanel` uses `initial={false}` on `AnimatePresence` to prevent animation on first render — good.
- `SceneEditModal` cleanly separates derived `computedPrompt` from form state.
- Bottom bar hiding for `storyboard`/`vfx_export` is clean and doesn't break layout — steps fill full height as intended.

---

## Recommended Actions

1. **Fix stale closures** in `handleChatDeleteScene`/`handleChatInsertScene` (issue #2) — medium risk of state corruption if AI chat is used heavily.
2. **Thread model/quality props** into `StoryboardStep` and `VfxExportStep` so `CreditsSpendingPanel` and `calculateProjectCost` use real config values (issue #6).
3. **Extract shared scene template data** to avoid duplication between storyboard and vfx steps (issue #10).
4. **Replace hardcoded `sceneCount: 39`** with a shared constant or derived prop (issue #5).
5. **Move `setIsPlaying(false)` out of state updater** in `WaveformTrimSelector` (issue #8) — Strict Mode safe.

---

## Metrics

- Type coverage: no errors (tsc clean)
- Test coverage: n/a (prototype, no tests)
- Linting issues: 1 suppressed eslint comment (`vfx-export-step.tsx:149`)
- Memory leaks: none — all intervals/RAF cleaned up on unmount
- Security: n/a (prototype, no auth/data)

---

## Unresolved Questions

- Is `sceneCount: 39` intentionally fixed as the prototype's "demo" value, or should it reflect actual scenes the user would generate? This determines whether issues #5/#6 are bugs or deferred scope.
- Should navigating Back on the `analysis` step cancel the in-progress analysis simulation? Currently it silently discards state.

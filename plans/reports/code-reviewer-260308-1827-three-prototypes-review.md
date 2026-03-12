# Code Review Summary

## Scope
- Files reviewed: 37 files across scenarios, monitor, and flow prototypes
- Lines of code analyzed: ~5,600
- Review focus: Recent changes (3 commits) — all three prototype areas
- Updated plans: none (no plan file provided)

## Overall Assessment

Build succeeds (`next build` passes clean), TypeScript compiles with zero errors. No missing imports or broken paths. Framer Motion used correctly throughout. The primary issues are a handful of low-impact bugs around animation configs, a timer leak pattern, and one invalid Tailwind class that silently fails.

---

## Critical Issues

None.

---

## High Priority Findings

### 1. `motion.polyline` `pathLength` animation will not work
**File:** `/Users/itscofield/code/songGen/prototypeMusicVideo/src/components/flow/steps/analysis-energy-curve.tsx` — line 59–61

`pathLength` is a SVG path-drawing animation that only works on `<motion.path>` elements with a single continuous path descriptor. `<motion.polyline>` does not implement `getTotalLength()` and Framer Motion silently ignores the `pathLength` property. The energy curve will appear instantly (opacity fades in) but the draw-on animation will not play.

Fix: Replace `<motion.polyline>` with `<motion.path>` using an equivalent `d` attribute built from the same points:
```tsx
const svgPath = `M ${energyCurve.map((p) => `${(p.time / duration) * 100},${40 - p.energy * 36}`).join(' L ')}`
// then use <motion.path d={svgPath} ... />
```

---

## Medium Priority Findings

### 2. `setInterval` leak in `Typewriter` component (two instances)
**Files:**
- `/Users/itscofield/code/songGen/prototypeMusicVideo/src/components/flow/steps/storyline-card.tsx` — lines 24–33
- `/Users/itscofield/code/songGen/prototypeMusicVideo/src/components/flow/steps/analysis-results.tsx` — lines 36–46

Both `Typewriter` / `TypewriterText` implementations nest a `setInterval` inside a `setTimeout`. The effect's cleanup function correctly clears the outer `setTimeout`, but the inner `setInterval` (`iv`) is returned from the setTimeout callback — that return value is discarded and the interval is never cleared if the component unmounts after the timeout fires but before typing completes. Results in state updates on unmounted components (React dev warning) and a running interval with a stale closure.

Fix: Track both refs and clear both in the effect cleanup:
```tsx
useEffect(() => {
  let iv: ReturnType<typeof setInterval> | null = null
  const t = setTimeout(() => {
    iv = setInterval(() => { ... }, 26)
  }, delay)
  return () => {
    clearTimeout(t)
    if (iv !== null) clearInterval(iv)
  }
}, [text, delay, onDone])
```

### 3. `Typewriter` reruns after completion due to unstable `onDone` reference
**File:** `/Users/itscofield/code/songGen/prototypeMusicVideo/src/components/flow/steps/storyline-card.tsx` — lines 33, 196

`onDone` is in the `useEffect` deps array. The caller passes `onDone={() => setTitleDone(true)}` — an inline arrow that is recreated every render. When typing completes, `onDone()` triggers `setTitleDone(true)`, which re-renders `StorylineCard`, creating a new `onDone` reference, which triggers the `Typewriter` effect again. The typewriter restarts and types the full title a second time before stabilizing (since the second `setTitleDone(true)` call causes no re-render).

Visually: title types once, resets briefly, types again. Severity depends on animation speed.

Fix options:
- Wrap the callback with `useCallback` in `StorylineCard`
- Remove `onDone` from deps and use a ref pattern

### 4. Idle scene cards pulse-animate infinitely with `repeat: Infinity`
**File:** `/Users/itscofield/code/songGen/prototypeMusicVideo/src/components/flow/steps/generation-scene-card.tsx` — lines 30–42

When a scene is neither active nor sparkling (`!isSparkle && !isActive`), the `animate` prop is `{ boxShadow: 'none', scale: 1 }` but the `transition` prop is `{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }`. Framer Motion will continuously schedule animation frames for all completed/pending cards, animating them to their current values on every cycle. Not a visual bug but causes unnecessary CPU/GPU work proportional to scene count.

Fix: Conditionally set `repeat` only when `isActive`:
```tsx
transition={
  isSparkle
    ? { duration: 0.45, ease: 'easeOut' }
    : isActive
    ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
    : { duration: 0.3 }
}
```

### 5. `viewChanged` computed by mutating a ref during render
**File:** `/Users/itscofield/code/songGen/prototypeMusicVideo/src/components/monitor/monitor-layout.tsx` — lines 28–30

```tsx
const prevViewHint = useRef(viewHint)
const viewChanged = prevViewHint.current !== viewHint
if (viewChanged) prevViewHint.current = viewHint  // mutation during render
```

Mutating a ref during render is documented as unsafe in React — concurrent rendering and Strict Mode double-invocation can cause `viewChanged` to compute incorrectly. In development Strict Mode, the component renders twice per prop change; the ref is updated on the first render, so the second render always sees `viewChanged = false`, meaning the flash effect never triggers in dev mode.

Fix: Move the ref update into a `useEffect`:
```tsx
useEffect(() => {
  prevViewHint.current = viewHint
}, [viewHint])
```
Then use a separate `useState` for the flash trigger.

---

## Low Priority Findings

### 6. Invalid Tailwind class `h-4.5 w-4.5`
**File:** `/Users/itscofield/code/songGen/prototypeMusicVideo/src/components/flow/steps/generation-scene-card.tsx` — line 61

```tsx
<Check className="h-4.5 w-4.5 text-white" />
```

`h-4.5` and `w-4.5` are not standard Tailwind classes (Tailwind's scale goes `4`, `5`, `6`... with no `4.5`). Tailwind v4 may generate these as arbitrary values silently or ignore them. The icon renders at the default Lucide size instead of the intended size.

Fix: Use `h-4 w-4` or `h-5 w-5`.

### 7. Local `cn` re-implementation in `analysis-loading.tsx`
**File:** `/Users/itscofield/code/songGen/prototypeMusicVideo/src/components/flow/steps/analysis-loading.tsx` — lines 135–137

A local `cn()` function is defined at the bottom of the file instead of importing from `@/lib/utils`. This version lacks `tailwind-merge` deduplication. Works functionally here (no conflicting classes in the call sites), but inconsistent with the rest of the codebase.

Fix: Remove local `cn`, add `import { cn } from '@/lib/utils'` at the top.

### 8. `setTimeout` in `MvTypeStep` onSelect not cleaned up
**File:** `/Users/itscofield/code/songGen/prototypeMusicVideo/src/app/flow/page.tsx` — line 79

```tsx
setTimeout(() => setCurrentStep('setup'), 400)
```

If the user selects a type and then immediately navigates away (or the component unmounts within 400ms), `setCurrentStep` is called on an unmounted component. In React 18 this is a no-op (no crash), but a minor cleanup concern.

### 9. Files over 200 lines
- `/Users/itscofield/code/songGen/prototypeMusicVideo/src/app/scenarios/page.tsx` — 264 lines (contains `useCountUp`, `TimeRing`, `SummaryBanner`, `CompareView`, `SingleView`, `SummarySection` all in one file)
- `/Users/itscofield/code/songGen/prototypeMusicVideo/src/components/flow/steps/storyboard-step.tsx` — 248 lines
- `/Users/itscofield/code/songGen/prototypeMusicVideo/src/components/flow/steps/storyline-card.tsx` — 250 lines
- `/Users/itscofield/code/songGen/prototypeMusicVideo/src/components/flow/steps/vfx-export-step.tsx` — 228 lines
- `/Users/itscofield/code/songGen/prototypeMusicVideo/src/components/flow/steps/vfx-export-sub.tsx` — 223 lines
- `/Users/itscofield/code/songGen/prototypeMusicVideo/src/components/flow/steps/setup-step.tsx` — 238 lines

These exceed the 200-line guideline per `development-rules.md`. The `vfx-export-step.tsx` + `vfx-export-sub.tsx` already show a split pattern. The `scenarios/page.tsx` inner components (`TimeRing`, `SummaryBanner`, etc.) could be extracted.

---

## Positive Observations

- TypeScript is clean with zero errors — all types are well-defined and imported correctly.
- Build passes cleanly — all 24 routes compile, no import failures.
- `Framer Motion` usage is consistent and well-structured throughout.
- The `vfx-export-sub.tsx` split from `vfx-export-step.tsx` is a good example of the 200-line rule being applied proactively.
- `FlowConfig` state management in `flow/page.tsx` is clean — single source of truth, callbacks passed down correctly.
- `canContinue()` logic correctly guards navigation and matches `hasOwnContinue` exclusions.
- The `interpolateHex` utility in `storyline-data.ts` is clean and correctly typed.
- Monitor prototype cleanly separates workspace views from chat panel.
- Mock data is centralized under `@/lib/mock/` and `@/lib/flow/` — not scattered inline.

---

## Recommended Actions

1. **[High]** Fix `analysis-energy-curve.tsx`: replace `motion.polyline` with `motion.path` so the draw-on animation actually plays.
2. **[Medium]** Fix the `setInterval` leak in both `Typewriter` implementations — track `iv` ref outside the setTimeout, clear in effect cleanup.
3. **[Medium]** Fix the `Typewriter onDone` unstable ref in `storyline-card.tsx` — wrap with `useCallback` or remove from deps using a ref.
4. **[Medium]** Fix `generation-scene-card.tsx` idle `repeat: Infinity` — add conditional `repeat` only for active cards.
5. **[Medium]** Fix `monitor-layout.tsx` ref mutation during render — move the assignment into `useEffect`.
6. **[Low]** Replace `h-4.5 w-4.5` with `h-4 w-4` or `h-5 w-5` in `generation-scene-card.tsx` line 61.
7. **[Low]** Remove the local `cn` from `analysis-loading.tsx` and import from `@/lib/utils`.

---

## Metrics

- Type coverage: 100% (tsc --noEmit: 0 errors)
- Build: passing (next build clean)
- Linting issues: not run (no eslint invoked)
- Files over 200 lines: 6

---

## Unresolved Questions

- Is `scrollbar-none` defined somewhere not visible in the codebase? It's used in `generation-activity-feed.tsx` (flow) but not found in `globals.css`, `package.json`, or any plugin config. It may silently have no effect, leaving the activity feed with a visible scrollbar on some browsers/OS.

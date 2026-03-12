# Code Review: Aspect Ratio Fixes

**Date:** 2026-03-12
**Scope:** Thumbnail aspect ratio standardisation across 7 files

---

## Code Review Summary

### Scope
- Files reviewed: 7 changed files + 2 files in context (`mock-video-player.tsx`, `studio/editor/page.tsx`)
- Lines of code analyzed: ~400 (targeted diff review)
- Review focus: Correctness of aspect ratio changes, layout regressions, missed instances

### Overall Assessment
All 7 aspect-ratio changes are correct. TypeScript compiles clean (`tsc --noEmit` exits 0). No layout regressions found in 5 of the 7 files. Two files have minor concerns worth examining — one potential layout regression, one intentional design decision to validate.

---

## Critical Issues
None.

---

## High Priority Findings

### 1. `scene-card-flip.tsx` — Thumbnail expands, card body gains space (no breakage, but visible change)

The card has a **fixed outer dimension of 280×360px** (inline `style`). With `h-44` (176 px) the body got 184 px. With `aspect-video` inside a 280 px-wide container the thumbnail becomes 157.5 px (280 × 9/16), freeing **203 px** for the body — 19 px more.

Result: The card body (description, camera data, takes bar, "Click to edit" hint) now has more vertical room; nothing clips. The change is visually correct. However:

- The thumbnail is now **shorter** (157 px vs 176 px) — the card looks slightly less "image-forward"
- Body content won't overflow, so no layout regression

**Verdict:** Safe. Intentional tradeoff of image size for correct ratio.

---

## Medium Priority Improvements

### 2. `preview-monitor.tsx` — Removal of `h-full` safe in current call site, but loses fill behaviour

Before: `relative w-full h-full … style={{ aspectRatio: '16/9' }}`
After: `relative w-full aspect-video …` (no `h-full`)

The component is rendered inside `<div class="w-full max-w-3xl">` in `studio/editor/page.tsx` (line 107). That wrapper has no explicit height, so `h-full` was already a no-op there — the inline `aspectRatio` was the actual constraint. The new `aspect-video` replicates that exactly and is cleaner.

**One remaining inconsistency in the same file (line 111):** the `isGenerating` branch of `PreviewMonitor`'s call site still uses `style={{ aspectRatio: '16/9' }}` inline. This is outside the changed file but is the direct sibling of the now-fixed component — should be updated for consistency:

```tsx
// studio/editor/page.tsx L110-L114 — change to:
<div className="relative rounded border border-white/10 flex items-center justify-center bg-card aspect-video">
```

Same pattern exists in `src/app/studio/page.tsx:60`.

### 3. `mood-board-sub.tsx` — MoodComposite strip (`h-[90px]`) intentionally fixed

The `MoodComposite` banner is a **colour palette strip**, not a video thumbnail — a fixed height is the correct design choice for a horizontal collage. Converting it to `aspect-video` would make it dynamic and inconsistent. **Leave it as `h-[90px]`.**

---

## Low Priority Suggestions

### 4. `mock-video-player.tsx` — `aspect-[9/16]` is intentional and correct
Line 16: `'9:16': 'aspect-[9/16]'` — this powers TikTok/vertical video previews. Not a target for standardisation; it models a genuinely different aspect ratio. Leave untouched.

### 5. Two remaining `style={{ aspectRatio: '16/9' }}` inlines outside reviewed files

| File | Line | Context |
|------|------|---------|
| `src/app/studio/editor/page.tsx` | 111 | `GenerationLoading` wrapper — same call site as `PreviewMonitor` |
| `src/app/studio/page.tsx` | 60 | Studio page preview thumbnail |

These are minor; can be cleaned up in a follow-up pass by replacing `style={{ aspectRatio: '16/9' }}` with the `aspect-video` Tailwind class.

---

## Positive Observations
- All 7 target files confirmed clean — no `aspect-[4/3]` remains in the changed set
- TypeScript passes with zero errors
- `mock-video-player.tsx` architecture (typed `aspectRatio` prop → map to Tailwind class) is the right pattern; the only `aspect-[9/16]` in the codebase exists there with explicit purpose
- `mood-board-sub.tsx` MoodComposite correctly keeps its fixed-height strip design

---

## Recommended Actions

1. **Optional (low):** Replace the two remaining `style={{ aspectRatio: '16/9' }}` inlines in `studio/editor/page.tsx:111` and `studio/page.tsx:60` with `aspect-video` Tailwind class for full consistency
2. **No action needed** on `MoodComposite h-[90px]` — correct design
3. **No action needed** on `mock-video-player.tsx aspect-[9/16]` — intentional

---

## Metrics
- Type Coverage: Pass (tsc --noEmit exits 0)
- Test Coverage: N/A (prototype)
- Linting Issues: 0 blocking
- Remaining non-standard `aspect-[` in src/: 1 instance (`aspect-[9/16]` in `mock-video-player.tsx`, intentional)
- Remaining inline `style={{ aspectRatio }}` in src/: 2 instances (both `16/9`, low-priority cleanup)

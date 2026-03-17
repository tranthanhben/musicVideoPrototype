# Code Review: Flow-V3 Showcase Sections

**Date:** 2026-03-16
**Reviewer:** code-reviewer agent

---

## Code Review Summary

### Scope
- Files reviewed: 7 showcase section files
  - `src/components/flow-v3/showcase/showcase-section-wrapper.tsx` (27 lines)
  - `src/components/flow-v3/showcase/project-dashboard-section.tsx` (79 lines)
  - `src/components/flow-v3/showcase/credits-billing-section.tsx` (108 lines)
  - `src/components/flow-v3/showcase/asset-library-section.tsx` (110 lines)
  - `src/components/flow-v3/showcase/character-library-section.tsx` (100 lines)
  - `src/components/flow-v3/showcase/export-settings-section.tsx` (158 lines)
  - `src/components/flow-v3/showcase/share-publish-section.tsx` (152 lines)
- Lines of code analyzed: ~734
- Review focus: New files, full content review
- Updated plans: none (no given plan file)

### Overall Assessment

Well-structured, consistently styled showcase components. Design pattern is uniform across all 7 files: `ShowcaseSection` wrapper + framer-motion entry animations + Tailwind dark theme. One **critical functional bug** (Audio tab shows no results), one **medium** leak risk (uncleared `setTimeout`), and several **accessibility gaps** across interactive `div`/`motion.div` elements.

TypeScript check: **clean** (0 errors). All files under 200 lines.

---

### Critical Issues

None (security/data-loss class).

---

### High Priority Findings

#### 1. `asset-library-section.tsx:36` — Audio tab filter always returns 0 results

```ts
// BUG: tab filter logic
const matchesTab = activeTab === 'All' || a.type === activeTab.slice(0, -1) || a.type + 's' === activeTab
```

- `'Images'.slice(0,-1)` → `'Image'` ✓
- `'Videos'.slice(0,-1)` → `'Video'` ✓
- `'Audio'.slice(0,-1)` → `'Audi'` ✗ — no match, Audio tab is permanently empty
- `'Characters'.slice(0,-1)` → `'Character'` ✓

Fix: Replace the fragile string-slicing with an explicit map:

```ts
const TAB_TYPE_MAP: Record<Tab, string | null> = {
  All: null, Images: 'Image', Videos: 'Video', Audio: 'Audio', Characters: 'Character'
}
const matchesTab = activeTab === 'All' || a.type === TAB_TYPE_MAP[activeTab]
```

---

### Medium Priority Improvements

#### 2. `share-publish-section.tsx:47` — `setTimeout` not cleaned up on unmount

```ts
function copyText(text: string, setter: (v: boolean) => void) {
  navigator.clipboard.writeText(text).catch(() => {})
  setter(true)
  setTimeout(() => setter(false), 2000)  // leaks if component unmounts within 2s
}
```

If the component unmounts before the 2-second timer fires, calling `setter(false)` on an unmounted component causes a React state update warning. Fix with `useRef` cleanup:

```ts
const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

function copyText(text: string, setter: (v: boolean) => void) {
  navigator.clipboard.writeText(text).catch(() => {})
  setter(true)
  if (timerRef.current) clearTimeout(timerRef.current)
  timerRef.current = setTimeout(() => setter(false), 2000)
}

useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])
```

#### 3. Accessibility — interactive `motion.div` / `div` elements lack keyboard support

Multiple locations use `motion.div` or `div` with `cursor-pointer` and click-like semantics but are not focusable or keyboard-activatable:

| File | Line | Element |
|------|------|---------|
| `project-dashboard-section.tsx` | 34, 65 | Project cards + "Create New Project" `motion.div` |
| `asset-library-section.tsx` | 59 | Sort dropdown `div` (not even a `<button>`) |
| `asset-library-section.tsx` | 86 | Asset grid items `motion.div` |
| `character-library-section.tsx` | 29, 87 | Character cards + "Create Character" `motion.div` |

These are showcase/demo components, so the impact is limited, but if production-intended they need `role="button"` + `tabIndex={0}` + `onKeyDown` handler (Enter/Space), or be converted to `<button>` elements.

The sort dropdown `<div>` at `asset-library-section.tsx:59` is a more immediate concern — it looks interactive but has no click handler and is not a `<button>`.

#### 4. `export-settings-section.tsx:133–138` — Watermark toggle `<button>` missing ARIA role

The custom toggle button lacks `role="switch"` and `aria-checked`. Compare with `user-preferences-section.tsx` (in the same directory) which correctly implements `role="switch"` + `aria-checked={checked}`. This is inconsistent.

```tsx
// Missing:
role="switch"
aria-checked={watermark}
aria-label="Watermark"
```

---

### Low Priority Suggestions

#### 5. `showcase-section-wrapper.tsx:9–10` — `React.ReactNode` without `import React`

Uses `React.ReactNode` in the interface without an explicit `import React from 'react'`. This works because `@types/react` exports `React` as a UMD global namespace (`export as namespace React`) and tsc accepts it. However it is implicit and inconsistent with standard practice. Same applies to `asset-library-section.tsx:24` and `share-publish-section.tsx:11`.

Recommendation: add `import type { ReactNode } from 'react'` and use `ReactNode` directly.

#### 6. `share-publish-section.tsx:37` — `frameborder` is deprecated HTML4

```ts
const EMBED_CODE = `<iframe ... frameborder="0" ...></iframe>`
```

`frameborder` is deprecated in HTML5. Use CSS `style="border: none"` instead. Low-impact since this is a static string for copy/paste, but incorrect as a code sample.

#### 7. `credits-billing-section.tsx:89` — Debit values display redundant sign

```tsx
{tx.type === 'credit' ? '+' : ''}{tx.credits}
// Renders: '-150' for debits (sign already in data)
// But '+500' for credits (sign prepended)
```

Works correctly since debit values already carry `-` in the data (`credits: -150`). However this is fragile — if a positive debit were ever added the display would show no sign. A more explicit format:

```tsx
{tx.type === 'credit' ? `+${tx.credits}` : `${tx.credits}`}
```

Or use `Intl.NumberFormat` with `signDisplay: 'always'`.

#### 8. `character-library-section.tsx:66–68` — Project tags capped at 2 with no overflow indicator

```tsx
{char.projects.slice(0, 2).map((p) => (...))}
```

If `char.projects.length > 2` there is no `+N more` indicator. Luna has 4 projects — user sees 2 with no hint there are more. Minor UX gap.

---

### Positive Observations

- Consistent wrapper pattern via `ShowcaseSection` — clean DRY usage
- Animation delays scale with index (`i * 0.06`) — prevents overwhelming simultaneous entrance
- `statusConfig` record in `project-dashboard-section.tsx` is clean separation of UI config from data
- `ExportSettingsSection` has thoughtful UX: estimated file size + credit cost updates reactively with selection
- `SharePublishSection` correctly uses two separate copy-state booleans (`copiedLink`, `copiedEmbed`) — no confusion between the two copy actions
- `statusConfig[project.status]` — TypeScript-safe with typed Record key
- All files well under 200-line limit
- Mock data is realistic and domain-consistent (music video production context)
- No hardcoded secrets or environment values

---

### Recommended Actions

1. **Fix Audio tab bug** — `asset-library-section.tsx:36` — replace slice-based logic with explicit `TAB_TYPE_MAP` (high, functional regression)
2. **Fix setTimeout leak** — `share-publish-section.tsx:47` — add `useRef` + `useEffect` cleanup
3. **Add ARIA to watermark toggle** — `export-settings-section.tsx:133` — `role="switch"` + `aria-checked`
4. **Convert interactive `motion.div` to `<button>` or add `role="button"` + keyboard handler** — project-dashboard, asset-library, character-library (if production-intended)
5. **Replace `frameborder` in embed code** — `share-publish-section.tsx:37` — use `style="border:none"`
6. **Explicit React type imports** — replace `React.ReactNode` with `import type { ReactNode } from 'react'`

### Metrics
- Type Coverage: 100% (TypeScript strict mode, 0 errors)
- Test Coverage: N/A (UI showcase components, no tests in scope)
- Linting Issues: 0 syntax errors; 1 functional bug; 1 leak risk; 3+ accessibility gaps

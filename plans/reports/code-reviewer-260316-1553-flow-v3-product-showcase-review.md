# Code Review: flow-v3 product/ & showcase/ components

**Date:** 2026-03-16
**Reviewer:** code-reviewer agent
**Plan:** none (ad-hoc review)

---

## Scope

- **Files reviewed:** 19 files (5 in `product/`, 13 in `showcase/`, 1 page)
- **Total LOC:** ~2,044
- **Review focus:** DRY, YAGNI, consistency, performance, file organization, imports, mock data, naming, file size

---

## Overall Assessment

Code is **well-structured and readable** for a prototype gallery. All files use `ShowcaseSection` uniformly, are properly named (kebab-case), and stay under the 200-line rule. The main issues are moderate: two parallel toggle implementations, hardcoded color tokens that could become semantic constants, a minor scroll-spy bug, and some mock data inconsistencies across sections.

---

## Critical Issues

None.

---

## High Priority Findings

### 1. Duplicate toggle implementations (DRY violation)

Two separate, non-identical toggle button implementations coexist:

**`export-settings-section.tsx` lines 133–138** — raw inline button:
```tsx
<button
  onClick={() => setWatermark(!watermark)}
  className={cn('h-5 w-9 rounded-full transition-all relative', watermark ? 'bg-primary' : 'bg-zinc-700')}
>
  <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all shadow', watermark ? 'left-4' : 'left-0.5')} />
</button>
```

**`user-preferences-section.tsx` lines 9–29** — `Toggle` component with `motion.span`, `role="switch"`, `aria-checked`.

The `product/` dir has `CreditsBadge` but no shared toggle. The `UserPreferencesSection` version is superior (animated, accessible). **The inline version in `export-settings-section.tsx` should be replaced** with either a shared component or the `Toggle` local component extracted to `product/`.

---

### 2. Scroll-spy attaches to wrong element (page.tsx)

**`src/app/flow-v3/showcase/page.tsx` line 42–54:**
```tsx
useEffect(() => {
  function onScroll() {
    const sections = navItems.map((n) => document.getElementById(n.id))...
    const scrollY = window.scrollY + 100   // <-- reads window scroll
    ...
  }
  const container = document.getElementById('showcase-scroll')
  container?.addEventListener('scroll', onScroll)   // <-- listens on container
  ...
}, [])
```

The handler reads `window.scrollY` but the scroll event fires on `#showcase-scroll` (the `<main>` element with `overflow-y-auto`). `window.scrollY` will always be 0 on non-window scrolls. Active section will never update on scroll. Fix: use `container.scrollTop` instead.

---

## Medium Priority Improvements

### 3. Hardcoded zinc/purple tokens inside showcase files (consistency)

Several showcase sections use literal zinc/purple Tailwind tokens instead of semantic design tokens (`bg-zinc-800`, `text-zinc-500`, `border-zinc-800`, `text-purple-400`). The `product/` components consistently use `border-border`, `text-muted-foreground`, `bg-card`, etc.

Affected files:
- `version-history-section.tsx` — lines 45, 57, 65
- `notification-center-section.tsx` — lines 58, 67, 83–85, 93–97
- `usage-analytics-section.tsx` — lines 55, 61–62, 70–71, 87, 92
- `generation-queue-section.tsx` — lines 55, 72–74, 97, 103, 109
- `user-preferences-section.tsx` — throughout (zinc-700/800, purple-600)
- `keyboard-shortcuts-section.tsx` — lines 64, 86, 92

The `project-dashboard-section.tsx`, `credits-billing-section.tsx`, `asset-library-section.tsx`, `export-settings-section.tsx`, `share-publish-section.tsx`, `character-library-section.tsx` all use semantic tokens. This split makes theme changes require touching half the files individually.

**Recommendation:** Replace literal zinc/purple tokens with semantic equivalents in the six inconsistent sections (non-blocking for prototype, but important for theme maintainability).

---

### 4. Mock data inconsistency across sections

Project names and character names are partially consistent but have gaps:

| Name in project-dashboard | Name in other sections |
|---|---|
| "Solar Flare" (artist: Kael Voss) | credits-billing uses "Solar Flare" correctly; generation-queue also uses it |
| "Midnight Dreams MV" (dashboard) | version-history uses "Midnight Dreams MV" but notification says "Midnight Dreams MV" then export says "Midnight Dreams" (no suffix) |
| character "Luna Eclipse" (artist for Midnight Dreams MV) | character-library has "Luna" as a separate character; asset-library has "Aria Character" and "Kael Character" — but "Aria" in character-library matches; no "Kael" entry in character-library matches "Kael Voss" the artist |

Specific issues:
- `credits-billing-section.tsx` line 10: `'Solar Flare'` — matches
- `credits-billing-section.tsx` line 11: `'Midnight Dreams'` — missing "MV" suffix used elsewhere
- `notification-center-section.tsx` line 31: `'Solar Flare'` but says "39 scenes" while generation-queue says "Scene 24/39" (consistent)
- `notification-center-section.tsx` line 32: `'Midnight Dreams MV (1080p)'` — consistent
- `generation-queue-section.tsx` line 25: `'Midnight Dreams'` — missing "MV"
- `character-library-section.tsx` line 10: character named "Aria" with `projects: ['Midnight Dreams', ...]` — dashboard uses "Midnight Dreams MV"; `asset-library-section.tsx` line 16: asset named "Aria Character" (consistent with character lib), line 20: "Kael Character" — but character library has "Kael" not "Kael Voss"

This inconsistency reduces the realism of the prototype demo.

---

### 5. `InfoTooltip` wraps `TooltipProvider` per instance (YAGNI / performance)

**`product/info-tooltip.tsx` line 12:**
```tsx
export function InfoTooltip({ content, side = 'top' }: InfoTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>...
```

Mounting a new `TooltipProvider` per tooltip is unnecessary overhead. `TooltipProvider` is designed to be placed once near the root. In a production build this is a minor memory concern; in a showcase with dozens of tooltips it is wasteful. Move `TooltipProvider` to the layout or app root.

---

### 6. `credits-badge.tsx` uses `href="#"` placeholder (line 65)

```tsx
<a href="#" className="...">
  <ShoppingCart className="h-3 w-3" />
  Buy more
</a>
```

`href="#"` scrolls to the top of the page and triggers a navigation event. Use `<button type="button">` or `href="javascript:void(0)"` (bad) or, best: extract to a no-op click handler. The rest of the codebase uses `<button onClick>` consistently for stub actions.

---

## Low Priority Suggestions

### 7. `asset-library-section.tsx` — tab filter logic is brittle (line 36)

```tsx
const matchesTab = activeTab === 'All' || a.type === activeTab.slice(0, -1) || a.type + 's' === activeTab
```

This relies on string trimming (`'Characters'.slice(0,-1) === 'Character'`) which breaks if a tab name or type name changes. A simple lookup map `{ Images: 'Image', Videos: 'Video', Audio: 'Audio', Characters: 'Character' }` is more maintainable.

---

### 8. `page.tsx` — 12 section components imported individually (low concern)

The 12 named imports at the top of the page are explicit and readable. A barrel index (`showcase/index.ts`) could shorten it to 3–4 lines but would introduce another file — for a showcase page this is YAGNI. Current approach is fine.

---

### 9. `generation-queue-section.tsx` line 75 — hardcoded "12 completed today"

```tsx
<span><span className="font-semibold text-emerald-400">12 completed today</span></span>
```

The job list only has 2 completed entries. The summary stat is not derived from `completed.length`. For a prototype this is cosmetic, but it reduces credibility in demos.

---

### 10. `keyboard-shortcuts-section.tsx` — array index used as `key` (line 99)

```tsx
{s.keys.map((k, ki) => (
  <span key={ki} className="...">
```

Index keys are generally fine for static, non-reordered lists, which this is. Low concern.

---

### 11. `user-preferences-section.tsx` line 72 — `displayName` state is orphaned

State `displayName` is read/set but the "Save" action for preferences doesn't exist (no save button visible for the whole form). This is expected for a prototype but `displayName` at least changes visually, while the email at line 160 `jamie@songgen.io` is hardcoded — this is consistent with prototype intent.

---

## Positive Observations

1. **`ShowcaseSection` wrapper** — used uniformly in all 12 sections with consistent `id`, `title`, `description`, `icon` props. Pattern is clean and composable.
2. **Animation consistency** — staggered `delay: i * 0.0X` pattern with `opacity + y/x` initial states is consistent across all sections.
3. **All files are under 200 lines** — largest is `user-preferences-section.tsx` at 174 lines. Well within rule.
4. **Kebab-case naming** — all files follow the convention. Names are self-documenting.
5. **`product/` vs `showcase/` split is logical** — `product/` contains standalone reusable UI widgets (`CostEstimateTag`, `CreditsBadge`, `EditProjectModal`, `InfoTooltip`, `ProjectInfoBar`); `showcase/` contains full gallery demo sections. No circular dependencies possible since showcase sections import from `product/` and `product/` imports only from `@/lib/utils` and `@/components/ui/`.
6. **Controlled/uncontrolled pattern** in `EditProjectModal` (lines 37–40) is well-implemented.
7. **Type definitions** — `NotifType`, `JobStatus`, `Privacy` union types are used appropriately.

---

## Recommended Actions

1. **(High)** Fix scroll-spy in `page.tsx` line 44: `window.scrollY` → `(e.target as HTMLElement).scrollTop` or `container.scrollTop` inside the handler.
2. **(High)** Extract the `Toggle` component from `user-preferences-section.tsx` into `product/toggle.tsx` and replace the inline toggle in `export-settings-section.tsx` with it.
3. **(Medium)** Move `TooltipProvider` out of `InfoTooltip` to app/layout root.
4. **(Medium)** Standardize mock project/character names: decide on "Midnight Dreams MV" vs "Midnight Dreams" and apply uniformly across all section files.
5. **(Medium)** Migrate `version-history-section.tsx`, `notification-center-section.tsx`, `usage-analytics-section.tsx`, `generation-queue-section.tsx`, `user-preferences-section.tsx`, `keyboard-shortcuts-section.tsx` to use semantic design tokens (`text-muted-foreground`, `border-border`, `bg-card`, etc.) instead of literal zinc/purple.
6. **(Low)** Replace `href="#"` in `credits-badge.tsx:65` with `<button type="button">`.
7. **(Low)** Replace brittle tab filter logic in `asset-library-section.tsx:36` with a lookup map.
8. **(Low)** Fix hardcoded "12 completed today" in `generation-queue-section.tsx:75` to derive from data.

---

## Metrics

- **Type coverage:** Full — all components have explicit interfaces; no implicit `any`
- **Test coverage:** N/A (showcase/prototype, no tests expected)
- **Linting issues:** 0 syntax errors observed; ~6 stylistic/logic concerns noted above
- **Files over 200 lines:** 0
- **Files violating kebab-case:** 0

---

## Unresolved Questions

- Is `product/` intended to be consumed by the actual main editor (flow-v3 page) or only by the showcase? If the former, `Toggle` extraction becomes more urgent.
- Should `InfoTooltip` remain in `product/` given that none of the 12 showcase sections currently import it? It may be used in the main editor — if not, it qualifies as YAGNI in the current scope.

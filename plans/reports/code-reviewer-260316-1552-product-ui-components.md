# Code Review: Product UI Components (flow-v3/product)

## Scope
- Files reviewed: 5
  - `src/components/flow-v3/product/credits-badge.tsx` (106 lines)
  - `src/components/flow-v3/product/project-info-bar.tsx` (89 lines)
  - `src/components/flow-v3/product/info-tooltip.tsx` (26 lines)
  - `src/components/flow-v3/product/cost-estimate-tag.tsx` (29 lines)
  - `src/components/flow-v3/product/edit-project-modal.tsx` (160 lines)
- Lines of code analyzed: 410
- Review focus: New files — type safety, accessibility, patterns, correctness
- Updated plans: none (no plan file provided)

## Overall Assessment
Files are well-structured, readable, under the 200-line limit, and consistent with existing codebase patterns. TypeScript compiles clean with strict mode. The main concerns are: (1) an unused prop, (2) three `<label>` elements not linked to their inputs, (3) a stale-closure risk in `project-info-bar.tsx`, (4) a Tailwind opacity utility that may not generate at build time, and (5) missing ARIA attributes on interactive elements that change state. No critical security or data-loss issues.

---

## Critical Issues
None.

---

## High Priority Findings

### H1 — `label` elements not associated with inputs (`edit-project-modal.tsx:84,95,107`)
All three `<label>` elements lack `htmlFor` attributes and the inputs lack `id` attributes. This breaks screen-reader association — clicking the label will not focus the input.

```tsx
// Current (broken)
<label className="...">Project Name</label>
<input value={name} ... />

// Fix
<label htmlFor="project-name" className="...">Project Name</label>
<input id="project-name" value={name} ... />
```
Same pattern applies to `description` (line 95) and `tags` (line 107/130).

### H2 — `draft` state not synced when `name` prop changes externally (`project-info-bar.tsx:15`)
`draft` is initialised from `name` once at mount. If the parent updates `name` (e.g. loaded async), `draft` remains stale and editing would overwrite the new value with the old one.

```tsx
// Add a useEffect to sync
useEffect(() => {
  if (!editing) setDraft(name)
}, [name, editing])
```

### H3 — Unrecognised Tailwind arbitrary value `bg-amber-500/8` (`cost-estimate-tag.tsx:20`)
Tailwind's opacity modifier generates in steps of 5 (5, 10, 15 … 95, 100). The value `/8` is not a standard step and will be silently dropped in a standard Tailwind 4 setup unless `bg-opacity: 8` is explicitly added to the theme. Use `bg-amber-500/10` (already used for `md` size) or add a theme extension.

---

## Medium Priority Improvements

### M1 — `compact` prop accepted but never used (`credits-badge.tsx:11,17`)
The prop is declared in the interface and destructured with a default but has no effect in the render tree. Either implement the compact layout variant or remove the prop.

### M2 — Missing ARIA state on `CreditsBadge` toggle button (`credits-badge.tsx:36-47`)
The button opens a popup panel but has no `aria-expanded` or `aria-haspopup` attribute. Screen readers cannot convey the open/closed state.

```tsx
<button
  onClick={() => setOpen((o) => !o)}
  aria-expanded={open}
  aria-haspopup="true"
  aria-label="Credits balance"
  ...
>
```

### M3 — `a href="#"` placeholder link in dropdown (`credits-badge.tsx:65`)
`href="#"` causes a scroll-to-top on click and is semantically incorrect for a navigating action. If the "Buy more" action is not yet implemented, use a `<button>` instead.

```tsx
// Replace <a href="#"> with:
<button
  type="button"
  className="flex items-center gap-1 ..."
  onClick={() => { /* TODO: open purchase flow */ }}
>
```

### M4 — Missing ARIA label on settings button (`project-info-bar.tsx:80-86`)
The icon-only settings button has only `title="Project settings"`. `title` is not reliably announced by all screen readers; add `aria-label` as well.

```tsx
<button aria-label="Project settings" title="Project settings" ...>
```

### M5 — Remove tag button has no accessible label (`edit-project-modal.tsx:115-120`)
The `<button>` wrapping the `X` icon that removes a tag has no text content, `aria-label`, or `title`. Screen readers will announce it as an unlabelled button.

```tsx
<button
  onClick={() => removeTag(tag)}
  aria-label={`Remove tag ${tag}`}
  className="..."
>
  <X className="h-2.5 w-2.5" />
</button>
```

### M6 — `TooltipProvider` instantiated per `InfoTooltip` usage (`info-tooltip.tsx:13`)
Radix recommends a single `TooltipProvider` at the application root. Nesting one inside every `InfoTooltip` is safe but wasteful — each instance creates its own provider context. If `setup-step.tsx` renders several `InfoTooltip` simultaneously (it renders 3), the extra providers add minor overhead.

Low-friction fix: wrap the app layout in a single `TooltipProvider` and remove it from `InfoTooltip`. Medium effort; low urgency for a prototype.

### M7 — `setOpen` fallback to `setInternalOpen` when controlled (`edit-project-modal.tsx:40`)
```ts
const setOpen = isControlled ? (onOpenChange ?? setInternalOpen) : setInternalOpen
```
When `controlledOpen` is defined but `onOpenChange` is not provided, the component silently falls back to internal state — meaning the controlled open value and internal state diverge. This is a logic inconsistency. Either document that `onOpenChange` is required when `open` is provided, or mark it required via TypeScript when `open` is defined (using a discriminated union prop).

---

## Low Priority Suggestions

### L1 — Hardcoded timestamp `"Edited 2 min ago"` (`project-info-bar.tsx:73`)
The timestamp is a static string. If this is intended as a UI placeholder, that's fine for a prototype — but note it will always show "2 min ago" regardless of state. A `lastSavedAt?: Date` prop would be the minimal real implementation.

### L2 — Hardcoded default tags `['music video', 'cinematic']` (`edit-project-modal.tsx:44`)
Tags are initialised with hardcoded values and not derived from `projectName` or any prop. If projects should persist their own tags, these defaults should come from a prop (e.g. `initialTags?: string[]`).

### L3 — `setTimeout` for input selection in `startEdit` (`project-info-bar.tsx:21`)
`setTimeout(..., 0)` to call `.select()` after setting `editing = true` works but is fragile. Prefer a `useEffect` keyed on `editing`:
```tsx
useEffect(() => {
  if (editing) inputRef.current?.select()
}, [editing])
```
This removes the implicit timing dependency.

### L4 — `CostEstimateTag` renders `<span>` not `<button>` — consistent with its read-only intent
This is intentional and correct. No change needed. Noted as positive.

---

## Positive Observations
- All files under 200 lines — clean separation of concerns.
- `CreditsBadge`: outside-click handler correctly uses `mousedown` and is properly cleaned up via `useEffect` return — no memory leak.
- `EditProjectModal`: controlled/uncontrolled pattern (M7 aside) is a good approach for reuse across contexts.
- Consistent use of `cn()` for conditional class merging throughout — matches codebase convention.
- `tabular-nums` class on all credit/number displays — prevents layout jitter as values change.
- `shrink-0` on icons — prevents icon squishing in flex rows.
- TypeScript strict mode passes with zero errors.
- File sizes and responsibilities well-scoped — no violations of the 200-line guideline.

---

## Recommended Actions
1. **(H1)** Add `id` + `htmlFor` pairs for all 3 label/input pairs in `edit-project-modal.tsx`.
2. **(H2)** Add `useEffect` to sync `draft` with `name` prop in `project-info-bar.tsx`.
3. **(H3)** Replace `bg-amber-500/8` with `bg-amber-500/10` in `cost-estimate-tag.tsx`.
4. **(M1)** Remove unused `compact` prop from `credits-badge.tsx` or implement it.
5. **(M2)** Add `aria-expanded`, `aria-haspopup`, `aria-label` to toggle button in `credits-badge.tsx`.
6. **(M3)** Replace `<a href="#">` with `<button>` in `credits-badge.tsx` dropdown.
7. **(M4)** Add `aria-label` to the settings icon button in `project-info-bar.tsx`.
8. **(M5)** Add `aria-label` to remove-tag buttons in `edit-project-modal.tsx`.
9. **(M7)** Clarify/enforce the `open`+`onOpenChange` contract in `edit-project-modal.tsx` props.

---

## Metrics
- Type Coverage: 100% (strict mode, no `any`)
- Test Coverage: N/A (prototype, no tests in scope)
- Linting Issues: 0 compile errors; accessibility issues: 5 (H1 ×3 inputs, M2, M4, M5)
- Files over 200 lines: 0

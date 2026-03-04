# Cremi UI/UX Prototype Concepts - Brainstorming Report

**Date:** 2026-03-02
**Context:** 5 distinct frontend-only prototype concepts for the Cremi music video creation platform
**Stack:** Next.js 15 + Tailwind CSS + shadcn/ui, static/mock data

---

## Problem Statement

Cremi needs to explore different product directions before committing to a single UI/UX approach. The current production frontend uses a traditional sidebar + page layout with a step-based video generation flow. We need 5 genuinely different interface concepts that reimagine how users interact with the core flow: creating music videos from prompts, managing scenes, previewing results, and sharing with community.

---

## Concept 1: "STUDIO" - Dark Professional DAW

### Name & Theme
**Studio** -- A digital audio workstation (DAW) inspired interface. Think Ableton Live meets DaVinci Resolve. Dark theme with precise controls and professional terminology.

### Layout Philosophy
Horizontal timeline as the central organizing element. Every action anchors to a point on the timeline. The screen is divided into 3 zones:
- **Top bar:** Project name, export controls, credit balance, settings
- **Center stage:** Large preview monitor (60% of viewport) flanked by a narrow properties panel
- **Bottom dock:** Full-width timeline with scene tracks, audio waveform, and keyframe markers

### Key Interaction Pattern
**Timeline-first editing.** Users drag-drop scenes onto a multi-track timeline. Audio waveform is always visible beneath the video track. Scene boundaries snap to beat markers detected in the uploaded audio. Users scrub through the timeline to preview transitions. Double-clicking a scene on the timeline opens an inline editor -- no modal popups, no page navigation.

### Target User Persona
**"The Producer"** -- Semi-professional content creators, music producers, YouTubers who already use tools like Premiere Pro or CapCut. They expect keyboard shortcuts, precise control, and professional terminology. Age 22-35, technically proficient, values efficiency over guidance.

### Core Screens
1. **Project Dashboard** - Grid of recent projects with thumbnail previews, status badges (draft/rendering/complete), and quick-resume buttons. Dark card-based layout.
2. **Timeline Editor** - The main workspace. Large video preview top-center, timeline bottom, properties panel right. Scene thumbnails on the timeline track with drag handles.
3. **Scene Composer** - Inline panel (slides in from right) with subject/action/environment/camera fields. Live preview updates as you type. Prompt history sidebar.
4. **Audio Lab** - Waveform visualization with beat detection markers. Region selection for scene assignment. Upload or generate music controls.
5. **Export & Share** - Render queue with quality settings, format options, and one-click share to community/social platforms.

### Visual Style
- **Palette:**
  - Background: `#0D0D0D` (near-black) with `#1A1A2E` (dark navy) panels
  - Primary: `#7C3AED` (violet-600) for active elements and selection highlights
  - Secondary: `#22D3EE` (cyan-400) for audio waveforms and beat markers
  - Accent: `#F59E0B` (amber-500) for warnings, credits, and CTAs
  - Surface: `#1E1E2E` for cards and panels, `#2A2A3A` for hover states
  - Text: `#E5E7EB` (gray-200) primary, `#9CA3AF` (gray-400) secondary
- **Typography:** `JetBrains Mono` for labels/metadata, `Inter` for body text. Small font sizes (12-14px) to maximize workspace density.
- **Animations:** Minimal and functional. 150ms ease-out for panel transitions. No decorative animations. Waveform rendering is the "animation" -- real-time audio visualization.
- **Visual references:** Ableton Live, DaVinci Resolve, Figma's dark mode

### Unique Components
- `<TimelineTrack>` - Horizontal scrolling track with draggable scene blocks
- `<WaveformRuler>` - Audio waveform with beat markers and region selection
- `<PreviewMonitor>` - Video preview with transport controls (play/pause/scrub)
- `<PropertyInspector>` - Context-sensitive right panel that changes based on selection
- `<KeyboardShortcutOverlay>` - Press `?` to show all shortcuts

---

## Concept 2: "VIBE" - Bright Social-First Mobile

### Name & Theme
**Vibe** -- A TikTok/Instagram-inspired vertical-first interface. Bright, playful, emoji-friendly. The creation flow feels like posting a story, not using production software. Community feed is the homepage, not a secondary feature.

### Layout Philosophy
Vertical stack, card-based, scroll-driven. No sidebar navigation -- use a bottom tab bar (mobile) or slim top nav (desktop). Content is organized as a social feed. Creating a video starts from a floating action button (FAB) that opens a full-screen creation sheet.

- **Feed-first:** Homepage is the community explore feed. Your own projects appear as "drafts" in your profile tab.
- **Bottom tabs:** Home (feed) / Create (+) / Activity (notifications) / Profile (projects)
- **Full-screen creation:** Tapping "Create" opens a vertically stacked wizard with swipe-to-advance steps.

### Key Interaction Pattern
**Swipe-driven creation flow.** The creation process is a series of full-screen cards you swipe through:
1. Upload/record audio (swipe right)
2. Describe your vision in a chat-like prompt box (swipe right)
3. Review AI-generated scenes as a vertical carousel (swipe up/down to browse, tap to edit)
4. Preview and publish

No complex forms. Each step fits on one screen. Heavy use of preset buttons ("Dreamy", "Energetic", "Dark", "Retro") instead of typed prompts.

### Target User Persona
**"The Creator"** -- Gen Z and young millennials who make content for TikTok/Instagram. They want fast results, not granular control. They share everything. They think in terms of "vibes" not "specifications." Age 16-28, mobile-native, values speed and aesthetics.

### Core Screens
1. **Discover Feed** - Masonry grid of community videos with play-on-hover. Infinite scroll. Like/save/remix buttons. Trending tags at top.
2. **Create Sheet** - Full-screen bottom sheet with 3-step swipe flow: Audio -> Prompt -> Style. Each step is one screen with large touch targets.
3. **Scene Carousel** - Vertical TikTok-style scroll through generated scenes. Tap a scene to enter inline edit mode. Swipe up to advance.
4. **Profile/Projects** - Your creations displayed as a profile grid (like Instagram). Drafts section at top, published below. Stats (views, likes, remixes).
5. **Video Player** - Full-screen immersive player with comments sliding up from bottom, like TikTok.

### Visual Style
- **Palette:**
  - Background: `#FFFFFF` (white) with `#F8FAFC` (slate-50) sections
  - Primary: `#EC4899` (pink-500) for CTAs and active states
  - Secondary: `#8B5CF6` (violet-500) for secondary actions and gradients
  - Accent: `#06B6D4` (cyan-500) for links and interactive elements
  - Gradient: `linear-gradient(135deg, #EC4899, #8B5CF6)` for the Create FAB and key CTAs
  - Text: `#0F172A` (slate-900) primary, `#64748B` (slate-500) secondary
- **Typography:** `Plus Jakarta Sans` for headings (rounded, friendly), `Inter` for body. Larger sizes (16-18px body) for mobile readability.
- **Animations:** Playful and expressive. Spring physics for the FAB (bouncy on tap). Swipe transitions with momentum. Confetti on first publish. Skeleton loading with pulse. 300ms spring curves.
- **Visual references:** TikTok creator tools, Instagram Stories editor, BeReal

### Unique Components
- `<FloatingCreateButton>` - Gradient circle FAB with spring animation on press
- `<SwipeWizard>` - Full-screen horizontal swipe container for creation steps
- `<VibePresetGrid>` - Grid of style presets with preview thumbnails ("Dreamy", "Cyberpunk", "Lo-fi")
- `<SceneCarousel>` - Vertical snap-scroll through scene previews
- `<CommunityFeed>` - Masonry grid with play-on-hover video cards
- `<ReactionsBar>` - Floating reaction buttons along right edge (like TikTok)

---

## Concept 3: "ZEN" - Minimal Single-Focus Canvas

### Name & Theme
**Zen** -- An ultra-minimal interface inspired by iA Writer and Linear. One thing at a time. No clutter, no distractions. The interface literally fades away elements you are not actively using.

### Layout Philosophy
Single-column centered layout. Maximum 640px content width. One primary action per screen. Navigation is contextual breadcrumbs at the top, not a persistent sidebar. The interface uses progressive disclosure -- advanced options are hidden behind expandable sections.

- **Single focus:** Only one panel/section is visually active at a time. Others dim to 40% opacity.
- **Breathing room:** Generous padding (32-48px), large line heights, plenty of whitespace.
- **Contextual nav:** Breadcrumb trail replaces traditional navigation. `Home > Project > Scenes > Scene 3`

### Key Interaction Pattern
**Focus-mode editing.** When you click into a scene prompt, everything else dims. The prompt field expands to fill the available space. A subtle "done" checkmark appears when you finish. Moving to the next step is explicit -- you click "Continue" rather than navigating a complex layout. The interface rewards patience and intentionality.

Keyboard-centric: `Tab` to advance through fields, `Enter` to confirm, `Escape` to go back. No mouse hunting.

### Target User Persona
**"The Artist"** -- Musicians, poets, and visual artists who find complex interfaces overwhelming. They want a calm, focused environment where they can think clearly about their creative vision. Age 25-45, values simplicity, probably uses tools like Notion, Bear, or iA Writer. Might be neurodivergent and benefit from reduced visual noise.

### Core Screens
1. **Home** - Just your projects listed vertically with clean typography. A single "New Project" button. No community, no stats, no noise. Optional "Explore" link in footer.
2. **Project Canvas** - Vertical scroll through project phases. Each phase is a collapsible card: Audio -> Vision -> Scenes -> Preview -> Export. Only the active phase is expanded.
3. **Scene Editor** - Full-screen prompt editor with large monospace text field. Minimal controls: subject, action, environment as inline tags below the prompt. Real-time character count.
4. **Preview** - Clean video player centered on screen. Nothing else visible. Play/pause and timeline scrubber only.
5. **Share** - Simple share form: title, description, visibility toggle. One "Publish" button.

### Visual Style
- **Palette:**
  - Background: `#FAFAFA` (near-white) -- or `#111111` in dark mode with no in-between
  - Primary: `#18181B` (zinc-900) for text and primary actions
  - Secondary: `#A1A1AA` (zinc-400) for secondary text and borders
  - Accent: `#2563EB` (blue-600) for the single active element/CTA -- used sparingly
  - Surface: `#FFFFFF` for cards with `1px solid #E4E4E7` borders
  - Focus ring: `#2563EB` with 2px offset for keyboard navigation
- **Typography:** `iA Writer Quattro` (or `IBM Plex Mono`) for prompts/creative text, `Inter` for UI chrome. Body at 18px with 1.75 line height. Headings at 24-32px, no bold -- just size differentiation.
- **Animations:** Almost none. 200ms ease for opacity transitions when elements dim/activate. No bouncing, no springs, no confetti. The only motion is a subtle pulse on the active element indicator.
- **Visual references:** iA Writer, Linear.app, Notion in minimal mode, Bear notes app

### Unique Components
- `<FocusContainer>` - Wrapper that dims siblings when child receives focus
- `<CollapsiblePhase>` - Accordion-style project phase with smooth expand/collapse
- `<PromptCanvas>` - Full-width monospace text area with inline tag controls
- `<BreadcrumbNav>` - Minimal contextual breadcrumb replacing traditional nav
- `<ProgressDots>` - Simple dot indicators showing project completion progress

---

## Concept 4: "NEON" - Retro-Futuristic Creative Playground

### Name & Theme
**Neon** -- A vaporwave/synthwave-inspired interface that treats the creation process as play, not work. Glowing neon accents on dark backgrounds, chrome gradients, retro-futuristic grid patterns. The interface itself is a visual experience.

### Layout Philosophy
Asymmetrical grid with floating panels. No rigid columns. Panels can be dragged and repositioned (or snap to predefined layouts). The background features a subtle animated grid pattern (retro perspective grid). Content panels have frosted glass (backdrop-blur) backgrounds with neon border glows.

- **Floating panels:** Scene editor, audio player, preview monitor are all draggable floating windows with neon-glow borders.
- **Command palette:** Central command palette (triggered by `Cmd+K`) for all actions -- no traditional menus.
- **Ambient background:** Subtle animated gradient background that shifts based on the current project's "mood."

### Key Interaction Pattern
**Remix-first creation.** Instead of starting from a blank canvas, users browse a gallery of community templates/starting points and "remix" them. The creation flow is non-linear -- users can jump between audio, scenes, and style in any order. Everything auto-saves. A persistent floating toolbar provides quick access to all tools.

The interface encourages experimentation: every change is instantly previewable, and an "undo stack" visualized as a horizontal timeline lets users scrub through previous states.

### Target User Persona
**"The Experimenter"** -- Creative technologists, VJs, visual artists, and indie musicians who see software as a creative medium. They want to play, not follow steps. They appreciate aesthetic software (think: Winamp skins, customizable interfaces). Age 20-35, design-aware, values self-expression and customization.

### Core Screens
1. **Launchpad** - Grid of featured templates and community remixes on an animated gradient background. Each card has a glowing border that pulses. Search via command palette.
2. **Workspace** - Freeform canvas with floating panels: Preview Monitor, Scene Cards (horizontal scroll), Audio Deck, Style Controls. Panels have neon-glow borders and frosted glass backgrounds.
3. **Remix Browser** - Full-screen gallery of community creations with "Remix This" buttons. Filter by style/mood/genre. Preview on hover with audio.
4. **Style Lab** - Dedicated panel for adjusting visual style: color grading presets, motion intensity, transition types. Visual sliders with real-time preview.
5. **Showcase** - Publication screen with social preview cards showing how the video will look on different platforms.

### Visual Style
- **Palette:**
  - Background: `#0A0A0F` (deep black) with animated gradient overlays
  - Primary: `#FF006E` (hot pink/magenta neon) for primary actions
  - Secondary: `#00F5D4` (cyan/turquoise neon) for secondary elements
  - Tertiary: `#FEE440` (neon yellow) for highlights and badges
  - Surface: `rgba(255, 255, 255, 0.05)` with `backdrop-blur-xl` for panels
  - Borders: `1px solid rgba(255, 0, 110, 0.3)` with `box-shadow: 0 0 20px rgba(255, 0, 110, 0.15)`
  - Text: `#EEEEF0` primary, `#888899` secondary
- **Typography:** `Space Grotesk` for headings (geometric, slightly retro), `IBM Plex Sans` for body. Chrome gradient effect on main headings using `background-clip: text`.
- **Animations:** Expressive and ambient. Neon glow pulse on hover (CSS box-shadow animation). Subtle parallax on panel backgrounds. Grid line animation in background (45-degree perspective grid slowly scrolling). Panel open/close with scale + fade. 400ms spring curves.
- **Visual references:** Winamp, Synthwave album art, cyberpunk game UIs, Resolume VJ software

### Unique Components
- `<NeonPanel>` - Frosted glass panel with configurable neon glow color border
- `<CommandPalette>` - `Cmd+K` triggered search/action palette with fuzzy matching
- `<RetroGrid>` - Animated CSS perspective grid background
- `<ChromeText>` - Gradient chrome/metallic text effect for headings
- `<FloatingToolbar>` - Persistent mini toolbar that follows cursor area
- `<UndoTimeline>` - Horizontal scrubber showing visual history of changes
- `<RemixCard>` - Community video card with "Remix This" fork action

---

## Concept 5: "DIRECTOR" - Cinematic Storyboard Theater

### Name & Theme
**Director** -- A film director's workspace. The metaphor is a physical storyboard pinned to a corkboard, with a screening room for previews. Warm cinematic tones, letterboxed video previews, film-industry terminology (scenes, takes, cuts, reels).

### Layout Philosophy
Two-mode interface that toggles between **Storyboard View** and **Screening Room**:

- **Storyboard View (default):** A large canvas showing scene cards arranged in a horizontal filmstrip. Each card shows a thumbnail, scene number, duration, and prompt excerpt. Cards can be reordered by drag-drop. Below the filmstrip is a collapsed audio timeline.
- **Screening Room:** Full-screen dark viewing mode with letterboxed video player, minimal controls, and a scene index sidebar.

The header is a classic "director's slate" motif with project name, scene count, total duration, and status.

### Key Interaction Pattern
**Storyboard-first composition.** Users think in terms of scenes on a physical board. They pin reference images, write shot descriptions, specify camera angles -- all within a card metaphor. Double-clicking a storyboard card flips it over to reveal the detailed editor (backside contains prompt fields, camera controls, motion settings). This card-flip interaction is the signature UX moment.

The "Take" system: Each scene can have multiple AI-generated "takes." Users review takes (like a film director reviewing dailies) and select the best one. Takes are displayed as a horizontal strip within each scene card.

### Target User Persona
**"The Director"** -- Filmmakers, film students, screenwriters, and narrative-focused creators who think in terms of story structure, shot composition, and visual storytelling. They understand concepts like "coverage," "B-roll," and "establishing shots." Age 25-45, film-literate, values narrative coherence over speed.

### Core Screens
1. **Slate** (Home) - Project list displayed as film reels/clapperboards. Each project shows a thumbnail grid of its scenes. "New Production" button with director's slate animation.
2. **Storyboard Canvas** - Horizontal filmstrip of scene cards on a warm-toned canvas. Drag to reorder. Pin reference images. Each card shows scene number, thumbnail, duration tag.
3. **Scene Card (flipped)** - Card flip reveals backside with full scene editor: subject, action, environment, camera angle, camera movement, prompt field, reference image upload. "Generate Take" button.
4. **Dailies Review** - Horizontal strip of generated takes for a scene. Compare takes side by side. Select "hero take" for final cut. Add director's notes.
5. **Screening Room** - Letterboxed full-screen player. Scene index in collapsible left sidebar. Playback controls with timecode display. "Approve" or "Reshoot" buttons per scene.
6. **Wrap Party** (Export/Share) - Final export with film-credit-style roll of project details. Share options with platform-specific preview cards.

### Visual Style
- **Palette:**
  - Background: `#1C1917` (stone-900) warm near-black
  - Primary: `#D97706` (amber-600) for primary actions -- warm, cinematic gold
  - Secondary: `#78716C` (stone-500) for secondary elements
  - Accent: `#DC2626` (red-600) for "recording/active" indicators
  - Surface: `#292524` (stone-800) for cards with `#44403C` (stone-700) borders
  - Canvas texture: Subtle paper/cork texture overlay at 5% opacity
  - Text: `#FAFAF9` (stone-50) primary, `#A8A29E` (stone-400) secondary
- **Typography:** `Playfair Display` for project titles and scene headings (cinematic serif), `Source Sans 3` for body and UI text. Timecode displays in `JetBrains Mono`.
- **Animations:** Cinematic and purposeful. Card flip animation (3D CSS transform, 500ms). Letterbox bars sliding in/out when entering Screening Room. Fade-to-black transitions between views. Film grain overlay (CSS noise filter at very low opacity). Scene card entrance with subtle stagger animation.
- **Visual references:** Milanote storyboard tools, Final Draft screenplay software, Arc browser's spaces, Film clapperboard aesthetics

### Unique Components
- `<StoryboardFilmstrip>` - Horizontal scrollable filmstrip with drag-to-reorder scene cards
- `<SceneCard>` - Flippable card (front: thumbnail + metadata, back: full editor)
- `<TakeStrip>` - Horizontal strip of AI-generated variations with compare/select
- `<ScreeningRoom>` - Full-screen letterboxed player with retractable controls
- `<DirectorsSlate>` - Animated clapperboard header with project metadata
- `<TimecodeDisplay>` - Monospace timecode counter (HH:MM:SS:FF format)
- `<FilmGrainOverlay>` - Subtle CSS-based grain texture overlay

---

## Comparison Matrix

| Dimension | STUDIO | VIBE | ZEN | NEON | DIRECTOR |
|-----------|--------|------|-----|------|----------|
| **Primary metaphor** | DAW/NLE | Social app | Notes app | Creative playground | Film production |
| **Complexity** | High | Low | Minimal | Medium | Medium-High |
| **Target skill** | Professional | Beginner | Any | Intermediate | Intermediate |
| **Mobile-first?** | No (desktop) | Yes | Responsive | No (desktop) | No (desktop) |
| **Community** | Secondary | Primary | Minimal | Integrated (remix) | Minimal |
| **Learning curve** | Steep | Flat | Flat | Medium | Medium |
| **Creation flow** | Timeline drag | Swipe wizard | Sequential focus | Freeform/remix | Storyboard cards |
| **Dark/Light** | Dark only | Light only | Both (stark) | Dark only | Dark (warm) |
| **Animation level** | Minimal | Playful | Almost none | Expressive | Cinematic |
| **Differentiator** | Timeline + waveform | Social feed + FAB | Focus dimming | Neon glow + remix | Card flip + takes |

---

## Implementation Considerations

### Shared Infrastructure (all 5 prototypes)
- **Mock data layer:** Create a shared `/lib/mock/` directory with fake projects, scenes, community videos, user profiles. All prototypes consume the same data shape.
- **shadcn/ui base:** All prototypes share the same shadcn/ui primitives (Button, Dialog, Card, etc.) but with different theme configurations via CSS custom properties.
- **Route structure:** Each prototype lives under its own route prefix: `/studio`, `/vibe`, `/zen`, `/neon`, `/director`. A landing page at `/` lets users choose which prototype to explore.
- **Responsive breakpoints:** STUDIO and NEON are desktop-optimized (min-width: 1024px). VIBE is mobile-first. ZEN is fluid. DIRECTOR is desktop with tablet support.

### Technical Risks
- **Timeline component (STUDIO):** Most complex to build. Consider using a simplified version -- fixed-width scene blocks rather than true drag-resize. CSS Grid can handle the track layout without a full timeline library.
- **Card flip (DIRECTOR):** 3D CSS transforms can have rendering issues on some browsers. Need `perspective` on parent and `transform-style: preserve-3d` on the card. Test on Safari.
- **Frosted glass (NEON):** `backdrop-filter: blur()` has performance implications with many overlapping panels. Limit to 3-4 panels max.
- **Waveform (STUDIO):** Even for mock data, rendering a fake waveform visualization adds visual credibility. Use a pre-generated SVG path rather than WaveSurfer.js to keep it static.
- **Drag-and-drop (STUDIO, DIRECTOR):** Use HTML5 drag-and-drop API or a lightweight library. Avoid heavy dependencies for prototypes.

### Estimated Build Effort (per concept)
- **ZEN:** 2-3 days (simplest, mostly typography and layout)
- **VIBE:** 3-4 days (many screens but simple components)
- **DIRECTOR:** 4-5 days (card flip animation, storyboard canvas)
- **NEON:** 4-5 days (custom animations, floating panels, command palette)
- **STUDIO:** 5-7 days (timeline component, waveform, panel system)

### Recommendation
Build in this order: ZEN -> VIBE -> DIRECTOR -> NEON -> STUDIO. This goes from simplest to most complex, allowing the team to ship early prototypes quickly while iterating on the harder concepts. ZEN and VIBE represent the two extremes (minimal vs social) and will generate the most contrasting user feedback.

---

## Success Metrics & Validation

For each prototype, measure during user testing:
1. **Time to first video creation** - Can users complete the core flow within 5 minutes?
2. **Comprehension** - Do users understand what each screen does without explanation?
3. **Emotional response** - Which prototype makes users say "I want to use this"?
4. **Feature discoverability** - Can users find scene editing, audio upload, and sharing?
5. **Return preference** - After trying all 5, which one would they choose for daily use?

---

## Unresolved Questions

1. Should the prototypes share a common component library, or should each have fully independent components to maximize visual distinctiveness?
2. Is there a preference for which user persona Cremi primarily targets? This would weight one concept over others.
3. Should community/social features be present in all prototypes, or is it acceptable for some (ZEN, DIRECTOR) to deliberately exclude them?
4. What is the timeline for user testing? This affects how polished each prototype needs to be.
5. Are there existing brand guidelines (logo, colors, font) that all prototypes must incorporate, or is the visual identity still open?
6. Should prototypes include the credit system UI, or focus purely on the creative workflow?

# Cremi v2 UI Concepts: Agentic Chat + Video Editor Integration

**Date:** 2026-03-02
**Context:** 5 prototype concepts for combining an agentic chat interface with a video editor, backed by a 5-layer production pipeline (Input, Creative Direction, Pre-Production, Production, Post-Production).
**Supersedes:** `brainstormer-260302-1652-five-prototype-ui-concepts.md` (old approach: visual-theme variations of the same workflow -- now dead)

---

## The Core Design Tension

Chat interfaces are **linear, temporal, conversational**. Video editors are **spatial, direct-manipulation, non-linear**. The 5-layer agentic pipeline adds a third dimension: **process state** (which layer is active, quality gates, revisions, agent activity).

The fundamental question: **How do you unify three fundamentally different interaction paradigms (conversation, spatial editing, process monitoring) into one coherent experience?**

Each concept below answers this question differently.

---

## Differentiation Matrix (Read First)

| Dimension | 1. Screening Room | 2. Director's Monitor | 3. Editing Bay | 4. Mission Control | 5. The Canvas |
|---|---|---|---|---|---|
| **Chat vs Editor** | Chat-first (90/10) | Split (40/60) | Editor-first (15/85) | Dashboard-first (30/70) | Merged/spatial |
| **Pipeline Visibility** | Opaque | Checkpoint-based | Abstracted to tabs | Fully transparent | Spatial/zoomable |
| **User Agency** | Observer / critic | Collaborator | Director / operator | Monitor / commander | Co-creator |
| **Intervention Timing** | Reactive only | At quality gates + chat | Proactive, anytime | Reactive, per-layer | Contextual, anytime |
| **Primary Metaphor** | Messaging a collaborator | Director on a film set | Pro NLE with AI copilot | NASA mission control | Infinite whiteboard |
| **Complexity** | Low | Medium | High | Medium-High | High (novel) |
| **Target User** | Beginners, casual | Mid-level creators | Pro editors | Power users, technical | Creative technologists |
| **Mobile Viable?** | Yes (native feel) | Partially (portrait split) | No (desktop only) | No (desktop only) | Tablet possible |

---

## Concept 1: "The Screening Room"

**Metaphor:** You are a music executive reviewing cuts. You talk, the AI produces, you react.

### Primary Interaction Pattern
The chat IS the entire interface. Full-screen conversational UI (think iMessage / ChatGPT). When the AI generates artifacts -- mood boards, storyboard frames, video clips, style references -- they appear **inline as rich media cards** within the conversation. Users never leave the chat to edit; they reply to artifacts with natural language feedback.

### Layout Structure
```
+--------------------------------------------------+
|  [Project Name]                    [Settings] [?] |
+--------------------------------------------------+
|                                                    |
|  CHAT THREAD (full width, scrollable)             |
|                                                    |
|  [AI] Here's the creative direction I'm           |
|       proposing for your track...                  |
|                                                    |
|  +----------------------------------------------+ |
|  | MOOD BOARD CARD (expandable)                  | |
|  | [img] [img] [img]  Color: warm amber          | |
|  | Style: cinematic noir  Pacing: slow build     | |
|  | [Approve] [Revise] [Reject]                   | |
|  +----------------------------------------------+ |
|                                                    |
|  [AI] Now working on storyboard...               |
|  [===========>          ] L3: Pre-Production      |
|                                                    |
|  +----------------------------------------------+ |
|  | STORYBOARD CARD (expandable)                  | |
|  | [frame1] [frame2] [frame3] [frame4]           | |
|  | Tap any frame to discuss it                   | |
|  +----------------------------------------------+ |
|                                                    |
|  [User] Make scene 2 more dramatic, add rain     |
|                                                    |
|  [AI] Revising scene 2... sending back to L3     |
|                                                    |
+--------------------------------------------------+
|  [Type a message...]              [Send] [Attach] |
+--------------------------------------------------+
```

### Pipeline Visibility
**Opaque by design.** The user sees progress indicators ("Working on creative direction...") and a minimal progress bar showing current layer, but never sees agent names, MCP calls, quality scores, or revision loops. The AI summarizes what happened behind the scenes in natural language.

Rationale: Most users do not care about the pipeline. They care about results. The pipeline is an implementation detail, not a feature.

### User Intervention Model
**Reactive.** The AI drives the process. It produces work, presents it, and asks for feedback at natural conversation points. The user responds with:
- Natural language feedback ("darker mood", "more energy in the chorus")
- Card-level actions (Approve / Revise / Reject buttons on each artifact card)
- Expanding a card to inspect details (e.g., tap a storyboard frame to see it larger and comment on it)

The user never initiates pipeline actions directly. They talk; the AI translates intent into pipeline operations.

### Key Screens/States
1. **Onboarding Chat** -- AI asks for audio file, references, and vision. Conversational intake replaces forms.
2. **Creative Review** -- Inline mood board / style direction cards. Approve to proceed.
3. **Storyboard Review** -- Expandable storyboard card with frame thumbnails. Tap frame to discuss.
4. **Generation Progress** -- Animated progress card showing current layer + estimated time.
5. **Final Review** -- Inline video player card. "Looks great!" or "Change the ending."
6. **Export** -- Share card with platform previews and download button.

### Unique Differentiator
The entire production process feels like texting a talented friend who happens to be a video producer. Zero learning curve. The complexity of the 5-layer pipeline is completely hidden. The quality gate decisions (PASS/REVISE/REJECT) are embedded naturally as conversation beats.

### Trade-offs
**Pros:**
- Lowest cognitive load of all concepts
- Mobile-native (chat is the most natural mobile interaction)
- Easiest to build (chat UI is well-understood)
- Graceful degradation -- works even with slow generation (user just waits for replies)
- Naturally conversational revision flow
- Accessible to non-technical users

**Cons:**
- No direct manipulation -- cannot drag scenes, adjust timeline, or fine-tune visually
- Long conversations become hard to navigate (scroll fatigue)
- Precision suffers -- "make it more blue" is ambiguous; a color picker is not
- Power users will feel constrained quickly
- No spatial overview of the entire video (you see one artifact at a time)
- Cannot work on multiple scenes simultaneously

---

## Concept 2: "The Director's Monitor"

**Metaphor:** You are a director on set with a monitor bank. You can see what's happening, give direction, call "cut."

### Primary Interaction Pattern
Persistent split-screen: chat on the left, context-sensitive workspace on the right. The workspace **transforms based on the current pipeline layer**. During L2 it shows mood boards. During L3 it shows a storyboard grid. During L4 it shows generation previews. During L5 it shows a simplified timeline editor. The chat drives the process forward; the workspace shows the current state.

Quality gates are explicit **checkpoint screens** that appear between layers -- a clear "review moment" where the user must approve before proceeding.

### Layout Structure
```
+--------------------+----------------------------------------+
| [Project]  [L3/5]  |  WORKSPACE (context-sensitive)         |
+--------------------+----------------------------------------+
|                    |                                         |
| CHAT PANEL (40%)   |  [Changes based on active layer]       |
|                    |                                         |
| [AI] Creative dir  |  DURING L2: Mood board + style cards   |
| approved. Moving   |  DURING L3: Storyboard grid (editable) |
| to pre-production. |  DURING L4: Generation preview gallery  |
|                    |  DURING L5: Mini timeline editor        |
| [AI] I've drafted  |                                         |
| 6 scenes for your  |  +---+ +---+ +---+                     |
| storyboard...      |  | 1 | | 2 | | 3 |  <- scene cards    |
|                    |  +---+ +---+ +---+                     |
| [User] Scene 4     |  +---+ +---+ +---+                     |
| needs a different  |  | 4 | | 5 | | 6 |                     |
| angle              |  +---+ +---+ +---+                     |
|                    |                                         |
+--------------------+  [Reorder] [Add Scene] [Approve All]   |
| [Type...]  [Send]  |                                         |
+--------------------+----------------------------------------+
|  PIPELINE BAR: [L1 done] [L2 done] [L3 active] [L4] [L5]  |
+-------------------------------------------------------------+
```

### Pipeline Visibility
**Checkpoint-based.** A persistent pipeline progress bar at the bottom shows all 5 layers with current status (done / active / pending). Between layers, a checkpoint modal appears:

```
+------------------------------------------+
|  QUALITY GATE: Pre-Production -> Production
|
|  Storyboard: 6 scenes, 3:24 total
|  Quality Score: 87/100
|
|  [Review Details]  [Approve & Continue]
|  [Request Revisions]
+------------------------------------------+
```

Users see layer transitions but not internal agent activity. The pipeline is visible as a progression, not as a machine.

### User Intervention Model
**Checkpoint-primary, chat-supplementary.** The structured intervention points are the quality gates between layers. Users MUST approve at each gate. Between gates, they CAN intervene via chat ("actually, change the genre to lo-fi") or by directly editing artifacts in the workspace (clicking a storyboard frame to modify its prompt).

The workspace enables direct manipulation within the current layer's context. The chat enables out-of-context requests that may trigger revision loops.

### Key Screens/States
1. **Project Setup** -- Split: chat intake on left, uploaded assets preview on right.
2. **Creative Direction Review** -- Chat summary on left, mood board + style cards on right. Approve/Revise buttons.
3. **Storyboard Workshop** -- Chat on left, draggable storyboard grid on right. Direct manipulation of scene order. Click scene to edit in-place.
4. **Generation Monitor** -- Chat on left, real-time generation preview gallery on right. Thumbnails appear as images generate.
5. **Post-Production Edit** -- Chat on left, simplified timeline with scene clips on right. Drag to reorder, trim, add transitions.
6. **Quality Gate Modal** -- Overlay between layers with summary metrics and approve/revise/reject actions.

### Unique Differentiator
The context-sensitive workspace means the right panel is always showing the most relevant tool for the current stage. Users get direct manipulation when it matters (storyboard reordering, timeline editing) but guided conversation when exploration is needed (creative direction, revision feedback). The quality gates create natural "breathing room" where users consciously decide to proceed.

### Trade-offs
**Pros:**
- Balances conversation and direct manipulation naturally
- Quality gates prevent the AI from running ahead unchecked
- Workspace adapts to context -- no mode-switching by the user
- Pipeline progress is visible but not overwhelming
- Good for mid-level users who want control without complexity

**Cons:**
- Right panel context-switching may be disorienting (the workspace changes between layers)
- Chat panel may feel cramped at 40% width on smaller screens
- Quality gates can feel bureaucratic if the user just wants speed
- Cannot see/edit artifacts from a previous layer while a later layer is active (linear progression)
- The dual-panel layout is less mobile-friendly

---

## Concept 3: "The Editing Bay"

**Metaphor:** You are a professional editor at your workstation. The AI is your assistant sitting next to you, ready to execute on command.

### Primary Interaction Pattern
Full video editor UI dominates the screen -- timeline at bottom, preview monitor in center, asset browser on left, properties panel on right. The chat is a **collapsible side panel** (like GitHub Copilot in VS Code) that slides in from the right edge. It is a tool the user summons, not the primary surface.

Users can work entirely through direct manipulation (drag scenes on timeline, adjust color grading sliders, pick from generated alternatives) OR open the chat and issue commands ("replace all outdoor scenes with indoor versions", "add a beat-synced transition between scenes 3 and 4").

The 5 pipeline layers are abstracted into **editor tabs/modes** at the top: Input, Creative, Storyboard, Generate, Edit. Each tab has both manual controls and "AI Assist" buttons.

### Layout Structure
```
+----------------------------------------------------------------+
| [Input] [Creative] [Storyboard] [Generate] [Edit]    [Chat >] |
+----------------------------------------------------------------+
| ASSET        |  PREVIEW MONITOR (video player)  | PROPERTIES   |
| BROWSER      |                                   | PANEL        |
|              |  +-----------------------------+  |              |
| [Audio]      |  |                             |  | Scene: 3     |
| [Scenes]     |  |      VIDEO PREVIEW          |  | Prompt: ...  |
| [Generated]  |  |                             |  | Camera: wide |
| [References]  |  +-----------------------------+  | Motion: pan  |
|              |                                   | Style: ...   |
|              |  [<<] [Play] [>>]  00:45/03:24   | [Regenerate] |
+--------------+-----------------------------------+--------------+
| TIMELINE                                                        |
| [Audio]  |█████████████████████████████████████████|            |
| [Video]  |[Sc1][Sc2  ][Sc3][Sc4    ][Sc5][Sc6]   |            |
| [FX]     |  fade  | cut |  dissolve  | cut |      |            |
+----------------------------------------------------------------+
```

Chat panel (when open, overlays the properties panel):
```
                                              +------------------+
                                              | AI ASSISTANT     |
                                              |                  |
                                              | [AI] What would  |
                                              | you like to      |
                                              | change?          |
                                              |                  |
                                              | [User] Add lens  |
                                              | flare to scene 4 |
                                              |                  |
                                              | [AI] Done. Check |
                                              | the preview.     |
                                              |                  |
                                              | [Type...] [Send] |
                                              +------------------+
```

### Pipeline Visibility
**Abstracted into editor modes.** The 5 pipeline layers map to 5 tabs at the top. Users think of them as editor modes, not pipeline stages:
- **Input tab:** Upload audio, add references, describe vision
- **Creative tab:** Style presets, mood board builder, color palette picker
- **Storyboard tab:** Scene card grid with drag-to-reorder, frame editor
- **Generate tab:** Generation queue, progress indicators, variant selector
- **Edit tab:** Full timeline, transitions, color grading, effects

A small status indicator shows which layers have been completed and which have pending work. But the user can jump to any tab at any time -- the pipeline is not enforced as a linear sequence from the user's perspective. (The backend still processes linearly, but the UI lets users pre-configure later stages.)

### User Intervention Model
**Proactive, anytime.** The user is always in control. They can:
- Work manually with direct manipulation tools (timeline, sliders, drag-drop)
- Use "AI Assist" buttons scattered throughout the editor (e.g., "Auto-arrange scenes," "Generate transitions," "Color grade to match reference")
- Open the chat panel for complex multi-step requests
- Override any AI decision by directly editing the output

The AI is a tool, not a driver. It never proceeds without explicit user action (clicking "Generate," pressing "AI Assist," or issuing a chat command).

### Key Screens/States
1. **Input Mode** -- Audio waveform viewer, reference image uploader, vision prompt field. "AI Assist: Analyze Audio" button.
2. **Creative Mode** -- Style preset gallery, mood board canvas, color palette builder. "AI Assist: Suggest Creative Direction" button.
3. **Storyboard Mode** -- Scene card grid with inline editors. Drag-to-reorder. "AI Assist: Generate Storyboard" button.
4. **Generate Mode** -- Generation queue with progress bars per scene. Variant gallery (3-4 options per scene). Select best variant.
5. **Edit Mode** -- Full timeline with multi-track editing. Transition library. Color grading panel. Effects rack. "AI Assist: Auto-Edit" button.
6. **Chat Panel** -- Slide-in assistant for complex requests that span multiple modes.

### Unique Differentiator
This is the only concept where the user has **full manual control at every level**. The AI is purely assistive -- it can do the heavy lifting, but the user can override every decision with direct manipulation. For power users, this is the dream: a professional editor that happens to have an AI assistant. The chat is not the interface; it is one tool among many.

### Trade-offs
**Pros:**
- Maximum user control and precision
- Familiar to anyone who has used video editing software
- AI assistance is opt-in, never forced
- Can handle complex, non-linear editing workflows
- Professional output quality through direct manipulation
- The chat is genuinely useful for batch operations and complex requests

**Cons:**
- Highest learning curve -- intimidating for beginners
- Most complex to build (full editor UI + timeline + chat)
- Desktop-only; not viable on mobile
- Risk of underusing the AI -- users may default to manual work
- The 5 pipeline layers feel less coherent when abstracted into editor tabs
- Quality gates are less visible -- users may skip review steps

---

## Concept 4: "Mission Control"

**Metaphor:** You are in NASA mission control. You see every system, every agent, every metric. You monitor and intervene when something goes off-track.

### Primary Interaction Pattern
A dashboard-first interface organized as a **horizontal pipeline view** (5 columns, one per layer). Each layer column shows: agent status, current activity, quality metrics, generated artifacts, and a mini-chat input specific to that layer. A global command bar at the bottom handles cross-layer operations.

Real-time SSE updates stream into each column, showing agent activity as it happens. The user watches the pipeline execute and intervenes at the layer level when needed.

### Layout Structure
```
+----------------------------------------------------------------+
| CREMI MISSION CONTROL       [Project: "Midnight Drive"]        |
| Global: [Pause All] [Resume] [Restart from L2]    [Settings]  |
+----------------------------------------------------------------+
|  L1: INPUT    | L2: CREATIVE | L3: PRE-PROD | L4: PROD  | L5  |
|  [COMPLETE]   | [COMPLETE]   | [ACTIVE]     | [PENDING] |[PND]|
+----------------------------------------------------------------+
| music-intel   | creative-dir | storyboard-  | production| ed- |
| MCP: done     | Agent: done  | architect    | -supervis | itor|
|               |              | Agent: active| or: idle  |     |
| Audio: 3:24   | Style: noir  |              |           |     |
| BPM: 128      | Mood: tense  | Building     |           |     |
| Key: Am       | Palette: [_] | scene 4/6... |           |     |
|               |              |              |           |     |
| [thumbnail]   | [mood board] | +---+ +---+  |           |     |
| Waveform vis  | [style ref]  | |S1 | |S2 |  |           |     |
|               |              | +---+ +---+  |           |     |
| Quality: 94   | Quality: 87  | +---+ +---+  |           |     |
|               |              | |S3 | |S4 |  |           |     |
| [Expand]      | [Expand]     | +---+ +---+  | [Expand]  |[Exp]|
+---------------+--------------+--------------+-----------+-----+
| LAYER CHAT: "Add more close-up shots to the storyboard"       |
| [Target: L3] [Send]                          [Global Chat >]  |
+----------------------------------------------------------------+
| EVENT LOG (collapsible):                                       |
| 14:23:01 L3/storyboard-builder: Generated frame 4 of 6        |
| 14:22:58 L3/storyboard-architect: Requesting frame generation  |
| 14:22:45 QUALITY GATE L2->L3: PASSED (score: 87)              |
+----------------------------------------------------------------+
```

### Pipeline Visibility
**Maximum transparency.** Every agent, every MCP call, every quality score is visible. The event log at the bottom shows real-time activity (similar to a CI/CD build log or server logs). Each layer column shows:
- Agent name and status (idle / working / waiting)
- MCP tools being invoked
- Quality score from the quality-assessor
- Generated artifacts as thumbnails
- Revision count (how many times this layer has been revised)

Users can expand any layer column to full-screen for detailed inspection.

### User Intervention Model
**Reactive, per-layer.** The pipeline runs autonomously. The user monitors. When something looks wrong, they:
- Type into the layer-specific chat input to give feedback to that layer's agent
- Use global controls to pause, resume, or restart from any layer
- Click "Expand" on a layer to inspect artifacts in detail and approve/reject them
- Use the global chat for cross-layer commands ("restart from creative direction with a happier mood")

Quality gates auto-pause the pipeline and require user approval (configurable -- power users can set gates to auto-approve if quality score exceeds threshold).

### Key Screens/States
1. **Project Launch** -- Modal: upload audio, write prompt, set quality thresholds. Then "Launch Pipeline."
2. **Pipeline Running** -- 5-column dashboard with real-time updates streaming in. Active layer column is highlighted.
3. **Quality Gate Pause** -- Active layer flashes. Gate modal shows summary, score, and approve/revise/reject buttons.
4. **Layer Deep Dive** -- Expanded single-layer view with full artifact gallery, detailed metrics, agent conversation history, and revision timeline.
5. **Revision in Progress** -- Revision controller shows which layers are being re-executed. Arrows indicate backward flow (e.g., L4 -> L3 revision).
6. **Pipeline Complete** -- All columns show green "COMPLETE." Final video preview with export options.
7. **History View** -- Version tracker showing all pipeline runs, revisions, and artifact versions.

### Unique Differentiator
Full pipeline transparency. This is the only concept where users see the agents working, understand the revision loops, and can intervene at the granular layer level. For power users and technical creators, this is deeply satisfying -- it demystifies the AI and gives a sense of control. The per-layer chat is unique: instead of one global conversation, users have targeted conversations with specific pipeline stages.

### Trade-offs
**Pros:**
- Maximum transparency and debuggability
- Per-layer intervention is precise and powerful
- Real-time SSE streaming creates engaging "watching it work" experience
- Quality gates with configurable thresholds give flexible control
- Revision flows are clearly visible (user can see exactly which layers re-execute)
- Event log enables technical users to understand and optimize their workflow

**Cons:**
- Information overload for casual users
- Dashboard layout is not intuitive for creative work (feels like DevOps, not filmmaking)
- No spatial editing capability (no timeline, no drag-drop)
- The 5-column layout wastes space when only one layer is active
- Desktop-only; complex layout does not adapt to mobile
- May make the AI feel mechanical rather than creative ("I'm watching a factory, not collaborating with an artist")

---

## Concept 5: "The Canvas"

**Metaphor:** You and the AI co-create on an infinite whiteboard. Conversation and visual artifacts coexist in the same spatial plane.

### Primary Interaction Pattern
The entire screen is a **zoomable, pannable infinite canvas** (like Miro, FigJam, or tldraw). Chat bubbles, storyboard frames, video previews, mood boards, pipeline status nodes -- they all exist as **objects on the canvas** that can be positioned, grouped, connected with lines, and annotated.

There is no fixed layout. Users organize their workspace spatially. Chat is **contextual**: click on any artifact and a chat thread appears attached to it. The conversation is distributed across the canvas, not centralized in one panel.

The 5 pipeline layers are represented as **spatial zones** (regions on the canvas) connected by flow arrows. Artifacts flow from left to right through the zones as the pipeline processes them.

### Layout Structure
```
+----------------------------------------------------------------+
| [Zoom: 65%] [Fit All] [+Layer] [Search]    [Pan] [Select]     |
+----------------------------------------------------------------+
|                                                                  |
|   L1 ZONE              L2 ZONE            L3 ZONE              |
|   +----------+         +------------+     +------------------+  |
|   | [Audio   |  -----> | [Mood      | --> | [Storyboard      |  |
|   |  file]   |         |  Board]    |     |  Grid]           |  |
|   |          |         |            |     |                  |  |
|   | [Vision  |         | [Style     |     | [S1] [S2] [S3]  |  |
|   |  prompt] |         |  Guide]    |     | [S4] [S5] [S6]  |  |
|   +----------+         +-----+------+     +--------+---------+  |
|                              |                     |            |
|                         +----+----+                |            |
|                         | Chat:   |                v            |
|                         | "darker |         L4 ZONE             |
|                         |  mood"  |         +-----------+       |
|                         +---------+         | [Gen      |       |
|                                             |  Queue]   |       |
|                                             | [Preview] | ----> |
|                                             +-----------+       |
|                                                                  |
|          [Floating input: "Tell me what to change..."]          |
|                                                                  |
+----------------------------------------------------------------+
```

When zoomed into a zone:
```
+----------------------------------------------------------------+
|  L3: PRE-PRODUCTION (zoomed in)              [Zoom out] [Chat] |
+----------------------------------------------------------------+
|                                                                  |
|  +-------+  +-------+  +-------+                               |
|  | Sc 1  |  | Sc 2  |  | Sc 3  |    CHAT THREAD (attached to  |
|  | [img]  |  | [img]  |  | [img]  |    scene 2):               |
|  | 0:00-  |  | 0:18-  |  | 0:35-  |                            |
|  | 0:18   |  | 0:35   |  | 0:52   |    [User] Too static.     |
|  +-------+  +---+---+  +-------+    Add camera movement.       |
|              |   ^                                               |
|              |   |                    [AI] Adding slow pan left. |
|              |   thread               Regenerating...            |
|              |   connector                                       |
|  +-------+  +-------+  +-------+                               |
|  | Sc 4  |  | Sc 5  |  | Sc 6  |                               |
|  | [img]  |  | [img]  |  | [img]  |                             |
|  +-------+  +-------+  +-------+                               |
|                                                                  |
+----------------------------------------------------------------+
|  [Floating: "What should I work on next?"]            [Send]   |
+----------------------------------------------------------------+
```

### Pipeline Visibility
**Spatial and zoomable.** The 5 pipeline layers are laid out as connected zones on the canvas. At max zoom-out, you see the entire pipeline as a flow diagram. Zoom into any zone to see its artifacts, agent activity, and attached chat threads.

Flow arrows between zones show data movement. Revision loops appear as backward arrows (e.g., an arrow from L4 back to L3 with a label "Revision: scene consistency issue").

Quality gates appear as **gate nodes** between zones -- diamond-shaped decision points with pass/revise/reject indicators.

### User Intervention Model
**Contextual, anytime, anywhere.** Users interact with whatever they can see:
- Click any artifact to open a chat thread attached to it
- Drag artifacts between zones (e.g., move a reference image from L1 to L3 to influence storyboard)
- Draw connections between artifacts to indicate relationships ("this reference image should influence this scene")
- Double-click any artifact to expand it into an inline editor
- Use the floating input bar for global commands ("start over from creative direction")
- Annotate directly on the canvas with text notes, arrows, highlights

### Key Screens/States (Canvas States, Not Pages)
1. **Empty Canvas** -- Upload audio and describe vision. Initial artifacts placed in L1 zone. "Start Pipeline" button.
2. **Pipeline Flowing** -- Artifacts appear progressively across zones as layers complete. Animated flow particles along arrows show active processing.
3. **Zoomed: Storyboard** -- L3 zone fills the screen. Storyboard frames as cards. Chat threads attached to individual scenes.
4. **Zoomed: Generation** -- L4 zone with generation progress bars and variant thumbnails. Side-by-side comparison panels.
5. **Revision Loop** -- Backward arrow appears between zones. Affected artifacts pulse/glow. Chat thread at the revision point explains what went wrong.
6. **Zoomed: Timeline** -- L5 zone contains an embedded timeline editor. Standard video editing controls within the zone.
7. **Full Zoom Out** -- Entire project visible as a connected flow diagram. High-level status at a glance.

### Unique Differentiator
Conversation and artifacts share the same spatial plane. There is no separation between "the chat" and "the editor" -- they are the same surface. Chat threads are attached to the things they discuss. The pipeline is not a progress bar; it is a spatial map you can explore. This is the most innovative concept and the closest to how creative people actually think -- spatially, non-linearly, with context spread across a surface.

### Trade-offs
**Pros:**
- Most innovative and potentially delightful interaction model
- Spatial organization matches how creative people think
- Contextual chat eliminates the "which scene am I talking about?" problem
- Pipeline as a spatial map is intuitive and beautiful
- Scales well: zoom out for overview, zoom in for detail
- Supports non-linear workflows naturally
- Artifacts can be freely arranged, grouped, and connected

**Cons:**
- Highest design risk -- could feel magical or could feel chaotic
- Requires excellent zoom/pan/navigation UX (if this is bad, everything is bad)
- Canvas performance with many artifacts (images, video previews) is a real technical challenge
- Mobile adaptation is extremely difficult (pinch-to-zoom on small screens)
- No established UX precedent for "spatial chat" -- users need onboarding
- Building a performant infinite canvas is a significant engineering effort (consider tldraw or reactflow as foundations)
- Discoverability: new users may not know what to do with an empty canvas

---

## Recommendation: Build Order and Strategy

### Phase 1: Build Concepts 1 and 2 (The Screening Room + The Director's Monitor)
These represent the two most viable extremes of the chat-editor spectrum. Screening Room is pure chat (simple, fast to build, tests whether chat-only works). Director's Monitor is the balanced split (tests whether users want direct manipulation alongside chat). Comparing user reactions to these two will reveal whether the product needs to lean more toward conversation or more toward editing.

### Phase 2: Build Concept 4 (Mission Control)
This tests the appetite for pipeline transparency. If users love watching the agents work, it validates a transparency-heavy approach. If they find it overwhelming, it validates the opaque approach. This is a critical product question worth answering early.

### Phase 3: Build Concept 3 OR 5 (Editing Bay or Canvas)
Build one of these based on Phase 1-2 learnings:
- If users want more control: build The Editing Bay
- If users want more innovation/delight: build The Canvas

### Key Questions Each Concept Answers

| Concept | Product Question It Answers |
|---|---|
| Screening Room | Can chat-only work? Is direct manipulation even necessary? |
| Director's Monitor | What is the right balance between chat and editor? |
| Editing Bay | Do pro users want the AI to be a tool, not a driver? |
| Mission Control | Do users care about pipeline transparency? |
| Canvas | Can we invent a new interaction paradigm that unifies chat + editor? |

---

## Cross-Cutting Implementation Notes

### Shared Backend Contract
All 5 concepts consume the same backend API:
- SSE endpoint for real-time pipeline updates (`/api/pipeline/stream`)
- REST endpoints for pipeline control (`/api/pipeline/start`, `/api/pipeline/revise`, etc.)
- Chat endpoint for user messages (`/api/chat/message`) routed to user-bridge MCP
- Quality gate responses (`/api/gate/{layer}/approve`, `/api/gate/{layer}/revise`)
- Artifact retrieval (`/api/artifacts/{layer}/{id}`)

### Shared Frontend Infrastructure
- **SSE client** for real-time updates (shared hook: `usePipelineStream()`)
- **Chat engine** for message history, streaming responses, and media card rendering
- **Artifact renderer** for displaying mood boards, storyboard frames, video previews, quality scores
- **Pipeline state machine** client-side mirror of the backend pipeline state

### Mock Data Strategy for Prototypes
For frontend-only prototypes, simulate the pipeline with:
- Timed delays per layer (L1: 2s, L2: 5s, L3: 8s, L4: 15s, L5: 5s)
- Pre-generated artifact images (storyboard frames, mood boards)
- Fake SSE events from a local event emitter
- Mock quality scores and gate decisions

---

## Unresolved Questions

1. **Revision depth:** When a user requests a revision at L3, does the UI need to show which earlier layers are affected? Or is that backend-only complexity? (Matters most for Mission Control and Canvas.)
2. **Multi-project:** Do any of these concepts need to support multiple concurrent pipeline runs? (Mission Control naturally supports this; others would need redesign.)
3. **Collaboration:** Is multi-user real-time collaboration a future requirement? (Canvas is best suited; Screening Room is worst suited.)
4. **Audio sync:** How important is beat-level timeline editing? (Only Editing Bay supports this natively. Director's Monitor could add it in L5 workspace. Others ignore it.)
5. **Prototype fidelity:** Should the prototypes include real chat streaming (mock LLM responses with typing indicators) or static message sequences? Real streaming is more convincing but harder to build.
6. **Target user persona:** Has the team aligned on whether Cremi targets casual creators (favors Screening Room / Director's Monitor) or prosumers (favors Editing Bay / Mission Control)? This decision should weight concept selection heavily.
7. **Canvas feasibility:** The Canvas concept is the most innovative but requires either building on an existing canvas library (tldraw, reactflow, xyflow) or significant custom engineering. Is there appetite for that technical investment at the prototype stage?

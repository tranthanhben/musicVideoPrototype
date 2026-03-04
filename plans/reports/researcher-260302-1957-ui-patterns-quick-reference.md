# Quick Reference: Agentic UI Pattern Selection Guide
**Date:** 2026-03-02 | **Context:** Music video generation with 5 agents + quality gates

---

## TL;DR: Recommended Pattern Stack

**Primary:** Dashboard + Chat Overlay (LangGraph Studio style)
**Secondary:** Side-by-side preview + chat (Cursor style)
**Tertiary:** Inline commands for editing (Figma slash commands)

---

## Pattern Decision Tree

```
START: Designing UI for music video agent pipeline
│
├─ Q: Need to show agent orchestration visually?
│  └─ YES → Use LangGraph Studio pattern (dashboard + graph)
│           └─ Add chat overlay for explanation
│
├─ Q: Users editing existing outputs frequently?
│  └─ YES → Add side-by-side viewer + chat (Cursor style)
│           └─ Preview on right, chat/controls on left
│
├─ Q: Power users want keyboard shortcuts?
│  └─ YES → Implement slash commands (Figma style)
│           └─ /extend, /regenerate, /approve in context menu
│
├─ Q: Need real-time progress visibility?
│  └─ YES → Implement AG-UI event streaming
│           └─ Show agent execution steps as they happen
│
└─ Q: Users unfamiliar with technical workflows?
   └─ YES → Provide conversational mode (v0 style)
            └─ Chat-first approach for onboarding
```

---

## Pattern Comparison: Key Metrics

| Metric | Cursor (Side-by-Side) | LangGraph (Dashboard) | v0 (Chat) | Figma (Inline) |
|--------|----------------------|-----------------------|-----------|----------------|
| **Visual Clarity** | ★★★★☆ | ★★★★★ | ★★☆☆☆ | ★★★☆☆ |
| **Interaction Speed** | ★★★☆☆ | ★★★☆☆ | ★★★★☆ | ★★★★★ |
| **Learning Curve** | ★★★☆☆ | ★★☆☆☆ | ★★★★★ | ★★★★☆ |
| **Multi-Agent Support** | ★★★☆☆ | ★★★★★ | ★★☆☆☆ | ★★☆☆☆ |
| **Real-time Feedback** | ★★★☆☆ | ★★★★☆ | ★★★★☆ | ★★★☆☆ |
| **Mobile-friendly** | ★☆☆☆☆ | ★★☆☆☆ | ★★★★☆ | ★★★☆☆ |

---

## Pattern Mapping to Your 5 Agents

### Agent Flow in UI

```
DESKTOP LAYOUT:
┌──────────────────────────────────────────────────┐
│ 1. Scene Composition Agent                        │
│    → Show as node in LangGraph dashboard (left)   │
│    └─ Output: Scene frames preview (right)        │
│                                                   │
│ 2. Music Timing Agent                             │
│    → Input: Scene duration from Agent 1           │
│    → Output: Beat-aligned timeline (right viewer) │
│    → Chat explains: "Added 0.5s hold at 32 beat"  │
│                                                   │
│ 3. Narrative Flow Agent                           │
│    → Parallel to Agent 2 (show in dashboard)      │
│    → Output: Shot transitions + pacing           │
│    → Dependency: Waits for both Agent 1 + 2       │
│                                                   │
│ 4. VFX Integration Agent                          │
│    → Reads from Agents 2 + 3                      │
│    → Output: Effect overlays on timeline         │
│    → Quality gate flags any sync issues          │
│                                                   │
│ 5. Quality Check Agent (Gate)                     │
│    → Evaluates all previous agents               │
│    → Output: Pass/Flag/Reject with reasons       │
│    → Footer shows detailed feedback cards        │
└──────────────────────────────────────────────────┘
```

---

## UI Component Checklist

### Must-Have Components

- [ ] **Agent Graph Visualization** (LangGraph Studio style)
  - Nodes: Scene Comp → Music Timing → Narrative → VFX → Quality Gate
  - Edges: Show data flow dependencies
  - Status indicators: Running (spinner), Completed (✓), Error (✗), Waiting (⏳)

- [ ] **Real-time Progress Indicator**
  - Per-agent: What's happening right now?
  - Per-scene: Render progress 0-100%
  - Total: Time elapsed + estimated remaining

- [ ] **Preview Viewer**
  - Timeline scrubber showing 0-3m 45s
  - Scene markers with render status
  - Hover to see frame preview

- [ ] **Chat Interface**
  - Ask questions: "Why did you extend Scene 2?"
  - Receive explanations: Agent reasoning
  - Provide feedback: "Add more dramatic pause here"

- [ ] **Quality Gate Feedback Panel** (footer)
  - Per-scene status cards
  - Issue detail: "Color mismatch in frame 3"
  - Actions: Approve, Request Changes, Retry

- [ ] **Context Menu** (right-click on timeline)
  - `/extend [duration]` - Extend clip
  - `/regenerate` - Re-run agent
  - `/approve` - Move to next stage
  - `/explain` - Why this choice?

### Nice-to-Have Components

- [ ] **Parameter Adjustment Panel**
  - Mood slider: Dramatic ←→ Peaceful
  - Pacing slider: Fast ←→ Slow
  - Visual style selector

- [ ] **Agent Reasoning Browser**
  - Expand any agent node to see decision tree
  - "Tool calls" made by agent
  - Input context used by agent

- [ ] **Collaboration Panel**
  - Who reviewed scene X?
  - Comment threads on timeline
  - Approval status per stakeholder

---

## Critical UX Decisions

### Decision 1: Agent Execution Model

**Option A: Sequential (Agents run one after another)**
```
Scene Comp → Music Timing → Narrative → VFX → Quality Gate
(Wait)        (Wait)         (Wait)      (Wait)
```
- Simpler to reason about
- Slower (can't parallelize)
- Clear blockers visible

**Option B: Parallel with Dependencies (Recommended)**
```
Scene Comp ───┐
              ├─→ Narrative → VFX → Quality Gate
Music Timing ─┘
```
- Faster (agents run simultaneously)
- Harder to debug (race conditions)
- Better UX (faster feedback)

**Recommendation:** Option B with clear dependency visualization in dashboard

---

### Decision 2: Approval Model

**Option A: Strict Gate (All agents must pass)**
```
Scene 1 Quality Gate:
  ✓ Visual Consistency
  ✓ Audio Sync
  ✓ Narrative Flow
  = Status: APPROVED → Move to next scene
```

**Option B: Per-Agent Approval (Each agent independently)**
```
Scene 1:
  ✓ Scene Comp approved
  ⚠ Music Timing flagged (fix audio sync)
  ✓ Narrative approved
  ✗ Quality blocked until Music fixed
```

**Recommendation:** Option B (provides more granular control, avoids blocking entire scene)

---

### Decision 3: Feedback Specificity

**Option A: High-level feedback only**
```
Quality Gate: ✗ REJECTED
Reason: "Visual quality too low"
[Retry Scene]
```

**Option B: Detailed checklist feedback (Recommended)**
```
Quality Gate Checklist:
  ✓ Color consistency (12/12 frames match palette)
  ⚠ Pacing issue (Scene 1→2 transition too fast)
    [Adjust by 0.2s?] [Mark as override]
  ✗ Audio sync (Beat alignment off by 0.15s)
    [Auto-fix timing] [Manual adjustment]
```

**Recommendation:** Option B (enables users to understand and fix issues)

---

## Real-Time Streaming Integration

### AG-UI Event Flow → UI Updates

```
Agent executes:
  1. agent_start event
     → Highlight agent node (start spinner animation)

  2. tool_use event (e.g., "analyzing music beats")
     → Show tool name in chat
     → Update progress: "20%"

  3. tool_result event
     → Show tool output in chat
     → Progress: "40%"

  4. agent_end event
     → Stop spinner, mark node complete (✓)
     → Render output in preview
     → Unblock downstream agents

  5. error event (if any)
     → Mark node red (✗)
     → Show error in chat
     → Block dependent agents
```

### Chat Message Format (Streamed)

```
AI: "Analyzing music beats for timing alignment..."
[Tool: beat_detector] → Starting
  Detected 120 BPM, 4/4 time signature
[Tool: beat_detector] → Complete (2.3s)

Found 48 beat markers in 3m 45s composition.
Aligning scene cuts to beats...

[Computing optimal cut timing for Scene 1]
  ├─ Beat 1-8: Title sequence (4 bars)
  ├─ Beat 9-24: Verse 1 (8 bars)
  ├─ Beat 25-32: Chorus starts (8 bars) ← Scene cut here
  └─ Beat 33+: Bridge section

Scene 1 duration optimized: 3.5s → 4.0s (4 bars)
```

---

## Mobile/Responsive Considerations

### Desktop Layout (Recommended for creation)
```
Left (40%):  Agent graph + controls
Right (60%): Preview + chat
```

### Tablet Layout
```
Top (50%):    Preview
Bottom (50%):  Chat with agent graph as expandable panel
```

### Mobile Layout (View-only recommended)
```
Full width: Preview (swipe timeline)
Overlay:    Chat button (hamburger)
            Agent status (collapsible header)
```

---

## Performance Budgets

### Acceptable Latencies

| Interaction | Target | Threshold |
|-------------|--------|-----------|
| Click agent node → Show chat | <100ms | <500ms |
| Scroll timeline | <50ms | <100ms |
| Render frame preview | <500ms | <2s |
| Agent start → UI update | <200ms | <1s |
| Quality gate decision → display | <300ms | <2s |

### Render Pipeline

```
Agent output → Format as JSON → Stream via AG-UI →
Frontend parses → Update state → React re-render →
Canvas reflow → Paint → User sees result
```

Optimize: Lazy render (off-screen frames), WebWorker for heavy computation

---

## Accessibility Requirements

- [ ] **Keyboard navigation:** All controls reachable via Tab
- [ ] **Timeline:** Arrow keys to scrub, Enter to play/pause
- [ ] **Chat:** Screen reader compatible (ARIA labels)
- [ ] **Colors:** Not sole indicator (use icons + text)
  - ✓ (✓ icon) + "Approved"
  - ✗ (✗ icon) + "Rejected"
  - ⏳ (hourglass icon) + "Processing"
- [ ] **Motion:** Reduce motion mode (prefer static progress bars)
- [ ] **Text contrast:** WCAG AA minimum

---

## Implementation Priority (MVP → Full)

### Phase 1: MVP (Week 1-2)
- [ ] Agent graph node visualization (static, no interactivity)
- [ ] Preview timeline (scrubber only)
- [ ] Basic chat interface (text in, text out)
- [ ] Status indicators (Running/Done/Error)

### Phase 2: Core (Week 3-4)
- [ ] Chat contextual to agent nodes (click → ask)
- [ ] Real-time progress streaming (AG-UI integration)
- [ ] Timeline preview (actual frames rendered)
- [ ] Quality gate feedback display (footer cards)

### Phase 3: Enhanced (Week 5+)
- [ ] Slash commands (context menu editing)
- [ ] Agent reasoning browser (expand nodes)
- [ ] Parameter adjustment sliders
- [ ] Collaboration features (comments, review threads)

---

## Common Pitfalls to Avoid

1. **Information overload:** Don't show all agent reasoning by default
   - Solution: Expandable details, summary-first approach

2. **Latency perception:** Empty space while agents run feels slow
   - Solution: Show streaming output, progress indicators, skeleton loaders

3. **Context switching fatigue:** Too many panels/tabs to monitor
   - Solution: Keep agent graph always visible, consolidate feedback

4. **Approval paralysis:** Too many quality gates blocks workflow
   - Solution: Provide "approve with override" option, explain reasoning

5. **Mobile-hostile design:** Desktop-centric layout breaks on phones
   - Solution: Progressive disclosure, collapsible panels, touch-friendly targets

---

## Testing Checklist

- [ ] Create/run agents with < 500ms lag on UI update
- [ ] Chat works with 100+ message history without slowdown
- [ ] Timeline scrubbing smooth at 60 FPS
- [ ] Quality gate feedback clear without reading full explanations
- [ ] Keyboard nav works for all controls
- [ ] Works on Chrome, Firefox, Safari, mobile browsers
- [ ] AG-UI event stream handles dropped connections gracefully
- [ ] Agents can be interrupted/paused mid-execution
- [ ] Rollback to previous version works (undo last agent)

---

## Recommended Tech Stack

### Frontend
- **React 19+** (streaming UI + hooks)
- **TailwindCSS** (responsive, accessible styling)
- **Framer Motion** (smooth transitions)
- **Recharts or D3.js** (agent graph visualization)
- **Socket.io or SSE** (AG-UI event streaming)

### Backend Integration
- **LangGraph** (agent orchestration, built-in event streaming)
- **FastAPI + WebSockets** (real-time streaming)
- **TypeScript** (frontend + backend type safety)

### Visualization Libraries
- **Reactflow** (agent graph DAG visualization, better than custom)
- **React Timeline** (timeline scrubber component)
- **Framer Canvas** (preview rendering)

---

## References for Implementation

- Cursor 2.0 agent sidebar: https://cursor.com/features
- LangGraph Studio: https://blog.langchain.com/langgraph-studio-the-first-agent-ide/
- AG-UI protocol: https://www.marktechpost.com/2025/09/18/bringing-ai-agents-into-any-ui-the-ag-ui-protocol-for-real-time-structured-agent-frontend-streams/
- Figma AI: https://www.figma.com/blog/introducing-figma-ai/
- GitHub Actions visualization: https://github.blog/enterprise-software/ci-cd/build-cicd-pipeline-github-actions-four-steps/

# Brainstorm Report: AI Music Video Generator Architecture

**Date:** 2026-02-25 | **Status:** Brainstorm Complete | **Rev:** 2 (iterative loop redesign)

---

## Problem Statement

Build an agentic system where content creators upload music → system analyzes, suggests storylines, generates storyboard, produces visuals, post-processes into polished 3-5 min music video. **Critical constraint:** creative work is iterative — system must support feedback loops, quality verification, backward transitions, and revision at any stage.

## Core Design Principle

> **Music video creation is NOT a one-shot process.** It requires continuous creative refinement. The architecture must be a **cyclic graph with feedback loops**, not a linear pipeline.

## Decisions Made

| Area | Decision | Rationale |
|---|---|---|
| Target User | Content Creators | Social media / YouTube focus |
| User Control | Smart Default + Override | Auto-generate, user intervenes at any stage |
| Architecture | **Iterative Loop Orchestrator** | Cyclic state machine with quality gates + backward transitions |
| Visual Consistency | Hybrid (Ref Images + Style Lock) | Character sheets + locked prompts + color matching |
| Video Models | Abstracted Multi-Model Layer | All providers via adapter pattern |
| Music Analysis | Combined (Local + LLM + Multimodal) | librosa/essentia + LLM + Gemini audio |
| Data Flow | Shared DB + Object Storage | PostgreSQL + S3/R2, versioned outputs per stage |
| LLM Strategy | Multi-LLM with Routing | Claude/GPT/Gemini routed per task type |
| Quality Control | **Quality Gate Agent** | Dedicated verification at every stage transition |
| Revision System | **Versioned Stage Outputs** | Every stage output is versioned, can revert/branch |

## Architecture Overview

### Iterative Loop Model (NOT Linear Pipeline)

```
                    ┌─────────────────────────────────────────┐
                    │          QUALITY GATE AGENT              │
                    │  (verifies output at every transition)   │
                    └────┬────────┬────────┬────────┬─────────┘
                         │        │        │        │
  ┌──────────┐     ┌─────▼──┐  ┌─▼──────┐ ┌▼──────┐ ┌▼──────────┐  ┌──────────┐
  │  Music   │◄───►│Creative│◄►│Story-  │◄►│Visual │◄►│   Post-   │─►│  Final   │
  │ Analysis │     │Direction│  │board   │  │ Gen   │  │Production │  │  Video   │
  └──────────┘     └────────┘  └────────┘  └───────┘  └───────────┘  └──────────┘
       ▲                ▲           ▲           ▲            ▲
       │                │           │           │            │
       └────────────────┴───────────┴───────────┴────────────┘
                    BACKWARD TRANSITIONS (revision loops)
                    - Quality gate rejects → re-process
                    - User requests changes → targeted revision
                    - Downstream issues detected → upstream fix
```

### Key Differences from Linear Pipeline

| Linear Pipeline (OLD) | Iterative Loop (NEW) |
|---|---|
| Stage A → B → C → Done | Stage A ↔ B ↔ C with cycles |
| Quality checked only at end | Quality gate at EVERY transition |
| User overrides pause pipeline | User revisions target specific stages |
| Failure = restart from scratch | Failure = re-process specific stage |
| Single output version | Versioned outputs, compare & branch |
| One-shot creative process | Iterative refinement loop |

## Component Breakdown (12 Components)

### MCP Servers (6 Tools) — unchanged

| # | MCP Server | Responsibility | Key Tools |
|---|---|---|---|
| 1 | `music-analyzer-mcp` | Audio analysis | `analyze_music()`, `detect_beats()`, `detect_sections()` |
| 2 | `storyline-generator-mcp` | Creative direction | `suggest_storylines()`, `generate_scene_descriptions()`, `revise_storyline()` |
| 3 | `storyboard-builder-mcp` | Scene planning | `build_storyboard()`, `sync_to_music()`, `revise_scene()`, `reorder_scenes()` |
| 4 | `image-generator-mcp` | Visual assets | `generate_scene_visuals()`, `generate_character_ref()`, `regenerate_scene()`, `swap_model()` |
| 5 | `video-generator-mcp` | Video clips | `generate_clips()`, `regenerate_clip()`, `list_models()` |
| 6 | `post-processor-mcp` | Assembly & effects | `assemble_video()`, `apply_lipsync()`, `apply_effects()`, `preview_assembly()` |

### Sub-Agents (4 Intelligence Layers) — added quality-gate-agent

| # | Agent | Role | Uses MCPs |
|---|---|---|---|
| 7 | `creative-director-agent` | Interprets music, suggests themes, maintains style | #1, #2, #3 |
| 8 | `production-agent` | Orchestrates generation, model selection | #4, #5 |
| 9 | `editor-agent` | Post-production, assembly, effects, lipsync | #6 |
| **10** | **`quality-gate-agent`** | **Verifies output quality at every stage transition. Can reject + request re-process.** | **All MCPs (read-only)** |

### Orchestrator (1 Coordinator) + Revision Manager (1)

| # | Component | Role |
|---|---|---|
| 11 | `loop-orchestrator` | Cyclic state machine, manages forward/backward transitions, quality gates |
| **12** | **`revision-manager`** | **Tracks output versions per stage, handles diff/compare, manages revision history** |

## Iterative Loop: How It Works

### 1. Quality Gates (Automatic)

Every stage transition passes through the `quality-gate-agent`:

```
Stage N completes
    │
    ▼
Quality Gate Agent evaluates:
    ├─ PASS → proceed to Stage N+1
    ├─ SOFT FAIL → suggest improvements, ask user to approve or revise
    └─ HARD FAIL → auto-reject, re-process Stage N with feedback
```

**What quality-gate-agent checks per stage:**

| Stage | Quality Checks |
|---|---|
| Music Analysis | Section detection confidence, beat alignment accuracy, mood classification certainty |
| Storyline | Narrative coherence, music-story alignment, visual feasibility |
| Storyboard | Scene count vs song length, timing sync accuracy, transition logic, character consistency |
| Visual Gen | Style consistency across scenes, prompt adherence, image/video quality scores |
| Post-Production | Audio-video sync accuracy, transition smoothness, lipsync quality, color consistency |

### 2. Backward Transitions (Revision Loops)

Any stage can trigger re-processing of a previous stage:

```
Trigger Sources:
  1. Quality gate rejects output → sends feedback to same or earlier stage
  2. User requests revision → targets specific stage
  3. Downstream stage detects upstream issue → escalates backward

Example flows:
  - Video Gen finds storyboard scene too vague → revise storyboard scene
  - Post-Production detects lipsync fails on a clip → regenerate that clip
  - User dislikes storyline after seeing storyboard → revise storyline, cascade updates
  - Quality gate rejects visual consistency → regenerate inconsistent scenes only
```

### 3. Revision Manager (Versioning)

Every stage output is versioned:

```
project_123/
  music_analysis/
    v1/ (initial analysis)
  storyline/
    v1/ (auto-generated)
    v2/ (user revised mood)
  storyboard/
    v1/ (from storyline v1)
    v2/ (from storyline v2 — cascaded)
    v3/ (user swapped scene 3)
  visuals/
    v1/ (from storyboard v2)
    v2/ (regenerated scene 5 — quality gate)
  final/
    v1/ (first assembly)
    v2/ (lipsync improved)
```

**Cascade rules:** When a stage is revised, downstream stages are marked `stale` and queued for re-processing. Only affected scenes are re-generated (not the entire stage).

### 4. State Machine (Cyclic)

```
States:
  uploaded → analyzing → analyzed
  → creating_storyline → storyline_ready
  → building_storyboard → storyboard_ready
  → generating_visuals → visuals_ready
  → post_processing → assembled
  → quality_review → complete

Special transitions:
  ANY_STATE → revising_{stage}     (user or quality gate triggers revision)
  revising_{stage} → {stage}_ready (revision complete, re-validate)
  ANY_STATE → paused               (user pauses)
  paused → ANY_STATE               (user resumes)
```

## Data Backbone

- **Database**: PostgreSQL — project state, **versioned stage outputs**, generation metadata
- **Object Storage**: S3/R2 — audio, images, video clips (organized by version)
- **Job Queue**: BullMQ + Redis — async jobs, **supports re-queue for revision jobs**
- **Progress**: SSE — real-time updates including revision/loop status
- **Cache**: Redis — model routing, rate limits, cost tracking

## Agent Communication Pattern (Iterative)

```
Loop Orchestrator
  │
  ├─ triggers → Agent (forward or backward transition)
  │     │
  │     ├─ calls → MCP Server (tool call)
  │     │     ├─ writes → DB (versioned result)
  │     │     ├─ writes → S3 (versioned media)
  │     │     └─ publishes → Redis (progress event)
  │     │
  │     └─ returns → quality-gate-agent (evaluate output)
  │           │
  │           ├─ PASS → orchestrator advances
  │           ├─ SOFT FAIL → notify user, suggest revision
  │           └─ HARD FAIL → orchestrator loops back
  │
  └─ Revision Manager tracks all versions + cascade logic
```

## Tech Stack Summary

| Layer | Technology |
|---|---|
| MCP Transport | Streamable HTTP (production), stdio (dev) |
| Backend | Node.js/TypeScript (API + orchestration) |
| ML Services | Python microservices (librosa, essentia, MuseTalk) |
| Job Queue | BullMQ + Redis (with revision re-queue support) |
| Database | PostgreSQL (versioned stage outputs) |
| Object Storage | S3 / Cloudflare R2 (version-organized) |
| LLM Gateway | LiteLLM (multi-provider routing) |
| Media Models | Custom adapter layer (all providers) |
| Progress | SSE (real-time, includes loop/revision status) |
| Frontend | React/Next.js (pipeline dashboard with revision UI) |

## Key Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Visual inconsistency across scenes | High | Hybrid ref images + style lock + color matching + quality gate |
| Infinite revision loops | High | Max revision count per stage (default: 3), escalate to user |
| Cascade explosion (1 change → everything re-generates) | Medium | Smart cascade: only re-process affected scenes, not entire stages |
| Long generation times | Medium | Parallel generation, targeted re-generation (not full re-run) |
| API provider outages | Medium | Multi-model fallback routing |
| High cost from re-generations | Medium | Cost tracking per revision, budget limits, quality scoring to minimize retries |
| Quality gate too strict/lenient | Medium | Configurable thresholds, user can override quality decisions |

## Open Questions

1. Quality gate scoring model — LLM-based or metric-based or hybrid?
2. Cascade granularity — scene-level or full-stage-level re-processing?
3. Max revision depth before requiring user decision?
4. Cost model with iterative loops — how to estimate and cap costs?

## Visualization

See: `plans/reports/brainstorm-260225-1429-architecture-visualization.html`

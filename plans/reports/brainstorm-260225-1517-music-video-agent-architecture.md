# Music Video Agent — System Architecture

**Date:** 2026-02-25 | **Type:** Brainstorm Final Report

---

## Vision

An agentic tool that empowers content creators to produce music videos — similar to how Claude Code empowers developers to build software. The user provides inputs (music, characters, references, direction), and a system of specialized agents collaboratively produces a polished music video through iterative creative refinement.

---

## System Anatomy

The system has **5 layers**, each containing agents, MCP servers, and skills that work together.

### Layer 1 — Input & Understanding

Receives and deeply analyzes everything the user provides.

**User Inputs:**
- Music audio file (self-composed, Suno, Udio, etc.)
- Character references (photos, descriptions, or AI-generated)
- Style references (images, videos, mood boards)
- Text prompt (creative direction, storyline ideas, lyrics)
- Preferences (duration, aspect ratio, genre, mood override)

**Agents & Tools:**

| Component | Type | What It Does |
|---|---|---|
| `music-intelligence` | MCP Server | Analyzes audio → beats, BPM, key, sections (intro/verse/chorus/bridge/outro), energy curve, mood. Uses librosa + essentia (precise data) + Gemini multimodal (holistic understanding). Outputs `MusicProfile` JSON. |
| `vision-analyzer` | MCP Server | Analyzes reference images/videos → extracts style, color palette, composition, character features, mood using VLM (Claude Vision / GPT-4o). Outputs `StyleProfile` JSON. |
| `prompt-interpreter` | Skill | Domain knowledge for parsing user text prompts into structured creative briefs. Understands music video terminology (close-up, wide shot, beat drop, etc.). |
| `character-builder` | MCP Server | Takes reference photos + descriptions → builds `CharacterSheet` (multiple angles, consistent features, wardrobe, key traits). Generates anchor images for visual consistency. |

**Output:** `ProjectBrief` — a unified structured document containing music profile, style profile, character sheets, and user preferences. This is the single source of truth for all downstream agents.

---

### Layer 2 — Creative Direction

The creative brain. Takes the ProjectBrief and generates creative vision.

| Component | Type | What It Does |
|---|---|---|
| `creative-director` | Agent | The main creative brain. Reads ProjectBrief, understands the music's emotional arc, and produces a `CreativeVision` — the overall concept, visual themes, narrative thread, and mood progression across the song. Suggests 2-3 directions; picks best if user doesn't intervene. |
| `storyline-writer` | MCP Server | Generates narrative storylines matched to music structure. Each section of the song maps to a story beat. Tools: `write_storyline()`, `revise_storyline()`, `adapt_to_genre()`. |
| `genre-templates` | Skill | Domain knowledge: proven music video formats per genre (pop dance, rock performance, R&B intimate, hip-hop urban, etc.). Loaded as creative context. |
| `mood-mapper` | Skill | Maps music analysis data (energy, key, tempo) to visual language (color temperature, pacing, shot types, lighting). |

**Output:** `CreativeVision` — storyline, visual themes, mood arc, character roles, setting concepts.

---

### Layer 3 — Pre-Production

Converts creative vision into a concrete production plan.

| Component | Type | What It Does |
|---|---|---|
| `storyboard-architect` | Agent | Takes CreativeVision + MusicProfile → designs scene-by-scene storyboard. Each scene: description, camera angle, timing (synced to music sections), transition type, character placement. Manages scene ordering, pacing, and beat-sync logic. |
| `storyboard-builder` | MCP Server | Tools: `create_storyboard()`, `revise_scene()`, `reorder_scenes()`, `preview_timing()`. Stores versioned storyboard data. |
| `style-guide-generator` | MCP Server | Generates locked prompt templates + color palette + character reference pack that all downstream generation must use. Tools: `generate_style_guide()`, `create_character_anchors()`. |
| `model-selector` | MCP Server | Given scene requirements, selects optimal AI model per scene (Runway for character consistency, Kling for audio-sync, Veo for physics, Flux for images). Tools: `recommend_models()`, `estimate_cost()`, `check_availability()`. |
| `cinematic-prompts` | Skill | Domain knowledge: how to write effective prompts for each video/image model. Model-specific prompt strategies (Runway likes X, Kling prefers Y). |

**Output:** `ProductionPlan` — complete storyboard with timing, style guide, character anchors, model assignments per scene, and cost estimate.

---

### Layer 4 — Production

Generates all visual assets. The most computationally intensive layer.

| Component | Type | What It Does |
|---|---|---|
| `production-supervisor` | Agent | Orchestrates the generation pipeline. Manages parallel scene generation, monitors quality, handles failures and retries. Decides when to switch models or regenerate. |
| `image-generator` | MCP Server | Multi-model adapter layer for image generation. Tools: `generate_image()`, `generate_character_ref()`, `regenerate()`. Adapters: Flux, DALL-E, SD, Ideogram. |
| `video-generator` | MCP Server | Multi-model adapter layer for video clips. Tools: `generate_clip()`, `generate_with_audio()`, `regenerate_clip()`. Adapters: Kling, Runway, Veo, Minimax, Pika, Luma. |
| `lipsync-processor` | MCP Server | Applies lip synchronization to vocal scenes. Tools: `apply_lipsync()`, `check_quality()`. Adapters: MuseTalk, Sync.so, Wav2Lip. |
| `consistency-checker` | Skill | Evaluates visual consistency across generated scenes (character identity, style drift, color palette adherence). Uses CLIP similarity scoring + VLM assessment. |

**Output:** Raw visual assets — character reference images, scene images, video clips per scene, lipsync-processed clips. All stored versioned in object storage.

---

### Layer 5 — Post-Production & Delivery

Assembles, refines, and delivers the final video.

| Component | Type | What It Does |
|---|---|---|
| `editor` | Agent | The post-production brain. Plans the edit: cut points (beat-synced), transitions, effects, pacing. Handles assembly strategy and quality review. |
| `video-assembler` | MCP Server | FFmpeg-powered video assembly. Tools: `assemble_timeline()`, `apply_transitions()`, `overlay_audio()`, `add_effects()`, `render_preview()`, `render_final()`. |
| `color-grader` | MCP Server | Color consistency + creative grading across all clips. Tools: `match_colors()`, `apply_grade()`, `generate_lut()`. Uses FFmpeg filters. |
| `effects-library` | Skill | Domain knowledge: video transition types (crossfade, glitch, zoom, whip pan), when to use each, beat-sync rules, genre-appropriate effects. |
| `export-manager` | MCP Server | Final delivery: format conversion, thumbnail generation, multi-platform export (YouTube 16:9, TikTok 9:16, Instagram 1:1). Tools: `export()`, `generate_thumbnail()`, `create_preview()`. |

**Output:** Final music video + thumbnails + platform-specific exports.

---

## Cross-Layer Systems

These components span the entire pipeline.

### Quality Gate

| Component | Type | What It Does |
|---|---|---|
| `quality-assessor` | Agent | Evaluates output at every layer transition. Checks: coherence, consistency, technical quality, music-visual alignment. Three verdicts: PASS, REVISE (with feedback), REJECT (with reason). Uses LLM assessment + metric scoring. |
| `quality-metrics` | Skill | Scoring rubrics per stage: analysis completeness, storyline coherence, storyboard timing accuracy, visual consistency, audio-video sync, final polish. |

### Revision Engine

| Component | Type | What It Does |
|---|---|---|
| `revision-controller` | Agent | Manages iterative refinement. When quality gate revises or user requests changes: identifies which stage to revisit, what specifically to change, and which downstream outputs are affected. Supports backward transitions to ANY previous stage. |
| `version-tracker` | MCP Server | Tracks all output versions per stage. Tools: `create_version()`, `compare_versions()`, `mark_stale()`, `revert()`. Smart cascade: when upstream changes, only affected downstream scenes are marked for re-generation — not everything. |

### Orchestrator

| Component | Type | What It Does |
|---|---|---|
| `pipeline-orchestrator` | Core Service | The central coordinator. Cyclic state machine (not linear). Manages: state transitions (forward + backward), quality gate checkpoints, user intervention points, job queue (BullMQ), parallel generation scheduling, cost tracking, progress events (SSE). Max 3 auto-revision loops per stage before asking user. |

### User Interaction

| Component | Type | What It Does |
|---|---|---|
| `user-bridge` | MCP Server | Interface between user and pipeline. Tools: `submit_project()`, `get_status()`, `review_output()`, `request_revision()`, `approve_stage()`, `override_decision()`, `set_preferences()`. |
| `progress-streamer` | Service | SSE-based real-time progress: stage status, generation progress per scene, quality gate results, revision notifications, cost tracker. |

---

## Complete Component Map

| # | Component | Type | Layer |
|---|---|---|---|
| 1 | `music-intelligence` | MCP Server | Input |
| 2 | `vision-analyzer` | MCP Server | Input |
| 3 | `character-builder` | MCP Server | Input |
| 4 | `prompt-interpreter` | Skill | Input |
| 5 | `creative-director` | Agent | Creative |
| 6 | `storyline-writer` | MCP Server | Creative |
| 7 | `genre-templates` | Skill | Creative |
| 8 | `mood-mapper` | Skill | Creative |
| 9 | `storyboard-architect` | Agent | Pre-Production |
| 10 | `storyboard-builder` | MCP Server | Pre-Production |
| 11 | `style-guide-generator` | MCP Server | Pre-Production |
| 12 | `model-selector` | MCP Server | Pre-Production |
| 13 | `cinematic-prompts` | Skill | Pre-Production |
| 14 | `production-supervisor` | Agent | Production |
| 15 | `image-generator` | MCP Server | Production |
| 16 | `video-generator` | MCP Server | Production |
| 17 | `lipsync-processor` | MCP Server | Production |
| 18 | `consistency-checker` | Skill | Production |
| 19 | `editor` | Agent | Post-Production |
| 20 | `video-assembler` | MCP Server | Post-Production |
| 21 | `color-grader` | MCP Server | Post-Production |
| 22 | `effects-library` | Skill | Post-Production |
| 23 | `export-manager` | MCP Server | Post-Production |
| 24 | `quality-assessor` | Agent | Cross-Layer |
| 25 | `quality-metrics` | Skill | Cross-Layer |
| 26 | `revision-controller` | Agent | Cross-Layer |
| 27 | `version-tracker` | MCP Server | Cross-Layer |
| 28 | `pipeline-orchestrator` | Core Service | Cross-Layer |
| 29 | `user-bridge` | MCP Server | Cross-Layer |
| 30 | `progress-streamer` | Service | Cross-Layer |

**Total: 30 components** — 6 Agents, 14 MCP Servers, 7 Skills, 3 Services

---

## How Components Communicate

```
User ←→ user-bridge (MCP) ←→ pipeline-orchestrator (state machine)
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                  │
              [Layer Agents]    [Quality Gate]    [Revision Engine]
                    │                 │                  │
              [MCP Servers]     quality-assessor   revision-controller
              (call tools)      (evaluate)          (manage loops)
                    │                 │                  │
              [Skills loaded      version-tracker    Cascade logic
               as context]       (track versions)   (smart re-gen)
                    │
              [External APIs]
              Kling, Runway, Flux, Gemini, Claude, FFmpeg...
```

**Key patterns:**
- Agents have domain intelligence — they decide *what* to do
- MCP Servers expose tools — they execute *how* to do it
- Skills provide context — they inject domain knowledge
- Orchestrator coordinates — it manages *when* and *in what order*
- Everything flows through versioned state in DB + S3

---

## Iterative Refinement Model

```
            ┌───────────────────────────────────────┐
            │         USER (observe + guide)         │
            └───┬───────────┬───────────┬───────────┘
                │ approve   │ revise    │ override
                ▼           ▼           ▼
  ┌─────┐   ┌─────┐   ┌─────┐   ┌─────┐   ┌─────┐
  │Input│──►│Creat│──►│PrePr│──►│Prod │──►│Post │──► Final
  │     │◄──│ive  │◄──│od   │◄──│     │◄──│     │
  └─────┘   └─────┘   └─────┘   └─────┘   └─────┘
     ▲  │      ▲  │      ▲  │      ▲  │      ▲  │
     │  ▼      │  ▼      │  ▼      │  ▼      │  ▼
   [QG]      [QG]      [QG]      [QG]      [QG]

  ◄── = backward revision (targeted, scene-level)
  [QG] = quality gate (PASS / REVISE / REJECT)
```

**Rules:**
- Forward flow is default (auto-pilot)
- Quality gates verify at every layer boundary
- Backward transitions target specific stages + specific scenes
- User can intervene at any checkpoint or let it auto-complete
- Max 3 auto-revisions per stage, then escalate to user
- Cascade: upstream changes only re-generate affected downstream scenes

---

## Data Architecture

| Store | What | Why |
|---|---|---|
| **PostgreSQL** | Project state, versioned stage outputs (JSON), user preferences, generation metadata, quality scores, cost tracking | Structured, queryable, relational |
| **S3 / Cloudflare R2** | Audio files, reference images, character sheets, generated images, video clips, final output — organized by project/stage/version | Scalable media storage |
| **Redis** | Job queue (BullMQ), progress pub/sub, rate limits per provider, cost counters, cache | Fast state + messaging |

**Versioning scheme:**
```
s3://bucket/projects/{projectId}/
  audio/original.mp3
  input/references/*.{jpg,png}
  stages/
    music-analysis/v1/profile.json
    creative-direction/v1/vision.json
    creative-direction/v2/vision.json     ← revised
    storyboard/v1/storyboard.json
    storyboard/v2/storyboard.json         ← cascaded from creative v2
    visuals/v2/scene-01.mp4               ← only affected scenes
    visuals/v2/scene-05.mp4
    final/v1/output.mp4
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Agent Orchestration | Node.js/TypeScript + custom state machine |
| MCP Transport | Streamable HTTP (production), stdio (dev) |
| ML Services | Python microservices (librosa, essentia, MuseTalk) |
| LLM Gateway | LiteLLM proxy (Claude, GPT-4o, Gemini routing) |
| Media APIs | Custom adapter layer (Kling, Runway, Veo, Flux, etc.) |
| Job Queue | BullMQ + Redis |
| Database | PostgreSQL |
| Object Storage | S3 / Cloudflare R2 |
| Real-time | SSE (progress events) |
| Video Processing | FFmpeg + editly |
| Frontend | React / Next.js |
| Containers | Docker (each MCP server isolated) |

---

## External Model Providers

| Category | Providers | Routing Strategy |
|---|---|---|
| **Video** | Kling 2.6, Runway Gen-4, Veo 3.1, Minimax, Pika, Luma | Capability → cost → fallback |
| **Image** | Flux 1.1 Pro (fal.ai), DALL-E 3, SD 3.5, Ideogram | Quality → speed → cost |
| **LLM** | Claude (creative), GPT-4o (prompts), Gemini (multimodal) | Task-type routing |
| **Lipsync** | MuseTalk (self-hosted), Sync.so (API) | Quality → availability |
| **Vision** | Claude Vision, GPT-4o Vision | Structured extraction |
| **Music** | librosa + essentia (local), Gemini (multimodal) | Combined for coverage |

---

## Visualization

See: `plans/reports/brainstorm-260225-1517-architecture-visualization.html`

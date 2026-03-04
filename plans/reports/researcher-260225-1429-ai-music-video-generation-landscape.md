# Research Report: AI Music Video Generation Landscape
**Date:** 2026-02-25

---

## 1. Music Analysis Tools / APIs

| Tool | Type | Key Features | Status |
|------|------|-------------|--------|
| **librosa** | Python lib | Beat tracking, BPM, onset detection, chroma, MFCCs, spectral features | Active, de-facto standard |
| **essentia** | Python/C++ lib | Full MIR suite: RhythmExtractor2013 (BPM + beat positions), key, mood, chords, pitch; JS port (essentia.js) | Active, production-grade |
| **aubio** | Python/C lib | Beat/tempo, onset detection, pitch; lightweight | Active |
| **Spotify Audio Features API** | REST API | BPM, key, mode, time signature, danceability, energy, valence, loudness | Available but **Audio Analysis endpoint recently restricted** (deprecation risk) |
| **Spotify Audio Analysis API** | REST API | Section timestamps (verse/chorus/bridge), segment-level data, beat ticks | Same deprecation risk |
| **AudD** | REST API | Music recognition + audio features (BPM, key, sections) | Commercial, paid |
| **ACRCloud** | REST API | Audio fingerprinting, BPM, genre, mood | Commercial, paid |

**Best picks for music video sync:**
- Offline/no API cost: `librosa` + `essentia` — gives beat timestamps, BPM, key, sections
- For chorus/section detection: Spotify Audio Analysis (if still available) or `essentia`'s SegmentDescriptors
- Mood/energy: `essentia` TensorFlow models (pre-trained on Discogs) or Spotify valence/energy fields

---

## 2. AI Video Generation Models

| Model | API? | Quality Tier | Max Clip | Notes |
|-------|------|-------------|----------|-------|
| **Runway Gen-4 / Gen-4.5** | Yes (commercial) | S-tier | ~10s | Consistent character, strong motion control; $12/mo+ |
| **Kling 2.6** | Yes (API) | S-tier | 10s | Prepaid bundles; audio+visual in single pass (v2.6) |
| **Google Veo 3 / 3.1** | Yes (Google Cloud) | S-tier | ~8s | Expensive (~$250/use tier); best physics fidelity |
| **Luma Ray 3** | Yes (commercial) | A-tier | 10s | $29.99/mo unlimited; good for fast iteration |
| **Pika 2.5** | Yes (commercial) | A-tier | 10s | $8/mo; strong for stylized content |
| **Minimax (Hailuo)** | Yes (API) | A-tier | 6-10s | $14.99/mo; high quality motion |
| **Sora 2** | No public API yet | S-tier | 20s | API speculated ~$0.50–1.00/sec when released |
| **Stable Video Diffusion** | Open source | B-tier | 4s | Self-hostable; quality below commercial |
| **Haiper** | Yes (limited) | B-tier | 4s | Less mature |

**Architecture relevance:** For a music video pipeline, Kling or Runway are the most API-ready. Kling 2.6's native audio-visual generation is directly relevant — it can produce visuals that inherently respond to audio cues.

---

## 3. AI Image Generation (Storyboard Frames)

| Model | API? | Quality | Notes |
|-------|------|---------|-------|
| **Flux 1.1 Pro** | Yes (fal.ai, Replicate, BFL API) | S-tier | Best prompt adherence; cinematic output; fast |
| **DALL-E 3** | Yes (OpenAI API) | A-tier | Strong text rendering; easy integration |
| **Midjourney v6** | No public API | S-tier | Discord-only; no programmatic access |
| **Stable Diffusion 3.5** | Yes (open source / Stability AI API) | A-tier | Self-hostable; good for custom fine-tunes |
| **Ideogram 2.0** | Yes (API) | A-tier | Best for typography; decent cinematics |
| **Adobe Firefly** | Yes (API, paid) | A-tier | Enterprise focus; safe-for-commercial licensing |

**Best picks:** Flux 1.1 Pro via fal.ai for cinematic storyboard frames (fast, cheap, high quality). DALL-E 3 as fallback for easy OpenAI SDK integration.

---

## 4. Lipsync Technology

| Tool | Type | Quality | Real-time? | Notes |
|------|------|---------|-----------|-------|
| **MuseTalk v1.5** | Open source (Tencent) | Best OSS | Yes | Perceptual+GAN+Sync loss; highest FID/CSIM scores; Python |
| **Wav2Lip** | Open source | Good for dubbing | No | Best for syncing audio to existing video; can blur |
| **SadTalker** | Open source | Good for avatars | No | 3D motion coefficients; single image → talking head |
| **LivePortrait** | Open source | Premium | No | Emotion-aware; best identity retention |
| **Sync.so** | Commercial API | Production | No | REST API for lipsync; easiest integration |
| **Hedra** | Commercial | High | No | Character animation platform; API in beta |
| **D-ID** | Commercial API | Good | No | Mature REST API; talking avatar focus |
| **HeyGen** | Commercial API | High | No | Best commercial quality; expensive |

**Best picks:** MuseTalk v1.5 for self-hosted pipeline; Sync.so for API-first approach with minimal infra.

---

## 5. Agentic Architecture Patterns

**MCP (Model Context Protocol)**
- Anthropic standard (2024) for tool/resource exposure to LLMs
- Defines how agents call tools: standardized JSON schema, server/client pattern
- CrewAI + LangGraph both support MCP via `MCPServerAdapter`
- Best used as the **integration layer** (how tools are called), not orchestration logic

**Framework Comparison:**

| Framework | Maturity | Pattern | Best For |
|-----------|---------|---------|----------|
| **LangGraph** | v1.0 (Oct 2025) stable | State machine / DAG | Complex pipelines, explicit state, error handling |
| **CrewAI** | Production | "Team of agents" roles | Role-based delegation, enterprise |
| **AutoGen / AG2** | Production | Conversation-based | Back-and-forth agent collaboration |
| **OpenAI Agents SDK** | New (2025) | Lightweight tool-calling | Simple, GPT-4o-native pipelines |
| **Pydantic AI** | Growing | Type-safe agents | Python-first, strong validation |

**For a music video pipeline architecture:**
- LangGraph is best fit — explicit DAG nodes map cleanly to: `analyze_music → generate_storyboard → generate_images → generate_video → lipsync → assemble`
- MCP exposes video/image generation APIs as tools the orchestrator calls
- Parallel execution: image generation nodes can run concurrently per scene

---

## 6. Existing Products / Projects

| Product | Type | Approach |
|---------|------|---------|
| **Neural Frames** | Commercial SaaS | Autopilot mode: audio → beat-synced frames via Stable Diffusion; timeline editor |
| **Freebeat.ai** | Commercial SaaS | 15s–6min videos; auto-adapts pacing/visuals to music duration and BPM |
| **Plazmapunk** | Commercial SaaS | Beat-reactive visuals; abstract/stylized output |
| **Tammy (GitHub)** | Open source | Python/PyTorch; text prompts + BPM sync → VQGAN-CLIP generated frames |
| **music2video (GitHub)** | Open source | Wav2CLIP + VQGAN-CLIP; audio embedding drives visual generation |
| **Kling 2.6** | Commercial API | Native audio-visual co-generation — only model that natively ties audio to video output |

**Architecture pattern used by existing tools:**
1. Extract audio features (BPM, sections, energy envelope)
2. Map sections → scene descriptions (prompt engineering)
3. Generate images/video clips per section
4. Assemble timeline with beat-aligned cuts
5. (Optional) lipsync if vocal/avatar content

**Gap in market:** No production-grade open API product does full end-to-end (music in → polished music video out) with agent orchestration + lipsync + narrative coherence. Neural Frames is closest but limited to stylized abstract visuals.

---

## Architecture Recommendation (Conceptual)

```
Music File
    ↓
[librosa/essentia] → beat timestamps, BPM, sections, energy, mood
    ↓
[LLM Agent - LangGraph] → generate scene descriptions per section
    ↓ (parallel)
[Flux 1.1 Pro] → storyboard images per scene
[Kling / Runway API] → video clips per scene
    ↓
[MuseTalk / Sync.so] → lipsync if vocal scenes
    ↓
[FFmpeg] → assemble timeline, beat-synced cuts
    ↓
Music Video Output
```

---

## Unresolved Questions

1. Spotify Audio Analysis API deprecation timeline — unclear if sections endpoint will persist; need fallback (essentia)
2. Kling 2.6 audio-visual API docs — limited public documentation on exact audio input format for co-generation
3. Sora API availability — no confirmed release date; can't rely on it for near-term architecture
4. MuseTalk v1.5 production stability — strong benchmarks but limited production deployment reports
5. Coherence across scenes — no tool/model today guarantees visual consistency (character, style) across multiple generated clips; this remains the hardest unsolved problem for narrative music videos

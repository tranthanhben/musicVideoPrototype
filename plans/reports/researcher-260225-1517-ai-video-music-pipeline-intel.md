# Research Report: AI Video + Music Pipeline Intelligence
**Date:** 2026-02-25 | **Scope:** 5 topics for music video AI generation system

---

## 1. Character Consistency in AI Video Generation (2025-2026)

### Techniques (API-accessible)

**Reference-image locking (most practical)**
- **Runway Gen-4**: Upload subject photo → prompt actions. ~70% consistency rate. API available via `runway-ml` SDK. Best current option for scene-to-scene continuity.
- **Kling AI Elements**: Upload up to 4 reference images → fused into single consistent output. "Character consistency" feature with adjustable reference strength. REST API available (Kling API v1).
- **Runway Act-One**: Facial animation from reference + performance video. Primarily face-driven. API access via Runway platform.
- **HeyGen**: Face-swap + lip-sync pipeline. REST API mature. Best for talking-head consistency, not action scenes.
- **Pika 2.0**: Reference image input supported. Less documented API for character locking.

**Local/self-hosted (ComfyUI pipelines)**
- **IP-Adapter v2 + SDXL**: Best open-source face consistency for image gen. Not directly video, but feeds img2video.
- **InstantID**: Face embedding into diffusion. Works with ComfyUI + AnimateDiff for video.
- **InsightFace + ReActor**: Face-swap post-processing on generated video frames. Production-ready via API wrapper.

### What Parameters Matter
- Reference image quality: 3-5 clean shots, varied angles, consistent lighting
- Prompt must reinforce identity ("the same woman with red hair and freckles")
- Scene-to-scene: use identical seed + character prompt prefix across clips
- Kling's reference strength slider (0.0–1.0) is the most direct control exposed via API

### Verdict
Runway Gen-4 + Kling API are the only fully-API-accessible options with reliable character locking today. For music videos: generate anchor frame per character → use as reference image for all subsequent clips.

---

## 2. Image/Video Prompt Analysis (Style/Mood Extraction)

### Production Pipeline Pattern
```
User uploads image
  → VLM describes: style, palette, mood, composition, subject features
  → Output structured JSON: {style, mood, colors[], composition, character_features}
  → Inject into generation prompt
```

### Best APIs for Each Task

| Task | Best API | Notes |
|------|----------|-------|
| Full scene description | GPT-4o Vision or Gemini 1.5 Pro | Most accurate for complex scenes |
| Style extraction | Claude 3.5 Sonnet Vision | Strong at aesthetic vocabulary |
| Character features | GPT-4o + face crop | Describe facial features for prompt injection |
| Color palette | Any VLM + "list dominant hex colors" | Or use Pillow locally |
| Mood/emotion | Claude or Gemini | Better at nuanced affective language |

### CLIP Use Case
- CLIP embeddings useful for **similarity search** (find closest style in a reference library), not description
- Not the right tool for extracting prompt text; use VLMs for that
- BLIP-2 / LLaVA: open-source alternatives, weaker than GPT-4o/Claude for aesthetic vocab

### Practical Approach
1. Send reference image to GPT-4o or Claude with structured prompt: "Describe this image's visual style, color palette, mood, and any character features. Output JSON."
2. Use output to construct generation prompt prefix
3. Optionally: CLIP embed reference + all generated frames → cosine similarity score for style drift detection

---

## 3. FFmpeg + AI Post-Production Pipelines

### Beat-Synced Cutting
- **librosa** (Python): industry-standard beat/onset detection. `librosa.beat.beat_track()` returns BPM + beat timestamps.
- **Essentia** (by MTG): more accurate for complex music. Supports downbeat detection.
- Pipeline: extract beats → compute clip durations → FFmpeg concat with timestamps
- No mature end-to-end OSS tool does this automatically. Manual scripting required.

### Key FFmpeg Operations for Music Videos
```bash
# Trim clip to beat duration
ffmpeg -ss {start} -t {duration} -i clip.mp4 -c copy segment.mp4

# Concat segments (no re-encode)
ffmpeg -f concat -safe 0 -i segments.txt -c copy output.mp4

# Color grade (curves)
ffmpeg -i input.mp4 -vf "curves=r='0/0 0.5/0.6 1/1'" output.mp4

# Lyric overlay
ffmpeg -i input.mp4 -vf "drawtext=text='{lyric}':fontsize=48:x=(w-tw)/2:y=h-100" output.mp4
```

### Audio-Reactive Effects
- Truly audio-reactive video (amplitude → visual effect) requires frame-by-frame processing: **not** pure FFmpeg
- Options: **TouchDesigner** (not API), **Hydra** (browser), **p5.js** (browser), or custom Python with OpenCV + librosa
- Practical for API pipeline: pre-compute audio envelope → drive FFmpeg filter parameters via shell script

### Production-Ready OSS Tools
- **auto-editor** (auto-editor.com): cuts silence/motion. Beat-sync limited.
- **editly** (npm): programmatic video editing with JSON spec. FFmpeg-backed. Production-ready.
- **moviepy**: Python FFmpeg wrapper. Good for scripted pipelines. Slower than raw FFmpeg.
- **remotion** (React): code-driven video. Supports audio sync. Good for lyric videos.

### Verdict
No single tool does beat-sync + AI transitions + color grade. Production pipeline = librosa (beats) + editly or raw FFmpeg (assembly) + VLM (shot selection) + custom Python glue.

---

## 4. Creative AI Direction UX Patterns

### What Works (2025 Evidence)

**Adobe Firefly Boards** (launched globally Sept 2025):
- Unified canvas: generate, arrange, iterate in one space
- "Describe Image" → auto-generates prompt from any visual on canvas
- Presets = style shortcuts (mood/look encoded in one click)
- Multi-model access: Runway, Pika, Moonvalley, BFL from same UI
- Key insight: **visual remix beats text prompt** for non-technical users

**Runway**:
- Reference image upload for character/style locking
- "Extend" workflow: generate → select good frame → extend forward
- Text + image combined prompt (multimodal input)

**Kling / Pika**:
- Strength sliders for style reference adherence
- Seed locking for consistency

### UX Patterns That Work
1. **Show-don't-tell**: reference image > text description for style
2. **Progressive disclosure**: basic prompt → advanced controls hidden unless needed
3. **Variation grids**: generate 4 variants, user picks → refine from best
4. **Anchor + extend**: lock best frame as anchor → generate forward/backward
5. **Style presets**: named moods (cinematic, lo-fi, anime) > raw parameters
6. **Iterative narrowing**: AI generates → user selects/rejects → AI learns constraints

### Patterns That Fail
- Free-form text-only for style (too ambiguous)
- Too many simultaneous controls
- Regenerating from scratch vs. refining from existing

### Adaptation for Music Video Context
- Map song sections (verse/chorus/bridge) to mood presets
- Let user pin reference images per section
- Beat intensity → suggest cut density automatically
- "Vibe" selector (cinematic, lo-fi, energetic) drives both prompt and edit style

---

## 5. MCP + Skills + Tools Architecture

### Core Concepts
- **MCP Server**: exposes Tools (callable functions), Resources (data), Prompts (templates) over stdio or HTTP/SSE
- **Tools**: discrete capabilities (e.g., `generate_video_clip`, `analyze_image`, `sync_beats`)
- **Skills**: domain knowledge modules (prompt strategies, style guides) loaded as context
- **Agent**: LLM instance that decides which tools to call based on goal

### Architecture Pattern for Creative Media
```
Orchestrator Agent
  ├── MCP: image-analysis-server  (GPT-4o Vision tool)
  ├── MCP: runway-server           (video generation tools)
  ├── MCP: kling-server            (video generation tools)
  ├── MCP: audio-server            (librosa beat detection)
  ├── MCP: ffmpeg-server           (assembly, effects tools)
  └── MCP: storage-server          (S3/local file ops)
```

### Orchestration Patterns
- **Sequential**: analyze → plan shots → generate clips → assemble. Use when each step depends on prior output.
- **Parallel**: generate 4 clip variants simultaneously → pick best. Use for independent generation tasks.
- **Fan-out + aggregate**: send same prompt to Runway + Kling → select better result. Quality hedge.

### Context Passing Limits
- Claude context: ~200K tokens. Practical limit for passing video metadata between agents.
- Pass file paths + structured JSON, not raw video data
- Agent memory: store generation params in JSON sidecar per clip → re-injectable context

### Claude Code Specific
- Skills = markdown files loaded as system context (domain expertise, not executable)
- MCP servers registered in `.claude/settings.json` or `mcp.json`
- Sub-agents spawned via `claude -p` or orchestration primitives
- Transport: stdio (local) or HTTP+SSE (remote services)

### Practical Adaptation for Music Video Pipeline
Each AI API becomes an MCP server with typed tools:
- `runway.generate(prompt, reference_image, duration)` → clip path
- `audio.detect_beats(audio_path)` → beat timestamps[]
- `ffmpeg.assemble(clips[], beats[], lyrics[])` → final video path
- `vision.analyze_style(image_path)` → style JSON

Orchestrator reads song metadata + user prefs → calls tools in sequence → returns assembled video.

---

## Unresolved Questions

1. **Runway Gen-4 API rate limits / pricing** not publicly documented — need direct API account to verify throughput for batch generation (full music video = 20-40 clips).
2. **Kling API availability by region** — US access inconsistent as of early 2026.
3. **Beat-to-visual semantic alignment** — librosa gives beat times, but mapping beat energy to shot *content* (not just timing) has no production-ready API solution.
4. **Character consistency across different AI providers** — no cross-platform identity protocol; locked to single provider per video if consistency is critical.
5. **Real-time vs batch**: whether music video generation pipeline should be async job queue or streaming — impacts UX design significantly.

---

## Sources
- [Kling AI Character Consistency](https://app.klingai.com/global/quickstart/ai-video-character-consistency)
- [Runway Gen-4 Review 2025](https://aitoolanalysis.com/runway-gen-4-review/)
- [Adobe Firefly Boards Global Launch](https://blog.adobe.com/en/publish/2025/09/24/firefly-boards-launches-globally-now-with-runway-aleph-moonvalley-marey-models-new-powerful-ideation-features-flexible-offers)
- [MCP Architecture Spec](https://modelcontextprotocol.io/specification/2025-06-18/architecture)
- [MCP + Creative Pipelines (AdSkate)](https://www.adskate.com/blogs/mcp-model-context-protocol-2025-guide)
- [Anthropic: Code execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp)
- [FFmpeg + n8n Automation](https://lilys.ai/en/notes/ai-video-production-20251029/ffmpeg-n8n-automated-video-editing)
- [OpenAI GPT-4V Video Processing Cookbook](https://cookbook.openai.com/examples/gpt_with_vision_for_video_understanding)
- [mcp-agent (lastmile-ai)](https://github.com/lastmile-ai/mcp-agent)

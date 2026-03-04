# Research Report: MCP Servers, AI Pipeline Architecture, Model Routing, Real-Time Progress

Date: 2026-02-25

---

## 1. MCP Server Best Practices (2025-2026)

### Transport

| Transport | Status | Use Case |
|---|---|---|
| stdio | Active | Local dev / desktop clients only |
| SSE | **Deprecated** (spec 2025-06-18) | Legacy |
| Streamable HTTP | **Production standard** | Remote, networked, horizontally scalable |

Use stdio for maximum client compat today; Streamable HTTP for production remote servers.

### Tool Granularity

**Anti-pattern**: Map tools 1:1 to API operations (`createIssue`, `addLabel`, `assignUser` = 3 tools).

**Pattern**: Map tools to complete user intents (`create_github_issue` handles the whole workflow = 1 tool).

Benefits: fewer permission prompts, better LLM decision-making, smaller tool surface.

### Organization at Scale

- **<30 tools**: flat namespace, descriptive names
- **30+ tools**: namespacing via forward slash (`files/read`, `db/query`)
- **Enterprise**: split servers by product area, permission boundary, or perf requirement
- **Dynamic loading**: serve only contextually relevant tools, not all tools upfront

### Primitives (don't conflate these)

- **Tools** → state-changing ops (POST/PUT/DELETE equivalent)
- **Resources** → read-only data (GET equivalent)
- **Prompts** → reusable interaction templates

### Error Handling

Return human-readable error messages from within the tool (not raw exception traces). Annotate tools with `confirmation_required`, `danger` flags for destructive ops.

### Production Ops

- Structured logs with correlation IDs + tool name + invocation ID + latency
- Make tool calls **idempotent** where possible, accept client-generated request IDs
- Pagination cursors for list ops
- Request cancellation + timeouts to prevent stranded resources
- Docker packaging: eliminates environment drift

### Auth

Never deploy without auth. HTTPS only. Token validation with least-privilege scopes.

---

## 2. AI Media Pipeline State Management

### Standard Pattern: Job Queue + State Machine

```
HTTP Request → Queue Job (Redis/BullMQ) → Worker(s) → Artifact Storage (S3) → Status Updates
```

**Job States** (BullMQ model, industry standard):
```
waiting → active → completed
                 → failed → (retry with backoff)
waiting → delayed → waiting  (scheduled/retry)
```

### BullMQ + Redis (Node.js de facto for AI pipelines)

- Jobs are Redis entries with metadata: `jobId`, `status`, `progress`, `data`, `result`, `attempts`
- **FlowProducer**: manages DAG-style dependencies (children run before parents) — critical for multi-step pipelines (e.g., generate image → lip-sync → add audio → compose video)
- Built-in: delayed jobs, priorities, retries with backoff, rate limiting, concurrency control per worker

### Multi-Step Pipeline Pattern

```
JobA (image gen) ──→ JobB (lip-sync) ──→ JobC (audio mix) ──→ JobD (final compose)
     └─ stored in S3   └─ reads JobA artifact  └─ reads JobB artifact  └─ reads A+B+C
```

Each job stores its artifact URL in job result; downstream jobs read from job data. Intermediate artifacts stored in S3/GCS, job metadata in Redis.

### Production Considerations

- `removeOnComplete: { age: 3600, count: 100 }` — prevent Redis memory bloat
- `attempts` + `backoff` on AI generation jobs (they fail transiently)
- Monitor queue depth and failed job counts (key reliability signal)
- Separate queues per priority tier (fast/slow jobs don't block each other)

### Alternative: Python Stack

Celery + Redis/RabbitMQ for Python-heavy shops (same conceptual pattern, different runtime).

---

## 3. Model Routing: Unified Provider Abstraction

### Two Deployment Patterns

**Infrastructure Layer (self-hosted)** — LiteLLM pattern:
```
Your App → LiteLLM Proxy → [OpenAI | Anthropic | Replicate | Fal.ai | Runway]
                          ↑ handles: routing, retries, cost tracking, rate limits
```
Full control, self-hosted, supports 100+ providers via single OpenAI-compatible endpoint.

**Integration Layer (managed SaaS)** — OpenRouter pattern:
```
Your App → OpenRouter API → [500+ models across providers]
                           ↑ single billing, framework-compatible (OpenAI SDK works as-is)
```

### Adapter Pattern for Image/Video APIs

These (Replicate, Fal.ai, Runway, Stability AI) don't follow OpenAI-compatible format — need custom adapters:

```typescript
interface MediaGenerationProvider {
  generateImage(params: ImageParams): Promise<GenerationJob>
  generateVideo(params: VideoParams): Promise<GenerationJob>
  getJobStatus(jobId: string): Promise<JobStatus>
  cancelJob(jobId: string): Promise<void>
}

class ReplicateAdapter implements MediaGenerationProvider { ... }
class FalAiAdapter implements MediaGenerationProvider { ... }
class RunwayAdapter implements MediaGenerationProvider { ... }

class MediaRouter {
  route(task: Task): MediaGenerationProvider { /* capability + cost + availability routing */ }
}
```

### Routing Strategies

1. **Capability routing** — route based on what the provider supports (video length, resolution, style)
2. **Cost routing** — cheapest provider that meets quality threshold
3. **Fallback routing** — try provider A, fallback to B on error/timeout
4. **Load balancing** — distribute across providers to avoid rate limits

### Key Implementation Points

- Normalize request/response schemas at the adapter layer, not at call sites
- Track per-provider rate limits and costs in shared state (Redis)
- Idempotency keys prevent double-billing on retries

---

## 4. Real-Time Progress for Long-Running AI Jobs

### Decision Matrix

| Method | Latency | Complexity | Best For |
|---|---|---|---|
| Short polling | ~1-5s | Low | Simple fallback, legacy |
| Long polling | ~100ms | Medium | Moderate interactivity |
| **SSE** | ~5ms | **Low** | **AI job progress (standard)** |
| WebSocket | ~2ms | High | Bidirectional, interactive |

### SSE is the 2025 Standard for AI Job Progress

- One-way server → client (matches AI job use case perfectly)
- Works over standard HTTP (CDN/proxy friendly, no upgrade dance)
- Built-in browser `EventSource` API, automatic reconnect
- 5 bytes overhead per message vs WebSocket's 2 bytes — negligible

### Standard Architecture

```
Client → POST /jobs          (create job, returns jobId)
Client → GET  /jobs/:id/stream  (SSE stream for that job)

SSE Events:
{ event: "progress", data: { step: "generating_image", pct: 25 } }
{ event: "progress", data: { step: "lip_sync", pct: 60 } }
{ event: "progress", data: { step: "compositing", pct: 85 } }
{ event: "complete", data: { result_url: "https://..." } }
{ event: "error",    data: { message: "...", code: "GENERATION_FAILED" } }
```

### Backend Pattern (FastAPI/Node)

```
HTTP Request → Create BullMQ Job → Return { jobId }
SSE Handler  → Subscribe to Redis pub/sub channel `job:{jobId}:progress`
BullMQ Worker → publish progress events to Redis channel as steps complete
```

Workers push progress to Redis pub/sub; SSE handler streams to client. Decoupled, scales horizontally.

### When to Use WebSocket Instead

- User sends messages mid-generation (interactive AI)
- Multiple concurrent jobs need multiplexed updates on one connection
- Bidirectional control (pause, cancel, adjust params mid-run)

### Polling as Fallback

Exponential backoff polling: start at 1s, cap at 10s for jobs >30s. Acceptable for non-realtime contexts or when SSE is blocked by corporate proxies.

---

## Summary: Recommended Stack for AI Video Pipeline

```
Transport:     Streamable HTTP (MCP) + SSE (job progress)
Queue:         BullMQ + Redis (Node.js) or Celery + Redis (Python)
State:         Redis (job metadata + pub/sub) + S3 (artifacts)
Routing:       Custom adapter pattern behind MediaRouter interface
Provider:      LiteLLM for LLMs; custom adapters for image/video APIs
```

---

## Unresolved Questions

1. MCP Streamable HTTP auth spec is still maturing — OAuth 2.1 integration details not finalized across all client implementations as of early 2026.
2. No clear open-source reference implementation for unified image+video API routing (LiteLLM covers LLMs only; media APIs need custom work).
3. FlowProducer (BullMQ) job DAG visualization tooling is sparse — monitoring complex pipelines requires custom dashboards.

---

## Sources

- [15 Best Practices for Building MCP Servers - The New Stack](https://thenewstack.io/15-best-practices-for-building-mcp-servers-in-production/)
- [MCP Server Best Practices - MCPcat](https://mcpcat.io/blog/mcp-server-best-practices/)
- [MCP Best Practices - modelcontextprotocol.info](https://modelcontextprotocol.info/docs/best-practices/)
- [BullMQ Architecture](https://docs.bullmq.io/guide/architecture)
- [Using BullMQ to Power AI Workflows - DEV](https://dev.to/lbd/using-bullmq-to-power-ai-workflows-with-observability-in-mind-1ieh)
- [OpenRouter vs LiteLLM - Xenoss](https://xenoss.io/blog/openrouter-vs-litellm)
- [LiteLLM vs OpenRouter - TrueFoundry](https://www.truefoundry.com/blog/litellm-vs-openrouter)
- [SSE vs WebSockets vs Long Polling 2025 - DEV](https://dev.to/haraf/server-sent-events-sse-vs-websockets-vs-long-polling-whats-best-in-2025-5ep8)
- [SSE's Glorious Comeback 2025 - portalZINE](https://portalzine.de/sses-glorious-comeback-why-2025-is-the-year-of-server-sent-events/)

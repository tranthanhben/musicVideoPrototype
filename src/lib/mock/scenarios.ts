// --- Types ---

export interface ScenarioStep {
  id: number
  phase: 'ANALYZE' | 'CONCEPT' | 'VISUAL' | 'VIDEO' | 'EDIT'
  time: string
  title: string
  what: string
  friction?: string[]
  value?: string[]
  tools: string[]
  quote: string
  color: string
  icon: string
  good?: boolean
}

export interface FrictionRow {
  category: string
  before: string
  after: string
}

export const PHASE_COLORS: Record<string, string> = {
  ANALYZE: '#74c0fc',
  CONCEPT: '#a9e34b',
  VISUAL: '#ffd43b',
  VIDEO: '#ff922b',
  EDIT: '#20c997',
}

export const persona = {
  name: 'Minh — Music Producer / Indie Artist',
  avatar: '🎧',
  desc: 'Has a track they want to make an MV for. Familiar with AI tools & prompting, but not a developer.',
}

// --- Before: Manual AI orchestration ---

export const beforeSteps: ScenarioStep[] = [
  {
    id: 1, phase: 'ANALYZE', time: '~45 min', title: 'Manually analyze music + write prompt context',
    what: 'Use ChatGPT to describe song emotions. Listen manually, note timestamps by hand. Paste lyrics into Claude for mood & themes. Compile everything into a doc for later steps.',
    friction: [
      'Emotion analysis by hand — no real waveform/BPM data',
      'Self-made context doc — inconsistent, easy to miss details',
      'Each tool has no knowledge of the other tool\'s results',
    ],
    tools: ['ChatGPT (lyrics/mood)', 'Claude (ideation)', 'Notepad / Notion'],
    quote: '"ChatGPT says the mood is melancholic... Claude says nostalgic... I just pick whichever feels right"',
    color: '#ff6b6b', icon: '🎵',
  },
  {
    id: 2, phase: 'CONCEPT', time: '~1–2 hrs', title: 'Brainstorm storyline & storyboard',
    what: 'Chat with Claude/ChatGPT for storyline. Must copy-paste context doc into every new chat. Ask multiple times, curate manually. Use ChatGPT to gen image prompts per scene. Manually decide which scene matches which timestamp.',
    friction: [
      'No memory between sessions — must re-paste context constantly',
      'Storyline & storyboard are separate conversations, easy to lose track',
      'No way to instantly visualize results on a timeline',
    ],
    tools: ['Claude (storyline)', 'ChatGPT (scene breakdown)', 'Google Docs'],
    quote: '"Wrote a great storyline, but now I have to start a brand new conversation for the storyboard..."',
    color: '#ffa94d', icon: '💭',
  },
  {
    id: 3, phase: 'VISUAL', time: '~2–4 hrs', title: 'Gen storyboard images — one scene at a time',
    what: 'Use Midjourney or Flux to gen images for each scene. Must craft a separate prompt per image. Run many times due to inconsistent styles. Manually check each image for character consistency. Re-roll many times.',
    friction: [
      'Style drift between scenes — same character looks different',
      'No shared style seed/reference between image gens',
      'Each image takes ~5–10 prompt tries — 16 scenes = hundreds of attempts',
    ],
    tools: ['Midjourney / Flux / DALL-E', 'Discord bot', 'Manual prompting'],
    quote: '"Scene 1 and scene 8 have the same character but look like two different people..."',
    color: '#cc5de8', icon: '🎨',
  },
  {
    id: 4, phase: 'VIDEO', time: '~3–6 hrs', title: 'Gen video clips — manual orchestration',
    what: 'Export images from Midjourney → Upload to Kling/Runway for i2v. Write motion prompts per clip. Wait for render (5–15 min/clip). Download, review, re-prompt if unsatisfied. Repeat for 10–16 scenes. No shared context between clips.',
    friction: [
      'Kling/Runway know nothing about the music — motion doesn\'t sync with beats',
      'Must manually manage files: scene1_v1.mp4, scene1_v2.mp4...',
      'No timeline preview to see how the full MV looks',
    ],
    tools: ['Kling / Runway / Pika', 'File manager', 'Manual motion prompts'],
    quote: '"16 clips, each 3–4 attempts. My folder has 50 mp4 files and I don\'t know which is which..."',
    color: '#339af0', icon: '🎬',
  },
  {
    id: 5, phase: 'EDIT', time: '~3–5 hrs', title: 'Edit, sync, assemble — DIY',
    what: 'Import all clips into CapCut/Premiere. Drag each clip to the right timestamp manually. Sync beats by eye and ear. Add transitions, text, effects by hand. Export, review, fix, re-export.',
    friction: [
      'No AI helps with auto beat-sync in this step',
      'Color grading is inconsistent since clips come from different sources',
      'Wanting to change 1 scene means redoing from the image gen step',
    ],
    tools: ['CapCut / Premiere', 'DaVinci (color)', 'Eyes + ears for sync'],
    quote: '"This is the most time-consuming step. And if I want to change scene 5, I have to start over..."',
    color: '#51cf66', icon: '✂️',
  },
]

// --- After: Agentic system ---

export const afterSteps: ScenarioStep[] = [
  {
    id: 1, phase: 'ANALYZE', time: '< 2 min', title: 'Upload track → Agent auto-builds context',
    what: 'Upload music file. MCP Music Analysis skill auto-runs: extracts BPM, key, waveform, segment structure (intro/verse/chorus), emotion curve by timestamp. Output is structured data for the entire pipeline — user does nothing.',
    value: [
      'Context built from real data, not subjective feelings',
      'All downstream agents share the same music context',
      'Timeline editor instantly displays emotion map & segment markers',
    ],
    tools: ['MCP: Music Analysis', 'Waveform parser', 'Emotion segmentation model'],
    quote: '"It detected 3 emotional peaks I didn\'t notice while listening — and suggested placing the climax scenes right there"',
    color: '#74c0fc', icon: '🎵', good: true,
  },
  {
    id: 2, phase: 'CONCEPT', time: '10–15 min', title: 'Input intent → Agent gens storyline + scene map',
    what: 'User inputs: character reference, desired setting, rough idea prompt. Concept Agent (powered by Claude) uses music context + user input to gen 3 storyline options with scene breakdowns already mapped to music timestamps. User picks or mixes.',
    value: [
      'Storylines are bound to the music structure — not generic',
      'No copy-pasting context — agent remembers everything',
      '3 options with different tones to choose from or combine',
    ],
    tools: ['Claude Agent (concept)', 'Music context binding', 'Scene-timestamp mapper'],
    quote: '"3 storyline options, each with clear breakdown: scene X at timestamp Y because this is the chorus — I just pick"',
    color: '#a9e34b', icon: '💭', good: true,
  },
  {
    id: 3, phase: 'VISUAL', time: '15–20 min', title: 'Auto storyboard — consistent style, full MV',
    what: 'Image Agent receives scene breakdown + character ref + style preference → gens entire storyboard with shared style seed. Every scene uses consistent character appearance and visual language. Results display on timeline editor, user can swap individual scenes.',
    value: [
      'Style consistency ensured by shared seed — no manual checking',
      'User only needs to approve or request regeneration of specific scenes',
      'See the entire visual flow before generating video',
    ],
    tools: ['Image Gen Agent (Flux/SD)', 'Style consistency layer', 'Timeline preview UI'],
    quote: '"16 images, same character, same colors, same mood — first time I see my MV before it even exists"',
    color: '#ffd43b', icon: '🎨', good: true,
  },
  {
    id: 4, phase: 'VIDEO', time: '20–30 min (parallel render)', title: 'Video Agent gens clips — music-aware motion',
    what: 'Video Agent receives storyboard + music data → auto-crafts motion prompts accounting for beat rhythm (slow motion for quiet parts, dynamic motion for chorus). Sends batch to Kling/Runway via MCP. Clips render in parallel, auto-organized by scene ID.',
    value: [
      'Motion designed to match music energy — not random',
      'Parallel rendering: 16 clips simultaneously instead of sequentially',
      'Files auto-named and placed in the correct timeline slot',
    ],
    tools: ['MCP: Kling / Runway connector', 'Music-aware motion planner', 'Parallel job orchestration'],
    quote: '"I hit Generate All and went to make coffee. Came back to find 16 clips done and previewing on the timeline"',
    color: '#ff922b', icon: '🎬', good: true,
  },
  {
    id: 5, phase: 'EDIT', time: '10–15 min', title: 'Review on timeline → Iterate by exception',
    what: 'All clips auto-assembled on timeline with music. Beat sync was calculated during generation. User reviews, only flags scenes they don\'t like → Re-gen that scene only (doesn\'t affect others). Apply color grade, effects, lyric animation with 1-click presets. Export.',
    value: [
      'Only fix what needs fixing — don\'t redo everything',
      'Re-gen 1 scene keeps context — character & style won\'t drift',
      'Multi-platform export (YouTube / TikTok / Instagram) auto-optimized',
    ],
    tools: ['Timeline editor', 'Scene re-gen (isolated)', 'Color + effects presets', 'Multi-platform export'],
    quote: '"I only changed 2 scenes and tweaked the colors a bit. 15 minutes later I had a complete MV that looks more pro than I expected"',
    color: '#20c997', icon: '✂️', good: true,
  },
]

// --- Friction summary ---

export const frictionSummary: FrictionRow[] = [
  {
    category: 'Context sharing',
    before: 'User manually copy-pastes context between ChatGPT, Claude, Kling, Midjourney',
    after: 'Shared music context object — all agents see the same source of truth',
  },
  {
    category: 'Style consistency',
    before: 'Manually check each image/clip, re-prompt many times, still drifts',
    after: 'Shared style seed + character embedding → automatic consistency',
  },
  {
    category: 'Music-visual sync',
    before: 'No tool knows about the music when generating visuals — sync is fully manual',
    after: 'Music context bound to every gen step — motion & timing auto-align with beats',
  },
  {
    category: 'File management',
    before: 'Self-named, self-organized, self-remembered which is which',
    after: 'Scene ID system — all assets auto-organize through the pipeline',
  },
  {
    category: 'Iteration cost',
    before: 'Changing 1 scene = redo the entire chain from that step',
    after: 'Re-gen isolated scene — nothing else affected',
  },
  {
    category: 'Orchestration',
    before: 'User is the "glue" — manually copies output from one tool as input to another',
    after: 'Agent orchestration + MCP connectors handle all handoffs',
  },
]

import type { PipelineResponse } from '@/lib/chat/response-bank'
import type { JourneyStateId } from './orchestrator'
import type { MockProject } from '@/lib/mock/types'

// --- Intent pattern matching ---

interface IntentPattern {
  pattern: RegExp
  action: string | ((m: RegExpMatchArray) => string)
  states: JourneyStateId[]
}

const ALL_STATES: JourneyStateId[] = [
  'welcome', 'analyzing', 'l1_review', 'creative', 'l2_review',
  'storyboard', 'l3_review', 'generating', 'l4_review', 'editing', 'l5_review', 'complete',
]

const PATTERNS: IntentPattern[] = [
  // Analysis
  { pattern: /emotion\s*peaks?|energy\s*peaks?|show\s*peaks/i, action: 'show_emotion_peaks', states: ['l1_review', 'analyzing'] },
  { pattern: /segment\s*detail|show\s*segments|all\s*segments/i, action: 'show_segments', states: ['l1_review', 'analyzing'] },
  { pattern: /what\s*key|song\s*key|musical\s*key/i, action: 'show_key', states: ['l1_review', 'analyzing'] },
  { pattern: /beat\s*markers?|beat\s*map/i, action: 'show_beat_markers', states: ['l1_review'] },
  // Creative
  { pattern: /select.*celestial|celestial\s*journey/i, action: 'select_storyline_0', states: ['l2_review'] },
  { pattern: /select.*neon|neon\s*metropolis/i, action: 'select_storyline_1', states: ['l2_review'] },
  { pattern: /select.*abstract|abstract\s*emotion/i, action: 'select_storyline_2', states: ['l2_review'] },
  { pattern: /different\s*palette|suggest.*palette|new\s*palette/i, action: 'suggest_palette', states: ['l2_review'] },
  { pattern: /more\s*ethereal|ethereal\s*vibe/i, action: 'adjust_mood_ethereal', states: ['l2_review'] },
  { pattern: /make.*dark|darker|moody/i, action: 'adjust_mood_dark', states: ['l2_review'] },
  { pattern: /warm.*palette|try\s*warm/i, action: 'adjust_mood_warm', states: ['l2_review'] },
  // Storyboard
  { pattern: /show\s*scene\s*(\d+)\s*detail|scene\s*(\d+)\s*info/i, action: (m) => `show_scene_details_${parseInt(m[1] || m[2]) - 1}`, states: ['l3_review'] },
  { pattern: /swap\s*scene\s*(\d+)\s*(?:and|&)\s*(\d+)/i, action: (m) => `swap_scenes_${parseInt(m[1]) - 1}_${parseInt(m[2]) - 1}`, states: ['l3_review'] },
  { pattern: /(?:change|edit)\s*scene\s*(\d+)\s*camera/i, action: (m) => `change_camera_${parseInt(m[1]) - 1}`, states: ['l3_review'] },
  { pattern: /close.?ups/i, action: 'add_closeups', states: ['l3_review'] },
  // Generation
  { pattern: /compare\s*takes?\s*(?:for\s*)?scene\s*(\d+)/i, action: (m) => `compare_takes_${parseInt(m[1]) - 1}`, states: ['l4_review'] },
  { pattern: /show\s*all\s*renders?/i, action: 'show_all_renders', states: ['l4_review'] },
  { pattern: /try\s*runway.*scene\s*(\d+)|runway.*gen.?4.*scene\s*(\d+)/i, action: (m) => `change_model_runway_${parseInt(m[1] || m[2]) - 1}`, states: ['l4_review'] },
  { pattern: /which\s*models?|what\s*models?/i, action: 'describe_models', states: ['generating', 'l4_review'] },
  // Editing
  { pattern: /film\s*noir|try.*noir/i, action: 'apply_effect_film_noir', states: ['l5_review'] },
  { pattern: /warm\s*vintage|try.*vintage/i, action: 'apply_effect_warm_vintage', states: ['l5_review'] },
  { pattern: /clean\s*pop|try.*clean\s*pop/i, action: 'apply_effect_clean_pop', states: ['l5_review'] },
  { pattern: /cosmic\s*cinema/i, action: 'apply_effect_cosmic_cinema', states: ['l5_review'] },
  { pattern: /(?:add|toggle)\s*lens\s*flare/i, action: 'toggle_lens_flare', states: ['l5_review'] },
  { pattern: /(?:remove|toggle)\s*film\s*grain/i, action: 'toggle_film_grain', states: ['l5_review'] },
  { pattern: /boost\s*contrast|more\s*contrast/i, action: 'adjust_contrast', states: ['l5_review'] },
  { pattern: /preview\s*tiktok|tiktok\s*format/i, action: 'preview_tiktok', states: ['l5_review', 'complete'] },
  { pattern: /dissolve\s*transition/i, action: 'set_transition_dissolve', states: ['l5_review'] },
  // Complete
  { pattern: /export\s*youtube|youtube\s*only/i, action: 'export_youtube', states: ['complete'] },
  // Global
  { pattern: /regenerate\s+scene\s+(\d+)/i, action: (m) => `regenerate_scene_${parseInt(m[1]) - 1}`, states: ALL_STATES },
  { pattern: /download\s*all/i, action: 'download', states: ['complete'] },
  { pattern: /start\s*new/i, action: 'new_project', states: ['complete'] },
]

export function matchIntent(text: string, state: JourneyStateId): string | null {
  for (const { pattern, action, states } of PATTERNS) {
    if (!states.includes(state)) continue
    const m = text.match(pattern)
    if (m) return typeof action === 'function' ? action(m) : action
  }
  return null
}

// --- Response builders ---

function fmt(s: number): string {
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

function svgThumb(from: string, to: string): string {
  return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${from}"/><stop offset="100%" style="stop-color:${to}"/></linearGradient></defs><rect width="400" height="300" fill="url(%23g)"/></svg>`
}

const CAMERA_ALTS: Record<string, string[]> = {
  'wide shot': ['Medium close-up', 'Low angle tracking', 'Dutch angle'],
  'low angle': ['Over-shoulder tracking', 'Aerial drone', 'POV shot'],
  'cockpit POV': ['Over-shoulder tracking', 'Dutch angle', 'Wide establishing'],
  'aerial overhead': ['Close tracking', 'Handheld', 'Crane sweep'],
  'extreme close-up': ['Medium shot', 'Wide pullback', 'Rack focus'],
  'medium shot': ['Close-up', 'Wide shot', 'Low angle'],
  'tracking shot': ['Steadicam circle', 'Aerial follow', 'Handheld shake'],
  'wide establishing': ['Close-up push in', 'Dolly across', 'Tilt reveal'],
}

const EFFECT_DESCRIPTIONS: Record<string, string> = {
  film_noir: 'High contrast B&W with deep shadows, subtle blue desaturation, and dramatic side lighting. Classic noir atmosphere.',
  warm_vintage: 'Warm golden tones, soft highlights, slightly faded shadows. 70mm film stock emulation with light grain.',
  clean_pop: 'Vibrant, saturated colors with clean blacks and sharp contrast. Modern, polished look with no grain.',
  cosmic_cinema: 'Deep blues → warm golds following the emotion curve. Film grain overlay + lens flare at energy peaks.',
}

export function buildBayResponse(action: string, _state: JourneyStateId, project: MockProject): PipelineResponse | null {
  const { audio, scenes } = project

  // --- Analysis ---
  if (action === 'show_emotion_peaks') {
    const peaks = audio.energyCurve.filter((p) => p.isPeak)
    const lines = peaks.map((p, i) => {
      const seg = audio.segments.find((s) => p.time >= s.startTime && p.time < s.endTime)
      return `- **Peak ${i + 1}** at ${fmt(p.time)} (energy ${(p.energy * 100).toFixed(0)}%) — during ${seg?.label ?? 'transition'}`
    }).join('\n')
    return { text: `Detected **${peaks.length} emotional peaks** in "${audio.title}":\n\n${lines}\n\nThese drive the most intense visual moments.` }
  }
  if (action === 'show_segments') {
    const lines = audio.segments.map((s) => {
      const avg = audio.energyCurve.filter((p) => p.time >= s.startTime && p.time < s.endTime)
      const avgE = avg.length ? avg.reduce((sum, p) => sum + p.energy, 0) / avg.length : 0
      return `- **${s.label}** (${s.type}) — ${fmt(s.startTime)}–${fmt(s.endTime)} · avg energy ${(avgE * 100).toFixed(0)}%`
    }).join('\n')
    return { text: `**${audio.segments.length} segments** in "${audio.title}":\n\n${lines}` }
  }
  if (action === 'show_key') {
    const desc: Record<string, string> = {
      'A minor': 'moody, introspective — perfect for ethereal or emotional visuals',
      'F# minor': 'dark, passionate with sharp intensity — great for cyberpunk aesthetics',
      'D major': 'bright, warm, triumphant — ideal for uplifting nature visuals',
    }
    return { text: `**${audio.key}** at **${audio.bpm} BPM** — ${desc[audio.key] ?? 'a versatile key for many visual styles'}.\n\n${(audio.bpm / 60).toFixed(1)} beats/second → scene cuts and transitions will sync to this pulse.` }
  }
  if (action === 'show_beat_markers') {
    return { text: `**${audio.beatMarkers.length} beat markers** across ${fmt(audio.duration)}. At ${audio.bpm} BPM, one beat every ${(60 / audio.bpm).toFixed(2)}s. Every 4th beat (${(240 / audio.bpm).toFixed(2)}s) creates natural cut points.` }
  }

  // --- Creative ---
  const storylineMatch = action.match(/^select_storyline_(\d+)$/)
  if (storylineMatch) {
    const idx = parseInt(storylineMatch[1])
    const names = ['Celestial Journey', 'Neon Metropolis', 'Abstract Emotion']
    const descs = [
      'Ethereal space voyage synced to verse/chorus arcs. Soft nebula visuals for verses, supernova bursts for choruses.',
      'High-energy cyberpunk city narrative with beat-driven cuts. Neon reflections and motion blur match the pulse.',
      'Pure visual poetry following the emotion curve. Color and form shift with energy — no narrative, pure feeling.',
    ]
    return { text: `**${names[idx]}** selected! Locking in: ${descs[idx]}\n\nStyle seed \`CREMI-7C3A-COSMIC\` will maintain character and color consistency across all scenes.` }
  }
  if (action === 'suggest_palette') {
    return { text: "Here are 3 alternative palettes:\n\n1. **Warm Sunset** — amber, coral, deep magenta\n2. **Cool Ocean** — teal, navy, silver\n3. **Monochrome Drama** — pure B&W with a single accent color\n\nType the name to apply, or stick with the current cosmic palette." }
  }
  if (action === 'adjust_mood_ethereal') {
    return { text: "Shifting mood toward **more ethereal**: softer transitions, dreamier color grading, longer dissolves between scenes. Lens flare intensity increased. Verse sections will use slow-motion overlays." }
  }
  if (action === 'adjust_mood_dark') {
    return { text: "Going **darker**: increased contrast, desaturated midtones, deeper shadows. Chorus explosions will feel more dramatic against the dark baseline. Adding subtle vignette to all scenes." }
  }
  if (action === 'adjust_mood_warm') {
    return { text: "Applying **warm palette**: shifting from cool blues toward amber and gold tones. Temperature +15%. The emotion curve peaks will glow with warm highlights while valleys stay in cool shadow." }
  }

  // --- Storyboard ---
  const sceneDetailMatch = action.match(/^show_scene_details_(\d+)$/)
  if (sceneDetailMatch) {
    const idx = parseInt(sceneDetailMatch[1])
    const sc = scenes[idx]
    if (!sc) return null
    const seg = audio.segments.find((s) => {
      let cumDur = 0
      for (let i = 0; i <= idx; i++) cumDur += scenes[i].duration
      return cumDur >= s.startTime && cumDur <= s.endTime
    }) ?? audio.segments[Math.min(idx, audio.segments.length - 1)]
    return { text: `**Scene ${idx + 1}** — "${sc.subject} ${sc.action}"\n\n- Environment: ${sc.environment}\n- Camera: ${sc.cameraAngle}, ${sc.cameraMovement}\n- Duration: ${sc.duration}s\n- Segment: ${seg.label} (${seg.type})\n- Prompt: *${sc.prompt}*` }
  }
  const swapMatch = action.match(/^swap_scenes_(\d+)_(\d+)$/)
  if (swapMatch) {
    const [a, b] = [parseInt(swapMatch[1]), parseInt(swapMatch[2])]
    const sa = scenes[a], sb = scenes[b]
    if (!sa || !sb) return null
    return { text: `**Swapped Scene ${a + 1} and Scene ${b + 1}!**\n\n- Scene ${a + 1} is now: "${sb.subject} ${sb.action}"\n- Scene ${b + 1} is now: "${sa.subject} ${sa.action}"\n\nThis creates a stronger emotional arc — the ${sb.subject.toLowerCase()} moment now leads into the ${sa.subject.toLowerCase()} sequence.` }
  }
  const cameraMatch = action.match(/^change_camera_(\d+)$/)
  if (cameraMatch) {
    const idx = parseInt(cameraMatch[1])
    const sc = scenes[idx]
    if (!sc) return null
    const alts = CAMERA_ALTS[sc.cameraAngle] ?? ['Close-up', 'Wide shot', 'Tracking']
    return { text: `Scene ${idx + 1} currently uses **${sc.cameraAngle}** (${sc.cameraMovement}).\n\nAlternatives:\n${alts.map((a, i) => `${i + 1}. ${a}`).join('\n')}\n\nType the number or name to apply. The camera change will be reflected in the next render.` }
  }
  if (action === 'add_closeups') {
    return { text: "Adding close-up shots to Scenes 2, 5, and 8 — these are emotional peaks where facial expressions sell the story. Camera angles adjusted from wide → medium close-up with shallow depth of field." }
  }

  // --- Generation ---
  const takesMatch = action.match(/^compare_takes_(\d+)$/)
  if (takesMatch) {
    const idx = parseInt(takesMatch[1])
    const sc = scenes[idx]
    if (!sc) return null
    const takeLines = sc.takes.map((t, i) => `- **Take ${i + 1}** ${t.selected ? '(current)' : ''}`).join('\n')
    return {
      text: `**Scene ${idx + 1}** has ${sc.takes.length} takes:\n\n${takeLines}\n\nTake 1 was rendered with Kling 2.6 (dynamic motion). Others offer subtle variations in lighting and camera timing.`,
      artifacts: [{
        id: `takes-compare-${idx}-${Date.now()}`, type: 'image_gallery',
        title: `Scene ${idx + 1} — ${sc.takes.length} Takes`,
        thumbnails: sc.takes.map((t) => t.thumbnailUrl),
        description: `${sc.takes.length} takes | ${sc.subject} ${sc.action}`,
      }],
    }
  }
  if (action === 'show_all_renders') {
    return {
      text: `All **${scenes.length} scenes** rendered successfully:\n\n${scenes.map((s, i) => `- Scene ${i + 1}: "${s.subject}" — ${s.takes.length} takes`).join('\n')}\n\nOverall consistency score: 91%. Style seed maintained across all renders.`,
      artifacts: [{
        id: `all-renders-${Date.now()}`, type: 'image_gallery',
        title: `All ${scenes.length} Rendered Scenes`,
        thumbnails: scenes.map((s) => s.thumbnailUrl),
        description: `${scenes.length} scenes | Consistency: 91%`,
      }],
    }
  }
  const modelMatch = action.match(/^change_model_runway_(\d+)$/)
  if (modelMatch) {
    const idx = parseInt(modelMatch[1])
    const sc = scenes[idx]
    if (!sc) return null
    return { text: `Switching Scene ${idx + 1} from **Kling 2.6** → **Runway Gen-4**. This gives smoother, more cinematic motion for "${sc.subject} ${sc.action}". Re-rendering now — style seed maintained for consistency.` }
  }
  if (action === 'describe_models') {
    return { text: "Using a **music-aware dual-model strategy**:\n\n- **Kling 2.6** — high-energy scenes (chorus, bridge, drop). Fast motion, dramatic camera work.\n- **Runway Gen-4** — gentle scenes (verse, intro, outro). Smooth, cinematic flow with subtle motion.\n\nModel assignment is automatic based on segment energy levels." }
  }

  // --- Editing ---
  const effectMatch = action.match(/^apply_effect_(.+)$/)
  if (effectMatch) {
    const key = effectMatch[1]
    const desc = EFFECT_DESCRIPTIONS[key]
    if (desc) {
      const name = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      return { text: `Applied **${name}** preset: ${desc}\n\nAll ${scenes.length} scenes updated. Energy peak moments get extra emphasis with this grade.` }
    }
  }
  if (action === 'toggle_lens_flare') {
    const peaks = audio.energyCurve.filter((p) => p.isPeak)
    return { text: `Lens flare toggled at **${peaks.length} energy peaks** (${peaks.map((p) => fmt(p.time)).join(', ')}). Subtle anamorphic streaks add cinematic depth at the most intense moments.` }
  }
  if (action === 'toggle_film_grain') {
    return { text: "Film grain toggled. When enabled: 35mm stock emulation at 15% intensity — adds organic texture without obscuring detail. Strength reduces during verse sections for cleaner visuals." }
  }
  if (action === 'adjust_contrast') {
    return { text: "Contrast boosted +12%. Shadows are now deeper, highlights pop more. The emotion curve peaks will feel more dramatic with this increased dynamic range." }
  }
  if (action === 'set_transition_dissolve') {
    return { text: "Transitions set to **dissolve** (0.8s). Each dissolve is synced to beat markers — the blend starts 2 beats before the cut point for smooth musical flow." }
  }
  if (action === 'preview_tiktok') {
    return { text: `**TikTok preview** (9:16 vertical, 60s):\n\nAuto-cropped to center subjects. Highlight section: ${fmt(48)}–${fmt(108)} covering the most energetic chorus + bridge. Vertical framing emphasizes close-ups and facial expressions.` }
  }
  if (action === 'export_youtube') {
    return { text: `**YouTube export** ready:\n\n- Format: 16:9 (1920x1080)\n- Full length: ${fmt(audio.duration)}\n- Codec: H.264, AAC audio\n- Color grade: current preset applied\n- Beat-sync: all transitions locked\n\nIn a real app, the download would start now!` }
  }

  return null
}

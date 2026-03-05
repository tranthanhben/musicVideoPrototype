import type { PipelineResponse } from '@/lib/chat/response-bank'
import type { JourneyStateId } from './orchestrator'
import type { MockScene } from '@/lib/mock/types'

// Chat responses specific to the enhanced monitor prototype

export const MONITOR_RESPONSES: Partial<Record<JourneyStateId, PipelineResponse>> = {
  upload: {
    text: "Welcome to Cremi! Upload your music track or pick a demo track to get started. I'll analyze the music and guide you through the entire production process.",
  },
  analysis_review: {
    text: "Analysis complete! Detected **3 emotional peaks**, mapped **7 segments** (Intro -> Verse -> Chorus -> Bridge -> Outro), and built a shared music context.\n\nReview the results and approve to continue.",
    actions: [
      { label: 'Approve & Continue', action: 'approve', variant: 'primary' },
      { label: 'Re-analyze', action: 'revise', variant: 'secondary' },
    ],
  },
  style_selection: {
    text: "Now let's define the creative direction. Choose your preferred **video style**, **mood**, **genre**, and **color palette**. These will guide the AI's visual generation.",
  },
  character_setup: {
    text: "Style locked in! Now select your characters. Choose from preset archetypes or upload reference images. You can pick 1-3 characters.",
  },
  storyline_generating: {
    text: "Generating 3 storyline options based on your music analysis, style preferences, and characters...",
  },
  storyline_review: {
    text: "Here are **3 storyline options**, each tailored to your track:\n\n1. **Celestial Journey** (92% match) — Ethereal space voyage\n2. **Neon Metropolis** (87% match) — Cyberpunk city narrative\n3. **Abstract Emotion** (78% match) — Pure visual poetry\n\nPick one or request modifications.",
    actions: [
      { label: 'Approve & Continue', action: 'approve', variant: 'primary' },
      { label: 'Request Changes', action: 'revise', variant: 'secondary' },
    ],
  },
  storyboard_generating: {
    text: "Building storyboard with shared style seed for visual consistency. Mapping scenes to music timestamps...",
  },
  storyboard_review: {
    text: "Storyboard complete! **8 scenes** with beat-synced transitions. Review and approve.",
    actions: [
      { label: 'Approve & Generate', action: 'approve', variant: 'primary' },
      { label: 'Request Changes', action: 'revise', variant: 'secondary' },
    ],
  },
  video_generating: {
    text: "Dispatching **parallel render jobs** — music-aware motion per segment:\n- **Kling 2.6** for dynamic scenes\n- **Runway Gen-4** for gentle scenes",
  },
  video_review: {
    text: "All **8 scenes** rendered! Review the clips. Regenerate any scene you're not happy with.",
    actions: [
      { label: 'Approve All', action: 'approve', variant: 'primary' },
      { label: 'Regenerate Scenes', action: 'show_regen_options', variant: 'secondary' },
    ],
  },
  editing: {
    text: "Auto-assembling timeline with beat-synced transitions. Applying **Cosmic Cinema** preset: film grain + lens flare at peaks, color grading blues to golds...",
  },
  edit_review: {
    text: "Final assembly ready! Beat-synced transitions, color graded, effects applied. Approve for export.",
    actions: [
      { label: 'Approve & Export', action: 'approve', variant: 'primary' },
      { label: 'Adjust Effects', action: 'revise', variant: 'secondary' },
    ],
  },
  complete: {
    text: "Your music video is ready in **3 formats**:\n- **YouTube** — 16:9, full length\n- **TikTok** — 9:16 vertical, 60s highlight\n- **Instagram Reels** — 9:16, 30s teaser",
    actions: [
      { label: 'Download All Formats', action: 'download', variant: 'primary' },
      { label: 'Start New Project', action: 'new_project', variant: 'secondary' },
    ],
  },
}

function svgThumb(from: string, to: string): string {
  return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${from}"/><stop offset="100%" style="stop-color:${to}"/></linearGradient></defs><rect width="400" height="300" fill="url(%23g)"/></svg>`
}

export function buildSceneRegenResponse(sceneIndex: number, scene: MockScene): PipelineResponse {
  return {
    text: `Regenerating Scene ${sceneIndex + 1} — "${scene.subject} ${scene.action}"... Using Kling 2.6 for optimal motion quality.`,
  }
}

export function buildSceneRegenCompleteResponse(sceneIndex: number): PipelineResponse {
  const score = 88 + Math.floor(Math.random() * 10)
  return {
    text: `Scene ${sceneIndex + 1} regenerated! New consistency score: ${score}%.`,
    artifacts: [{
      id: `regen-result-${sceneIndex}-${Date.now()}`, type: 'image_gallery',
      title: `Scene ${sceneIndex + 1} — New Take`,
      thumbnails: [svgThumb('%2306B6D4', '%237C3AED'), svgThumb('%23A855F7', '%23F59E0B')],
      description: `Consistency: ${score}% | Model: Kling 2.6`,
    }],
    actions: [
      { label: 'Approve All Scenes', action: 'approve', variant: 'primary' },
      { label: 'Regenerate Another', action: 'show_regen_options', variant: 'secondary' },
    ],
  }
}

export function buildMonitorFreeformResponse(stateId: JourneyStateId): PipelineResponse {
  const contextual: Partial<Record<JourneyStateId, string>> = {
    upload: "Pick a demo track or upload your own to get started!",
    analyzing: "The analysis is still running — I'll share results shortly!",
    analysis_review: "Review the analysis results. Approve to continue.",
    style_selection: "Take your time choosing styles — they shape the visual direction.",
    character_setup: "Select characters that fit your vision. Pick 1-3.",
    storyline_generating: "Working on storylines — almost ready!",
    storyline_review: "Pick a storyline or ask me to adjust.",
    storyboard_generating: "Building the storyboard...",
    storyboard_review: "Review the storyboard. Approve or suggest edits.",
    video_generating: "Rendering in progress — all scenes in parallel!",
    video_review: "All clips ready. Approve or regenerate specific scenes.",
    editing: "Assembling the final cut with transitions and grading...",
    edit_review: "Final video ready! Approve to export.",
    complete: "Your video is ready! Download or start a new project.",
  }
  return {
    text: contextual[stateId] ?? "I'm working on your music video. Ask me anything!",
  }
}

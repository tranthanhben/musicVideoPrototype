import type { PipelineState } from '@/lib/pipeline/types'
import type { ChatArtifact, ChatActionButton } from './types'

function svgThumb(from: string, to: string): string {
  return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${from}"/><stop offset="100%" style="stop-color:${to}"/></linearGradient></defs><rect width="400" height="300" fill="url(%23g)"/></svg>`
}

export interface PipelineResponse {
  text: string
  artifacts?: ChatArtifact[]
  actions?: ChatActionButton[]
}

const APPROVE_ACTIONS: ChatActionButton[] = [
  { label: 'Approve', action: 'approve', variant: 'primary' },
  { label: 'Request Revision', action: 'revise', variant: 'secondary' },
]

export const PIPELINE_RESPONSES: Record<PipelineState, PipelineResponse> = {
  idle: {
    text: "Welcome to Cremi — your AI music video director. Upload a track and I'll orchestrate the entire production pipeline: music analysis → concept → storyboard → video generation → final edit.",
  },
  uploaded: {
    text: "MCP Music Analysis agent activated. Extracting BPM, musical key, waveform, segment boundaries, and mapping the emotion curve…",
    artifacts: [{
      id: 'art-audio-analysis-upload', type: 'audio_analysis', title: 'Audio Analysis — BPM, Key & Emotion Curve',
      description: 'Extracting waveform data, segment boundaries, and emotion curve…',
      thumbnails: [svgThumb('%233B82F6', '%2360A5FA')],
    }],
  },
  analyzing: {
    text: "Analysis complete. Detected **3 emotional peaks**, mapped **7 segments** (Intro → Verse → Chorus → Bridge → Outro), and built a shared music context for all downstream agents.\n\nReady to generate creative concepts aligned to the music's structure.",
    artifacts: [{
      id: 'art-audio-analysis', type: 'audio_analysis', title: 'Segment Map & Energy Curve',
      description: 'BPM detected | Key mapped | 7 segments | 3 emotional peaks | Emotion curve complete',
      thumbnails: [svgThumb('%233B82F6', '%2360A5FA')],
    }],
    actions: APPROVE_ACTIONS,
  },
  vision_ready: {
    text: "Concept Agent has generated **3 storyline options**, each mapped to the song's timestamp structure:\n\n1. **Celestial Journey** — Ethereal space voyage synced to verse/chorus arcs\n2. **Neon Metropolis** — Cyberpunk city narrative with energy-driven cuts\n3. **Abstract Emotion** — Pure visual poetry following the emotion curve\n\nStyle seed `CREMI-7C3A-COSMIC` applied for character and color consistency.",
    artifacts: [{
      id: 'art-mood-board', type: 'mood_board', title: 'Creative Vision & Mood Board',
      description: 'Cinematic space opera | Deep violet + cyan palette | Slow, ethereal pacing',
      thumbnails: [
        svgThumb('%237C3AED', '%2322D3EE'), svgThumb('%23A855F7', '%23F59E0B'),
        svgThumb('%2306B6D4', '%237C3AED'), svgThumb('%23EC4899', '%237C3AED'),
      ],
    }],
    actions: APPROVE_ACTIONS,
  },
  plan_ready: {
    text: "Storyboard locked. Beat-synced scene mapping complete:\n\n- Scene 4 at Chorus (1:00) — supernova climax at energy peak\n- Scene 7 at Bridge (2:44) — reflective slowdown matching gentle energy\n- All transitions aligned to beat markers for musical sync.",
    artifacts: [{
      id: 'art-storyboard', type: 'storyboard', title: 'Beat-Synced Storyboard',
      description: 'Beat-synced transitions | Cinematic camera work | Scene-to-segment mapping complete',
      thumbnails: [
        svgThumb('%237C3AED', '%2322D3EE'), svgThumb('%23A855F7', '%23F59E0B'),
        svgThumb('%2306B6D4', '%237C3AED'), svgThumb('%23EC4899', '%237C3AED'),
        svgThumb('%23F59E0B', '%23EF4444'), svgThumb('%2322D3EE', '%23A855F7'),
        svgThumb('%23F97316', '%23A855F7'), svgThumb('%237C3AED', '%23EC4899'),
      ],
    }],
    actions: APPROVE_ACTIONS,
  },
  assets_ready: {
    text: "Video Agent dispatching **parallel render jobs** — music-aware motion strategy per segment:\n\n- **Kling 2.6** for dynamic scenes (chorus, bridge) — high-energy motion\n- **Runway Gen-4** for gentle scenes (verse, intro) — smooth, cinematic flow\n\nStyle seed maintained across all renders for consistency.",
    artifacts: [{
      id: 'art-gallery', type: 'image_gallery', title: 'Parallel Render Progress',
      description: 'Parallel render jobs dispatched | Models: Kling 2.6, Runway Gen-4 | Style seed active',
      thumbnails: [
        svgThumb('%237C3AED', '%2322D3EE'), svgThumb('%23A855F7', '%23F59E0B'),
        svgThumb('%2306B6D4', '%237C3AED'), svgThumb('%23EC4899', '%237C3AED'),
      ],
    }],
    actions: APPROVE_ACTIONS,
  },
  assembled: {
    text: "Auto-assembled timeline with **beat-synced transitions**. Applied **\"Cosmic Cinema\"** preset:\n\n- Film grain overlay + lens flare at energy peaks\n- Color grading: deep blues → warm golds following emotion curve\n- All cuts land on beat markers for rhythmic sync.",
    artifacts: [{
      id: 'art-video-preview', type: 'video_preview', title: 'Final Assembly — Cosmic Cinema',
      description: 'Beat-synced transitions | Film grain + lens flare | Color graded: blues → golds',
      thumbnails: [svgThumb('%237C3AED', '%2322D3EE')],
    }],
    actions: APPROVE_ACTIONS,
  },
  complete: {
    text: "Production complete! Your music video is ready in **3 export formats**:\n\n- **YouTube** — 16:9, full length\n- **TikTok** — 9:16 vertical, 60s highlight\n- **Instagram Reels** — 9:16, 30s teaser\n\nAll formats maintain the Cosmic Cinema color grade and beat-sync.",
    artifacts: [{
      id: 'art-final-video',
      type: 'video_preview',
      title: 'Multi-Platform Export',
      description: 'YouTube 16:9 | TikTok 9:16 60s | Instagram Reels 9:16 30s | Cosmic Cinema grade',
      thumbnails: [svgThumb('%23667EEA', '%23764BA2')],
    }],
    actions: [
      { label: 'Download All Formats', action: 'download', variant: 'primary' },
      { label: 'Start New Project', action: 'new_project', variant: 'secondary' },
    ],
  },
}

export function getResponseForState(state: PipelineState): PipelineResponse {
  return PIPELINE_RESPONSES[state]
}

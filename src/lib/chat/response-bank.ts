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
    text: "Welcome! I'm your AI music video producer. Upload a song or describe your vision, and I'll bring it to life. What are we creating today?",
  },
  uploaded: {
    text: "Got it! Let me start analyzing your music track. I'll break down the BPM, key, sections, and energy curve to understand the perfect visual rhythm...",
  },
  analyzing: {
    text: "I've finished analyzing your track! Here's what I found: 128 BPM in A minor, with 4 distinct sections and 16 beat markers. The energy builds gradually with a peak at the chorus. I've also identified the emotional arc — starts intimate, builds to euphoric, then resolves peacefully.",
    artifacts: [{
      id: 'art-audio-analysis', type: 'audio_analysis', title: 'Audio Analysis Complete',
      description: 'BPM: 128 | Key: Am | Duration: 3:12 | 16 beat markers | 4 sections detected',
      thumbnails: [svgThumb('%233B82F6', '%2360A5FA')],
    }],
    actions: APPROVE_ACTIONS,
  },
  vision_ready: {
    text: "Here's the creative direction I'm proposing for your video. I've crafted a cosmic love story that matches the emotional arc of your music — intimate moments in deep space, building to a euphoric supernova climax, then resolving with a tender reunion at the edge of the universe.",
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
    text: "I've designed the complete storyboard — 8 scenes synchronized to your music's beat structure. Each scene has a specific camera angle, movement, and subject that follows the narrative arc. The transitions are timed to hit on the beat markers.",
    artifacts: [{
      id: 'art-storyboard', type: 'storyboard', title: 'Storyboard — 8 Scenes',
      description: '3:12 total | Beat-synced transitions | Cinematic camera work',
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
    text: "All 8 scenes have been generated! I used Kling 2.6 for 5 scenes (best for motion quality) and Runway Gen-4 for 3 scenes (best for character consistency). The consistency checker scored an average of 91% across all scenes. One scene needed lipsync processing, which is now complete.",
    artifacts: [{
      id: 'art-gallery', type: 'image_gallery', title: 'Generated Assets — 8 Scenes',
      description: 'Avg consistency: 91% | Models: Kling 2.6, Runway Gen-4 | Lipsync: complete',
      thumbnails: [
        svgThumb('%237C3AED', '%2322D3EE'), svgThumb('%23A855F7', '%23F59E0B'),
        svgThumb('%2306B6D4', '%237C3AED'), svgThumb('%23EC4899', '%237C3AED'),
      ],
    }],
    actions: APPROVE_ACTIONS,
  },
  assembled: {
    text: "Your music video is assembled! I've added beat-synced transitions, color grading to match the cosmic theme, and a subtle film grain effect. The final cut is 3:12 and ready for your review.",
    artifacts: [{
      id: 'art-video-preview', type: 'video_preview', title: 'Final Video Preview',
      description: '3:12 | 1920x1080 | Color graded | Beat-synced transitions',
      thumbnails: [svgThumb('%237C3AED', '%2322D3EE')],
    }],
    actions: [
      { label: 'Approve & Export', action: 'approve', variant: 'primary' },
      { label: 'Request Changes', action: 'revise', variant: 'secondary' },
    ],
  },
  complete: {
    text: "Your video is ready! I've prepared exports for YouTube (16:9), TikTok (9:16), and Instagram (1:1). You can download all formats or share directly.",
    actions: [
      { label: 'Download All', action: 'download', variant: 'primary' },
      { label: 'Start New Project', action: 'new_project', variant: 'secondary' },
    ],
  },
}

export function getResponseForState(state: PipelineState): PipelineResponse {
  return PIPELINE_RESPONSES[state]
}

import type { PipelineState, QualityGateId } from '@/lib/pipeline/types'
import type { ChatSuggestion } from '@/lib/chat/types'
import { PIPELINE_RESPONSES, type PipelineResponse } from '@/lib/chat/response-bank'
import type { MockScene } from '@/lib/mock/types'

// --- Journey state machine types ---

export type JourneyStateId =
  | 'welcome' | 'analyzing' | 'l1_review'
  | 'creative' | 'l2_review'
  | 'storyboard' | 'l3_review'
  | 'generating' | 'l4_review'
  | 'editing' | 'l5_review'
  | 'complete'

export interface JourneyState {
  id: JourneyStateId
  pipelineState: PipelineState
  /** Prototype-specific view hint (Bay uses for tab switching, Forge for step index, etc.) */
  viewHint?: string
  gateToResolve?: QualityGateId
  nextStateOnApprove?: JourneyStateId
  suggestions: ChatSuggestion[]
}

// --- State definitions ---

export const JOURNEY_STATES: Record<JourneyStateId, JourneyState> = {
  welcome: {
    id: 'welcome', pipelineState: 'idle', viewHint: 'input',
    suggestions: [],
  },
  analyzing: {
    id: 'analyzing', pipelineState: 'uploaded', viewHint: 'input',
    suggestions: [{ text: 'What BPM is this track?' }, { text: 'How long will analysis take?' }],
  },
  l1_review: {
    id: 'l1_review', pipelineState: 'analyzing', viewHint: 'input',
    gateToResolve: 'QG1', nextStateOnApprove: 'creative',
    suggestions: [{ text: 'Show beat markers' }, { text: 'Change key detection' }],
  },
  creative: {
    id: 'creative', pipelineState: 'uploaded', viewHint: 'creative',
    suggestions: [{ text: 'What style are you going for?' }],
  },
  l2_review: {
    id: 'l2_review', pipelineState: 'vision_ready', viewHint: 'creative',
    gateToResolve: 'QG2', nextStateOnApprove: 'storyboard',
    suggestions: [{ text: 'Make it darker' }, { text: 'Try warm palette' }, { text: 'More ethereal' }],
  },
  storyboard: {
    id: 'storyboard', pipelineState: 'uploaded', viewHint: 'storyboard',
    suggestions: [{ text: 'How many scenes?' }],
  },
  l3_review: {
    id: 'l3_review', pipelineState: 'plan_ready', viewHint: 'storyboard',
    gateToResolve: 'QG3', nextStateOnApprove: 'generating',
    suggestions: [{ text: 'Edit Scene 3 camera' }, { text: 'Add more close-ups' }, { text: 'Swap Scene 5 and 6' }],
  },
  generating: {
    id: 'generating', pipelineState: 'uploaded', viewHint: 'generate',
    suggestions: [{ text: 'Which models are you using?' }],
  },
  l4_review: {
    id: 'l4_review', pipelineState: 'assets_ready', viewHint: 'generate',
    gateToResolve: 'QG4', nextStateOnApprove: 'editing',
    suggestions: [
      { text: 'Regenerate Scene 3' }, { text: 'Regenerate Scene 7' },
      { text: 'Try Runway Gen-4 for Scene 1' },
    ],
  },
  editing: {
    id: 'editing', pipelineState: 'uploaded', viewHint: 'edit',
    suggestions: [{ text: 'How are the transitions?' }],
  },
  l5_review: {
    id: 'l5_review', pipelineState: 'assembled', viewHint: 'edit',
    gateToResolve: 'QG5', nextStateOnApprove: 'complete',
    suggestions: [{ text: 'Remove film grain' }, { text: 'Boost contrast' }, { text: 'Try dissolve transitions' }],
  },
  complete: {
    id: 'complete', pipelineState: 'complete', viewHint: 'edit',
    suggestions: [],
  },
}

// --- Gate → review state mapping ---

export const GATE_TO_REVIEW_STATE: Record<string, JourneyStateId> = {
  QG1: 'l1_review',
  QG2: 'l2_review',
  QG3: 'l3_review',
  QG4: 'l4_review',
  QG5: 'l5_review',
}

// --- Response helpers ---

/** Get the chat response for a journey state from the response bank */
export function getJourneyResponse(stateId: JourneyStateId): PipelineResponse {
  const state = JOURNEY_STATES[stateId]
  return PIPELINE_RESPONSES[state.pipelineState]
}

function svgThumb(from: string, to: string): string {
  return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${from}"/><stop offset="100%" style="stop-color:${to}"/></linearGradient></defs><rect width="400" height="300" fill="url(%23g)"/></svg>`
}

/** Build response for scene regeneration request */
export function buildSceneRegenResponse(sceneIndex: number, scene: MockScene): PipelineResponse {
  return {
    text: `Regenerating Scene ${sceneIndex + 1} — "${scene.subject} ${scene.action}"... Using Kling 2.6 for optimal motion quality. This should take about 30 seconds.`,
  }
}

/** Build response for scene regeneration completion */
export function buildSceneRegenCompleteResponse(sceneIndex: number): PipelineResponse {
  const score = 88 + Math.floor(Math.random() * 10)
  return {
    text: `Scene ${sceneIndex + 1} regenerated successfully! New consistency score: ${score}%. The motion is much smoother in this version.`,
    artifacts: [{
      id: `regen-result-${sceneIndex}-${Date.now()}`, type: 'image_gallery',
      title: `Scene ${sceneIndex + 1} — New Take`,
      thumbnails: [svgThumb('%2306B6D4', '%237C3AED'), svgThumb('%23A855F7', '%23F59E0B')],
      description: `Consistency: ${score}% | Model: Kling 2.6 | Duration: 5s`,
    }],
    actions: [
      { label: 'Approve All Scenes', action: 'approve', variant: 'primary' },
      { label: 'Regenerate Another', action: 'show_regen_options', variant: 'secondary' },
    ],
  }
}

/** Contextual response for free-form user messages based on current journey state */
export function buildFreeformResponse(stateId: JourneyStateId): PipelineResponse {
  const contextual: Partial<Record<JourneyStateId, string>> = {
    analyzing: "The analysis is still running — I'll share results as soon as it's done!",
    l1_review: "Take a look at the analysis results above. You can approve to continue, or request a revision if something looks off.",
    creative: "Working on the creative direction now — almost ready for your review!",
    l2_review: "The mood board and palette are ready for your review. Click Approve to continue, or suggest changes!",
    storyboard: "Building the storyboard — planning camera angles and transitions for each scene...",
    l3_review: "The storyboard is ready! Review the 8 scenes above. You can approve or suggest edits.",
    generating: "Generation is in progress — I'll let you know when each scene is ready!",
    l4_review: "All scenes are generated. You can approve, or regenerate any scene you're not happy with.",
    editing: "Assembling the final cut with transitions and color grading...",
    l5_review: "The final video is ready for review. Approve to export, or request changes!",
    complete: "Your video is ready! Click Download All to get all format exports.",
  }
  return {
    text: contextual[stateId] ?? "I'm working on your music video. Feel free to ask about the current stage!",
  }
}

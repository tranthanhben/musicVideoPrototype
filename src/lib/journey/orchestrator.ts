import type { QualityGateId } from '@/lib/pipeline/types'
import type { ChatSuggestion } from '@/lib/chat/types'
import type { PipelineResponse } from '@/lib/chat/response-bank'
import type { MockScene } from '@/lib/mock/types'
import { PIPELINE_RESPONSES } from '@/lib/chat/response-bank'
import type { PipelineState } from '@/lib/pipeline/types'

// --- Journey state machine types ---
// Includes both legacy states (other prototypes) and new monitor-specific states

export type JourneyStateId =
  // Legacy states (bay, screening, dock, control, canvas, forge, reel)
  | 'welcome' | 'analyzing' | 'l1_review'
  | 'creative' | 'l2_review'
  | 'storyboard' | 'l3_review'
  | 'generating' | 'l4_review'
  | 'editing' | 'l5_review'
  | 'complete'
  // Monitor-specific states
  | 'upload' | 'analysis_review'
  | 'style_selection' | 'character_setup'
  | 'storyline_generating' | 'storyline_review'
  | 'storyboard_generating' | 'storyboard_review'
  | 'video_generating' | 'video_review'
  | 'edit_review'

export interface JourneyState {
  id: JourneyStateId
  viewHint: string
  gateToResolve?: QualityGateId
  nextStateOnApprove?: JourneyStateId
  suggestions: ChatSuggestion[]
  pipelineState?: string
  narration?: string
}

// --- Legacy states (other prototypes) ---

const LEGACY_STATES: Record<string, JourneyState> = {
  welcome: {
    id: 'welcome', viewHint: 'input', pipelineState: 'idle',
    suggestions: [{ text: 'Analyze my track', icon: '🎵' }, { text: 'Show me a demo', icon: '▶' }],
  },
  analyzing: {
    id: 'analyzing', viewHint: 'input', pipelineState: 'uploaded',
    narration: 'MCP Music Analysis agent running — extracting BPM, key, segments, mapping emotion curve...',
    suggestions: [{ text: 'What BPM is this track?', icon: '🎶' }, { text: 'How does the emotion curve look?', icon: '📈' }],
  },
  l1_review: {
    id: 'l1_review', viewHint: 'input', pipelineState: 'analyzing',
    gateToResolve: 'QG1', nextStateOnApprove: 'creative',
    suggestions: [{ text: 'Show emotion peaks', icon: '📈' }, { text: 'Segment details', icon: '🎼' }, { text: 'What key is this song in?', icon: '🔑' }, { text: 'Show beat markers', icon: '🎵' }],
  },
  creative: {
    id: 'creative', viewHint: 'creative', pipelineState: 'uploaded',
    narration: "Concept Agent generating 3 storyline options mapped to song's timestamp structure...",
    suggestions: [{ text: 'What style are you going for?', icon: '🎨' }],
  },
  l2_review: {
    id: 'l2_review', viewHint: 'creative', pipelineState: 'vision_ready',
    gateToResolve: 'QG2', nextStateOnApprove: 'storyboard',
    suggestions: [{ text: 'Select Celestial Journey', icon: '🚀' }, { text: 'Select Neon Metropolis', icon: '🌃' }, { text: 'Make it darker', icon: '🌑' }, { text: 'More ethereal', icon: '✨' }],
  },
  storyboard: {
    id: 'storyboard', viewHint: 'storyboard', pipelineState: 'uploaded',
    narration: 'Image Agent rendering beat-synced storyboard with shared style seed for consistency...',
    suggestions: [{ text: 'How many scenes?', icon: '🎬' }],
  },
  l3_review: {
    id: 'l3_review', viewHint: 'storyboard', pipelineState: 'plan_ready',
    gateToResolve: 'QG3', nextStateOnApprove: 'generating',
    suggestions: [{ text: 'Show Scene 4 details', icon: '🔍' }, { text: 'Swap Scene 5 and 6', icon: '🔄' }, { text: 'Edit Scene 3 camera', icon: '🎥' }, { text: 'Add more close-ups', icon: '📸' }],
  },
  generating: {
    id: 'generating', viewHint: 'generate', pipelineState: 'uploaded',
    narration: 'Video Agent dispatching parallel render jobs — music-aware motion per segment energy...',
    suggestions: [{ text: 'Which models are you using?', icon: '🤖' }],
  },
  l4_review: {
    id: 'l4_review', viewHint: 'generate', pipelineState: 'assets_ready',
    gateToResolve: 'QG4', nextStateOnApprove: 'editing',
    suggestions: [{ text: 'Compare takes for Scene 3', icon: '🔀' }, { text: 'Regenerate Scene 3', icon: '🔄' }, { text: 'Try Runway Gen-4 for Scene 1', icon: '🎬' }, { text: 'Show all renders', icon: '🖼' }],
  },
  editing: {
    id: 'editing', viewHint: 'edit', pipelineState: 'uploaded',
    narration: 'Auto-assembling timeline with beat-synced cuts. Applying Cosmic Cinema preset and effects...',
    suggestions: [{ text: 'How are the transitions?', icon: '🎬' }],
  },
  l5_review: {
    id: 'l5_review', viewHint: 'edit', pipelineState: 'assembled',
    gateToResolve: 'QG5', nextStateOnApprove: 'complete',
    suggestions: [{ text: 'Try Film Noir preset', icon: '🎬' }, { text: 'Remove film grain', icon: '🎞' }, { text: 'Boost contrast', icon: '⬛' }, { text: 'Preview TikTok format', icon: '📱' }],
  },
  complete: {
    id: 'complete', viewHint: 'edit', pipelineState: 'complete',
    suggestions: [{ text: 'Download All', icon: '📥' }, { text: 'Export YouTube only', icon: '▶' }, { text: 'Start New Project', icon: '🆕' }],
  },
}

// --- Monitor-specific states ---

const MONITOR_STATES: Record<string, JourneyState> = {
  upload: { id: 'upload', viewHint: 'upload', suggestions: [{ text: 'Use Cosmic Love Story demo', icon: '🚀' }, { text: 'Use Neon City Nights demo', icon: '🌃' }, { text: 'Use Ocean Dreams demo', icon: '🌊' }] },
  analysis_review: { id: 'analysis_review', viewHint: 'analysis', gateToResolve: 'QG1', nextStateOnApprove: 'style_selection', suggestions: [{ text: 'Show emotion peaks', icon: '📈' }, { text: 'Segment details', icon: '🎼' }, { text: 'What key is this song in?', icon: '🔑' }] },
  style_selection: { id: 'style_selection', viewHint: 'style', suggestions: [{ text: 'Suggest a style for this track', icon: '🎨' }, { text: 'What works best for this BPM?', icon: '🎵' }] },
  character_setup: { id: 'character_setup', viewHint: 'characters', suggestions: [{ text: 'Recommend characters for this style', icon: '👤' }, { text: 'Can I use multiple characters?', icon: '👥' }] },
  storyline_generating: { id: 'storyline_generating', viewHint: 'storyline_loading', suggestions: [{ text: 'How are the storylines coming?', icon: '💭' }] },
  storyline_review: { id: 'storyline_review', viewHint: 'storyline', gateToResolve: 'QG2', nextStateOnApprove: 'storyboard_generating', suggestions: [{ text: 'Make it darker', icon: '🌑' }, { text: 'More ethereal', icon: '✨' }, { text: 'Show scene breakdown', icon: '📋' }] },
  storyboard_generating: { id: 'storyboard_generating', viewHint: 'storyboard_loading', suggestions: [{ text: 'How many scenes?', icon: '🎬' }] },
  storyboard_review: { id: 'storyboard_review', viewHint: 'storyboard', gateToResolve: 'QG3', nextStateOnApprove: 'video_generating', suggestions: [{ text: 'Show Scene 4 details', icon: '🔍' }, { text: 'Swap Scene 5 and 6', icon: '🔄' }, { text: 'Add more close-ups', icon: '📸' }] },
  video_generating: { id: 'video_generating', viewHint: 'generate', suggestions: [{ text: 'Which models are being used?', icon: '🤖' }] },
  video_review: { id: 'video_review', viewHint: 'generate', gateToResolve: 'QG4', nextStateOnApprove: 'editing', suggestions: [{ text: 'Regenerate Scene 3', icon: '🔄' }, { text: 'Compare takes for Scene 1', icon: '🔀' }, { text: 'Show all renders', icon: '🖼' }] },
  edit_review: { id: 'edit_review', viewHint: 'edit', gateToResolve: 'QG5', nextStateOnApprove: 'complete', suggestions: [{ text: 'Try Film Noir preset', icon: '🎬' }, { text: 'Boost contrast', icon: '⬛' }, { text: 'Preview TikTok format', icon: '📱' }] },
}

// --- Combined state record ---

export const JOURNEY_STATES: Record<JourneyStateId, JourneyState> = {
  ...LEGACY_STATES,
  ...MONITOR_STATES,
} as Record<JourneyStateId, JourneyState>

// --- Gate mappings ---

export const GATE_TO_REVIEW_STATE: Record<string, JourneyStateId> = {
  QG1: 'l1_review', QG2: 'l2_review', QG3: 'l3_review', QG4: 'l4_review', QG5: 'l5_review',
}

export const MONITOR_GATE_TO_STATE: Record<string, JourneyStateId> = {
  QG1: 'analysis_review', QG2: 'storyline_review', QG3: 'storyboard_review', QG4: 'video_review', QG5: 'edit_review',
}

// --- Response helpers ---

export function getJourneyResponse(stateId: JourneyStateId): PipelineResponse {
  // Defer to monitor-responses for monitor-specific states (imported by page)
  const state = JOURNEY_STATES[stateId]
  if (state.narration) return { text: state.narration }
  if (state.pipelineState) {
    return PIPELINE_RESPONSES[state.pipelineState as PipelineState] ?? { text: 'Processing...' }
  }
  return { text: 'Processing...' }
}

function svgThumb(from: string, to: string): string {
  return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${from}"/><stop offset="100%" style="stop-color:${to}"/></linearGradient></defs><rect width="400" height="300" fill="url(%23g)"/></svg>`
}

export function buildSceneRegenResponse(sceneIndex: number, scene: MockScene): PipelineResponse {
  return { text: `Regenerating Scene ${sceneIndex + 1} — "${scene.subject} ${scene.action}"... Using Kling 2.6 for optimal motion quality.` }
}

export function buildSceneRegenCompleteResponse(sceneIndex: number): PipelineResponse {
  const score = 88 + Math.floor(Math.random() * 10)
  return {
    text: `Scene ${sceneIndex + 1} regenerated! New consistency score: ${score}%.`,
    artifacts: [{ id: `regen-result-${sceneIndex}-${Date.now()}`, type: 'image_gallery', title: `Scene ${sceneIndex + 1} — New Take`, thumbnails: [svgThumb('%2306B6D4', '%237C3AED'), svgThumb('%23A855F7', '%23F59E0B')], description: `Consistency: ${score}% | Model: Kling 2.6` }],
    actions: [{ label: 'Approve All Scenes', action: 'approve', variant: 'primary' }, { label: 'Regenerate Another', action: 'show_regen_options', variant: 'secondary' }],
  }
}

export function buildFreeformResponse(stateId: JourneyStateId): PipelineResponse {
  const ctx: Partial<Record<JourneyStateId, string>> = {
    welcome: "Send a message to get started, or click 'Analyze my track'!",
    analyzing: "The analysis is still running — I'll share results shortly!",
    l1_review: "Review the analysis results. Approve to continue.",
    creative: "Working on creative direction — almost ready!",
    l2_review: "The mood board is ready. Click Approve to continue.",
    storyboard: "Building the storyboard — planning scenes...",
    l3_review: "The storyboard is ready! Review and approve.",
    generating: "Generation in progress — I'll let you know when done!",
    l4_review: "All scenes generated. Approve or regenerate.",
    editing: "Assembling the final cut...",
    l5_review: "Final video ready! Approve to export.",
    complete: "Your video is ready! Download or start new.",
  }
  return { text: ctx[stateId] ?? "I'm working on your music video. Ask me anything!" }
}

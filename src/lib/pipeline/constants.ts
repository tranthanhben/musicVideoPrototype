import type { PipelineLayerId, PipelineState, QualityGateId } from './types'

export interface LayerDefinition {
  id: PipelineLayerId
  name: string
  description: string
  agents: string[]
  mcps: string[]
  skills: string[]
  durationMs: number
}

export const PIPELINE_LAYERS: LayerDefinition[] = [
  {
    id: 'L1_INPUT', name: 'Input & Understanding',
    description: 'Analyze music, vision references, and build character profiles',
    agents: [], mcps: ['music-intelligence', 'vision-analyzer', 'character-builder'],
    skills: ['prompt-interpreter'], durationMs: 3000,
  },
  {
    id: 'L2_CREATIVE', name: 'Creative Direction',
    description: 'Generate creative vision, storyline, and mood mapping',
    agents: ['creative-director'], mcps: ['storyline-writer'],
    skills: ['genre-templates', 'mood-mapper'], durationMs: 4000,
  },
  {
    id: 'L3_PREPRODUCTION', name: 'Pre-Production',
    description: 'Build storyboard, style guide, and select AI models',
    agents: ['storyboard-architect'], mcps: ['storyboard-builder', 'style-guide-generator', 'model-selector'],
    skills: ['cinematic-prompts'], durationMs: 5000,
  },
  {
    id: 'L4_PRODUCTION', name: 'Production',
    description: 'Generate images, video clips, and process lipsync',
    agents: ['production-supervisor'], mcps: ['image-generator', 'video-generator', 'lipsync-processor'],
    skills: ['consistency-checker'], durationMs: 8000,
  },
  {
    id: 'L5_POSTPRODUCTION', name: 'Post-Production',
    description: 'Assemble timeline, color grade, and export final video',
    agents: ['editor'], mcps: ['video-assembler', 'color-grader', 'export-manager'],
    skills: ['effects-library'], durationMs: 4000,
  },
]

export const QUALITY_GATES: { id: QualityGateId; before: PipelineLayerId; after: PipelineLayerId }[] = [
  { id: 'QG1', before: 'L1_INPUT', after: 'L2_CREATIVE' },
  { id: 'QG2', before: 'L2_CREATIVE', after: 'L3_PREPRODUCTION' },
  { id: 'QG3', before: 'L3_PREPRODUCTION', after: 'L4_PRODUCTION' },
  { id: 'QG4', before: 'L4_PRODUCTION', after: 'L5_POSTPRODUCTION' },
  { id: 'QG5', before: 'L5_POSTPRODUCTION', after: 'L5_POSTPRODUCTION' },
]

export const STATE_TRANSITIONS: { from: PipelineState; to: PipelineState; layerId: PipelineLayerId }[] = [
  { from: 'uploaded', to: 'analyzing', layerId: 'L1_INPUT' },
  { from: 'analyzing', to: 'vision_ready', layerId: 'L2_CREATIVE' },
  { from: 'vision_ready', to: 'plan_ready', layerId: 'L3_PREPRODUCTION' },
  { from: 'plan_ready', to: 'assets_ready', layerId: 'L4_PRODUCTION' },
  { from: 'assets_ready', to: 'assembled', layerId: 'L5_POSTPRODUCTION' },
  { from: 'assembled', to: 'complete', layerId: 'L5_POSTPRODUCTION' },
]

export const LAYER_ORDER: PipelineLayerId[] = [
  'L1_INPUT', 'L2_CREATIVE', 'L3_PREPRODUCTION', 'L4_PRODUCTION', 'L5_POSTPRODUCTION',
]

export function getLayerDef(id: PipelineLayerId): LayerDefinition {
  return PIPELINE_LAYERS.find((l) => l.id === id)!
}

export function getGateAfterLayer(layerId: PipelineLayerId): QualityGateId | null {
  const gate = QUALITY_GATES.find((g) => g.before === layerId)
  return gate?.id ?? null
}

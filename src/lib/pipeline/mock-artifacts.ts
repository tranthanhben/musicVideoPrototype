import type { PipelineArtifact, PipelineLayerId } from './types'

function svgThumb(from: string, to: string): string {
  return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${from}"/><stop offset="100%" style="stop-color:${to}"/></linearGradient></defs><rect width="400" height="300" fill="url(%23g)"/></svg>`
}

let artifactCounter = 0
function nextId(prefix: string): string {
  return `${prefix}-${++artifactCounter}`
}

function now(): string {
  return new Date().toISOString()
}

const LAYER_ARTIFACTS: Record<PipelineLayerId, () => PipelineArtifact[]> = {
  L1_INPUT: () => [
    { id: nextId('art'), type: 'audio_analysis', name: 'Audio Analysis', description: 'BPM: 128, Key: Am, Duration: 3:12, 16 beat markers detected', thumbnailUrl: svgThumb('%233B82F6', '%2360A5FA'), layerId: 'L1_INPUT', createdAt: now() },
    { id: nextId('art'), type: 'image', name: 'Vision Analysis', description: 'Style: cinematic, warm tones. Palette: amber, deep blue, gold', thumbnailUrl: svgThumb('%23F59E0B', '%231E3A8A'), layerId: 'L1_INPUT', createdAt: now() },
  ],
  L2_CREATIVE: () => [
    { id: nextId('art'), type: 'creative_vision', name: 'Creative Vision', description: 'Cosmic love story through space and time. Cinematic noir palette with warm highlights.', thumbnailUrl: svgThumb('%237C3AED', '%23EC4899'), layerId: 'L2_CREATIVE', createdAt: now() },
    { id: nextId('art'), type: 'mood_board', name: 'Mood Board', description: '6 reference images capturing desired aesthetic', thumbnailUrl: svgThumb('%23A855F7', '%2322D3EE'), layerId: 'L2_CREATIVE', createdAt: now() },
    { id: nextId('art'), type: 'mood_board', name: 'Color Palette', description: 'Primary: deep violet, Secondary: cyan, Accent: gold', thumbnailUrl: svgThumb('%236D28D9', '%23F59E0B'), layerId: 'L2_CREATIVE', createdAt: now() },
    { id: nextId('art'), type: 'mood_board', name: 'Genre Template', description: 'Cinematic space opera — wide shots, slow pacing, orchestral feel', thumbnailUrl: svgThumb('%230EA5E9', '%237C3AED'), layerId: 'L2_CREATIVE', createdAt: now() },
  ],
  L3_PREPRODUCTION: () => [
    { id: nextId('art'), type: 'storyboard', name: 'Storyboard', description: '8 scenes, 3:12 total duration, beat-synced transitions', thumbnailUrl: svgThumb('%2306B6D4', '%237C3AED'), layerId: 'L3_PREPRODUCTION', createdAt: now() },
    { id: nextId('art'), type: 'style_guide', name: 'Style Guide', description: 'Locked prompt templates, character anchors, model assignments', thumbnailUrl: svgThumb('%238B5CF6', '%2306B6D4'), layerId: 'L3_PREPRODUCTION', createdAt: now() },
    { id: nextId('art'), type: 'production_plan', name: 'Production Plan', description: 'Model: Kling 2.6 (5 scenes), Runway Gen-4 (3 scenes). Est. cost: $4.20', thumbnailUrl: svgThumb('%23EAB308', '%23F97316'), layerId: 'L3_PREPRODUCTION', createdAt: now() },
  ],
  L4_PRODUCTION: () => [
    { id: nextId('art'), type: 'image', name: 'Scene 1 — Space Nebula', description: 'Generated with Flux 1.1 Pro. Resolution: 1920x1080', thumbnailUrl: svgThumb('%237C3AED', '%2322D3EE'), layerId: 'L4_PRODUCTION', createdAt: now() },
    { id: nextId('art'), type: 'video_clip', name: 'Scene 1 — Video Clip', description: '5s clip via Kling 2.6. Consistency score: 92%', thumbnailUrl: svgThumb('%23A855F7', '%23F59E0B'), layerId: 'L4_PRODUCTION', createdAt: now() },
    { id: nextId('art'), type: 'image', name: 'Scene 2 — Asteroid Field', description: 'Generated with DALL-E 3. Resolution: 1920x1080', thumbnailUrl: svgThumb('%2306B6D4', '%237C3AED'), layerId: 'L4_PRODUCTION', createdAt: now() },
    { id: nextId('art'), type: 'video_clip', name: 'Scene 2 — Video Clip', description: '4s clip via Runway Gen-4. Consistency score: 88%', thumbnailUrl: svgThumb('%23EC4899', '%237C3AED'), layerId: 'L4_PRODUCTION', createdAt: now() },
    { id: nextId('art'), type: 'lipsync', name: 'Lipsync — Scene 5', description: 'Processed via MuseTalk v1.5. Sync accuracy: 94%', thumbnailUrl: svgThumb('%23F59E0B', '%23EF4444'), layerId: 'L4_PRODUCTION', createdAt: now() },
  ],
  L5_POSTPRODUCTION: () => [
    { id: nextId('art'), type: 'assembled_video', name: 'Assembled Timeline', description: '8 scenes assembled with beat-synced transitions. Total: 3:12', thumbnailUrl: svgThumb('%23EC4899', '%23A855F7'), layerId: 'L5_POSTPRODUCTION', createdAt: now() },
    { id: nextId('art'), type: 'final_video', name: 'Final Video', description: 'Color graded, effects applied, audio mixed. Ready for export.', thumbnailUrl: svgThumb('%237C3AED', '%2322D3EE'), layerId: 'L5_POSTPRODUCTION', createdAt: now() },
  ],
}

export function generateLayerArtifacts(layerId: PipelineLayerId): PipelineArtifact[] {
  return LAYER_ARTIFACTS[layerId]()
}

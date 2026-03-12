export type FlowStep =
  | 'mv_type'
  | 'setup'
  | 'analysis'
  | 'storyline'
  | 'mood_board'
  | 'storyboard'
  | 'generation'
  | 'vfx_export'

export type MvType = 'dance' | 'performance' | 'lyrics' | 'visual' | 'narrative' | 'abstract'

export type RenderMode = 'realistic' | '3d' | 'anime' | 'stylized'

export interface FlowConfig {
  mvType: MvType | null
  trackIndex: number | null
  prompt: string
  mode: RenderMode
  musicControl: number
  lyricsControl: number
  storylineId: string | null
  moodSelections: string[]
}

export interface Storyline {
  id: string
  title: string
  description: string
  sceneCount: number
  tone: string
  thumbnailColors: [string, string]
  thumbnailUrl?: string
}

export interface MoodImage {
  id: string
  label: string
  category: 'color' | 'mood' | 'scene'
  colors: [string, string]
  approved: boolean
  url?: string
}

export interface VfxPreset {
  id: string
  label: string
  description: string
  accentColor: string
}

export const FLOW_STEPS: { key: FlowStep; label: string; shortLabel: string }[] = [
  { key: 'mv_type', label: 'Video Type', shortLabel: 'Type' },
  { key: 'setup', label: 'Track & Settings', shortLabel: 'Setup' },
  { key: 'analysis', label: 'Music Analysis', shortLabel: 'Analysis' },
  { key: 'storyline', label: 'Storyline', shortLabel: 'Story' },
  { key: 'mood_board', label: 'Mood Board', shortLabel: 'Mood' },
  { key: 'storyboard', label: 'Storyboard', shortLabel: 'Scenes' },
  { key: 'generation', label: 'Video Generation', shortLabel: 'Generate' },
  { key: 'vfx_export', label: 'VFX & Export', shortLabel: 'Export' },
]

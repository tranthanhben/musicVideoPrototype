export type FlowStep =
  | 'mv_type'
  | 'setup'
  | 'analysis'
  | 'storyboard'
  | 'vfx_export'

export type MvType = 'dance' | 'performance' | 'lyrics' | 'full_mv' | 'visualizer'

export type RenderMode = 'realistic' | '3d' | 'anime' | 'stylized'

export interface FlowConfig {
  mvType: MvType | null
  trackIndex: number | null
  prompt: string
  mode: RenderMode
  musicControl: number
  lyricsControl: number
  selectedConceptId: string | null
  model: string
  quality: string
  aspectRatio: string
}

export interface ColorSwatch {
  hex: string
  name: string
}

export interface ConceptDetails {
  themes: string[]
  colorPalette: ColorSwatch[]
  characterStyle: string[]
  lightingStyle: string
  cinematography: string[]
}

export interface VisualConcept {
  id: string
  title: string
  thumbnailColors: [string, string]
  thumbnailUrl?: string
  details: ConceptDetails
}

export interface StorylineVersion {
  id: string
  storylineText: string
  concepts: VisualConcept[]
  timestamp: number
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
  imageUrl?: string
}

export interface VfxPreset {
  id: string
  label: string
  description: string
  accentColor: string
}

export const FLOW_STEPS: { key: FlowStep; label: string; shortLabel: string }[] = [
  { key: 'mv_type', label: 'Video Type', shortLabel: 'Type' },
  { key: 'setup', label: 'Upload your song', shortLabel: 'Upload' },
  { key: 'analysis', label: 'Analysis & Ideation', shortLabel: 'Analysis' },
  { key: 'storyboard', label: 'Storyboard', shortLabel: 'Scenes' },
  { key: 'vfx_export', label: 'Video & Edit', shortLabel: 'Edit' },
]

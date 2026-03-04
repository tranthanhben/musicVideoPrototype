export type ProjectStatus = 'draft' | 'rendering' | 'complete'
export type SceneStatus = 'init' | 'generating' | 'completed' | 'failed'

export interface MockAudio {
  title: string
  artist: string
  duration: number // seconds
  bpm: number
  beatMarkers: number[] // timestamps in seconds
}

export interface MockTake {
  id: string
  thumbnailUrl: string
  selected: boolean
}

export interface MockScene {
  id: string
  index: number
  subject: string
  action: string
  environment: string
  cameraAngle: string
  cameraMovement: string
  prompt: string
  thumbnailUrl: string
  duration: number
  status: SceneStatus
  takes: MockTake[]
}

export interface MockProject {
  id: string
  title: string
  description: string
  status: ProjectStatus
  scenes: MockScene[]
  audio: MockAudio
  createdAt: string
  thumbnailUrl: string
}

export interface VibePreset {
  id: string
  name: string
  description: string
  gradient: string // CSS gradient
  icon: string // emoji
}

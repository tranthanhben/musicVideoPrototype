export type ProjectStatus = 'draft' | 'rendering' | 'complete'
export type SceneStatus = 'init' | 'generating' | 'completed' | 'failed'

export type SegmentType = 'intro' | 'verse' | 'chorus' | 'bridge' | 'outro' | 'drop' | 'breakdown'

export interface AudioSegment {
  id: string
  label: string
  type: SegmentType
  startTime: number // seconds
  endTime: number   // seconds
  color: string     // hex color for visual markers
}

export interface EnergyPoint {
  time: number    // seconds
  energy: number  // 0-1 normalized
  isPeak: boolean // marks emotional peaks
}

export interface MockAudio {
  title: string
  artist: string
  duration: number // seconds
  bpm: number
  key: string // e.g. 'A minor'
  beatMarkers: number[] // timestamps in seconds
  segments: AudioSegment[]
  energyCurve: EnergyPoint[]
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

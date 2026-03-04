export type PipelineLayerId =
  | 'L1_INPUT'
  | 'L2_CREATIVE'
  | 'L3_PREPRODUCTION'
  | 'L4_PRODUCTION'
  | 'L5_POSTPRODUCTION'

export type PipelineState =
  | 'idle'
  | 'uploaded'
  | 'analyzing'
  | 'vision_ready'
  | 'plan_ready'
  | 'assets_ready'
  | 'assembled'
  | 'complete'

export type QualityGateId = 'QG1' | 'QG2' | 'QG3' | 'QG4' | 'QG5'
export type QualityGateResult = 'pending' | 'pass' | 'revise' | 'reject'

export type ArtifactType =
  | 'mood_board'
  | 'storyboard'
  | 'style_guide'
  | 'image'
  | 'video_clip'
  | 'lipsync'
  | 'assembled_video'
  | 'final_video'
  | 'audio_analysis'
  | 'creative_vision'
  | 'production_plan'

export interface QualityGate {
  id: QualityGateId
  layerBefore: PipelineLayerId
  layerAfter: PipelineLayerId
  result: QualityGateResult
  score: number
  message: string
  timestamp: string | null
}

export interface PipelineArtifact {
  id: string
  type: ArtifactType
  name: string
  description: string
  thumbnailUrl: string
  layerId: PipelineLayerId
  createdAt: string
}

export interface AgentActivity {
  id: string
  agentName: string
  agentType: 'agent' | 'mcp' | 'skill' | 'service'
  layerId: PipelineLayerId
  action: string
  status: 'started' | 'running' | 'completed' | 'failed'
  timestamp: string
  message: string
}

export interface PipelineLayer {
  id: PipelineLayerId
  name: string
  description: string
  status: 'idle' | 'active' | 'complete'
  progress: number
  artifacts: PipelineArtifact[]
  activities: AgentActivity[]
  startedAt: string | null
  completedAt: string | null
}

export interface RevisionEntry {
  id: string
  fromLayerId: PipelineLayerId
  toLayerId: PipelineLayerId
  gateId: QualityGateId
  reason: string
  timestamp: string
}

export type PipelineEventType =
  | 'layer_start'
  | 'layer_progress'
  | 'artifact_created'
  | 'activity_log'
  | 'gate_pending'
  | 'gate_resolved'
  | 'pipeline_complete'
  | 'pipeline_error'

export interface PipelineEvent {
  type: PipelineEventType
  layerId?: PipelineLayerId
  artifactId?: string
  gateId?: QualityGateId
  progress?: number
  message?: string
  data?: unknown
}

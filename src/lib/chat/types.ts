export type ChatRole = 'user' | 'assistant' | 'system'

export type ChatArtifactType =
  | 'mood_board'
  | 'storyboard'
  | 'video_preview'
  | 'quality_gate'
  | 'progress_update'
  | 'image_gallery'
  | 'audio_analysis'

export interface ChatArtifact {
  id: string
  type: ChatArtifactType
  title: string
  description?: string
  thumbnails?: string[]
  data?: Record<string, unknown>
}

export interface ChatActionButton {
  label: string
  action: string
  variant: 'primary' | 'secondary' | 'destructive'
}

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  artifacts?: ChatArtifact[]
  actions?: ChatActionButton[]
  timestamp: string
  isStreaming?: boolean
}

export interface ChatSuggestion {
  text: string
  icon?: string
}

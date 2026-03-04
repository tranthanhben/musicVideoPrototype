import { create } from 'zustand'
import type {
  PipelineState, PipelineLayerId, PipelineLayer,
  QualityGateId, QualityGate, PipelineArtifact,
  AgentActivity, RevisionEntry,
} from './types'
import { PIPELINE_LAYERS, QUALITY_GATES } from './constants'

interface PipelineStore {
  currentState: PipelineState
  currentLayerId: PipelineLayerId | null
  isRunning: boolean
  layers: Record<PipelineLayerId, PipelineLayer>
  qualityGates: Record<QualityGateId, QualityGate>
  revisionHistory: RevisionEntry[]
  // Actions
  startPipeline: () => void
  setCurrentState: (state: PipelineState) => void
  setCurrentLayer: (layerId: PipelineLayerId) => void
  setLayerStatus: (layerId: PipelineLayerId, status: PipelineLayer['status']) => void
  setLayerProgress: (layerId: PipelineLayerId, progress: number) => void
  addArtifact: (layerId: PipelineLayerId, artifact: PipelineArtifact) => void
  addActivity: (activity: AgentActivity) => void
  resolveGate: (gateId: QualityGateId, result: QualityGate['result'], message?: string) => void
  addRevision: (entry: RevisionEntry) => void
  resetPipeline: () => void
}

function createInitialLayers(): Record<PipelineLayerId, PipelineLayer> {
  const layers = {} as Record<PipelineLayerId, PipelineLayer>
  for (const def of PIPELINE_LAYERS) {
    layers[def.id] = {
      id: def.id, name: def.name, description: def.description,
      status: 'idle', progress: 0, artifacts: [], activities: [],
      startedAt: null, completedAt: null,
    }
  }
  return layers
}

function createInitialGates(): Record<QualityGateId, QualityGate> {
  const gates = {} as Record<QualityGateId, QualityGate>
  for (const def of QUALITY_GATES) {
    gates[def.id] = {
      id: def.id, layerBefore: def.before, layerAfter: def.after,
      result: 'pending', score: 0, message: '', timestamp: null,
    }
  }
  return gates
}

export const usePipelineStore = create<PipelineStore>((set) => ({
  currentState: 'idle',
  currentLayerId: null,
  isRunning: false,
  layers: createInitialLayers(),
  qualityGates: createInitialGates(),
  revisionHistory: [],

  startPipeline: () => set({
    currentState: 'uploaded', isRunning: true,
    layers: createInitialLayers(), qualityGates: createInitialGates(),
    revisionHistory: [],
  }),

  setCurrentState: (state) => set({ currentState: state }),
  setCurrentLayer: (layerId) => set({ currentLayerId: layerId }),

  setLayerStatus: (layerId, status) => set((s) => ({
    layers: { ...s.layers, [layerId]: { ...s.layers[layerId], status,
      ...(status === 'active' ? { startedAt: new Date().toISOString() } : {}),
      ...(status === 'complete' ? { completedAt: new Date().toISOString(), progress: 100 } : {}),
    }},
  })),

  setLayerProgress: (layerId, progress) => set((s) => ({
    layers: { ...s.layers, [layerId]: { ...s.layers[layerId], progress: Math.min(100, progress) }},
  })),

  addArtifact: (layerId, artifact) => set((s) => ({
    layers: { ...s.layers, [layerId]: {
      ...s.layers[layerId], artifacts: [...s.layers[layerId].artifacts, artifact],
    }},
  })),

  addActivity: (activity) => set((s) => ({
    layers: { ...s.layers, [activity.layerId]: {
      ...s.layers[activity.layerId], activities: [...s.layers[activity.layerId].activities, activity],
    }},
  })),

  resolveGate: (gateId, result, message) => set((s) => ({
    qualityGates: { ...s.qualityGates, [gateId]: {
      ...s.qualityGates[gateId], result, message: message ?? '',
      score: result === 'pass' ? 85 + Math.floor(Math.random() * 15) : 50 + Math.floor(Math.random() * 30),
      timestamp: new Date().toISOString(),
    }},
  })),

  addRevision: (entry) => set((s) => ({
    revisionHistory: [...s.revisionHistory, entry],
  })),

  resetPipeline: () => set({
    currentState: 'idle', currentLayerId: null, isRunning: false,
    layers: createInitialLayers(), qualityGates: createInitialGates(),
    revisionHistory: [],
  }),
}))

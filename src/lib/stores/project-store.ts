import { create } from 'zustand'
import type { MockProject, MockScene } from '@/lib/mock/types'

interface ProjectStore {
  activeProject: MockProject | null
  activeSceneIndex: number
  isGenerating: boolean
  generationProgress: number
  setActiveProject: (project: MockProject) => void
  setActiveScene: (index: number) => void
  updateScene: (sceneId: string, updates: Partial<MockScene>) => void
  startGeneration: () => void
  completeGeneration: () => void
  setGenerationProgress: (progress: number) => void
}

export const useProjectStore = create<ProjectStore>((set) => ({
  activeProject: null,
  activeSceneIndex: 0,
  isGenerating: false,
  generationProgress: 0,

  setActiveProject: (project) =>
    set({ activeProject: project, activeSceneIndex: 0 }),

  setActiveScene: (index) =>
    set({ activeSceneIndex: index }),

  updateScene: (sceneId, updates) =>
    set((state) => {
      if (!state.activeProject) return state
      return {
        activeProject: {
          ...state.activeProject,
          scenes: state.activeProject.scenes.map((scene) =>
            scene.id === sceneId ? { ...scene, ...updates } : scene
          ),
        },
      }
    }),

  startGeneration: () =>
    set({ isGenerating: true, generationProgress: 0 }),

  completeGeneration: () =>
    set({ isGenerating: false, generationProgress: 100 }),

  setGenerationProgress: (progress) =>
    set({ generationProgress: Math.min(100, Math.max(0, progress)) }),
}))

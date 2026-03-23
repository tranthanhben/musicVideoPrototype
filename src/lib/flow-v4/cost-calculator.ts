/** Credit cost calculation for flow-v4 music video generation */

export interface CostBreakdown {
  analysis: number
  sceneGeneration: number
  vfxProcessing: number
  export: number
  total: number
  perScene: number
}

export function calculateProjectCost(sceneCount = 39): CostBreakdown {
  const perScene = 20 // default: cremi-signature @ 480p @ 4s
  const sceneGeneration = perScene * sceneCount
  const analysis = 50
  const vfxProcessing = Math.round(sceneGeneration * 0.1)
  const exportCost = Math.round(sceneCount * 2)

  return {
    analysis,
    sceneGeneration,
    vfxProcessing,
    export: exportCost,
    total: analysis + sceneGeneration + vfxProcessing + exportCost,
    perScene,
  }
}

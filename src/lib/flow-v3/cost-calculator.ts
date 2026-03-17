/** Credit cost calculation for music video generation */

const MODEL_COSTS: Record<string, number> = {
  'cremi-signature': 10,
  'kling-3.0': 15,
  'veo-3-fast': 12,
  'hailuo': 8,
  'seedance': 14,
  'wan': 6,
}

const QUALITY_MULTIPLIERS: Record<string, number> = {
  '480p': 0.5,
  '720p': 1,
  '1080p': 2,
  '2k': 3,
}

export interface CostBreakdown {
  analysis: number
  sceneGeneration: number
  vfxProcessing: number
  export: number
  total: number
  perScene: number
}

export function calculateProjectCost(config: {
  model: string
  quality: string
  sceneCount: number
  avgSceneDuration?: number
}): CostBreakdown {
  const modelCost = MODEL_COSTS[config.model] ?? 10
  const qualityMult = QUALITY_MULTIPLIERS[config.quality] ?? 1
  const duration = config.avgSceneDuration ?? 4

  const perScene = Math.round(modelCost * qualityMult * duration)
  const sceneGeneration = perScene * config.sceneCount
  const analysis = 50
  const vfxProcessing = Math.round(sceneGeneration * 0.1)
  const exportCost = Math.round(config.sceneCount * qualityMult * 2)

  return {
    analysis,
    sceneGeneration,
    vfxProcessing,
    export: exportCost,
    total: analysis + sceneGeneration + vfxProcessing + exportCost,
    perScene,
  }
}

/** Estimate credits for a specific step */
export function getStepCost(
  step: string,
  config: { model: string; quality: string; sceneCount: number },
): number {
  const cost = calculateProjectCost(config)
  switch (step) {
    case 'mv_type': return 0
    case 'setup': return 0
    case 'analysis': return cost.analysis
    case 'storyboard': return cost.sceneGeneration
    case 'vfx_export': return cost.vfxProcessing + cost.export
    default: return 0
  }
}

import { PipelineEventEmitter } from './event-emitter'
import { generateLayerArtifacts } from './mock-artifacts'
import { PIPELINE_LAYERS, QUALITY_GATES, LAYER_ORDER } from './constants'
import type { PipelineLayerId, QualityGateId } from './types'

/**
 * Drives the 5-layer pipeline with simulated delays.
 * Emits events consumed by stores and UI components.
 * Quality gates pause execution until resolved externally.
 */
export class PipelineSimulator {
  public emitter = new PipelineEventEmitter()
  private timers: ReturnType<typeof setTimeout>[] = []
  private intervals: ReturnType<typeof setInterval>[] = []
  private currentLayerIndex = 0
  private gateResolvers: Map<QualityGateId, (result: 'pass' | 'revise') => void> = new Map()
  private aborted = false

  async start(): Promise<void> {
    this.aborted = false
    this.currentLayerIndex = 0

    for (let i = 0; i < LAYER_ORDER.length; i++) {
      if (this.aborted) return
      this.currentLayerIndex = i
      const layerId = LAYER_ORDER[i]
      const layerDef = PIPELINE_LAYERS.find((l) => l.id === layerId)!

      // Emit layer start
      this.emitter.emit({ type: 'layer_start', layerId, message: `Starting ${layerDef.name}` })

      // Simulate agent activities
      this.emitActivities(layerId, layerDef)

      // Simulate progress
      await this.simulateLayerProgress(layerId, layerDef.durationMs)
      if (this.aborted) return

      // Generate artifacts
      const artifacts = generateLayerArtifacts(layerId)
      for (const art of artifacts) {
        this.emitter.emit({ type: 'artifact_created', layerId, artifactId: art.id, data: art })
      }

      // Quality gate (except after last layer completion triggers QG5 -> complete)
      const gate = QUALITY_GATES.find((g) => g.before === layerId)
      if (gate) {
        this.emitter.emit({
          type: 'gate_pending', layerId, gateId: gate.id,
          message: `Quality Gate ${gate.id}: Reviewing ${layerDef.name} output`,
        })

        const result = await this.waitForGateResolution(gate.id)
        this.emitter.emit({
          type: 'gate_resolved', gateId: gate.id,
          message: result === 'pass' ? 'Approved — advancing to next layer' : 'Revision requested',
        })

        if (result === 'revise') {
          // Re-run current layer
          i--
          continue
        }
      }
    }

    if (!this.aborted) {
      this.emitter.emit({ type: 'pipeline_complete', message: 'Pipeline finished successfully' })
    }
  }

  resolveGate(gateId: QualityGateId, result: 'pass' | 'revise'): void {
    const resolver = this.gateResolvers.get(gateId)
    if (resolver) {
      resolver(result)
      this.gateResolvers.delete(gateId)
    }
  }

  stop(): void {
    this.aborted = true
    this.timers.forEach(clearTimeout)
    this.intervals.forEach(clearInterval)
    this.timers = []
    this.intervals = []
    this.gateResolvers.clear()
    this.emitter.removeAll()
  }

  private simulateLayerProgress(layerId: PipelineLayerId, durationMs: number): Promise<void> {
    return new Promise((resolve) => {
      const intervalMs = 100
      const steps = durationMs / intervalMs
      let step = 0

      const interval = setInterval(() => {
        if (this.aborted) { clearInterval(interval); resolve(); return }
        step++
        const raw = step / steps
        const eased = 1 - Math.pow(1 - raw, 2)
        const progress = Math.min(100, Math.round(eased * 100))
        this.emitter.emit({ type: 'layer_progress', layerId, progress })
        if (step >= steps) { clearInterval(interval); resolve() }
      }, intervalMs)
      this.intervals.push(interval)
    })
  }

  private emitActivities(layerId: PipelineLayerId, layerDef: typeof PIPELINE_LAYERS[0]): void {
    const allComponents = [
      ...layerDef.agents.map((n) => ({ name: n, type: 'agent' as const })),
      ...layerDef.mcps.map((n) => ({ name: n, type: 'mcp' as const })),
      ...layerDef.skills.map((n) => ({ name: n, type: 'skill' as const })),
    ]
    allComponents.forEach((comp, idx) => {
      const delay = (idx + 1) * 400
      const timer = setTimeout(() => {
        if (this.aborted) return
        this.emitter.emit({
          type: 'activity_log', layerId,
          message: `${comp.name} (${comp.type}) — processing`,
          data: { agentName: comp.name, agentType: comp.type, status: 'running' },
        })
      }, delay)
      this.timers.push(timer)
    })
  }

  private waitForGateResolution(gateId: QualityGateId): Promise<'pass' | 'revise'> {
    return new Promise((resolve) => {
      this.gateResolvers.set(gateId, resolve)
    })
  }
}

import type { PipelineEvent, PipelineEventType } from './types'

type PipelineEventHandler = (event: PipelineEvent) => void

/**
 * Typed event emitter for pipeline simulation.
 * Uses a simple callback registry (no browser EventTarget needed).
 */
export class PipelineEventEmitter {
  private handlers: Map<PipelineEventType | '*', Set<PipelineEventHandler>> = new Map()

  on(type: PipelineEventType | '*', handler: PipelineEventHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set())
    }
    this.handlers.get(type)!.add(handler)
    return () => this.off(type, handler)
  }

  off(type: PipelineEventType | '*', handler: PipelineEventHandler): void {
    this.handlers.get(type)?.delete(handler)
  }

  emit(event: PipelineEvent): void {
    this.handlers.get(event.type)?.forEach((h) => h(event))
    this.handlers.get('*')?.forEach((h) => h(event))
  }

  removeAll(): void {
    this.handlers.clear()
  }
}

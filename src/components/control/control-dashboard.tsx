'use client'

import { LayerColumn } from './layer-column'
import { LAYER_ORDER } from '@/lib/pipeline/constants'
import { usePipelineStore } from '@/lib/pipeline/store'

export function ControlDashboard() {
  const layers = usePipelineStore((s) => s.layers)

  return (
    <div className="grid grid-cols-5 flex-1 min-h-0 overflow-hidden">
      {LAYER_ORDER.map((layerId) => (
        <LayerColumn
          key={layerId}
          layerId={layerId}
          layer={layers[layerId]}
        />
      ))}
    </div>
  )
}

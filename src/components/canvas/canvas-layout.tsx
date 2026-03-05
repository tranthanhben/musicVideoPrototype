'use client'

import { usePipelineStore } from '@/lib/pipeline/store'
import { PIPELINE_LAYERS } from '@/lib/pipeline/constants'
import { PipelineZone } from './pipeline-zone'
import { ZoneConnector } from './zone-connector'

// Zone positions — zigzag layout for clear left-to-right sequential flow
const ZONE_POSITIONS: Record<string, { x: number; y: number }> = {
  L1_INPUT:          { x: 0,    y: 100 },
  L2_CREATIVE:       { x: 420,  y: 0   },
  L3_PREPRODUCTION:  { x: 840,  y: 100 },
  L4_PRODUCTION:     { x: 1260, y: 0   },
  L5_POSTPRODUCTION: { x: 1680, y: 100 },
}

const ZONE_COLORS: Record<string, string> = {
  L1_INPUT:          'border-l-blue-500',
  L2_CREATIVE:       'border-l-purple-500',
  L3_PREPRODUCTION:  'border-l-cyan-500',
  L4_PRODUCTION:     'border-l-yellow-500',
  L5_POSTPRODUCTION: 'border-l-pink-500',
}

// Connections: [fromLayerId, toLayerId, gateLabel] — linear sequential flow
const CONNECTIONS: [string, string, string][] = [
  ['L1_INPUT', 'L2_CREATIVE', 'QG1'],
  ['L2_CREATIVE', 'L3_PREPRODUCTION', 'QG2'],
  ['L3_PREPRODUCTION', 'L4_PRODUCTION', 'QG3'],
  ['L4_PRODUCTION', 'L5_POSTPRODUCTION', 'QG4'],
]

const ZONE_WIDTH = 380
const ZONE_HEIGHT = 220

export function CanvasLayout() {
  const layers = usePipelineStore((s) => s.layers)

  function getConnectionPoints(fromId: string, toId: string) {
    const from = ZONE_POSITIONS[fromId]
    const to = ZONE_POSITIONS[toId]
    if (!from || !to) return { fromX: 0, fromY: 0, toX: 0, toY: 0 }

    // Exit from right-center of fromZone, enter left-center of toZone
    const fromX = from.x + ZONE_WIDTH
    const fromY = from.y + ZONE_HEIGHT / 2
    const toX = to.x
    const toY = to.y + ZONE_HEIGHT / 2

    return { fromX, fromY, toX, toY }
  }

  const svgWidth = 2200
  const svgHeight = 500

  return (
    <div style={{ width: 2200, height: 500, position: 'relative' }}>
      {/* SVG for connectors — rendered behind zones */}
      <svg
        width={svgWidth}
        height={svgHeight}
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', overflow: 'visible' }}
      >
        <style>{`
          @keyframes dash-flow {
            to { stroke-dashoffset: -28; }
          }
        `}</style>
        {CONNECTIONS.map(([fromId, toId, label]) => {
          const pts = getConnectionPoints(fromId, toId)
          const fromLayer = layers[fromId as keyof typeof layers]
          const toLayer = layers[toId as keyof typeof layers]
          const active = fromLayer?.status === 'complete' || toLayer?.status === 'active'
          return (
            <ZoneConnector
              key={`${fromId}-${toId}`}
              fromX={pts.fromX}
              fromY={pts.fromY}
              toX={pts.toX}
              toY={pts.toY}
              active={active}
              label={label}
            />
          )
        })}
      </svg>

      {/* Pipeline zones */}
      {PIPELINE_LAYERS.map((layerDef) => {
        const pos = ZONE_POSITIONS[layerDef.id]
        if (!pos) return null
        const layer = layers[layerDef.id]
        return (
          <PipelineZone
            key={layerDef.id}
            layer={layer}
            layerDef={layerDef}
            x={pos.x}
            y={pos.y}
            colorClass={ZONE_COLORS[layerDef.id] ?? 'border-l-gray-500'}
          />
        )
      })}
    </div>
  )
}

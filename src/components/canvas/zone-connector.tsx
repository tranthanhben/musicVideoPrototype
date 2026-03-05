'use client'

interface ZoneConnectorProps {
  fromX: number
  fromY: number
  toX: number
  toY: number
  active: boolean
  label: string
}

export function ZoneConnector({ fromX, fromY, toX, toY, active, label }: ZoneConnectorProps) {
  const midX = (fromX + toX) / 2
  const midY = (fromY + toY) / 2

  // Cubic bezier control points
  const cp1X = fromX + (toX - fromX) * 0.4
  const cp1Y = fromY
  const cp2X = fromX + (toX - fromX) * 0.6
  const cp2Y = toY

  const pathD = `M ${fromX} ${fromY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${toX} ${toY}`

  const strokeColor = active ? '#8B5CF6' : '#374151'
  const labelColor = active ? '#C4B5FD' : '#6B7280'

  return (
    <g>
      {/* Animated dashes when active */}
      {active && (
        <path
          d={pathD}
          stroke="#8B5CF6"
          strokeWidth={2}
          fill="none"
          strokeDasharray="8 6"
          opacity={0.4}
          style={{ animation: 'dash-flow 1.5s linear infinite' }}
        />
      )}

      {/* Main path */}
      <path
        d={pathD}
        stroke={strokeColor}
        strokeWidth={active ? 2 : 1.5}
        fill="none"
        opacity={active ? 1 : 0.4}
      />

      {/* Arrowhead */}
      <defs>
        <marker
          id={`arrow-${label}`}
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L0,6 L8,3 z" fill={strokeColor} opacity={active ? 1 : 0.4} />
        </marker>
      </defs>
      <path
        d={pathD}
        stroke={strokeColor}
        strokeWidth={active ? 2 : 1.5}
        fill="none"
        opacity={active ? 1 : 0.4}
        markerEnd={`url(#arrow-${label})`}
      />

      {/* Quality gate diamond at midpoint */}
      <g transform={`translate(${midX}, ${midY})`}>
        <rect
          x={-10} y={-10} width={20} height={20}
          rx={2}
          transform="rotate(45)"
          fill={active ? 'var(--card)' : 'var(--secondary)'}
          stroke={active ? '#7C3AED' : '#374151'}
          strokeWidth={1.5}
        />
        <text
          x={0} y={1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="7"
          fontWeight="600"
          fill={labelColor}
          fontFamily="monospace"
        >
          {label}
        </text>
      </g>
    </g>
  )
}

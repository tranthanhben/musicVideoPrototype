'use client'

import type { AgentActivity } from '@/lib/pipeline/types'

const TYPE_COLORS: Record<AgentActivity['agentType'], string> = {
  agent: 'text-emerald-400',
  mcp: 'text-purple-400',
  skill: 'text-cyan-400',
  service: 'text-amber-400',
}

const TYPE_BG: Record<AgentActivity['agentType'], string> = {
  agent: 'bg-emerald-400/10 border-emerald-400/20',
  mcp: 'bg-purple-400/10 border-purple-400/20',
  skill: 'bg-cyan-400/10 border-cyan-400/20',
  service: 'bg-amber-400/10 border-amber-400/20',
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toTimeString().slice(0, 8)
}

interface Props {
  activity: AgentActivity
}

export function AgentActivityItem({ activity }: Props) {
  const colorCls = TYPE_COLORS[activity.agentType]
  const bgCls = TYPE_BG[activity.agentType]

  return (
    <div className="flex flex-col gap-0.5 py-1.5 border-b border-border/30 last:border-0">
      <div className="flex items-center gap-1.5">
        <span className="text-[9px] text-foreground/30 font-mono shrink-0">
          {formatTime(activity.timestamp)}
        </span>
        <span
          className={`text-[9px] px-1 py-0.5 rounded border font-medium uppercase tracking-wide shrink-0 ${bgCls} ${colorCls}`}
        >
          {activity.agentType}
        </span>
        <span className="text-[10px] font-medium text-foreground/80 truncate">
          {activity.agentName}
        </span>
      </div>
      <p className="text-[10px] text-foreground/40 leading-snug pl-0.5">
        {activity.action || activity.message}
      </p>
    </div>
  )
}

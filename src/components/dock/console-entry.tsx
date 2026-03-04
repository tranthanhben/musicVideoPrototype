'use client'

import { cn } from '@/lib/utils'
import type { ConsoleEntryType } from '@/app/dock/page'

const TYPE_BADGE: Record<string, { label: string; className: string }> = {
  mcp: { label: 'mcp', className: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  agent: { label: 'agent', className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  skill: { label: 'skill', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  system: { label: 'sys', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  service: { label: 'svc', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
}

interface ConsoleEntryProps {
  entry: ConsoleEntryType
}

export function ConsoleEntry({ entry }: ConsoleEntryProps) {
  const badge = TYPE_BADGE[entry.agentType ?? 'system'] ?? TYPE_BADGE.system

  return (
    <div className="flex items-center gap-2 px-3 py-1 hover:bg-white/5 transition-colors group min-w-0">
      {/* Timestamp */}
      <span className="shrink-0 font-mono text-[10px] text-muted-foreground/60 w-12">
        [{entry.timestamp}]
      </span>

      {/* Agent type badge */}
      <span className={cn(
        'shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border',
        badge.className
      )}>
        {badge.label}
      </span>

      {/* Agent name */}
      <span className="shrink-0 text-xs font-medium text-foreground/80 max-w-[120px] truncate">
        {entry.agentName}
      </span>

      {/* Separator */}
      <span className="text-muted-foreground/40 shrink-0">—</span>

      {/* Message */}
      <span className="text-xs text-muted-foreground truncate flex-1">
        {entry.message}
      </span>

      {/* Status dot */}
      <span className="shrink-0 h-1.5 w-1.5 rounded-full bg-green-500" />
    </div>
  )
}

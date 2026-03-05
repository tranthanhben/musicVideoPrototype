'use client'

import { useRef, useEffect } from 'react'
import { Terminal, ChevronDown, ChevronUp, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ConsoleEntry } from './console-entry'
import { ConsoleGateBanner } from './console-gate-banner'
import type { ConsoleEntryType } from '@/app/dock/page'
import type { QualityGateId } from '@/lib/pipeline/types'

interface DockConsoleProps {
  entries: ConsoleEntryType[]
  onGateResolve: (gateId: QualityGateId, result: 'pass' | 'revise') => void
  collapsed: boolean
  onToggleCollapse: () => void
  onClear?: () => void
}

export function DockConsole({ entries, onGateResolve, collapsed, onToggleCollapse, onClear }: DockConsoleProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new entries
  useEffect(() => {
    if (!collapsed && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [entries, collapsed])

  return (
    <div className={cn(
      'shrink-0 border-t border-border bg-background flex flex-col transition-all duration-200',
      collapsed ? 'h-8' : 'h-48'
    )}>
      {/* Header */}
      <div className="flex h-8 shrink-0 items-center gap-2 px-3 border-b border-border/50">
        <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex-1">
          Console
        </span>
        <div className="flex items-center gap-1">
          {!collapsed && (
            <button
              onClick={onClear}
              className="flex h-5 w-5 items-center justify-center rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
              title="Clear console"
            >
              <X className="h-3 w-3" />
            </button>
          )}
          <button
            onClick={onToggleCollapse}
            className="flex h-5 w-5 items-center justify-center rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
            title={collapsed ? 'Expand console' : 'Collapse console'}
          >
            {collapsed ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* Scrollable entries */}
      {!collapsed && (
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto py-1 font-mono"
        >
          {entries.map((entry) => {
            if (entry.type === 'gate') {
              return (
                <ConsoleGateBanner
                  key={entry.id}
                  gateId={entry.gateId!}
                  message={entry.message}
                  status={entry.gateStatus ?? 'pending'}
                  onResolve={onGateResolve}
                />
              )
            }
            return <ConsoleEntry key={entry.id} entry={entry} />
          })}
          {entries.length === 0 && (
            <p className="px-3 py-2 text-xs text-muted-foreground/50">Waiting for pipeline...</p>
          )}
        </div>
      )}
    </div>
  )
}

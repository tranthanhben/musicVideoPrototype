'use client'

import { useEffect, useRef, useState } from 'react'
import { Bot, ChevronDown, ChevronUp } from 'lucide-react'
import type { PipelineEvent, PipelineEventType } from '@/lib/pipeline/types'

const EVENT_COLORS: Record<PipelineEventType, string> = {
  layer_start: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  layer_progress: 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20',
  artifact_created: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  activity_log: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  gate_pending: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  gate_resolved: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  pipeline_complete: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  pipeline_error: 'text-red-400 bg-red-400/10 border-red-400/20',
}

const JOURNEY_COLOR = 'text-violet-400 bg-violet-400/10 border-violet-400/20'

type FilterType = 'all' | 'gates' | 'activities' | 'errors' | 'journey'

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'gates', label: 'Gates' },
  { key: 'activities', label: 'Activities' },
  { key: 'errors', label: 'Errors' },
  { key: 'journey', label: 'AI' },
]

function isJourneyEvent(event: PipelineEvent): boolean {
  return (
    event.type === 'activity_log' &&
    typeof event.data === 'object' &&
    event.data !== null &&
    (event.data as Record<string, unknown>)['isJourney'] === true
  )
}

function matchesFilter(event: PipelineEvent, filter: FilterType): boolean {
  if (filter === 'all') return true
  if (filter === 'journey') return isJourneyEvent(event)
  if (filter === 'gates') return event.type === 'gate_pending' || event.type === 'gate_resolved'
  if (filter === 'activities') return (event.type === 'activity_log' || event.type === 'layer_start') && !isJourneyEvent(event)
  if (filter === 'errors') return event.type === 'pipeline_error'
  return true
}

interface Props {
  events: PipelineEvent[]
}

export function EventLog({ events }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const [filter, setFilter] = useState<FilterType>('all')
  const scrollRef = useRef<HTMLDivElement>(null)

  const filtered = events.filter((e) => matchesFilter(e, filter))

  useEffect(() => {
    if (!collapsed && scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [events, collapsed])

  return (
    <div
      className="border-t border-border bg-card/80 backdrop-blur-sm flex flex-col"
      style={{ height: collapsed ? 40 : 200 }}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 h-10 shrink-0 border-b border-border/30">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mr-1">
          Event Log
        </span>
        <span className="text-[10px] text-muted-foreground/60 font-mono">{events.length}</span>
        <div className="flex items-center gap-1 ml-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wide font-medium transition-colors ${
                filter === f.key
                  ? 'bg-foreground/10 text-foreground'
                  : 'text-muted-foreground/60 hover:text-muted-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
        >
          {collapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Events row — horizontal scroll */}
      {!collapsed && (
        <div
          ref={scrollRef}
          className="flex items-start gap-2 overflow-x-auto px-3 py-2 flex-1"
          style={{ scrollbarWidth: 'thin' }}
        >
          {filtered.length === 0 ? (
            <p className="text-[10px] text-muted-foreground/60 font-mono self-center">No events yet...</p>
          ) : (
            filtered.map((event, i) => {
              const journey = isJourneyEvent(event)

              if (journey) {
                return (
                  <div
                    key={i}
                    className={`shrink-0 flex flex-col gap-1 rounded border px-3 py-2 max-w-[320px] ${JOURNEY_COLOR}`}
                    style={{ background: 'rgba(139,92,246,0.06)' }}
                  >
                    <div className="flex items-center gap-1.5">
                      <Bot className="w-3 h-3 text-violet-400 shrink-0" />
                      <span className="text-[9px] font-mono uppercase tracking-wide text-violet-400 font-semibold">
                        AI Producer
                      </span>
                    </div>
                    {event.message && (
                      <p className="text-sm text-violet-300 leading-snug line-clamp-3">
                        {event.message}
                      </p>
                    )}
                  </div>
                )
              }

              const colorCls = EVENT_COLORS[event.type] ?? 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20'
              return (
                <div
                  key={i}
                  className="shrink-0 flex flex-col gap-0.5 rounded border border-border/30 px-2 py-1.5 max-w-[200px] bg-muted/20"
                >
                  <div className="flex items-center gap-1">
                    <span className={`text-[8px] px-1 py-0.5 rounded border font-mono uppercase tracking-wide ${colorCls}`}>
                      {event.type.replace('_', ' ')}
                    </span>
                    {event.layerId && (
                      <span className="text-[8px] text-muted-foreground/60 font-mono">
                        {event.layerId.split('_')[0]}
                      </span>
                    )}
                    {event.gateId && (
                      <span className="text-[8px] text-amber-500 font-mono">{event.gateId}</span>
                    )}
                  </div>
                  {event.message && (
                    <p className="text-[9px] text-muted-foreground leading-tight line-clamp-2">
                      {event.message}
                    </p>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

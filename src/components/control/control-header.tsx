'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Radio, Square, CheckCircle, Clock } from 'lucide-react'
import { usePipelineStore } from '@/lib/pipeline/store'
import { LAYER_ORDER } from '@/lib/pipeline/constants'

interface Props {
  onStop: () => void
  startedAt: number | null
}

function useElapsed(startedAt: number | null): string {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!startedAt) return
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [startedAt])

  if (!startedAt) return '00:00'
  const secs = Math.floor((now - startedAt) / 1000)
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function ControlHeader({ onStop, startedAt }: Props) {
  const { isRunning, currentState, layers } = usePipelineStore()
  const elapsed = useElapsed(startedAt)

  const avgProgress = Math.round(
    LAYER_ORDER.reduce((sum, id) => sum + layers[id].progress, 0) / LAYER_ORDER.length
  )

  const globalStatus = currentState === 'complete'
    ? 'Complete'
    : isRunning
    ? 'Pipeline Running'
    : 'Idle'

  const statusColor = currentState === 'complete'
    ? 'text-emerald-400'
    : isRunning
    ? 'text-amber-400'
    : 'text-muted-foreground'

  return (
    <div
      className="flex items-center gap-4 px-4 border-b border-border shrink-0 bg-background/95"
      style={{ height: 48 }}
    >
      {/* Back */}
      <Link
        href="/"
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span className="text-xs">Back</span>
      </Link>

      <div className="w-px h-4 bg-border" />

      {/* Title */}
      <div className="flex items-center gap-2">
        <Radio className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-sm font-semibold text-foreground font-mono tracking-wide">
          Mission Control
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted border border-border text-muted-foreground font-mono">
          Cosmic Love Story
        </span>
      </div>

      <div className="flex-1" />

      {/* Status cluster */}
      <div className="flex items-center gap-4">
        {/* Global status */}
        <div className="flex items-center gap-1.5">
          {currentState === 'complete' ? (
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          ) : isRunning ? (
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
          )}
          <span className={`text-xs font-medium ${statusColor}`}>{globalStatus}</span>
        </div>

        {/* Elapsed */}
        {startedAt && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span className="text-xs font-mono">{elapsed}</span>
          </div>
        )}

        {/* Progress */}
        <div className="flex items-center gap-1.5">
          <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-pink-500 transition-all duration-500"
              style={{ width: `${avgProgress}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">{avgProgress}%</span>
        </div>

        {/* Emergency stop */}
        {isRunning && (
          <button
            onClick={onStop}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-red-400 border border-red-400/30 bg-red-400/5 hover:bg-red-400/10 transition-colors"
          >
            <Square className="w-2.5 h-2.5" />
            Stop
          </button>
        )}
      </div>
    </div>
  )
}

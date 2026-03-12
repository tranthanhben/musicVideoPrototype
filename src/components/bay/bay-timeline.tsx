'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { mockProjects } from '@/lib/mock/projects'
import type { BayTab } from './bay-top-bar'

interface BayTimelineProps {
  activeTab: BayTab
  selectedSceneId: string | null
  onSceneClick: (id: string) => void
}

const project = mockProjects[0]
const SVG_W = 800
const SVG_H = 28
const BAND_H = 7

const SCENE_TABS = new Set<BayTab>(['storyboard', 'generate', 'edit'])

export function BayTimeline({ activeTab, selectedSceneId, onSceneClick }: BayTimelineProps) {
  const isActive = activeTab === 'edit'
  const showScenes = SCENE_TABS.has(activeTab)
  const [playheadPct, setPlayheadPct] = useState(0)
  const { segments, beatMarkers, duration } = project.audio
  const scenes = project.scenes
  const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0)

  // Animate playhead slowly
  useEffect(() => {
    if (!isActive) return
    const interval = setInterval(() => {
      setPlayheadPct((p) => (p >= 100 ? 0 : p + 0.15))
    }, 50)
    return () => clearInterval(interval)
  }, [isActive])

  return (
    <div className={cn('border-t border-border bg-background flex flex-col shrink-0 transition-all', isActive ? 'h-40' : showScenes ? 'h-36 opacity-60' : 'h-20 opacity-60')}>

      {/* Audio track label */}
      <div className="flex items-center gap-2 px-3 pt-2 pb-0.5 shrink-0">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide w-14 shrink-0">Audio</span>

        {/* Waveform with segment bands + beat markers */}
        <div className="flex-1 h-7 rounded-md overflow-hidden bg-muted">
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="ag2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#22D3EE" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#EC4899" stopOpacity="0.5" />
              </linearGradient>
            </defs>

            {/* Segment color bands at top */}
            {segments.map((seg) => {
              const x = (seg.startTime / duration) * SVG_W
              const w = ((seg.endTime - seg.startTime) / duration) * SVG_W
              return <rect key={seg.id} x={x} y={0} width={w} height={BAND_H} fill={seg.color} opacity="0.85" />
            })}

            {/* Waveform bars */}
            {Array.from({ length: 160 }).map((_, i) => {
              const h = 4 + Math.abs(Math.sin(i * 0.35) * 9 + Math.sin(i * 0.8) * 5)
              return (
                <rect key={i} x={i * 5} y={(SVG_H - h) / 2} width="3" height={h} rx="0.5" fill="url(#ag2)" />
              )
            })}

            {/* Beat marker tick lines — every 4th */}
            {beatMarkers.map((t, i) => {
              if (i % 4 !== 0) return null
              const x = (t / duration) * SVG_W
              return (
                <line key={i} x1={x} y1={BAND_H} x2={x} y2={SVG_H} stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
              )
            })}

            {/* Playhead on audio track */}
            {isActive && (
              <line
                x1={(playheadPct / 100) * SVG_W}
                y1={0}
                x2={(playheadPct / 100) * SVG_W}
                y2={SVG_H}
                stroke="white"
                strokeWidth="1.5"
                opacity="0.7"
              />
            )}
          </svg>
        </div>
      </div>

      {/* Segment label row */}
      <div className="relative h-4 ml-16 mr-3 mt-0.5 shrink-0 overflow-hidden">
        {segments.map((seg) => {
          const leftPct = (seg.startTime / duration) * 100
          return (
            <span
              key={seg.id}
              className="absolute text-[10px] font-medium whitespace-nowrap"
              style={{ left: `${leftPct.toFixed(1)}%`, color: seg.color, transform: 'translateX(2px)' }}
            >
              {seg.label}
            </span>
          )
        })}
      </div>

      {/* Scene track — visible from storyboard stage */}
      {showScenes && <div className="flex items-center gap-2 px-3 mt-1 pb-1 flex-1 min-h-0">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide w-14 shrink-0">Scenes</span>

        <div className="flex-1 relative flex gap-0.5 h-full rounded-lg overflow-hidden bg-muted/30">
          {scenes.map((scene) => {
            const widthPct = totalDuration > 0 ? (scene.duration / totalDuration) * 100 : 0
            const isSelected = scene.id === selectedSceneId
            return (
              <button
                key={scene.id}
                onClick={() => onSceneClick(scene.id)}
                className={cn(
                  'relative h-full overflow-hidden transition-all border-r border-background/30',
                  isSelected ? 'ring-2 ring-primary ring-inset' : 'hover:brightness-110'
                )}
                style={{ width: `${widthPct}%` }}
                title={`Scene ${scene.index + 1}: ${scene.subject}`}
              >
                <img src={scene.thumbnailUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                <div
                  className="absolute inset-0 opacity-30"
                  style={{ background: isSelected ? 'linear-gradient(135deg, #7C3AED44, #22D3EE44)' : 'transparent' }}
                />
                <span className="relative z-10 text-[9px] font-bold text-white drop-shadow-sm px-0.5 leading-tight">
                  {scene.index + 1}
                </span>
              </button>
            )
          })}

          {/* Animated playhead over scene track */}
          {isActive && totalDuration > 0 && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white z-20 pointer-events-none shadow-[0_0_4px_rgba(255,255,255,0.8)]"
              style={{ left: `${playheadPct}%` }}
            />
          )}
        </div>
      </div>}
    </div>
  )
}

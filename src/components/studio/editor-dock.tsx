'use client'

import { WaveformRuler } from '@/components/studio/waveform-ruler'
import { TimelineTrack } from '@/components/studio/timeline-track'
import type { MockScene } from '@/lib/mock/types'

const MONO = 'JetBrains Mono, monospace'

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

interface EditorDockProps {
  scenes: MockScene[]
  beatMarkers: number[]
  bpm: number
  totalDuration: number
  playheadPosition: number
  isPlaying: boolean
  activeSceneId: string | null
  onSeek: (t: number) => void
  onSceneClick: (id: string) => void
  onTogglePlay: () => void
}

export function EditorDock({
  scenes,
  beatMarkers,
  bpm,
  totalDuration,
  playheadPosition,
  isPlaying,
  activeSceneId,
  onSeek,
  onSceneClick,
  onTogglePlay,
}: EditorDockProps) {
  return (
    <div
      className="flex-shrink-0 border-t flex flex-col"
      style={{
        height: 140,
        borderColor: 'rgba(255,255,255,0.08)',
        background: '#1A1A2E',
      }}
    >
      {/* Waveform */}
      <div className="px-2 pt-1 flex-shrink-0" style={{ height: 60 }}>
        <WaveformRuler
          duration={totalDuration}
          beatMarkers={beatMarkers}
          playheadPosition={playheadPosition}
          onSeek={onSeek}
        />
      </div>

      {/* Transport */}
      <div
        className="flex items-center gap-3 px-3 border-y flex-shrink-0"
        style={{ height: 32, borderColor: 'rgba(255,255,255,0.06)', fontFamily: MONO }}
      >
        <button
          onClick={onTogglePlay}
          className="w-6 h-6 rounded flex items-center justify-center transition-colors hover:bg-violet-500/30"
          style={{ background: isPlaying ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.05)' }}
        >
          {isPlaying ? (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="#fff">
              <rect x="1" y="1" width="3" height="8" rx="0.5" />
              <rect x="6" y="1" width="3" height="8" rx="0.5" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="#fff">
              <polygon points="2,1 9,5 2,9" />
            </svg>
          )}
        </button>
        <span className="text-[11px] tabular-nums" style={{ color: '#22D3EE' }}>
          {formatTime(playheadPosition)}
        </span>
        <span className="text-[11px] opacity-30">/</span>
        <span className="text-[11px] opacity-30 tabular-nums">{formatTime(totalDuration)}</span>
        <div className="flex-1" />
        <span
          className="text-[10px] px-1.5 py-0.5 rounded"
          style={{ color: '#22D3EE', background: 'rgba(34,211,238,0.1)' }}
        >
          {bpm} BPM
        </span>
      </div>

      {/* Timeline */}
      <div className="px-2 flex-shrink-0" style={{ height: 48 }}>
        <TimelineTrack
          scenes={scenes}
          totalDuration={totalDuration}
          activeSceneId={activeSceneId}
          onSceneClick={onSceneClick}
          playheadPosition={playheadPosition}
        />
      </div>
    </div>
  )
}

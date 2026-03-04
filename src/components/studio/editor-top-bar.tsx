'use client'

import Link from 'next/link'
import type { MockProject } from '@/lib/mock/types'

const MONO = 'JetBrains Mono, monospace'

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

interface EditorTopBarProps {
  project: MockProject
  totalDuration: number
}

export function EditorTopBar({ project, totalDuration }: EditorTopBarProps) {
  return (
    <div
      className="flex items-center gap-3 px-3 border-b flex-shrink-0"
      style={{
        height: 48,
        borderColor: 'rgba(255,255,255,0.08)',
        background: '#1A1A2E',
        fontFamily: MONO,
      }}
    >
      <Link
        href="/studio"
        className="text-[11px] opacity-50 hover:opacity-90 transition-opacity"
      >
        ← STUDIO
      </Link>
      <div className="w-px h-4 bg-white/10" />
      <span className="text-[12px] text-[#E5E7EB]">{project.title}</span>
      <span
        className="text-[10px] px-1.5 py-0.5 rounded"
        style={{ background: 'rgba(124,58,237,0.2)', color: '#7C3AED' }}
      >
        {project.scenes.length} scenes
      </span>
      <span
        className="text-[10px] px-1.5 py-0.5 rounded"
        style={{ background: 'rgba(34,211,238,0.15)', color: '#22D3EE' }}
      >
        {project.audio.bpm} BPM
      </span>
      <span className="text-[10px] opacity-40 ml-1">{formatTime(totalDuration)}</span>
      <div className="ml-auto">
        <Link
          href={`/studio/export?id=${project.id}`}
          className="text-[10px] px-2 py-1 rounded uppercase tracking-widest transition-colors hover:bg-amber-500/30"
          style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}
        >
          Export
        </Link>
      </div>
    </div>
  )
}

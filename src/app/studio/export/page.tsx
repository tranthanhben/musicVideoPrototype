'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { mockProjects } from '@/lib/mock/projects'
import { simulateGeneration } from '@/lib/utils/generation-simulator'

const MONO = 'JetBrains Mono, monospace'

type Quality = '720p' | '1080p' | '4K'
type Format = 'MP4' | 'WebM' | 'MOV'

function ExportContent() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get('id')
  const project = mockProjects.find((p) => p.id === projectId) ?? mockProjects[0]

  const [quality, setQuality] = useState<Quality>('1080p')
  const [format, setFormat] = useState<Format>('MP4')
  const [progress, setProgress] = useState(0)
  const [isRendering, setIsRendering] = useState(false)
  const [isDone, setIsDone] = useState(false)

  async function handleRender() {
    setIsRendering(true)
    setIsDone(false)
    setProgress(0)
    await simulateGeneration(5000, setProgress)
    setIsRendering(false)
    setIsDone(true)
  }

  return (
    <div className="min-h-screen flex flex-col p-6 bg-background" style={{ fontFamily: MONO }}>
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Link
          href={`/studio/editor?id=${project.id}`}
          className="text-[11px] opacity-50 hover:opacity-90 transition-opacity"
        >
          ← EDITOR
        </Link>
        <div className="w-px h-4 bg-white/10" />
        <span className="text-[12px]" style={{ color: '#E5E7EB' }}>
          Export — {project.title}
        </span>
      </div>

      {/* Export options */}
      <div
        className="max-w-md rounded border p-5 bg-card border-border"
      >
        {/* Quality */}
        <div className="mb-5">
          <div
            className="text-[10px] uppercase tracking-widest opacity-50 mb-2"
          >
            Quality
          </div>
          <div className="flex gap-2">
            {(['720p', '1080p', '4K'] as Quality[]).map((q) => (
              <button
                key={q}
                onClick={() => setQuality(q)}
                className="flex-1 py-2 rounded text-[11px] uppercase tracking-wider transition-colors duration-150"
                style={{
                  background: quality === q ? '#7C3AED' : 'rgba(255,255,255,0.05)',
                  color: quality === q ? '#fff' : '#9CA3AF',
                  border: quality === q ? '1px solid #7C3AED' : '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Format */}
        <div className="mb-6">
          <div className="text-[10px] uppercase tracking-widest opacity-50 mb-2">
            Format
          </div>
          <div className="flex gap-2">
            {(['MP4', 'WebM', 'MOV'] as Format[]).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className="flex-1 py-2 rounded text-[11px] uppercase tracking-wider transition-colors duration-150"
                style={{
                  background: format === f ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.05)',
                  color: format === f ? '#7C3AED' : '#9CA3AF',
                  border: format === f ? '1px solid rgba(124,58,237,0.5)' : '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div
          className="mb-4 px-3 py-2 rounded text-[10px] opacity-50"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          {project.scenes.length} scenes · {quality} · {format} · {project.audio.bpm} BPM
        </div>

        {/* Progress bar */}
        {(isRendering || isDone) && (
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-[10px] opacity-50 uppercase tracking-wider">
                {isDone ? 'Complete' : 'Rendering...'}
              </span>
              <span className="text-[11px] tabular-nums" style={{ color: '#F59E0B' }}>
                {Math.round(progress)}%
              </span>
            </div>
            <div
              className="w-full rounded-full overflow-hidden"
              style={{ height: 4, background: 'rgba(255,255,255,0.1)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progress}%`,
                  background: isDone ? '#10B981' : '#F59E0B',
                }}
              />
            </div>
          </div>
        )}

        {/* Render / Download button */}
        {!isDone ? (
          <button
            onClick={handleRender}
            disabled={isRendering}
            className="w-full py-2.5 rounded text-[12px] uppercase tracking-widest transition-colors duration-150 disabled:opacity-50"
            style={{
              background: isRendering ? 'rgba(245,158,11,0.4)' : '#F59E0B',
              color: '#000',
              fontFamily: MONO,
            }}
          >
            {isRendering ? `Rendering ${Math.round(progress)}%...` : 'Render'}
          </button>
        ) : (
          <button
            className="w-full py-2.5 rounded text-[12px] uppercase tracking-widest transition-colors duration-150 hover:bg-emerald-400"
            style={{
              background: '#10B981',
              color: '#fff',
              fontFamily: MONO,
            }}
          >
            Download {format}
          </button>
        )}
      </div>
    </div>
  )
}

export default function ExportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-[11px] opacity-30" style={{ fontFamily: MONO }}>Loading...</span>
      </div>
    }>
      <ExportContent />
    </Suspense>
  )
}

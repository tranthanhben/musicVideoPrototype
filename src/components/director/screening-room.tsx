'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { MockProject } from '@/lib/mock/types'
import { MockVideoPlayer } from '@/components/shared/mock-video-player'
import { Check, RotateCcw, X, ChevronLeft, ChevronRight, Film } from 'lucide-react'

interface ScreeningRoomProps {
  project: MockProject
  activeSceneIndex: number
  onSceneChange: (index: number) => void
  onClose: () => void
}

function formatTimecode(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const f = Math.floor((seconds % 1) * 24)
  return [
    h.toString().padStart(2, '0'),
    m.toString().padStart(2, '0'),
    s.toString().padStart(2, '0'),
    f.toString().padStart(2, '0'),
  ].join(':')
}

function sumDuration(scenes: MockProject['scenes'], upTo: number): number {
  return scenes.slice(0, upTo).reduce((acc, s) => acc + s.duration, 0)
}

export function ScreeningRoom({
  project,
  activeSceneIndex,
  onSceneChange,
  onClose,
}: ScreeningRoomProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [approvedScenes, setApprovedScenes] = useState<Set<number>>(new Set())
  const [reshootScenes, setReshootScenes] = useState<Set<number>>(new Set())
  const scene = project.scenes[activeSceneIndex]
  const timecodeOffset = sumDuration(project.scenes, activeSceneIndex)

  const [elapsed, setElapsed] = useState(timecodeOffset)
  useEffect(() => {
    setElapsed(timecodeOffset)
    const id = setInterval(() => {
      setElapsed((prev) => {
        const max = timecodeOffset + scene.duration
        return prev < max ? prev + 1 : max
      })
    }, 1000)
    return () => clearInterval(id)
  }, [activeSceneIndex, timecodeOffset, scene.duration])

  function handleApprove() {
    setApprovedScenes((prev) => {
      const next = new Set(prev)
      next.add(activeSceneIndex)
      return next
    })
    setReshootScenes((prev) => {
      const next = new Set(prev)
      next.delete(activeSceneIndex)
      return next
    })
  }

  function handleReshoot() {
    setReshootScenes((prev) => {
      const next = new Set(prev)
      next.add(activeSceneIndex)
      return next
    })
    setApprovedScenes((prev) => {
      const next = new Set(prev)
      next.delete(activeSceneIndex)
      return next
    })
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col bg-background"
        style={{ fontFamily: 'var(--font-source-sans-3, sans-serif)' }}
      >
        {/* Top letterbox bar */}
        <div className="h-[10vh] bg-background flex items-center justify-between px-6 shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <X className="w-4 h-4" />
            Exit Screening
          </button>

          <div className="flex items-center gap-3">
            <Film className="w-4 h-4 text-amber-500" />
            <span
              className="text-amber-500 text-sm font-semibold"
              style={{ fontFamily: 'var(--font-playfair-display, serif)' }}
            >
              {project.title}
            </span>
          </div>

          <span
            className="text-foreground/70 text-sm tabular-nums"
            style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
          >
            {formatTimecode(elapsed)}
          </span>
        </div>

        {/* Main cinema area */}
        <div className="flex-1 flex min-h-0">
          {/* Collapsible sidebar */}
          <div
            className="bg-card border-r border-border flex flex-col shrink-0 transition-all duration-300 overflow-hidden"
            style={{ width: sidebarOpen ? 240 : 0 }}
          >
            <div className="p-3 border-b border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Scenes
              </span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              {project.scenes.map((s, i) => {
                const isActive = i === activeSceneIndex
                const isApproved = approvedScenes.has(i)
                const isReshoot = reshootScenes.has(i)
                return (
                  <button
                    key={s.id}
                    onClick={() => onSceneChange(i)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors border-b border-border/50 ${
                      isActive ? 'bg-muted' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="relative shrink-0 w-14 h-9 rounded overflow-hidden">
                      <img src={s.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                      {isApproved && (
                        <div className="absolute inset-0 bg-emerald-600/50 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      {isReshoot && (
                        <div className="absolute inset-0 bg-red-600/50 flex items-center justify-center">
                          <RotateCcw className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold truncate ${isActive ? 'text-amber-400' : 'text-foreground/70'}`}>
                        Scene {i + 1}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{s.cameraAngle}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Video area */}
          <div className="flex-1 flex flex-col items-center justify-center bg-background relative">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground bg-card/80 rounded p-1"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            <div className="w-full max-w-4xl px-8">
              <MockVideoPlayer
                thumbnailUrl={scene.thumbnailUrl}
                duration={scene.duration}
                aspectRatio="16:9"
                className="shadow-2xl"
              />
            </div>

            {/* Navigation arrows */}
            <div className="flex items-center gap-6 mt-6">
              <button
                onClick={() => onSceneChange(Math.max(0, activeSceneIndex - 1))}
                disabled={activeSceneIndex === 0}
                className="p-2 rounded-full bg-muted hover:bg-secondary disabled:opacity-30 text-foreground transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className="text-muted-foreground text-sm">
                Scene {activeSceneIndex + 1} / {project.scenes.length}
              </span>

              <button
                onClick={() =>
                  onSceneChange(Math.min(project.scenes.length - 1, activeSceneIndex + 1))
                }
                disabled={activeSceneIndex === project.scenes.length - 1}
                className="p-2 rounded-full bg-muted hover:bg-secondary disabled:opacity-30 text-foreground transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom letterbox bar */}
        <div className="h-[10vh] bg-background flex items-center justify-center gap-6 shrink-0 border-t border-border">
          <button
            onClick={handleApprove}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-sm transition-colors ${
              approvedScenes.has(activeSceneIndex)
                ? 'bg-emerald-600 text-white'
                : 'bg-muted hover:bg-emerald-700 text-foreground/80'
            }`}
          >
            <Check className="w-4 h-4" />
            Approve Scene
          </button>

          <button
            onClick={handleReshoot}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-sm transition-colors ${
              reshootScenes.has(activeSceneIndex)
                ? 'bg-red-600 text-white'
                : 'bg-muted hover:bg-red-700 text-foreground/80'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            Reshoot
          </button>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="text-emerald-500">{approvedScenes.size} approved</span>
            <span>·</span>
            <span className="text-red-500">{reshootScenes.size} reshoot</span>
            <span>·</span>
            <span>
              {project.scenes.length - approvedScenes.size - reshootScenes.size} pending
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

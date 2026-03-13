'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MockVideoPlayer } from '@/components/shared/mock-video-player'
import { SimpleTimeline } from '@/components/editor/simple-timeline'
import { mockProjects } from '@/lib/mock/projects'
import { cn } from '@/lib/utils'
import { Settings, Camera, MapPin, User, Eye, X } from 'lucide-react'
import { EditingVfxPanel, EditingExportPanel } from './editing-view-panels'

const project = mockProjects[0]
const PREVIEW_IMAGE = '/assets/export/final-preview.jpg'
const QUALITY_OPTIONS = ['4K Ultra HD', '1080p Full HD', '720p HD']

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

function buildSceneOffsets() {
  let elapsed = 0
  return project.scenes.map((s) => {
    const entry = { id: s.id, start: elapsed, end: elapsed + s.duration }
    elapsed += s.duration
    return entry
  })
}

const sceneOffsets = buildSceneOffsets()

export function EditingView() {
  const [activeSceneId, setActiveSceneId] = useState<string>(project.scenes[0].id)
  const [selectedPreset, setSelectedPreset] = useState<string>('Cosmic Cinema')
  const [selectedQuality, setSelectedQuality] = useState('1080p Full HD')
  const [exportedPlatforms, setExportedPlatforms] = useState<Set<string>>(new Set())
  const [playhead, setPlayhead] = useState(0)
  const [showDetail, setShowDetail] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const totalDuration = project.scenes.reduce((sum, s) => sum + s.duration, 0)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setPlayhead((p) => (p + 0.5) % totalDuration)
    }, 200)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [totalDuration])

  function handleExport(platform: string) {
    setExportedPlatforms((prev) => new Set([...prev, platform]))
  }

  function handleSceneClick(sceneId: string) {
    if (sceneId === activeSceneId) {
      setShowDetail((v) => !v)
    } else {
      setActiveSceneId(sceneId)
      setShowDetail(true)
    }
  }

  const activeScene = project.scenes.find((s) => s.id === activeSceneId)
  const activeOffset = sceneOffsets.find((o) => o.id === activeSceneId)

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="flex flex-col gap-3 p-5">
        <div className="shrink-0">
          <h2 className="text-sm font-bold text-foreground">Post-Production</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Final assembly and color grading</p>
        </div>

        {/* Video player */}
        <div className="shrink-0">
          <MockVideoPlayer
            thumbnailUrl={PREVIEW_IMAGE}
            duration={totalDuration}
            className="w-full"
            aspectRatio="16:9"
          />
        </div>

        {/* Timeline with timestamps */}
        <div className="shrink-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest">
              Timeline · {project.scenes.length} scenes
            </p>
            <span className="text-[9px] font-mono text-muted-foreground">{formatTime(playhead)} / {formatTime(totalDuration)}</span>
          </div>

          {/* Timestamp ticks */}
          <div className="relative flex mb-0.5 px-0 h-4">
            {sceneOffsets.map((off) => (
              <div
                key={off.id}
                className="absolute flex flex-col items-start"
                style={{ left: `${(off.start / totalDuration) * 100}%` }}
              >
                <div className="w-px h-2 bg-border/60" />
                <span className="text-[8px] font-mono text-muted-foreground/60 ml-0.5">
                  {formatTime(off.start)}
                </span>
              </div>
            ))}
          </div>

          <SimpleTimeline
            scenes={project.scenes}
            activeSceneId={activeSceneId}
            playheadPosition={playhead}
            onSceneClick={handleSceneClick}
          />
        </div>

        {/* Scene detail panel */}
        <AnimatePresence>
          {showDetail && activeScene && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0 overflow-hidden"
            >
              <div className="rounded-xl border border-primary/25 bg-primary/5 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                    Scene {activeScene.index + 1}
                    {activeOffset && (
                      <span className="ml-2 font-mono font-normal text-muted-foreground">
                        {formatTime(activeOffset.start)} – {formatTime(activeOffset.end)}
                      </span>
                    )}
                  </span>
                  <button onClick={() => setShowDetail(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <MetaChip icon={User} label="Subject" value={activeScene.subject} />
                  <MetaChip icon={Eye} label="Action" value={activeScene.action} />
                  <MetaChip icon={MapPin} label="Env" value={activeScene.environment} />
                  <MetaChip icon={Camera} label="Camera" value={`${activeScene.cameraAngle} · ${activeScene.cameraMovement}`} />
                </div>
                <p className="mt-2 text-[9px] text-muted-foreground leading-relaxed line-clamp-3">{activeScene.prompt}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <EditingVfxPanel selectedPreset={selectedPreset} onSelect={setSelectedPreset} />

        {/* Quality selector */}
        <div className="shrink-0">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Settings className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest">Resolution</p>
          </div>
          <div className="flex gap-1.5">
            {QUALITY_OPTIONS.map((q) => (
              <button key={q} onClick={() => setSelectedQuality(q)}
                className={cn(
                  'flex-1 py-1.5 rounded-lg border text-[10px] font-semibold transition-all cursor-pointer',
                  selectedQuality === q
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/40',
                )}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <EditingExportPanel exportedPlatforms={exportedPlatforms} onExport={handleExport} />
      </div>
    </div>
  )
}

function MetaChip({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-1.5 rounded-lg bg-background/50 border border-border/30 px-2 py-1.5">
      <Icon className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-[8px] text-muted-foreground uppercase tracking-wider font-semibold">{label}</p>
        <p className="text-[9px] text-foreground line-clamp-1">{value}</p>
      </div>
    </div>
  )
}

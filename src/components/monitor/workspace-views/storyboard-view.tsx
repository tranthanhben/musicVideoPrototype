'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Layers, Clock, Camera } from 'lucide-react'
import { mockProjects } from '@/lib/mock/projects'
import type { AudioSegment } from '@/lib/mock/types'
import { cn } from '@/lib/utils'
import { StoryboardViewWaveform } from './storyboard-view-waveform'

const project = mockProjects[0]
const segments = project.audio.segments
const duration = project.audio.duration

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

const totalDuration = project.scenes.reduce((sum, s) => sum + s.duration, 0)

function getSegmentForTime(time: number, segs: AudioSegment[]): AudioSegment | undefined {
  return segs.find((seg) => time >= seg.startTime && time < seg.endTime)
}

function buildSceneSegmentMap(): Record<string, { color: string; label: string } | undefined> {
  const totalVideoDuration = project.scenes.reduce((sum, s) => sum + s.duration, 0)
  let elapsed = 0
  const map: Record<string, { color: string; label: string } | undefined> = {}
  for (const scene of project.scenes) {
    const midPoint = elapsed + scene.duration / 2
    const audioTime = (midPoint / totalVideoDuration) * duration
    const seg = getSegmentForTime(audioTime, segments)
    map[scene.id] = seg ? { color: seg.color, label: seg.label } : undefined
    elapsed += scene.duration
  }
  return map
}

const sceneSegmentMap = buildSceneSegmentMap()

export function StoryboardView() {
  const [activeSceneId, setActiveSceneId] = useState<string | undefined>()
  const [activeTakeMap, setActiveTakeMap] = useState<Record<string, string>>({})

  function selectTake(sceneId: string, takeId: string) {
    setActiveTakeMap((prev) => ({ ...prev, [sceneId]: takeId }))
  }

  const activeScene = activeSceneId ? project.scenes.find((s) => s.id === activeSceneId) : null

  return (
    <div className="flex h-full flex-col p-5 gap-3">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">Storyboard</h2>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatDuration(totalDuration)}
          </span>
          <span>{project.scenes.length} scenes</span>
        </div>
      </div>

      <StoryboardViewWaveform energyCurve={project.audio.energyCurve} segments={segments} duration={duration} />

      <div className="flex flex-wrap gap-1.5 shrink-0">
        {segments.map((seg) => (
          <span key={seg.id} className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-white"
            style={{ backgroundColor: seg.color }}>
            {seg.label}
          </span>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="grid grid-cols-3 gap-2.5">
          {project.scenes.map((scene, idx) => {
            const segInfo = sceneSegmentMap[scene.id]
            const isActive = scene.id === activeSceneId
            const selectedTakeId = activeTakeMap[scene.id] ?? scene.takes[0]?.id

            return (
              <div key={scene.id} className="flex flex-col gap-1.5">
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.04 }}
                  className="relative cursor-pointer group"
                  onClick={() => setActiveSceneId(scene.id === activeSceneId ? undefined : scene.id)}
                >
                  {isActive && (
                    <div className="absolute inset-0 z-20 rounded-xl ring-2 ring-primary ring-offset-1 ring-offset-background pointer-events-none" />
                  )}
                  <div className={cn('aspect-video rounded-xl overflow-hidden bg-muted relative transition-transform duration-200', 'group-hover:scale-[1.03]')}>
                    <img src={scene.thumbnailUrl} alt={`Scene ${scene.index + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                    {segInfo && (
                      <div className="absolute top-1.5 left-1.5 z-10 rounded-md px-1.5 py-0.5" style={{ backgroundColor: segInfo.color }}>
                        <span className="text-[8px] font-bold text-white">{segInfo.label}</span>
                      </div>
                    )}
                    <div className="absolute top-1.5 right-1.5 z-10 h-5 w-5 rounded-full bg-black/60 flex items-center justify-center">
                      <span className="text-[9px] font-bold text-white">{scene.index + 1}</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-[9px] font-semibold text-white truncate">{scene.subject}</p>
                      <p className="text-[8px] text-white/60 flex items-center gap-1">
                        <Camera className="h-2 w-2" />
                        {scene.cameraAngle}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {scene.takes && scene.takes.length > 1 && (
                  <div className="grid grid-cols-3 gap-1">
                    {scene.takes.slice(0, 3).map((take) => (
                      <button key={take.id} onClick={() => selectTake(scene.id, take.id)}
                        className={cn('rounded overflow-hidden border-2 transition-all cursor-pointer aspect-video',
                          take.id === selectedTakeId ? 'border-primary' : 'border-border/40 opacity-60 hover:opacity-100')}
                      >
                        <img src={take.thumbnailUrl} alt="Take" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {activeScene && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
            <p className="text-[10px] font-semibold text-primary mb-1">Scene {activeScene.index + 1} Detail</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed">{activeScene.prompt}</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

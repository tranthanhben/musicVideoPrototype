'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Zap, Clock, Film } from 'lucide-react'
import { usePipelineStore } from '@/lib/pipeline/store'
import { GenerationLoading } from '@/components/shared/generation-loading'
import { mockProjects } from '@/lib/mock/projects'
import type { AudioSegment, SegmentType } from '@/lib/mock/types'
import { cn } from '@/lib/utils'

const scenes = mockProjects[0].scenes
const segments = mockProjects[0].audio.segments
const audioDuration = mockProjects[0].audio.duration
const LAYER_ID = 'L4_PRODUCTION'
const HIGH_ENERGY_TYPES: SegmentType[] = ['chorus', 'bridge', 'drop']

function getSegmentForScene(sceneIndex: number): AudioSegment | undefined {
  const totalVid = scenes.reduce((sum, s) => sum + s.duration, 0)
  let elapsed = 0
  for (let i = 0; i < sceneIndex; i++) elapsed += scenes[i].duration
  const audioTime = ((elapsed + scenes[sceneIndex].duration / 2) / totalVid) * audioDuration
  return segments.find((seg) => audioTime >= seg.startTime && audioTime < seg.endTime)
}

const ACTIVITY_MESSAGES = [
  'Dispatching Kling 2.6 for high-energy scene...',
  'Motion synthesis running — analyzing beat sync...',
  'Runway Gen-4 processing medium-shot scene...',
  'Beat-sync applied to transition cuts...',
  'Consistency check — style seed verified: CREMI-7C3A',
  'Scene render queued: Gentle motion profile',
  'Energy curve mapped — dynamic range matched',
  'Quality score: 94% — proceeding to next scene',
  'Color LUT applied: Cosmic Cinema preset',
  'Director notes: great take, keeping for review',
]

const PARALLEL_WINDOW = 3

export function GenerationView() {
  const layers = usePipelineStore((s) => s.layers)
  const layerProgress = layers[LAYER_ID]?.progress ?? 0

  const sceneCount = scenes.length
  const progressPerScene = 100 / sceneCount
  const completedCount = Math.floor(layerProgress / progressPerScene)

  const [activityLog, setActivityLog] = useState<{ id: number; text: string; time: string }[]>([])
  const nextId = useRef(0)
  const prevCount = useRef(-1)

  useEffect(() => {
    if (completedCount > prevCount.current) {
      const msg = ACTIVITY_MESSAGES[completedCount % ACTIVITY_MESSAGES.length]
      const time = new Date().toLocaleTimeString('en', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
      setActivityLog((prev) => [{ id: nextId.current++, text: msg, time }, ...prev].slice(0, 6))
      prevCount.current = completedCount
    }
  }, [completedCount])

  const activeIndices = new Set<number>()
  for (let i = 0; i < PARALLEL_WINDOW; i++) {
    const idx = completedCount + i
    if (idx < sceneCount && layerProgress < 100) activeIndices.add(idx)
  }

  const etaSeconds = layerProgress >= 100 ? 0 : Math.round(((100 - layerProgress) / 100) * 180)

  return (
    <div className="flex h-full flex-col p-5 gap-3">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-sm font-bold text-foreground">Generating Scenes</h2>
          <span className="mt-1 inline-flex items-center rounded-full border border-purple-500/40 bg-purple-500/10 px-2 py-0.5 text-[9px] font-mono font-semibold text-purple-400 tracking-wide">
            Style Seed: CREMI-7C3A-COSMIC
          </span>
        </div>
        <div className="text-right">
          <p className="text-xs font-mono font-bold text-foreground">{completedCount}/{sceneCount}</p>
          <p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
            <Clock className="h-3 w-3" />
            {layerProgress < 100 ? `~${etaSeconds}s` : 'Done'}
          </p>
        </div>
      </div>

      {/* Overall progress */}
      <div className="shrink-0">
        <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
          <span>Overall Progress</span>
          <span className="font-mono">{Math.round(layerProgress)}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400"
            animate={{ width: `${layerProgress}%` }} transition={{ duration: 0.5 }} />
        </div>
      </div>

      {/* Activity feed */}
      <div className="shrink-0 rounded-xl bg-black/40 border border-border/40 px-3 py-2 font-mono" style={{ maxHeight: 90 }}>
        <p className="text-[9px] text-primary/70 uppercase tracking-widest mb-1">Director Feed</p>
        <div className="space-y-0.5 overflow-hidden">
          <AnimatePresence mode="popLayout">
            {activityLog.slice(0, 4).map((m) => (
              <motion.p key={m.id}
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-[10px] text-green-400/80 truncate flex gap-2"
              >
                <span className="text-green-600/60 shrink-0">{m.time}</span>
                <span><span className="text-green-600 mr-1">›</span>{m.text}</span>
              </motion.p>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Scene grid */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="grid grid-cols-3 gap-2.5">
          {scenes.map((scene, idx) => {
            const isDone = idx < completedCount
            const isActive = activeIndices.has(idx)
            const seg = getSegmentForScene(idx)
            const highEnergy = seg ? HIGH_ENERGY_TYPES.includes(seg.type) : false

            const pOffset = idx - completedCount
            const baseProg = isActive ? ((layerProgress % progressPerScene) / progressPerScene) * 100 : isDone ? 100 : 0
            const sceneProg = isActive ? Math.max(0, baseProg - pOffset * 15) : baseProg

            const modelBadge = highEnergy ? 'Kling 2.6' : 'Runway Gen-4'
            const motionLabel = highEnergy ? 'Dynamic' : 'Gentle'
            const motionColor = highEnergy ? 'text-orange-400 bg-orange-500/15' : 'text-blue-400 bg-blue-500/15'

            // Show take alternatives for completed scenes
            const hasTakes = isDone && scene.takes && scene.takes.length > 1

            return (
              <div key={scene.id} className="flex flex-col gap-1">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
                  <img src={scene.thumbnailUrl} alt={`Scene ${scene.index + 1}`} className="absolute inset-0 w-full h-full object-cover" />

                  {isDone ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40">
                        <Check className="h-4 w-4 text-white" />
                      </motion.div>
                    </motion.div>
                  ) : isActive ? (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <GenerationLoading progress={sceneProg} message={`Scene ${scene.index + 1}`} variant="minimal" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/55" />
                  )}

                  <div className={cn('absolute top-1.5 left-1.5 rounded-md px-1.5 py-0.5', isDone ? 'bg-emerald-900/80' : 'bg-black/70')}>
                    <span className="text-[8px] font-mono font-semibold text-white/80">{modelBadge}</span>
                  </div>

                  <div className={`absolute top-1.5 right-1.5 rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${motionColor}`}>
                    <Zap className={cn('inline h-2.5 w-2.5 mr-0.5', highEnergy ? 'text-orange-400' : 'text-blue-400')} />
                    {motionLabel}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-[9px] font-semibold text-white truncate">S{scene.index + 1} · {scene.subject}</p>
                  </div>
                </div>

                {/* Take alternatives */}
                {hasTakes && (
                  <div className="flex gap-1 items-center">
                    <Film className="h-2.5 w-2.5 text-muted-foreground/50 shrink-0" />
                    {scene.takes.slice(0, 2).map((take, ti) => (
                      <div key={take.id} className={cn('flex-1 rounded overflow-hidden border', ti === 0 ? 'border-emerald-500/60' : 'border-border/30 opacity-60')}>
                        <img src={take.thumbnailUrl} alt="Take" className="w-full aspect-video object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

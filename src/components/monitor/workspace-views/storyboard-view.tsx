'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Layers, Clock } from 'lucide-react'
import { mockProjects } from '@/lib/mock/projects'
import type { AudioSegment } from '@/lib/mock/types'
import { StoryboardViewWaveform } from './storyboard-view-waveform'
import { StoryboardSceneCard } from './storyboard-scene-card'
import { StoryboardSceneDetail } from './storyboard-scene-detail'
import { StoryboardAudioPlayer } from './storyboard-audio-player'

const project = mockProjects[0]
const segments = project.audio.segments
const duration = project.audio.duration

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function getSegmentForTime(time: number, segs: AudioSegment[]): AudioSegment | undefined {
  return segs.find((seg) => time >= seg.startTime && time < seg.endTime)
}

function buildSceneSegmentMap(): Record<string, { color: string; label: string } | undefined> {
  const total = project.scenes.reduce((sum, s) => sum + s.duration, 0)
  let elapsed = 0
  const map: Record<string, { color: string; label: string } | undefined> = {}
  for (const scene of project.scenes) {
    const mid = elapsed + scene.duration / 2
    const audioTime = (mid / total) * duration
    const seg = getSegmentForTime(audioTime, segments)
    map[scene.id] = seg ? { color: seg.color, label: seg.label } : undefined
    elapsed += scene.duration
  }
  return map
}

function buildSceneTimeOffsets(): Record<string, { start: number; end: number }> {
  let elapsed = 0
  const map: Record<string, { start: number; end: number }> = {}
  for (const scene of project.scenes) {
    map[scene.id] = { start: elapsed, end: elapsed + scene.duration }
    elapsed += scene.duration
  }
  return map
}

const sceneSegmentMap = buildSceneSegmentMap()
const sceneTimeOffsets = buildSceneTimeOffsets()
const totalDuration = project.scenes.reduce((sum, s) => sum + s.duration, 0)

export function StoryboardView() {
  const [activeSceneId, setActiveSceneId] = useState<string | undefined>()
  const [activeTakeMap, setActiveTakeMap] = useState<Record<string, string>>({})
  const [sceneOrder, setSceneOrder] = useState(project.scenes.map((s) => s.id))

  function selectTake(sceneId: string, takeId: string) {
    setActiveTakeMap((prev) => ({ ...prev, [sceneId]: takeId }))
  }

  function moveScene(id: string, direction: 'up' | 'down') {
    setSceneOrder((prev) => {
      const idx = prev.indexOf(id)
      if (idx < 0) return prev
      const next = [...prev]
      const swap = direction === 'up' ? idx - 1 : idx + 1
      if (swap < 0 || swap >= next.length) return prev
      ;[next[idx], next[swap]] = [next[swap], next[idx]]
      return next
    })
  }

  const orderedScenes = sceneOrder.map((id) => project.scenes.find((s) => s.id === id)!).filter(Boolean)

  // Build grid items: insert detail panel immediately after the active scene's row
  // 3-column grid: rows of 3, inject detail after active scene's row
  function buildGridItems() {
    const items: Array<{ type: 'scene'; sceneId: string; sceneIndex: number } | { type: 'detail'; sceneId: string }> = []
    let detailInserted = false
    for (let i = 0; i < orderedScenes.length; i++) {
      const scene = orderedScenes[i]
      items.push({ type: 'scene', sceneId: scene.id, sceneIndex: i })
      // After completing a row of 3 (or the last scene), insert detail if active scene is in this row
      const isEndOfRow = (i + 1) % 3 === 0 || i === orderedScenes.length - 1
      if (isEndOfRow && !detailInserted && activeSceneId) {
        const rowStart = Math.floor(i / 3) * 3
        const rowEnd = i
        const rowIds = orderedScenes.slice(rowStart, rowEnd + 1).map((s) => s.id)
        if (rowIds.includes(activeSceneId)) {
          items.push({ type: 'detail', sceneId: activeSceneId })
          detailInserted = true
        }
      }
    }
    return items
  }

  const gridItems = buildGridItems()

  return (
    <div className="flex h-full flex-col p-5 gap-3 overflow-hidden">
      {/* Header */}
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

      {/* Waveform */}
      <StoryboardViewWaveform energyCurve={project.audio.energyCurve} segments={segments} duration={duration} />

      {/* Audio player */}
      <StoryboardAudioPlayer
        scenes={project.scenes}
        totalDuration={totalDuration}
        activeSceneId={activeSceneId}
        onSceneChange={setActiveSceneId}
      />

      {/* Segment legend */}
      <div className="flex flex-wrap gap-1.5 shrink-0">
        {segments.map((seg) => (
          <span key={seg.id} className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-white"
            style={{ backgroundColor: seg.color }}>
            {seg.label}
          </span>
        ))}
      </div>

      {/* Scene grid with inline detail panels */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="grid grid-cols-3 gap-2.5">
          <AnimatePresence>
            {gridItems.map((item) => {
              if (item.type === 'detail') {
                const scene = project.scenes.find((s) => s.id === item.sceneId)
                if (!scene) return null
                return (
                  <StoryboardSceneDetail
                    key={`detail-${scene.id}`}
                    scene={scene}
                    onClose={() => setActiveSceneId(undefined)}
                  />
                )
              }
              const scene = orderedScenes[item.sceneIndex]
              if (!scene) return null
              const segInfo = sceneSegmentMap[scene.id]
              const timeOff = sceneTimeOffsets[scene.id] ?? { start: 0, end: scene.duration }
              const selectedTakeId = activeTakeMap[scene.id] ?? scene.takes[0]?.id
              return (
                <StoryboardSceneCard
                  key={scene.id}
                  scene={scene}
                  index={item.sceneIndex}
                  segInfo={segInfo}
                  isActive={scene.id === activeSceneId}
                  selectedTakeId={selectedTakeId}
                  totalScenes={orderedScenes.length}
                  timeStart={timeOff.start}
                  timeEnd={timeOff.end}
                  onToggle={() => setActiveSceneId(scene.id === activeSceneId ? undefined : scene.id)}
                  onTakeSelect={(tid) => selectTake(scene.id, tid)}
                  onMoveUp={() => moveScene(scene.id, 'up')}
                  onMoveDown={() => moveScene(scene.id, 'down')}
                />
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
